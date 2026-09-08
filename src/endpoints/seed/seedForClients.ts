import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Corrects the two /information-centre/for-clients sections that never matched
 * the reference.
 *
 * All four edits are field values, not CSS. The services section rendered flat
 * grey at 120px where the reference is a blue gradient at 88px, and its cards
 * rendered left-aligned because `cardAlign` was unset — the homepage runs the
 * identical grid with `center`, so the two pages disagreed with each other. The
 * support cards used the shared bordered card rather than the quieter treatment
 * the reference gives them.
 *
 * `authorPage` early-returns on an authored page, so the fixture edits reach no
 * existing install; this runs unconditionally.
 *
 * ── Why the predicate is the section background ──
 * `cardStyle` and `cardAlign` cannot be used: `card` and `left` are exactly what
 * their `defaultValue`s write, so "is it card?" cannot tell an untouched block
 * from an editor who chose it — the trap that broke an earlier repair here.
 * `background: 'muted'` was written explicitly by the old fixture and is not any
 * field's default, so it is a genuine superseded value. It fires once; afterwards
 * the background reads `accent` and it can never fire again, so an editor who
 * later picks Left or Card keeps that choice.
 *
 * The Feature Grid edit rides the same marker deliberately — both halves ship in
 * one seed run, and a shared marker is what stops them drifting apart.
 */
export const repairForClientsCards = async ({ payload, req }: Ctx): Promise<void> => {
  type Row = { imagePlaceholder?: boolean | null; placeholderIcon?: string | null }
  type Inner = {
    blockType?: string
    cardAlign?: string | null
    cardStyle?: string | null
    cssClass?: string[] | null
    rows?: Row[]
  }
  type Block = {
    blockType?: string
    anchorId?: string | null
    background?: string | null
    paddingTop?: string | null
    paddingBottom?: string | null
    content?: Inner[]
  }

  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'for-clients' } },
    limit: 1,
    depth: 0,
    req,
  })
  const page = found.docs[0] as { id: number | string; layout?: Block[] } | undefined
  const layout = page?.layout
  if (!page || !Array.isArray(layout)) return

  const superseded = layout.some(
    (b) => b?.blockType === 'section' && b.anchorId === 'services' && b.background === SUPERSEDED_BAND,
  )
  if (!superseded) return

  const next = layout.map((block) => {
    if (block?.blockType !== 'section' || !Array.isArray(block.content)) return block

    if (block.anchorId === 'services') {
      return {
        ...block,
        background: 'accent',
        paddingTop: 'normal',
        paddingBottom: 'normal',
        content: block.content.map((inner) =>
          inner?.blockType === 'servicesGrid' ? { ...inner, cardAlign: 'center' } : inner,
        ),
      }
    }
    if (block.anchorId === 'support') {
      return {
        ...block,
        content: block.content.map((inner) => {
          if (inner?.blockType === 'featureGrid') return { ...inner, cardStyle: 'soft' }
          // The intro above the cards needs its scope class and the reference's
          // placeholder glyph; measured 10 further differences without them.
          if (inner?.blockType === 'splitFeature') {
            return {
              ...inner,
              cssClass: ['vf-client-overview'],
              rows: (inner.rows ?? []).map((row) =>
                row?.imagePlaceholder ? { ...row, placeholderIcon: 'image' } : row,
              ),
            }
          }
          return inner
        }),
      }
    }
    return block
  })

  await seedUpdate(payload, {
    collection: 'pages',
    id: page.id,
    data: { layout: next } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info(
    '— Repaired /information-centre/for-clients: services band + centred tiles + soft support cards',
  )
}

// The band the old fixture wrote. Not any field's default, so its presence means
// this has not run yet; its absence means it has, or an editor has since chosen.
const SUPERSEDED_BAND = 'muted'
