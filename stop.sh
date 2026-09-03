#!/usr/bin/env bash
# Stop the VERIFY CMS local dev server started by ./start.sh.
set -uo pipefail

cd "$(dirname "$0")"

PORT="${PORT:-3000}"
PID_FILE=".dev.pid"
stopped=0

# 1) Kill the tracked process tree (pnpm dev spawns child node processes).
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE" 2>/dev/null || echo "")
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    pkill -P "$PID" 2>/dev/null || true   # children first
    kill "$PID" 2>/dev/null || true
    stopped=1
  fi
  rm -f "$PID_FILE"
fi

# 2) Backstop: anything still bound to the port (e.g. a stray next-server).
PIDS=$(lsof -ti ":$PORT" 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  echo "$PIDS" | xargs -r kill -9 2>/dev/null || true
  stopped=1
fi

sleep 1
if lsof -ti ":$PORT" >/dev/null 2>&1; then
  echo "✗ Port $PORT still in use — check 'lsof -i :$PORT'."
  exit 1
fi

[ "$stopped" -eq 1 ] && echo "✓ Dev server stopped." || echo "• Nothing was running on port $PORT."
