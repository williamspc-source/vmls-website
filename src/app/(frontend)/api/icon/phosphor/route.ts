import * as Phosphor from '@phosphor-icons/react/ssr'

/**
 * Every Phosphor icon's name, for the Icon Library's browse screen.
 *
 * Derived from the package's own exports rather than a checked-in list, so it
 * cannot fall behind an upgrade — and a name that appears here is one the sibling
 * `[name]` route can definitely serve, because both read the same export table.
 */

/** `ArrowRight` → `arrow-right`. */
const kebab = (pascal: string): string =>
  pascal
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()

let cached: string[] | null = null

export const GET = async (): Promise<Response> => {
  if (!cached) {
    cached = [
      ...new Set(
        Object.keys(Phosphor)
          // Both `Brain` and `BrainIcon` are exported for every icon; keeping the
          // suffixed twin would double the list and offer the same picture twice.
          .filter((key) => /^[A-Z]/.test(key) && !key.endsWith('Icon'))
          .map(kebab),
      ),
    ].sort()
  }

  return new Response(JSON.stringify({ names: cached }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
  })
}
