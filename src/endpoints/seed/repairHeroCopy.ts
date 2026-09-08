import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

import { storedText } from './repairMatch'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Corrects superseded wording in page hero subtitles.
 *
 * Copy lives in the database, so editing a seed fixture fixes nothing on any
 * install that already exists — `authorPage` early-returns on an authored page.
 * Every wording correction therefore needs a repair like this one, run
 * unconditionally from `seedVerify`.
 *
 * ── Why the predicate is the superseded string itself ──
 * It is the narrowest possible signal: the exact sentence being replaced. Once
 * corrected the string is gone, so this can never fire twice, and an editor who
 * has since rewritten the sentence keeps their version untouched — the repair
 * writes only into the absence of the correction, never over a decision.
 *
 * Add a row per correction. Keep `from` an exact, whole-sentence match rather
 * than a fragment: a fragment can appear inside copy that was never meant to
 * change, and a hero subtitle is not the only thing a loose phrase would hit.
 */
const HERO_SUBTITLE_FIXES: { slug: string; from: string; to: string }[] = [
  // Oxford comma before the final item, matching the rest of the site's copy
  // (e.g. "accuracy, defensibility, and compliance" on the same page family).
  {
    slug: 'specialists',
    from: 'Our specialists are highly skilled professionals committed to the highest standards of professionalism, accuracy and impartiality.',
    to: 'Our specialists are highly skilled professionals committed to the highest standards of professionalism, accuracy, and impartiality.',
  },
  {
    slug: 'specialist-panel',
    from: 'Our specialists are highly skilled professionals committed to the highest standards of professionalism, accuracy and impartiality.',
    to: 'Our specialists are highly skilled professionals committed to the highest standards of professionalism, accuracy, and impartiality.',
  },
  // The other three hero subtitles carrying a three-item list without the final
  // comma. Found by matching `A, B and C` against every stored hero subtitle —
  // the whole set is four, and these are the remaining three.
  {
    slug: 'for-clients',
    from: 'VERIFY provides medico-legal services for plaintiff and defendant lawyers, insurers and self-insurers — a balanced, unbiased approach that supports a fair and just legal process.',
    to: 'VERIFY provides medico-legal services for plaintiff and defendant lawyers, insurers, and self-insurers — a balanced, unbiased approach that supports a fair and just legal process.',
  },
  {
    slug: 'join-expert-panel',
    from: "VERIFY partners with medical and allied-health specialists who value rigour, fairness and professional development. If you're interested in medico-legal work, we'd like to hear from you.",
    to: "VERIFY partners with medical and allied-health specialists who value rigour, fairness, and professional development. If you're interested in medico-legal work, we'd like to hear from you.",
  },
  {
    slug: 'privacy-policy',
    from: 'VERIFY Medico-Legal Solutions Pty Ltd — how we collect, use and protect your personal information.',
    to: 'VERIFY Medico-Legal Solutions Pty Ltd — how we collect, use, and protect your personal information.',
  },
]

export const repairHeroCopy = async ({ payload, req }: Ctx): Promise<void> => {
  for (const { slug, from, to } of HERO_SUBTITLE_FIXES) {
    const found = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      req,
    })
    const page = found.docs[0] as unknown as
      | { id: number | string; hero?: { subtitle?: string | null } | null }
      | undefined
    const subtitle = page?.hero?.subtitle
    if (!page || !storedText(subtitle).includes(from)) continue

    // The detection above reads a string or a rich-text tree; the correction
    // below can only rewrite a string. Say so rather than skipping: a repair
    // that quietly declines to fire is the exact failure this file's header
    // warns about, and after the rich-text conversion this branch is how a
    // superseded sentence announces that it now needs re-doing as a tree edit.
    if (typeof subtitle !== 'string') {
      const message =
        `repairHeroCopy: /${slug} still holds superseded wording, but its hero subtitle is ` +
        `rich text and this repair can only rewrite a plain string. Correct it in the admin, ` +
        `or rewrite this repair to edit the Lexical tree.`
      payload.logger.error(`— ${message}`)
      if (process.env.NODE_ENV !== 'production') throw new Error(message)
      continue
    }

    await seedUpdate(payload, {
      collection: 'pages',
      id: page.id,
      data: { hero: { ...page.hero, subtitle: subtitle.replace(from, to) } } as never,
      req,
      context: { disableRevalidate: true },
    })
    payload.logger.info(`— Repaired hero copy on /${slug}`)
  }
}
