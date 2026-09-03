#!/usr/bin/env bash
# Start the VERIFY CMS local server (Next.js + Payload) in the background.
# Binds 0.0.0.0 so the team can reach it over the LAN. Isolated from production
# either way — it uses the local verify_cms DB, never the live one.
#
#   ./start.sh          dev mode (default): hot reload, NO static caching, so
#                       edits/deletes always show instantly (revalidation hooks
#                       are effectively a no-op here).
#   ./start.sh prod     production build + serve: static caching + on-demand
#                       revalidation, i.e. how the deployed site actually behaves.
#                       Use this to see the revalidate hooks work (delete a post →
#                       refresh → gone; edit a nested page → refresh → updated).
#
# Stop either mode with ./stop.sh.
set -euo pipefail

cd "$(dirname "$0")"

MODE="${1:-dev}"
PORT="${PORT:-3000}"
PID_FILE=".dev.pid"
LOG_FILE=".dev.log"

case "$MODE" in
  dev | prod) ;;
  *)
    echo "✗ Unknown mode '$MODE'. Usage: ./start.sh [dev|prod]"
    exit 1
    ;;
esac

# Already running?
if lsof -ti ":$PORT" >/dev/null 2>&1; then
  echo "✗ Something is already listening on port $PORT. Run ./stop.sh first."
  exit 1
fi

if [ "$MODE" = "prod" ]; then
  # Clean build so no dev-mode .next artifacts leak into the production bundle,
  # then serve it. The build runs in the FOREGROUND so you see its progress and
  # errors; a failed build aborts here (set -e) before anything is backgrounded.
  # Needs the local Postgres up — build runs generateStaticParams against it.
  echo "→ Building for production (takes a minute or two)…"
  rm -rf .next
  pnpm build
  echo "→ Starting production server (port $PORT)…"
  # Call next directly (not `pnpm start`, whose `--` arg-forwarding mangles the
  # host flag) with the host/port bind, mirroring the npm scripts' NODE_OPTIONS.
  NODE_OPTIONS="--no-deprecation" nohup pnpm exec next start -H 0.0.0.0 -p "$PORT" >"$LOG_FILE" 2>&1 &
else
  echo "→ Starting dev server (port $PORT)…"
  # nohup + & so it survives this shell; all output goes to the log file.
  nohup pnpm dev >"$LOG_FILE" 2>&1 &
fi
echo $! >"$PID_FILE"

# Wait for it to come up (dev compiles on first boot; prod boots fast post-build).
for i in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost:$PORT/admin" 2>/dev/null || echo 000)
  case "$code" in
    200 | 301 | 302 | 307) break ;;
  esac
  sleep 2
done

LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")
echo "✓ ${MODE} server running (pid $(cat "$PID_FILE"))"
echo "   Local:   http://localhost:$PORT"
[ -n "$LAN_IP" ] && echo "   Network: http://$LAN_IP:$PORT   (team / other devices on the same Wi-Fi)"
echo "   Admin:   http://localhost:$PORT/admin"
echo "   Logs:    tail -f $LOG_FILE"
echo "   Stop:    ./stop.sh"
