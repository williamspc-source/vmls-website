import { seedCreate, seedUpdate, seedUpdateGlobal } from './seed/seedWrite'
import type { Payload, PayloadRequest } from 'payload'
import { readFileSync } from 'fs'
import path from 'path'
import {
  safeRevalidatePath as revalidatePath,
  safeRevalidateTag as revalidateTag,
} from '@/utilities/safeRevalidate'

import { seedDataLayer } from './seed/seedDataLayer'
import { seedAvailability } from './seed/seedAvailability'
import { seedHomepage } from './seed/seedHomepage'
import { seedContentGlobals } from './seed/seedContentGlobals'
import { seedAbout } from './seed/seedAbout'
import { seedServices } from './seed/seedServices'
import { seedSpecialists } from './seed/seedSpecialists'
import { seedInfoBooking } from './seed/seedInfoBooking'
import { seedHubs } from './seed/seedHubs'
import { seedLegal } from './seed/seedLegal'
import { repairBlockBands } from './seed/seedBlockBands'
import { repairLinkTargets } from './seed/seedLinkRepairs'
import { repairServiceLinks } from './seed/seedServiceLinks'
import {
  repairServicesFeatureIcon,
  repairImeFormatsCardStyle,
  repairJmeSpecialistCarousel,
  repairCompactProcessSteps,
  repairReportingSplitVariants,
  repairMedicalNegligenceRemoval,
} from './seed/seedServices'
import { repairSpecialistIcons } from './seed/seedSpecialistIcons'
import { repairFeaturedSpecialists } from './seed/seedFeaturedSpecialists'
import { repairForClientsCards } from './seed/seedForClients'
import { repairFaqVariants } from './seed/repairFaqVariants'
import { repairHeroCopy } from './seed/repairHeroCopy'
import { repairEnquiryLayout } from './seed/repairEnquiryLayout'
import { repairPortalEnquiry } from './seed/repairPortalEnquiry'
import { repairJoinBenefits } from './seed/repairJoinBenefits'
import { repairEventTimeDash } from './seed/repairEventTimeDash'
import { repairSocialImage } from './seed/repairSocialImage'
import { repairClaimantProcessImage } from './seed/repairClaimantProcessImage'
import { repairSpecialistNames } from './seed/repairSpecialistNames'
import { repairSpecialistPortraitShape } from './seed/repairSpecialistPortraitShape'
import { repairContentImages } from './seed/repairContentImages'
import { repairHubEmptySections } from './seed/repairHubEmptySections'
import { repairEventsSeparator } from './seed/repairEventsSeparator'
import { repairTeamDepartments } from './seed/repairTeamDepartments'
import { repairEventsHub, repairFeaturedCategories } from './seed/seedEventsHub'
import { isPlaceholderLayout } from './seed/authored'
import { CONTACT_SERVICE_OPTIONS } from './seed/data/services'

/* =====================================================================
   Non-destructive scaffold seed for the VERIFY site.

   Unlike the template `seed` (endpoints/seed), this does NOT wipe any
   collections. It creates the nested page tree (idempotently, by slug)
   and populates the Header + Footer globals so every nav link resolves.

   The data-driven section landings (specialists, in-the-loop,
   events) are created as plain placeholder pages for now; later they
   gain a list/archive block rather than a new route.
   ===================================================================== */

// Globals the seed writes, whose cache tags it must purge when it finishes.
// Keep in step with the globals registered in payload.config.ts.
const GLOBAL_SLUGS = [
  'header',
  'footer',
  'site-settings',
  'specialist-availability',
  'specialist-profile',
  'article-settings',
  'events-settings',
  'team-settings',
  'custom-styles',
  'design-system',
] as const

// ── Minimal Lexical helpers ──
// `format` is the Lexical inline-format bitmask (1 = bold).
const textNode = (text: string, format = 0) => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

const bold = (text: string) => textNode(text, 1)

