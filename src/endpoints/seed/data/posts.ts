// "In the Loop" article posts, transcribed/paraphrased from the design reference
// (.design-reference/in-the-loop/*). Titles are the real article H1s; slugs derive
// from the reference filenames. Bodies are faithful paraphrases of the reference
// article (the QA-insight volumes carry the reference's real, detailed content;
// the templated streams are rewritten from each article's title + lead). Consumed
// by the data-layer seed, which resolves `stream` (slug) → streams collection id,
// `categories` (slugs) → categories collection ids, and runs each body through
// plainTextToLexical() for the richText `content` field.
//
// `categories` carry the per-article chip shown on the In-the-Loop hub cards
// (e.g. "Company News" vs "Industry News"). The ArchiveBlock renders the post's
// OWN first category, falling back to the stream title when a post has none — so
// QA-insight posts deliberately omit a category and inherit the "QA Insights"
// stream tag.

import { POST_BODIES } from './postBodies'

export type PostSeed = {
  title: string
  slug: string
  stream: string // stream slug (featured | news-updates | industry-insights | specialist-spotlights | qa-insights | staff-narratives | resources)
  categories?: string[] // category slugs — the per-article chip on hub cards
  featured?: boolean
  excerpt: string
  author: { name: string; role: string }
  publishedAt: string // ISO date string, e.g. '2026-06-15'
  body: string // plain text; paragraphs separated by \n\n, `## ` lines → H2 sections
}

const RAW_POSTS: PostSeed[] = [
  // The four real "In the Loop" volumes. Everything else in this fixture was
  // AI-written scaffold content and was removed on 2026-08-20 — see the
  // 2026-08-20 content cull; `git log` has the pass. Deleting a fixture entry
  // does NOT remove the document from an existing install: `createIfNew` only
  // ever adds. These were cleared by a full reseed, which is also how the box
  // is built.
  {
    title: 'In the Loop Vol. 24 — Combining Whole Person Impairment Figures',
    slug: 'in-the-loop-vol-24-combining-whole-person-impairment-figures',
    stream: 'qa-insights',
    excerpt:
      'How Whole Person Impairment figures are correctly combined under the AMA Guides — and why it is not simple addition.',
    author: { name: 'Sharla Knechtli', role: 'Quality Assurance Lead' },
    publishedAt: '2025-09-22',
    body: `A question we field often in Quality Assurance is why a report's total Whole Person Impairment (WPI) figure doesn't match the sum of its parts. If a claimant has a 7% lumbar spine impairment, an 8% finger amputation, and a 15% lower limb impairment, the arithmetic sum is 30% — yet the specialist may correctly report 27%.

The answer lies in the Combined Values Chart of the AMA Guides to the Evaluation of Permanent Impairment, Fifth Edition. Rather than adding figures, each impairment is combined so that a new impairment applies only to the portion of the person that remains unimpaired. Working the example through the chart — 15% combined with 8%, then combined with 7% — yields 27%.

This is why total WPI can never exceed 100%: the figures are proportional reflections of overall functional loss, not raw numbers to be added indefinitely. Understanding the method helps practitioners explain a figure to a client, defend a compliant report, and recognise when a rating may be inconsistent with the Guides and warrant review.`,
  },
  {
    title: 'In the Loop Vol. 25 — Compiling Briefs to Medical Specialists',
    slug: 'in-the-loop-vol-25-compiling-briefs-to-medical-specialists',
    stream: 'qa-insights',
    excerpt:
      'Putting together a brief to a medico-legal specialist is a balancing act. Here is what the best briefs have in common.',
    author: { name: 'Aki Tsimouris', role: 'Quality Assurance Officer' },
    publishedAt: '2025-11-03',
    body: `Compiling a brief to a medico-legal specialist is a balancing act. It is tempting to include every available record so nothing is missed, but that often produces a brief that is large, costly, and cluttered with material that draws focus away from the subject incident.

The best briefs are built around relevance to the specialist's field. An orthopaedic surgeon benefits from pre-injury imaging and prior incident forms; a psychiatrist from school counsellor or treating psychologist records. Including only what is pertinent gives the specialist a clear picture of the claimant before and after the incident.

Great briefs also trim and de-duplicate. Redacted or poorly copied pages, unrelated pathology and imaging, and — most commonly — records duplicated across multiple treating providers are removed. Checking material against these principles before it is sent improves turnaround, ensures relevance, and reduces the specialist's reading time and cost.`,
  },
  {
    title: 'In the Loop Vol. 26 — Why Maximum Medical Improvement is the Baseline for a Reliable IME',
    slug: 'in-the-loop-vol-26-why-maximum-medical-improvement-is-the-baseline-for-a-reliable-ime',
    stream: 'qa-insights',
    excerpt:
      'Assessing before Maximum Medical Improvement is reached produces preliminary opinions that often need to be revisited.',
    author: { name: 'Evie Le', role: 'Quality Assurance Manager' },
    publishedAt: '2026-01-29',
    body: `In medico-legal practice, the timing of an independent medical examination can matter as much as its findings. We regularly see requests for a permanent impairment assessment before the examinee has reached Maximum Medical Improvement (MMI) — the point at which the condition is stable and stationary and no further significant change is expected.

Assessing an injury that is still healing produces a speculative, 'preliminary' report that cannot support a final WPI rating. That usually means a second assessment months later once MMI is reached — expert costs incurred twice over, added administrative burden, and limited value toward settlement in the meantime.

As a rule of thumb, we suggest a minimum of nine months from injury for physical conditions and twelve months for psychiatric injuries, alongside evidence that symptoms and treatment have plateaued. Asking the specialist to address MMI status as well as WPI in the letter of instruction avoids the cost of a reassessment.

There are exceptions — an early IME can be worthwhile to resolve a disputed diagnosis, establish causation, or assess current work capacity before the clinical picture changes. The key is to undertake an early assessment only where it delivers a genuine benefit to the claim, not simply to move a matter along.`,
  },
  {
    title: 'In the Loop Vol. 27 — Timing the IME Process',
    slug: 'in-the-loop-vol-27-timing-the-ime-process',
    stream: 'qa-insights',
    excerpt:
      'A practical timeline for the whole IME process — from booking specialist availability through to report delivery.',
    author: { name: 'Mel Smith', role: 'Quality Assurance Officer' },
    publishedAt: '2026-03-27',
    body: `The IME process has several time-sensitive stages, and planning around them prevents avoidable stress. Sought-after specialists are frequently booked out three months or more in advance, so the single best step is to book as early as possible to secure an appointment within your required timeframe.

Briefing is its own balancing act. Collate the brief too early and you may miss recent records; too late and the specialist has no time to review it. Aim to provide the brief one to three weeks before the examination — recent enough to be current, early enough for proper preparation.

The claimant needs preparation too. Confirm the location, date, and time at least one to two weeks ahead, ensure any forms are returned, and, for video assessments, help them test their equipment and confirm a private location. Where a solicitor relays communications, allow extra lead time to avoid missed messages.

Finally, keep the lines open. Provide an alternate contact for the day of assessment, flag any urgent deadlines to VERIFY as early as possible, and let us know if further documents arrive during drafting — a supplementary report can often be arranged even after the specialist has formed an opinion.`,
  },
]

// Prefer the H2-sectioned long-read body (data/postBodies.ts) when one exists
// for the slug, so the article page renders reference-style sections and the
// scroll-spy TOC populates; fall back to the inline flat body otherwise.
export const POSTS: PostSeed[] = RAW_POSTS.map((p) => ({
  ...p,
  body: POST_BODIES[p.slug] ?? p.body,
}))
