import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { svgIconDocument } from '@/utilities/svgIcon'

/**
 * Serve an uploaded icon's artwork.
 *
 * The response is built from the `viewBox`/`markup` stored on the document —
 * markup `normaliseSvgIcon` reconstructed from recognised geometry — and never
 * from the uploaded file itself. So there is no path by which visitor-supplied
 * markup reaches a browser from our origin, which is the whole reason that
 * normalisation exists.
 *
 * The CSP header is belt and braces on top of that: even if something unexpected
 * were ever stored, `default-src 'none'` gives it nothing to do.
 */
export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> => {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  let doc: { viewBox?: string | null; markup?: string | null } | null = null
  try {
    doc = (await payload.findByID({
      collection: 'icons',
      id,
      depth: 0,
    })) as { viewBox?: string | null; markup?: string | null }
  } catch {
    return new Response('Not found', { status: 404 })
  }

  if (!doc?.markup || !doc?.viewBox) return new Response('Not found', { status: 404 })

  return new Response(svgIconDocument({ viewBox: doc.viewBox, markup: doc.markup }), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      // Icons change only when re-uploaded, and the URL carries the id — but the
      // id is stable across a re-upload, so this cannot be immutable.
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
    },
  })
}