const heading = (text: string, tag: 'h1' | 'h2' | 'h3' = 'h1') => ({
  type: 'heading',
  tag,
  children: [textNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

// Accepts a string or an array of inline nodes (for mixed bold/normal text).
const paragraph = (content: string | unknown[]) => ({
  type: 'paragraph',
  children: typeof content === 'string' ? [textNode(content)] : content,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  version: 1,
})

const listItem = (content: string | unknown[], value: number) => ({
  type: 'listitem',
  children: typeof content === 'string' ? [textNode(content)] : content,
  direction: 'ltr',
  format: '',
  indent: 0,
  value,
  version: 1,
})

const list = (listType: 'bullet' | 'number', items: (string | unknown[])[]) => ({
  type: 'list',
  listType,
  tag: listType === 'number' ? 'ol' : 'ul',
  start: 1,
  children: items.map((item, i) => listItem(item, i + 1)),
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

const richText = (children: unknown[]) => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

// ── For Claimants page content (migrated from .design-reference) ──
const forClaimantsLayout = () => [
  {
    blockType: 'content' as const,
    columns: [
      {
        size: 'full' as const,
        enableLink: false,
        richText: richText([
          heading('The IME process', 'h2'),
          list('number', [
            [bold('The appointment is booked. '), textNode('The medico-legal appointment is scheduled by the lawyers, and the medical brief is sent to the doctor.')],
            [bold('Before the appointment. '), textNode('For videolink assessments, our team will contact you to test your device. Complete any paperwork you received electronically.')],
            [bold('On the day. '), textNode('Arrive at least 15 minutes early — you will have some paperwork to complete. Bring photo ID (driver licence or passport) and attend the examination.')],
            [bold('What happens next. '), textNode('The specialist writes the report and our team provides it to your solicitor.')],
          ]),
          heading('What to bring', 'h2'),
          list('bullet', [
            'Photographic identification (driver licence or passport)',
            'The Claimant Questionnaire completed by you',
            'The Informed Consent form completed by you',
            'For a physical examination: any X-rays, CT scans and MRI results',
          ]),
          paragraph('VERIFY will provide the Claimant Questionnaire and Informed Consent form to your lawyer before the IME.'),
          heading('What to wear', 'h2'),
          paragraph('You may need to partially disrobe for a physical examination, so we recommend loose-fitting clothing and appropriate underwear. Short-sleeve or sleeveless tops are better for upper-limb injuries; loose shorts or a medium-length skirt are better for lower-limb and hip injuries. Avoid long tight pants or jeans.'),
          heading('When to arrive', 'h2'),
          paragraph('We recommend arriving 20 minutes before your IME, and at least 15 minutes before, as you may need to complete additional paperwork before the examination commences.'),
          heading('Videolink appointments', 'h2'),
          paragraph('Videolink IMEs are conducted over a private link sent directly to you. At least three days before, arrange a suitable device (laptop, or desktop with camera and microphone, or a smart mobile device) and identify a quiet, comfortable and secure location. As this is a medical examination for a legal claim, you must be by yourself for the duration of the appointment unless support persons are pre-approved. Our admin team will be in touch to test your connection beforehand.'),
        ]),
      },
    ],
  },
  {
    blockType: 'faq' as const,
    heading: 'Frequently asked questions',
    items: [
      { question: 'What is an Independent Medico-Legal Examination (IME)?', answer: richText([paragraph("An IME is designed to provide an impartial, expert medical opinion about a claimant's injuries or medical conditions. The expert evaluates whether the injury is stable and stationary, permanent or otherwise, and determines how it affects the claimant's capacity to work and function.")]) },
      { question: 'Who is an independent medical examiner?', answer: richText([paragraph("The independent medical examiner is an expert in their field of medicine or allied health, engaged by lawyers and insurers to provide an independent opinion on the claimant's injury, treatment and impairments. Importantly, the examiner is not the claimant's treating doctor.")]) },
      { question: 'What happens at the IME?', answer: richText([paragraph('The examiner will have received and read a letter from your lawyer with all relevant medical notes before the IME. You will complete paperwork and produce photographic identification. The examiner may ask how the accident happened, about your injuries, symptoms and treatment, and how this has affected your work and daily living. For a physical injury, a physical examination focused on the injured area (and sometimes more general) will be conducted. A written report is then provided to your lawyer.')]) },
      { question: 'What should I bring to the IME?', answer: richText([paragraph('For a physical examination, bring any X-rays, CT scans and MRI results. For all examinations, bring photographic identification (driver licence or passport), the completed Claimant Questionnaire, and the completed Informed Consent form. VERIFY provides the questionnaire and consent form to your lawyer beforehand.')]) },
      { question: 'How long will the IME take?', answer: richText([paragraph('It varies with the complexity of your injuries and the specialist. Allow one hour for an orthopaedic surgeon or neurosurgeon; up to 90 minutes for a neurologist if additional testing is required; 90 minutes to 2 hours for a psychiatric examination; and two to three hours for an occupational therapist.')]) },
      { question: 'Can I bring someone with me?', answer: richText([paragraph('You are welcome to bring a family member, friend or support person, however they will generally wait in reception for the duration of the IME. If the examiner allows a support person to attend, they are there only to support you — not to participate, ask questions or answer on your behalf.')]) },
      { question: 'Can I get a copy of the report?', answer: richText([paragraph('The report is provided to your lawyer. If you wish to request a copy, you will need to speak directly to your lawyer — we are unable to release the report directly to you.')]) },
      { question: 'Do I have to pay for the examination?', answer: richText([paragraph('No. You do not pay for the examination in our office or directly to the doctor. The cost of the examination and the medico-legal report is invoiced to your solicitor.')]) },
      { question: 'What if I need an interpreter?', answer: richText([paragraph('We will organise an interpreter for you if required. We need adequate notice from your lawyer to schedule this.')]) },
      { question: 'What if I am running late or cannot attend?', answer: richText([paragraph('Contact VERIFY immediately. We will inform the examiner of the situation. Late cancellation fees and non-attendance fees may apply.')]) },
    ],
  },
]

const heroFor = (title: string) => ({
  type: 'lowImpact' as const,
  richText: richText([heading(title, 'h1')]),
})

// A standard page hero (eyebrow + heading + subtitle). The breadcrumb is left to
// the field's own `defaultValue: true` — an earlier `showBreadcrumb: false` here
// was wrong on both counts: the design reference does carry a trail on these
// pages (Contact included), and the header nav gives no sense of depth. Note the
// eyebrow only renders when the trail doesn't; see PageHero.
const pageHero = (eyebrow: string, headingText: string, subtitle: string) => ({
  type: 'pageHero' as const,
  eyebrow,
  heading: headingText,
  subtitle,
})

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const selectOptions = (labels: string[]) =>
  labels.map((label) => ({ label, value: slugify(label) }))

// `isPlaceholderLayout` now lives in ./seed/authored, where every authorPage
// copy reads it too — it used to be defined here and used only by the two pages
// built outside authorPage, while the seven authorPage copies each guessed with
// `layout.length > 2` instead.

const placeholderLayout = (title: string) => [
  {
    blockType: 'content' as const,
    columns: [
      {
        size: 'full' as const,
        enableLink: false,
        richText: richText([
          paragraph(`The “${title}” page is scaffolded and ready for content.`),
        ]),
      },
    ],
  },
]

// ── Page tree (parent-first order so parents exist before children) ──
type PageNode = { slug: string; title: string; parent?: string }

const PAGE_TREE: PageNode[] = [
  { slug: 'home', title: 'Home' },
  { slug: 'contact', title: 'Contact Us' },
  { slug: 'make-a-booking', title: 'Make a Booking' },

  { slug: 'about', title: 'About VERIFY' },
  { slug: 'meet-the-team', title: 'Meet the Team', parent: 'about' },

  { slug: 'services', title: 'Services' },
  { slug: 'educational-services', title: 'Educational Services', parent: 'services' },
  { slug: 'medico-legal', title: 'Medico-Legal Services', parent: 'services' },
  { slug: 'ime', title: 'Independent Medical Examination (IME)', parent: 'medico-legal' },
  { slug: 'jme', title: 'Joint Medical Examination (JME)', parent: 'medico-legal' },
  { slug: 'reporting-services', title: 'Other Reporting Services', parent: 'medico-legal' },
  { slug: 'admin-services', title: 'Administrative Services', parent: 'medico-legal' },

  { slug: 'specialists', title: 'Specialists' },
  { slug: 'specialist-panel', title: 'Specialist Panel', parent: 'specialists' },
  { slug: 'specialty-list', title: 'Specialty List', parent: 'specialists' },
  { slug: 'specialist-availability', title: 'Specialist Availability', parent: 'specialists' },
  { slug: 'join-expert-panel', title: 'Join Expert Panel', parent: 'specialists' },

  { slug: 'information-centre', title: 'Information Centre' },
  { slug: 'for-clients', title: 'For Clients', parent: 'information-centre' },
  { slug: 'for-claimants', title: 'For Claimants', parent: 'information-centre' },

  { slug: 'in-the-loop', title: 'In the Loop' },
  { slug: 'events', title: 'Events & Seminars' },
  { slug: 'upcoming-events', title: 'Upcoming Events', parent: 'events' },
  { slug: 'past-events', title: 'Past Events', parent: 'events' },

  // Legal pages are standalone (no "Legal" landing page).
  { slug: 'privacy-policy', title: 'Privacy Policy' },
  { slug: 'terms-conditions', title: 'Terms & Conditions' },
]

const LINKEDIN = 'https://www.linkedin.com/company/verify-medico-legal-solutions/'
const FACEBOOK = 'https://www.facebook.com/profile.php?id=100066385885275'

// ── Starter Custom Styles preset library ──
// Each preset bundles a class name + its CSS. Applied via the strict picker on
// blocks/heroes/pages. Selectors target the stable `vf-*` hooks and brand tokens.
const STYLE_PRESETS: { name: string; label: string; description: string; css: string }[] = [
  // Cards
  {
    name: 'card-elevated',
    label: 'Cards · Elevated',
    description: 'Larger brand-tinted shadow on every card in the block.',
    css: '.card-elevated .vf-card { box-shadow: var(--shadow-lg); }',
  },
  {
    name: 'card-bordered',
    label: 'Cards · Bold border',
    description: 'Adds a 2px primary border to cards.',
    css: '.card-bordered .vf-card { border-width: 2px; border-color: var(--primary); }',
  },
  {
    name: 'card-accent-bar',
    label: 'Cards · Accent bar on hover',
    description: 'A primary bar wipes across the top of a card on hover.',
    css: `.card-accent-bar .vf-card { position: relative; overflow: hidden; }
.card-accent-bar .vf-card::before { content: ''; position: absolute; inset: 0 0 auto 0; height: 3px; background: var(--primary); transform: scaleX(0); transform-origin: left; transition: transform .3s var(--transition); }
.card-accent-bar .vf-card:hover::before { transform: scaleX(1); }`,
  },
  {
    name: 'card-hover-zoom',
    label: 'Cards · Hover zoom',
    description: 'Cards scale up slightly on hover.',
    css: `.card-hover-zoom .vf-card { transition: transform .3s var(--transition); }
.card-hover-zoom .vf-card:hover { transform: scale(1.03); }`,
  },
  {
    name: 'card-gradient',
    label: 'Cards · Soft gradient',
    description: 'Light accent→white gradient background on cards.',
    css: '.card-gradient .vf-card { background: linear-gradient(140deg, var(--accent), #fff); }',
  },
  {
    name: 'card-flat',
    label: 'Cards · Flat',
    description: 'Removes shadow for a flat, bordered look.',
    css: '.card-flat .vf-card { box-shadow: none; border-color: var(--border); }',
  },
  // Buttons (apply via the Element styles → Buttons slot)
  {
    name: 'btn-pill',
    label: 'Button · Pill',
    description: 'Fully rounded button.',
    css: '.btn-pill { border-radius: 999px; }',
  },
  {
    name: 'btn-shine',
    label: 'Button · Shine',
    description: 'A light sweeps across the button on hover.',
    css: `.btn-shine { position: relative; overflow: hidden; }
.btn-shine::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent); transform: translateX(-100%); transition: transform .5s; }
.btn-shine:hover::before { transform: translateX(100%); }`,
  },
  {
    name: 'btn-glow',
    label: 'Button · Glow',
    description: 'Glowing shadow on hover.',
    css: '.btn-glow:hover { box-shadow: 0 8px 24px rgba(28,117,188,.4); }',
  },
  {
    name: 'btn-block',
    label: 'Button · Full width',
    description: 'Stretches the button to full width.',
    css: '.btn-block { width: 100%; justify-content: center; }',
  },
  // Headings (apply via Element styles → Heading)
  {
    name: 'heading-underline',
    label: 'Heading · Underline',
    description: 'Primary underline beneath the heading text.',
    css: '.heading-underline { display: inline-block; padding-bottom: .25em; border-bottom: 3px solid var(--primary); }',
  },
  {
    name: 'heading-gradient',
    label: 'Heading · Gradient text',
    description: 'Primary→light-blue gradient fill on the heading.',
    css: '.heading-gradient { background: linear-gradient(90deg, var(--primary), var(--secondary-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }',
  },
  {
    name: 'heading-primary',
    label: 'Heading · Primary colour',
    description: 'Colours the heading in the brand primary.',
    css: '.heading-primary { color: var(--primary); }',
  },
  // Badges (apply to the block root)
  {
    name: 'badge-solid',
    label: 'Badges · Solid',
    description: 'Solid primary badges.',
    css: '.badge-solid .vf-badge { background: var(--primary); color: var(--primary-foreground); }',
  },
  {
    name: 'badge-outline',
    label: 'Badges · Outline',
    description: 'Outlined badges.',
    css: '.badge-outline .vf-badge { background: transparent; border: 1px solid var(--primary); color: var(--primary); }',
  },
  // Sections / bands (apply to the block root)
  {
    name: 'section-tight',
    label: 'Section · Tight padding',
    description: 'Reduces the section’s vertical padding.',
    css: '.section-tight.vf-section { padding-top: 2.5rem; padding-bottom: 2.5rem; }',
  },
  {
    name: 'section-loose',
    label: 'Section · Loose padding',
    description: 'Increases the section’s vertical padding.',
    css: '.section-loose.vf-section { padding-top: 7rem; padding-bottom: 7rem; }',
  },
  {
    name: 'band-gradient-blue',
    label: 'Band · Light blue gradient',
    description: 'Soft light-blue gradient background.',
    css: '.band-gradient-blue.vf-section { background: linear-gradient(135deg, #eef9ff, #d9efff); }',
  },
  {
    name: 'band-flat-blue',
    label: 'Band · Flat light blue',
    description: 'Solid pale-blue background — the reference’s enquiry band, with no gradient.',
    css: '.band-flat-blue.vf-section { background: #e6f4ff; }',
  },
  {
    name: 'band-grey-deep',
    label: 'Band · Deeper grey',
    description: 'A slightly deeper grey than the standard Muted band.',
    css: '.band-grey-deep.vf-section { background: #f0f2f4; }',
  },
  {
    name: 'band-gradient-dark',
    label: 'Band · Dark blue gradient',
    description: 'Dark brand gradient with light text.',
    css: `.band-gradient-dark.vf-section { background: linear-gradient(135deg, #0d4f85, #1c75bc); color: #fff; }
.band-gradient-dark .vf-section-header__subtitle { color: rgba(255,255,255,.85); }
.band-gradient-dark .vf-section-header__eyebrow { color: rgba(255,255,255,.8); }`,
  },
  // Carousel
  {
    name: 'carousel-fade-edges',
    label: 'Carousel · Faded edges',
    description: 'Fades the carousel’s left/right edges.',
    css: '.carousel-fade-edges .vf-carousel__track { -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); }',
  },
  {
    name: 'carousel-arrows-overlay',
    label: 'Carousel · Overlay arrows',
    description: 'Places the arrows over the carousel sides.',
    // Targets .vf-carousel__arrow directly: ExpertsCarousel renders the arrows
    // as siblings of the viewport with no .vf-carousel__controls wrapper, so the
    // original selector matched nothing and this preset did nothing at all.
    css: `.carousel-arrows-overlay { position: relative; }
.carousel-arrows-overlay .vf-carousel__arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 2; pointer-events: auto; box-shadow: var(--vf-shadow-lg); }
.carousel-arrows-overlay .vf-carousel__arrow--prev { left: 0; }
.carousel-arrows-overlay .vf-carousel__arrow--next { right: 0; }`,
  },
  // Icons / avatars
  {
    name: 'icon-fill-hover',
    label: 'Icons · Fill on hover',
    description: 'Card icon fills with primary on card hover.',
    css: '.icon-fill-hover .vf-card:hover .vf-card__icon { background: var(--primary); color: #fff; }',
  },
  {
    name: 'avatar-gradient',
    label: 'Avatars · Gradient initials',
    description: 'Gradient background behind initials avatars.',
    // The initials element is `.avatar-mono` (PersonCard renders it on both the
    // team-card and specialist-card treatments). `.vf-person-card__avatar-initials`
    // was never emitted by anything, so this preset was a no-op.
    css: '.avatar-gradient .avatar-mono { background: linear-gradient(135deg, var(--primary), var(--secondary-2)); color: var(--white); }',
  },
  // Effects
  {
    name: 'divider-accent',
    label: 'Divider · Bold',
    description: 'Widens/thickens the section-header divider.',
    // SectionHeader renders the rule as plain `.divider`, never
    // `.vf-section-header__divider` — the documented name that never existed.
    css: '.divider-accent .vf-section-header .divider { width: 80px; height: 4px; }',
  },
  {
    name: 'lift-on-hover',
    label: 'Effect · Lift on hover',
    description: 'Lifts the element on hover.',
    css: '.lift-on-hover { transition: transform .3s var(--transition); } .lift-on-hover:hover { transform: translateY(-4px); }',
  },
]

export const seedVerify = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding VERIFY scaffold (non-destructive)…')

  const idBySlug = new Map<string, number | string>()

  // Reads the parent id off a page doc whether the relationship came back as an
  // object (populated) or a bare id (depth 0).
  const parentIdOf = (doc: { parent?: unknown }): number | string | null => {
    const p = doc.parent
    if (p && typeof p === 'object') return (p as { id: number | string }).id
    return (p as number | string | null | undefined) ?? null
  }

  // Create (or reuse) every page, parents first. PAGE_TREE is ordered parents-
  // before-children, so idBySlug always has the parent id by the time a child is
  // processed and breadcrumbs cascade correctly.
  for (const node of PAGE_TREE) {
    const intendedParent = node.parent ? (idBySlug.get(node.parent) ?? null) : null

    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: node.slug } },
      limit: 1,
      depth: 0,
      req,
    })

    if (existing.docs[0]) {
      const doc = existing.docs[0]
      idBySlug.set(node.slug, doc.id)

      // Repair pass: production pages predate the nested tree because this branch
      // used to `continue` without ever setting `parent` (it's only assigned on
      // create). Re-point such a page so its URL migrates flat → nested
      // (e.g. /ime → /services/medico-legal/ime). nested-docs recomputes this
      // page's (and its descendants') breadcrumbs on save.
      //
      // Only pages with NO parent are repaired. This used to re-point any page
      // whose parent merely differed from PAGE_TREE, which meant a deliberate
      // move by an editor was silently reverted on the next seed — changing a
      // live URL with no redirect left behind and no revalidation, so the old
      // path 404'd and the new one stayed uncached. An editor's decision beats
      // a code fixture.
      const currentParent = parentIdOf(doc)
      if (currentParent == null && intendedParent) {
        await seedUpdate(payload, {
          collection: 'pages',
          id: doc.id,
          depth: 0,
          req,
          context: { disableRevalidate: true },
          data: { parent: intendedParent } as never,
        })
        payload.logger.info(`— Repaired parent for /${node.slug} → under ${node.parent}`)
      } else {
        payload.logger.info(`— Page exists: /${node.slug}`)
      }
      continue
    }

    const created = await seedCreate(payload, {
      collection: 'pages',
      depth: 0,
      req,
      context: { disableRevalidate: true },
      data: {
        title: node.title,
        slug: node.slug,
        _status: 'published',
        hero: heroFor(node.title),
        layout: placeholderLayout(node.title),
        ...(intendedParent ? { parent: intendedParent } : {}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    })

    idBySlug.set(node.slug, created.id)
    payload.logger.info(`— Created page: /${node.slug}`)
  }

  // ── Link helpers ──
  const pageLink = (slug: string, label: string) => ({
    link: {
      type: 'reference' as const,
      reference: { relationTo: 'pages' as const, value: idBySlug.get(slug)! },
      label,
      url: null,
      newTab: false,
    },
  })
  // Custom URL link (used for the on-page anchor submenu items under Services).
  const customLink = (url: string, label: string) => ({
    link: { type: 'custom' as const, url, label, reference: null, newTab: false },
  })

  // ── Header global ──
  await seedUpdateGlobal(payload, {
    slug: 'header',
    depth: 0,
    req,
    context: { disableRevalidate: true },
    data: {
      navItems: [
        {
          ...pageLink('about', 'About Us'),
          subItems: [
            pageLink('about', 'About VERIFY'),
            pageLink('meet-the-team', 'Meet the Team'),
          ],
        },
        {
          ...pageLink('services', 'Services'),
          subItems: [
            pageLink('ime', 'Independent Medical Examination (IME)'),
            pageLink('jme', 'Joint Medical Examination (JME)'),
            {
              ...pageLink('reporting-services', 'Other Reporting Services'),
              // Canonical nested paths (pages live under /services/medico-legal) so
              // the in-page anchor survives — a flat /reporting-services#… would
              // 308-redirect to the nested URL and drop the fragment.
              subSubItems: [
                customLink('/services/medico-legal/reporting-services#file-review', 'File Review'),
                customLink('/services/medico-legal/reporting-services#supplementary-report', 'Supplementary Report'),
                customLink('/services/medico-legal/reporting-services#teleconference', 'Teleconference'),
                customLink('/services/medico-legal/reporting-services#expert-evidence', 'Expert Evidence'),
              ],
            },
            {
              ...pageLink('admin-services', 'Administrative Services'),
              subSubItems: [
                customLink('/services/medico-legal/admin-services#surrogate-assessment', 'Surrogate Assessment Service'),
                customLink('/services/medico-legal/admin-services#interpreter-booking', 'Interpreter Booking Service'),
                customLink('/services/medico-legal/admin-services#brief-reduction', 'Brief Reduction Service'),
                customLink('/services/medico-legal/admin-services#letter-of-instruction-review', 'Letter of Instruction Review'),
              ],
            },
          ],
        },
        {
          // Availability now lives on the Make a Booking page (no standalone nav item).
          ...pageLink('specialists', 'Specialists'),
          subItems: [
            pageLink('specialist-panel', 'Specialist Panel'),
            pageLink('specialty-list', 'Specialty List'),
            pageLink('join-expert-panel', 'Join our Expert Panel'),
          ],
        },
        {
          ...pageLink('information-centre', 'Information Centre'),
          subItems: [
            pageLink('for-clients', 'For Clients'),
            pageLink('for-claimants', 'For Claimants'),
          ],
        },
        pageLink('in-the-loop', 'In the Loop'),
        {
          ...pageLink('events', 'Events & Seminars'),
          subItems: [
            pageLink('upcoming-events', 'Upcoming Events'),
            pageLink('past-events', 'Past Events'),
          ],
        },
        pageLink('contact', 'Contact Us'),
      ],
      cta: {
        enabled: true,
        link: pageLink('make-a-booking', 'Make a Booking').link,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  })
  payload.logger.info('— Populated header global')

  // ── Footer global ──
  await seedUpdateGlobal(payload, {
    slug: 'footer',
    depth: 0,
    req,
    context: { disableRevalidate: true },
    data: {
      // Reference footer goes straight from the logo to the socials (no tagline).
      tagline: '',
      columns: [
        {
          title: 'Services',
          links: [
            pageLink('ime', 'Independent Medical Examination'),
            pageLink('jme', 'Joint Medical Examination'),
            pageLink('reporting-services', 'Reporting Services'),
            pageLink('admin-services', 'Administrative Services'),
          ],
        },
        {
          title: 'Key Pages',
          links: [
            pageLink('home', 'Home'),
            pageLink('about', 'About VERIFY'),
            pageLink('specialist-panel', 'Specialist Panel'),
            pageLink('information-centre', 'Information Centre'),
            pageLink('events', 'Events & Seminars'),
          ],
        },
      ],
      contact: {
        phone: '07 3356 0469',
        phoneHref: 'tel:0733560469',
        email: 'admin@vmls.com.au',
        address: 'Level 18, 127 Creek Street\nBrisbane QLD 4000',
      },
      hours: [{ days: 'Monday to Friday', time: '08:30 – 17:00' }],
      social: [
        { platform: 'linkedin', url: LINKEDIN },
        { platform: 'facebook', url: FACEBOOK },
      ],
      legalLinks: [
        pageLink('privacy-policy', 'Privacy Policy'),
        pageLink('terms-conditions', 'Terms & Conditions'),
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  })
  payload.logger.info('— Populated footer global')

  // ── Specialist Availability settings global ──
  await seedUpdateGlobal(payload, {
    slug: 'specialist-availability',
    depth: 0,
    req,
    context: { disableRevalidate: true },
    data: {
      heading: 'Specialist Availability',
      intro: richText([
        paragraph(
          'Browse current availability for our featured specialists. Select the sessions that suit your matter and send us an enquiry — our team will confirm the booking with you.',
        ),
      ]),
      carouselEyebrow: 'Featured Specialists',
      carouselTitle: 'Available This Month',
      carouselSubtitle:
        'A selection of our expert panel with current appointment availability across in-person and telehealth sessions.',
      enquiryEmail: 'admin@vmls.com.au',
      enquirySubject: 'Specialist Availability Enquiry',
      enquiryBodyIntro:
        'Hello VERIFY team,\n\nI would like to enquire about the following appointment sessions:',
      enquiryBodyFooter:
        'My name is:\nMy contact number is:\nClaim / referrer details (if any):\n\nThank you.',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  })
  payload.logger.info('— Populated specialist availability global')

  // ── Custom Styles global (starter presets) ──
  {
    const existingStyles = await payload.findGlobal({ slug: 'custom-styles', depth: 0, req })
    if (!existingStyles?.presets?.length) {
      await seedUpdateGlobal(payload, {
        slug: 'custom-styles',
        depth: 0,
        req,
        context: { disableRevalidate: true },
        data: {
          presets: STYLE_PRESETS,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })
      payload.logger.info(`— Seeded ${STYLE_PRESETS.length} Custom Styles presets`)
    }
  }

  // ── For Claimants page content (only while still the placeholder) ──
  {
    const fc = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'for-claimants' } },
      limit: 1,
      depth: 0,
      req,
    })
    const page = fc.docs[0]
    const layout = (page?.layout ?? []) as { blockType?: string }[]
    const isPlaceholder =
      Array.isArray(layout) &&
      layout.length === 1 &&
      layout[0]?.blockType === 'content' &&
      JSON.stringify(layout[0]).includes('scaffolded and ready for content')

    if (page && isPlaceholder) {
      await seedUpdate(payload, {
        collection: 'pages',
        id: page.id,
        depth: 0,
        req,
        context: { disableRevalidate: true },
        data: {
          layout: forClaimantsLayout(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })
      payload.logger.info('— Populated For Claimants content (IME info + FAQ)')
    } else {
      payload.logger.info('— For Claimants already has content, skipping')
    }
  }

  // ── Specialist Availability page: pageHero + the Availability block ──
  // (Only while still the placeholder, so editor changes are preserved.)
  {
    const av = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'specialist-availability' } },
      limit: 1,
      depth: 0,
      req,
    })
    const page = av.docs[0]
    if (page && isPlaceholderLayout(page.layout)) {
      await seedUpdate(payload, {
        collection: 'pages',
        id: page.id,
        depth: 0,
        req,
        context: { disableRevalidate: true },
        data: {
          hero: pageHero(
            'Specialists',
            'Specialist Availability',
            'Need an appointment? Browse our specialists with availability below, select the sessions that suit, and send us an enquiry.',
          ),
          layout: [{ blockType: 'availability', showCarousel: true, showLegend: true }],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })
      payload.logger.info('— Built Specialist Availability page (pageHero + Availability block)')
    } else {
      payload.logger.info('— Specialist Availability page already built, skipping')
    }
  }

  // ── Contact form (Form Builder) + place it on the Contact page ──
  {
    const existingForm = await payload.find({
      collection: 'forms',
      where: { title: { equals: 'Contact' } },
      limit: 1,
      depth: 0,
      req,
    })

    let formId = existingForm.docs[0]?.id
    if (!formId) {
      const created = await seedCreate(payload, {
        collection: 'forms',
        depth: 0,
        req,
        context: { disableRevalidate: true },
        data: {
          title: 'Contact',
          // Reference field-set (contact.html): no "Your Role"; "Type of Enquiry"
          // dropdown; Company optional; Message/Enquiry required.
          fields: [
            { blockType: 'text', name: 'firstName', label: 'First Name', width: 50, required: true, placeholder: 'First name' },
            { blockType: 'text', name: 'lastName', label: 'Last Name', width: 50, required: true, placeholder: 'Last name' },
            { blockType: 'email', name: 'email', label: 'Email Address', width: 50, required: true, placeholder: 'you@company.com' },
            { blockType: 'text', name: 'phone', label: 'Phone Number', width: 50, required: false, placeholder: '07 XXXX XXXX' },
            { blockType: 'text', name: 'company', label: 'Company / Organisation', width: 100, required: false, placeholder: 'Your firm or company' },
            {
              blockType: 'select',
              name: 'enquiry_type',
              label: 'Type of Enquiry',
              width: 100,
              required: false,
              options: selectOptions(CONTACT_SERVICE_OPTIONS),
            },
            {
              blockType: 'textarea',
              name: 'message',
              label: 'Message / Enquiry',
              width: 100,
              required: true,
              placeholder: 'Please provide details of your enquiry...',
            },
          ],
          submitButtonLabel: 'SEND ENQUIRY',
          confirmationType: 'message',
          confirmationMessage: richText([
            paragraph('Thank you — your enquiry has been received. Our team will be in touch shortly.'),
          ]),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })
      formId = created.id
      payload.logger.info('— Created Contact form')
    } else {
      payload.logger.info('— Contact form already exists, skipping')
    }

    // The Contact page's form is NOT placed here. It used to be, and that broke
    // the fresh-install path: this ran ~12 seconds before `seedInfoBooking`
    // authors the page, replaced the scaffold placeholder with a lone formBlock,
    // and so made `isUnauthored` false — the real fixture then logged
    // "contact already authored, skipping" on a database ninety seconds old.
    // Measured on a clean reseed: /contact ended with **1 block instead of 13**,
    // no portal card, no contact details, no map, and zero `cssClass` rows, which
    // in turn left `repairPortalEnquiry` with no `ct-portal-card__btn` anchor to
    // find. It failed silently on every fresh install — and the box is a fresh
    // install. `seedInfoBooking` places the same form itself (with the card
    // styling `repairEnquiryLayout` exists to retrofit), looking the id up by
    // query, so nothing is lost by leaving it to the fixture.
  }

  // ── Enquiry drawer form + Join-panel EOI form (per-form recipient email) ──
  {
    const RECIPIENT = 'admin@vmls.com.au'
    /**
     * Returns the form's id in BOTH branches — created and already-existing.
     *
     * It used to return `void` and bail early when the form existed, so anything
     * built on top of it (like the Site Settings pointer below) could only ever
     * run on a virgin database. Repairs that live inside a create branch never
     * repair anything; that is the same trap the `authorPage` early-return set.
     */
    const ensureForm = async (
      title: string,
      fields: unknown[],
      submitButtonLabel: string,
      subject: string,
    ): Promise<number | string> => {
      const existing = await payload.find({
        collection: 'forms',
        where: { title: { equals: title } },
        limit: 1,
        depth: 0,
        req,
      })
      if (existing.docs[0]) {
        payload.logger.info(`— ${title} form already exists, skipping`)
        return existing.docs[0].id
      }
      const created = await seedCreate(payload, {
        collection: 'forms',
        depth: 0,
        req,
        context: { disableRevalidate: true },
        data: {
          title,
          fields,
          submitButtonLabel,
          confirmationType: 'message',
          confirmationMessage: richText([
            paragraph('Thank you — your enquiry has been received. Our team will be in touch shortly.'),
          ]),
          emails: [
            {
              emailTo: RECIPIENT,
              subject,
              message: richText([paragraph(`A new submission was received via the ${title} form.`)]),
            },
          ],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })
      payload.logger.info(`— Created ${title} form (recipient ${RECIPIENT})`)
      return created.id
    }

    // Field names must match the drawer inputs exactly: EnquiryDrawer refuses to
    // submit when a filled-in field has no slot on the form, rather than storing
    // a partial enquiry that looks complete in the admin list.
    const enquiryFormId = await ensureForm(
      'Enquiry',
      [
        { blockType: 'text', name: 'first_name', label: 'First Name', width: 50, required: true, placeholder: 'First name' },
        { blockType: 'text', name: 'last_name', label: 'Last Name', width: 50, required: true, placeholder: 'Last name' },
        { blockType: 'email', name: 'email', label: 'Email Address', width: 50, required: true, placeholder: 'you@company.com' },
        { blockType: 'text', name: 'phone', label: 'Phone Number', width: 50, required: false, placeholder: '07 XXXX XXXX' },
        { blockType: 'text', name: 'company', label: 'Company / Organisation', width: 100, required: false, placeholder: 'Your firm or company' },
        {
          blockType: 'select',
          name: 'enquiry_type',
          label: 'Type of Enquiry',
          width: 100,
          required: false,
          options: selectOptions([
            'Medico-Legal Services',
            'Educational Services (AAMLE)',
            'Specialist Panel Information',
            'Register for Online Booking Portal',
            'Join Our Expert Panel',
            'General Enquiry',
          ]),
        },
        { blockType: 'textarea', name: 'message', label: 'Message / Enquiry', width: 100, required: true, placeholder: 'Please provide details of your enquiry...' },
      ],
      'Send Enquiry',
      'New website enquiry',
    )

    await ensureForm(
      'Expression of Interest',
      // Reference field-set (join-expert-panel.html): Medical Specialty optional,
      // no Qualifications, plain Message, submit "Send Enquiry".
      [
        { blockType: 'text', name: 'firstName', label: 'First Name', width: 50, required: true, placeholder: 'First name' },
        { blockType: 'text', name: 'lastName', label: 'Last Name', width: 50, required: true, placeholder: 'Last name' },
        { blockType: 'email', name: 'email', label: 'Email Address', width: 50, required: true, placeholder: 'you@practice.com.au' },
        { blockType: 'text', name: 'phone', label: 'Phone Number', width: 50, required: false, placeholder: '07 XXXX XXXX' },
        { blockType: 'text', name: 'specialty', label: 'Medical Specialty', width: 100, required: false, placeholder: 'e.g. Orthopaedic Surgery, Psychiatry' },
        {
          // Required is a DELIBERATE deviation: the reference leaves Message
          // optional, but an expression of interest with no message is not
          // useful to the team. Confirmed 2026-08-18.
          blockType: 'textarea',
          name: 'message',
          label: 'Message',
          width: 100,
          required: true,
          placeholder: 'Tell us about your medico-legal experience and areas of interest...',
        },
      ],
      'Send Enquiry',
      'New expert-panel expression of interest',
    )

    // Point the site-wide enquiry drawer at the form. This is what makes the
    // drawer usable at all: with `site-settings.enquiryForm` empty the drawer
    // initialises to 'unavailable' and its Send button is disabled on every page.
    //
    // Runs UNCONDITIONALLY, outside `ensureForm`'s early-return, so it also
    // repairs a database that was seeded before this field existed. Only writes
    // when the value would actually change, so a re-seed doesn't churn the global
    // (and doesn't stomp a deliberate choice of a different form).
    const currentSettings = await payload.findGlobal({ slug: 'site-settings', depth: 0, req })
    const currentEnquiryForm = currentSettings?.enquiryForm
    const currentEnquiryFormId =
      currentEnquiryForm && typeof currentEnquiryForm === 'object'
        ? currentEnquiryForm.id
        : currentEnquiryForm

    if (currentEnquiryFormId == null) {
      await seedUpdateGlobal(payload, {
        slug: 'site-settings',
        depth: 0,
        req,
        context: { disableRevalidate: true },
        data: { enquiryForm: enquiryFormId as number },
      })
      payload.logger.info(`— Pointed Site Settings → Enquiry drawer form at form ${enquiryFormId}`)
    } else {
      payload.logger.info(
        `— Site Settings → Enquiry drawer form already set (form ${currentEnquiryFormId}), leaving it`,
      )
    }
  }

  // ── Content globals: Specialist Profile CTA, Article sidebar, Events host copy ──
  await seedContentGlobals({ payload, req })

  // ── Branding: upload logo + favicon to Media, populate Site Settings ──
  try {
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, req })

    if (settings?.logo) {
      payload.logger.info('— Site settings already has a logo, skipping logo upload')
    } else {
      const publicDir = path.resolve(process.cwd(), 'public')
      const logoFile = readFileSync(path.join(publicDir, 'verify-logo.png'))
      const faviconFile = readFileSync(path.join(publicDir, 'favicon.png'))

      const logoDoc = await seedCreate(payload, {
        collection: 'media',
        req,
        data: { alt: 'VERIFY Medico-Legal Solutions logo' },
        file: {
          name: 'verify-logo.png',
          data: logoFile,
          mimetype: 'image/png',
          size: logoFile.length,
        },
      })

      const faviconDoc = await seedCreate(payload, {
        collection: 'media',
        req,
        data: { alt: 'VERIFY shield' },
        file: {
          name: 'verify-favicon.png',
          data: faviconFile,
          mimetype: 'image/png',
          size: faviconFile.length,
        },
      })

      await seedUpdateGlobal(payload, {
        slug: 'site-settings',
        depth: 0,
        req,
        context: { disableRevalidate: true },
        data: {
          siteName: 'VERIFY Medico-Legal Solutions',
          logo: logoDoc.id,
          favicon: faviconDoc.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })

      payload.logger.info('— Uploaded logo + favicon')
    }

    // Brand palette repair. Runs unconditionally: the logo check above used to
    // guard this too, so any site that already had a logo never received colour
    // fixes. Stored values are inlined onto <html> and outrank the globals.css
    // defaults, so a stale value here silently defeats a CSS-level correction.
    //
    // Only fills what is empty, plus retires known-stale values — an admin's own
    // choices are left alone, and re-running is a no-op.
    const current = (settings?.colors ?? {}) as Record<string, string | null | undefined>
    const STALE = { mutedText: ['#737373'] } as Record<string, string[]>
    const DEFAULTS: Record<string, string> = {
      primary: '#1c75bc',
      primaryStrong: '#155fa0',
      text: '#414042',
      // Design reference styles.css:20. Was #737373, which put secondary copy
      // well below the reference's contrast on every page.
      mutedText: '#222222',
      accent: '#cbe5fa',
      border: '#c6c6c6',
      textOnDark: '#ffffff',
      mutedTextOnDark: 'rgba(255,255,255,0.82)',
      accentOnDark: '#93d0f7',
      borderOnDark: 'rgba(255,255,255,0.35)',
    }

    const repaired: Record<string, string> = {}
    for (const [key, value] of Object.entries(DEFAULTS)) {
      const stored = current[key]?.trim()
      if (!stored || STALE[key]?.includes(stored.toLowerCase())) repaired[key] = value
    }

    if (Object.keys(repaired).length) {
      await seedUpdateGlobal(payload, {
        slug: 'site-settings',
        depth: 0,
        req,
        // Deliberately NOT disableRevalidate: these colours are read through
        // getCachedGlobal and inlined onto <html>, so without purging the tag the
        // repair sits in the database while every page keeps serving the old
        // palette. It's a single write, so there's no revalidation storm to avoid.
        data: { colors: { ...current, ...repaired } },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      payload.logger.info(`— Brand colours repaired: ${Object.keys(repaired).join(', ')}`)
    }
  } catch (e) {
    payload.logger.error({ err: e, message: 'Branding seed skipped (public asset files missing?)' })
  }

  // ── Data layer: taxonomy lookups + specialists / team / events ──
  await seedDataLayer({ payload, req })

  // ── Specialist availability demo data (advertised specialists + sessions) ──
  await seedAvailability({ payload, req })

  // ── Homepage layout (matches .design-reference/index.html) ──
  await seedHomepage({ payload, req })

  // ── About + Meet-the-Team page layouts ──
  await seedAbout({ payload, req })

  // ── Remaining page groups (isolated so one bad layout can't block the rest) ──
  const pageGroups: [string, (c: { payload: typeof payload; req: typeof req }) => Promise<void>][] = [
    ['seedServices', seedServices],
    ['seedSpecialists', seedSpecialists],
    ['seedInfoBooking', seedInfoBooking],
    ['seedHubs', seedHubs],
    ['seedLegal', seedLegal],
  ]
  for (const [name, fn] of pageGroups) {
    try {
      await fn({ payload, req })
    } catch (e) {
      payload.logger.error({ err: e, message: `Page group ${name} failed — skipping` })
    }
  }

  // Point every service card at its canonical nested destination. Runs after the
  // page groups so all service docs exist; unconditional (unlike seedHomepage,
  // which early-returns on an already-authored homepage) so it repairs live data.
  await repairServiceLinks({ payload, req })
  await repairServicesFeatureIcon({ payload, req })
  await repairImeFormatsCardStyle({ payload, req })
  await repairJmeSpecialistCarousel({ payload, req })
  await repairFeaturedSpecialists({ payload, req })
  await repairCompactProcessSteps({ payload, req })
  await repairReportingSplitVariants({ payload, req })
  await repairMedicalNegligenceRemoval({ payload, req })
  await repairSpecialistIcons({ payload, req })
  await repairForClientsCards({ payload, req })
  await repairFaqVariants({ payload, req })
  await repairHeroCopy({ payload, req })
  await repairEnquiryLayout({ payload, req })
  await repairPortalEnquiry({ payload, req })
  await repairJoinBenefits({ payload, req })
  await repairEventTimeDash({ payload, req })
  await repairSocialImage({ payload, req })
  await repairClaimantProcessImage({ payload, req })
  await repairSpecialistNames({ payload, req })
  await repairSpecialistPortraitShape({ payload, req })
  await repairContentImages({ payload, req })
  await repairHubEmptySections({ payload, req })
  await repairEventsSeparator({ payload, req })
  await repairTeamDepartments({ payload, req })
  await repairLinkTargets({ payload, req })
  await repairBlockBands({ payload, req })
  // Both write only into an absence — a missing carousel block, a superseded
  // heading string, a post with no category — so an editor's own work is never
  // reverted by a later seed run. See the header of seedEventsHub.ts.
  await repairEventsHub({ payload, req })
  await repairFeaturedCategories({ payload, req })

  // Every write above passes `disableRevalidate: true` so the seed doesn't fire
  // hundreds of individual purges — correct, but it left nothing to purge at the
  // end. Pages self-healed within the hour; the globals did not (their cache
  // entries carry a 1-year TTL), so seeded nav, branding and settings stayed
  // invisible until someone happened to save unrelated content. Purge once here.
  revalidatePath('/', 'layout')
  for (const slug of GLOBAL_SLUGS) revalidateTag(`global_${slug}`)
  payload.logger.info('— Revalidated site layout + global cache tags')

  payload.logger.info('VERIFY scaffold seed complete.')
}
