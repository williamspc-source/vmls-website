import { createElement } from 'react'
import * as Phosphor from '@phosphor-icons/react/ssr'

import { iconMap, type IconName } from '@/components/Icon'

/**
 * Any Phosphor icon, as an SVG file.
 *
 * ## Why the whole set is imported here
 *
 * This is a **route handler** — server only. The icons it renders reach a browser
 * as a URL, never as JavaScript, so the cost is the server bundle rather than
 * anything a visitor downloads. The alternative, a dynamic `import()` built from
 * the request path, is the kind of thing bundlers resolve inconsistently, and a
 * 404 for an icon that exists would look exactly like a typo in an editor's
 * choice.
 *
 * The build cost of this import is measured and recorded in README rather than
 * assumed — the first attempt at this feature reached for the same barrel and was
 * never built.
 *
 * ## Serving all 1,513 rather than the curated 101
 *
 * Which icons an editor may PICK is decided by the Icon Library global, not here.
 * This route is the artwork; the library is the policy. Keeping them apart is
 * what lets an admin add an icon without a deploy.
 */

/** `arrow-right` → `ArrowRight`. Phosphor exports PascalCase. */
const pascal = (kebab: string): string =>
  kebab
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
): Promise<Response> => {
  const { name } = await params

  // Refuse anything that is not a plain kebab name before it reaches the export
  // table, which is not a place to pass arbitrary strings.
  if (!/^[a-z0-9-]+$/.test(name)) return new Response('Not found', { status: 404 })

  // `iconMap` FIRST, because ten of its keys are ALIASES that Phosphor does not
  // export under that name: `activity` is Pulse, `mail` is Envelope, `search` is
  // MagnifyingGlass, `home` is House. Going straight to the barrel 404s every one
  // of them — which is what happened when this route was renamed from
  // `/api/icon/builtin`, silently blanking their previews in the picker and their
  // tiles in the library while they still rendered perfectly on the site.
  //
  // Not `typeof === 'function'`: Phosphor's icons are `forwardRef` components,
  // which are OBJECTS. That check 404s every icon that exists, which reads
  // exactly like a name the library does not have.
  const Cmp =
    iconMap[name as IconName] ?? (Phosphor as unknown as Record<string, unknown>)[pascal(name)]
  if (!Cmp || (typeof Cmp !== 'function' && typeof Cmp !== 'object')) {
    // A 404 is safe to leave visible here. Measured: an unresolvable mask URL
    // paints NOTHING — 0% coverage against white, against 24% for a real icon —
    // not the element's whole box. So a bad name degrades to an absent icon,
    // exactly as an unknown `iconMap` key already does.
    return new Response('Not found', { status: 404 })
  }

  // Imported inside the handler, not at module scope: Next refuses a static
  // `react-dom/server` import under `(frontend)` — it assumes the module is
  // browser-reachable and fails the build with a message about components, which
  // is misleading for a route handler.
  const { renderToStaticMarkup } = await import('react-dom/server')

  const svg = renderToStaticMarkup(
    createElement(Cmp as React.ComponentType<Record<string, unknown>>, {
      weight: 'duotone',
      // The mask reads alpha and discards the colour, so this only has to be opaque.
      color: '#000',
    }),
  )

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      // Built from a package version that only changes on an upgrade.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
