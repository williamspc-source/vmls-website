import type { IconName } from '@/components/Icon'

/**
 * Picks the icon for a specialist's qualification from its text.
 *
 * The design reference gives each qualification a semantically chosen icon — a
 * graduation cap for a degree, a medal for a fellowship, a certificate for a
 * certificate or diploma — and every accreditation a seal-check. Ours rendered a
 * medal on all 96 rows, because the per-row `icon` field exists but the seed
 * never wrote it, so `q.icon || 'medal'` fired every time.
 *
 * ── The rule is extracted from the reference, not invented ──
 * Parsing the qualification and accreditation lists out of all 26 profiles in
 * `.design-reference/specialists/profiles/` yields **86 distinct text→icon pairs
 * with zero conflicts** — no string is ever given two different icons:
 *
 *   graduation-cap 33   ·   medal 28   ·   seal-check 17   ·   certificate 8
 *
 * The classifier below reproduces **all 86 exactly**. That is the whole
 * justification for it, and it took two iterations to get there: the first
 * version missed `MRCPSYCH (UK)`, and the token added to fix that one broke
 * `FRACDS (OMS) RACDS`. A rule that reads sensibly is not a rule that is right —
 * re-run it against the corpus after any edit here.
 *
 * Seeded rows carry an explicit icon (83 of our 96 match a reference string
 * verbatim and take its icon directly; the other 13 are classified by this
 * function), so this is the fallback for rows an editor adds later. An icon
 * chosen in the admin always wins.
 */

// Word-boundary matched against a normalised, space-padded string, so `mrcp`
// cannot match inside an unrelated word.
const CERTIFICATE =
  /\b(certificate|certification|cct|ccst|diploma|lds|gaicd|mrcpsych|mrcp)\b/
const MEDAL =
  /\b(fellow|fellowship|fracs|fracds|franzcp|frcs|frcpsych|fanzca|fracp|facem|facd)\b/

export const qualificationIcon = (text?: string | null): IconName => {
  const t = String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
  if (CERTIFICATE.test(t)) return 'certificate'
  if (MEDAL.test(t)) return 'medal'
  return 'graduation-cap'
}

/**
 * Accreditations take a seal-check in every one of the reference's 26 profiles,
 * without exception — checked on every `<li>`, not sampled. Kept as a named
 * export rather than a literal at the call site so the two defaults sit together.
 */
export const ACCREDITATION_ICON: IconName = 'seal-check'
