import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Points the two "register for the booking portal" buttons at the prefilled
 * email configured in Site Settings.
 *
 * Portal access is by registration only, so both buttons now open the visitor's
 * mail app with the request already written rather than sending them off to find
 * a form. The wording lives in one global, so an editor changes it once.
 *
 * ── Why a repair, and not just the fixture ──
 * `authorPage` early-returns on a page someone has authored, so editing
 * `seedInfoBooking.ts` alone reaches a virgin database and nothing else. Every
 * existing install — the box included — would keep serving the old buttons.
 *
 * ── Predicates ──
 * Each half writes only into a genuine absence, and neither can fire twice:
 *  · Contact — the portal card holds no `portalEnquiry` link yet. Keyed on the
 *    link type rather than on the label, so an editor who renames the button
 *    does not get a duplicate inserted beneath it.
 *  · Make a Booking — the chooser link is still `custom` → `/contact`, the exact
 *    superseded value. Once it is anything else (repaired, or deliberately
 *    re-pointed by an editor) this stops matching.
 */

const REGISTER_LABEL = 'Email Us to Register'

type Link = {
  type?: string | null
  url?: string | null
  label?: string | null
  icon?: string | null
  appearance?: string | null
  newTab?: boolean | null
}
type Entry = { link?: Link }
type Block = {
  id?: string
  blockType?: string
  cssClass?: string[] | string | null
  links?: Entry[]
  halves?: { links?: Entry[] }[]
  content?: Block[]
  columns?: { content?: Block[] }[]
}

const isPortalEnquiry = (entry?: Entry): boolean => entry?.link?.type === 'portalEnquiry'

/** True when any block anywhere in the tree satisfies `pred`. */
const someBlock = (blocks: Block[], pred: (b: Block) => boolean): boolean =>
  blocks.some(
    (b) =>
      pred(b) ||
      (Array.isArray(b.content) && someBlock(b.content, pred)) ||
      (Array.isArray(b.columns) &&
        b.columns.some((c) => Array.isArray(c?.content) && someBlock(c.content, pred))),
  )

/**
 * Rebuilds a block list, letting `fn` return several blocks in place of one so a
 * new button can be inserted after an existing one.
 */
const expandBlocks = (blocks: Block[], fn: (b: Block) => Block[]): Block[] =>
  blocks.flatMap((block) => {
    let next = block
    if (Array.isArray(next.content)) next = { ...next, content: expandBlocks(next.content, fn) }
    if (Array.isArray(next.columns)) {
      next = {
        ...next,
        columns: next.columns.map((c) =>
          Array.isArray(c?.content) ? { ...c, content: expandBlocks(c.content, fn) } : c,
        ),
      }
    }
    return fn(next)
  })

/** The phone button in the Contact page's Online Booking Portal card. */
const isPortalPhoneButton = (b: Block): boolean =>
  b?.blockType === 'button' &&
  Array.isArray(b.links) &&
  b.links.some((e) => typeof e?.link?.url === 'string' && e.link.url.startsWith('tel:')) &&
  (Array.isArray(b.cssClass) ? b.cssClass : [b.cssClass]).includes('ct-portal-card__btn')

export const repairPortalEnquiry = async ({ payload, req }: Ctx): Promise<void> => {
  // ── Contact: add the email button under the phone button ──
  const contactFound = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'contact' } },
    limit: 1,
    depth: 0,
    req,
  })
  const contact = contactFound.docs[0] as unknown as
    | { id: number | string; layout?: Block[] }
    | undefined

  if (contact && Array.isArray(contact.layout)) {
    const alreadyThere = someBlock(
      contact.layout,
      (b) => Array.isArray(b.links) && b.links.some(isPortalEnquiry),
    )
    const anchor = someBlock(contact.layout, isPortalPhoneButton)

    if (!alreadyThere && anchor) {
      const next = expandBlocks(contact.layout, (b) =>
        isPortalPhoneButton(b)
          ? [
              b,
              {
                blockType: 'button',
                size: 'md',
                align: 'left',
                cssClass: ['ct-portal-card__btn'],
                links: [
                  {
                    link: {
                      type: 'portalEnquiry',
                      label: REGISTER_LABEL,
                      icon: 'envelope-simple',
                      appearance: 'outline',
                      newTab: false,
                    },
                  },
                ],
              } as Block,
            ]
          : [b],
      )
      await seedUpdate(payload, {
        collection: 'pages',
        id: contact.id,
        data: { layout: next } as never,
        req,
        context: { disableRevalidate: true },
      })
      payload.logger.info(`— Added the "${REGISTER_LABEL}" button to /contact`)
    }
  }

  // ── Make a Booking: retarget "Register an Account" ──
  const bookingFound = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'make-a-booking' } },
    limit: 1,
    depth: 0,
    req,
  })
  const booking = bookingFound.docs[0] as unknown as
    | { id: number | string; layout?: Block[] }
    | undefined

  if (!booking || !Array.isArray(booking.layout)) return

  const supersededLink = (e?: Entry): boolean =>
    e?.link?.type === 'custom' && e?.link?.url === '/contact'

  const needsRetarget = someBlock(
    booking.layout,
    (b) =>
      b?.blockType === 'bookingChooser' &&
      Array.isArray(b.halves) &&
      b.halves.some((h) => Array.isArray(h?.links) && h.links.some(supersededLink)),
  )
  if (!needsRetarget) return

  const next = expandBlocks(booking.layout, (b) => {
    if (b?.blockType !== 'bookingChooser' || !Array.isArray(b.halves)) return [b]
    return [
      {
        ...b,
        halves: b.halves.map((half) =>
          Array.isArray(half?.links)
            ? {
                ...half,
                links: half.links.map((e) =>
                  supersededLink(e)
                    ? // `url` is dropped deliberately: leaving /contact behind
                      // would render if the type were ever switched back, and a
                      // stale destination is exactly what this repair removes.
                      { ...e, link: { ...e.link, type: 'portalEnquiry', url: null } }
                    : e,
                ),
              }
            : half,
        ),
      } as Block,
    ]
  })

  await seedUpdate(payload, {
    collection: 'pages',
    id: booking.id,
    data: { layout: next } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info('— Retargeted "Register an Account" on /make-a-booking')
}
