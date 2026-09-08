import { seedUpdateGlobal } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'
import path from 'path'

import { getOrCreateMedia, syncMediaFile } from './media'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Gives the site a default social/OG preview image.
 *
 * ── What was wrong ──
 * Measured before this ran: not one of the 112 `meta.image` fields across Pages,
 * Articles, Events, Specialists and Team was set, and `site-settings.socialImage`
 * — the single fallback all 112 resolve to — was empty as well. So every link to
 * this site shared on LinkedIn, in Teams or in an email previewed with **no image
 * at all**. One upload fixes all 113 slots.
 *
 * ── Why a generated file rather than the logo ──
 * The obvious move is to point the field at the existing logo. It does not work,
 * and it fails silently: `generateMeta` serves the media's `og` derivative, which
 * Payload produces at 1200×630 with `crop: 'center'`. The logo is 4267×1359 —
 * 3.14:1 against OG's 1.9:1 — so it scales to 1978px wide and is then centre-cropped
 * to 1200, **losing 39% of its width**. Measured on the real derivative: the shield
 * is sliced in half and the wordmark reads "VERI" over "MEDICO-LEGAL SOL".
 *
 * `public/assets/images/social-share.png` is that same logo letterboxed onto an
 * opaque white 1200×630 canvas. At exactly the OG aspect the crop is a no-op, so
 * what is uploaded is what gets served.
 *
 * The transparency matters as much as the framing. The logo is a PNG with an alpha
 * channel, and so was every naive attempt at this canvas — social platforms
 * composite that onto their own, usually dark, background, which would have hidden
 * the grey "MEDICO-LEGAL SOLUTIONS" strapline entirely. The generated file is
 * colour type 2, no alpha.
 *
 * ── The predicate ──
 * Writes into an absence, or over a value that is known to be wrong. The field is
 * set when it is empty, and when it points at the Site Settings **logo** — which
 * is not an editorial preference but the specific mistake described above, and
 * which was made here on the first attempt. Any *other* choice is left completely
 * alone. When the field already points at our doc, the file is kept in step with
 * the committed one through `syncMediaFile`, itself a no-op unless the bytes
 * differ. So a second seed run does nothing.
 */
const ALT = 'VERIFY social share image'

export const repairSocialImage = async (ctx: Ctx): Promise<void> => {
  const { payload, req } = ctx
  const abs = path.join(process.cwd(), 'public', 'assets', 'images', 'social-share.png')

  const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 0, req })) as {
    socialImage?: number | string | null
    logo?: number | string | null
  } | null
  const current = settings?.socialImage ?? null
  const logo = settings?.logo ?? null

  const mediaId = await getOrCreateMedia(ctx, abs, ALT)
  if (!mediaId) return

  // An editor picked something of their own — not ours to change. Pointing at the
  // logo is not that: it is the 39%-cropped preview this module exists to replace.
  const isLogo = current !== null && logo !== null && String(current) === String(logo)
  if (current && !isLogo && String(current) !== String(mediaId)) return

  if (String(current) === String(mediaId)) {
    if ((await syncMediaFile(ctx, mediaId, abs)) === 'replaced') {
      payload.logger.info('— Social share image re-uploaded from public/assets/images/social-share.png')
    }
    return
  }

  await seedUpdateGlobal(payload, {
    slug: 'site-settings',
    data: { socialImage: mediaId } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info(
    isLogo
      ? '— Site Settings → Social image moved off the logo (which crops to "VERI") onto the 1200×630 share card'
      : '— Site Settings → Social image set to the 1200×630 VERIFY share card',
  )
}
