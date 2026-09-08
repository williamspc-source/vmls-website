import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'
import { isUnauthored } from './authored'

import { plainTextToLexical } from './data/richText'

type Ctx = { payload: Payload; req: PayloadRequest }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const custom = (url: string, label: string, extra: Record<string, unknown> = {}): any => ({
  link: { type: 'custom', url, label, newTab: false, ...extra },
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const enquiry = (label: string): any => ({
  link: { type: 'enquiry', label, url: null, newTab: false },
})

// ── Small builders to keep the long content blocks readable ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const faqItem = (question: string, answer: string): any => ({
  question,
  answer: plainTextToLexical(answer),
})
// Minimal Lexical heading node (Payload's richText shape) — used for the contact
// form's card heading, which the Form block renders above the fields.
const lexTextNode = (text: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lexHeading = (text: string, tag: 'h2' | 'h3' | 'h4' = 'h3'): any => ({
  root: {
    type: 'root',
    children: [
      { type: 'heading', tag, children: [lexTextNode(text)], direction: 'ltr', format: '', indent: 0, version: 1 },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})
// Inline Lexical custom-link node (matches Payload's link-feature shape).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lexLink = (text: string, url: string): any => ({
  type: 'link',
  children: [lexTextNode(text)],
  direction: 'ltr',
  fields: { linkType: 'custom', newTab: false, url },
  format: '',
  indent: 0,
  version: 2,
})
// A single rich-text paragraph built from mixed text + link nodes — used for the
// For-Clients cost note (which hyperlinks "Standard Terms & Conditions" + "browse
// our services").
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lexParagraphNodes = (children: any[]): any => ({
  root: {
    type: 'root',
    children: [
      { type: 'paragraph', children, direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1 },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})
// FeatureGrid card (icon + title + description).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const featureCard = (icon: string, title: string, description: string): any => ({
  icon,
  title,
  description,
})
// A rich-text atom for use inside Row columns / Sections.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const textAtom = (text: string, cssClass?: string[]): any => ({
  blockType: 'text',
  richText: plainTextToLexical(text),
  ...(cssClass ? { cssClass } : {}),
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const agItem = (icon: string, heading: string, body: string): any => ({
  icon,
  heading,
  body: plainTextToLexical(body),
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const agCard = (icon: string, title: string, bullets: string[]): any => ({
  icon,
  title,
  bullets: bullets.map((text) => ({ text })),
})

async function authorPage(
  { payload, req }: Ctx,
  slug: string,
  hero: Record<string, unknown>,
  layout: unknown[],
  pageCss?: string[],
): Promise<void> {
  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    req,
  })
  const rec = found.docs[0] as { id: number | string; layout?: unknown[] } | undefined
  if (!rec) {
    payload.logger.warn(`— ${slug}: page not found, skipping`)
    return
  }
  if (!isUnauthored(rec.layout)) {
    payload.logger.info(`— ${slug} already authored, skipping`)
    return
  }
  await seedUpdate(payload, {
    collection: 'pages',
    id: rec.id,
    data: { hero, layout, ...(pageCss ? { cssClass: pageCss } : {}) } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info(`— Authored /${slug}`)
}

// Variant used for pages that seedVerify pre-populates with >2 placeholder blocks
// (e.g. For Claimants). The plain authorPage guard would skip those, so this one
// overwrites unless the page already carries our signature block — keeping it
// idempotent while still replacing the earlier scaffold.
async function authorPageReplace(
  { payload, req }: Ctx,
  slug: string,
  hero: Record<string, unknown>,
  layout: unknown[],
  signatureBlock: string,
  pageCss?: string[],
): Promise<void> {
  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    req,
  })
  const rec = found.docs[0] as { id: number | string; layout?: unknown[] } | undefined
  if (!rec) {
    payload.logger.warn(`— ${slug}: page not found, skipping`)
    return
  }
  const blocks = (Array.isArray(rec.layout) ? rec.layout : []) as { blockType?: string }[]
  if (blocks.some((b) => b?.blockType === signatureBlock)) {
    payload.logger.info(`— ${slug} already authored, skipping`)
    return
  }
  await seedUpdate(payload, {
    collection: 'pages',
    id: rec.id,
    data: { hero, layout, ...(pageCss ? { cssClass: pageCss } : {}) } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info(`— Authored /${slug}`)
}

export const seedInfoBooking = async (ctx: Ctx): Promise<void> => {
  const { payload, req } = ctx

  // Look up the shared records the data-reading blocks reference.
  const contactForm = await payload.find({
    collection: 'forms',
    where: { title: { equals: 'Contact' } },
    limit: 1,
    depth: 0,
    req,
  })
  const contactFormId = contactForm.docs[0]?.id

  const brisbane = await payload.find({
    collection: 'offices',
    where: { slug: { equals: 'brisbane' } },
    limit: 1,
    depth: 0,
    req,
  })
  const brisbaneId = brisbane.docs[0]?.id

  // Resolve the curated set of Service docs shown on the For-Clients
  // "Comprehensive Medico-Legal Services" grid (reference order). Uses a manual
  // (hand-picked) list so it can include the two administrative services the
  // reference surfaces here — a plain category filter would drop them.
  const clientServiceSlugs = [
    'independent-medical-examination',
    'joint-medical-examination',
    'file-review',
    'supplementary-report',
    'teleconference-expert-evidence',
    'expert-evidence',
    'surrogate-assessment-interpreter-booking',
    'brief-reduction-loi-review',
  ]
  const servicesRes = await payload.find({
    collection: 'services',
    where: { slug: { in: clientServiceSlugs } },
    limit: 50,
    depth: 0,
    req,
  })
  const serviceIdBySlug = new Map<string, number | string>()
  for (const s of servicesRes.docs as { id: number | string; slug?: string | null }[]) {
    if (s.slug) serviceIdBySlug.set(s.slug, s.id)
  }
  const clientServiceIds = clientServiceSlugs
    .map((slug) => serviceIdBySlug.get(slug))
    .filter((id): id is number | string => id != null)

  // Shared "Where to Find Us" map block (Contact + For Claimants).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const findUsMap = (): any => ({
    blockType: 'mapEmbed',
    eyebrow: 'Visit Us',
    heading: 'Where to [[Find Us]]',
    subheading:
      "VERIFY is located in Brisbane's CBD, easily accessible by public transport and with multiple car parking options nearby.",
    kind: 'map',
    ...(brisbaneId
      ? { office: brisbaneId }
      : { embedUrl: 'https://www.google.com/maps?q=127+Creek+Street+Brisbane+QLD+4000&output=embed' }),
    showOfficeInfo: true,
    aspect: '16-9',
    // Outlined (bordered) buttons, matching the reference `.ct-map-action`.
    actions: [
      custom(
        'https://maps.google.com/?q=Level+18+127+Creek+Street+Brisbane+QLD+4000',
        'Get Directions',
        { icon: 'navigation-arrow', newTab: true, appearance: 'outline' },
      ),
      custom('tel:0733560469', '07 3356 0469', { icon: 'phone', appearance: 'outline' }),
      custom('mailto:admin@vmls.com.au', 'Email Us', {
        icon: 'envelope-simple',
        appearance: 'outline',
      }),
    ],
  })

  // ══════════════════════════════════════════════════════════════════
  // Contact
  // ══════════════════════════════════════════════════════════════════
  await authorPage(
    ctx,
    'contact',
    {
      type: 'pageHero',
      theme: 'dark',
      align: 'left',
      showBreadcrumb: true,
      showShield: true,
      // Two lines: "Make an Enquiry" (white) / "or Book a Service" (accent).
      // The accent span is forced onto its own line via the `.ct-page` CSS.
      heading: 'Make an Enquiry [[or Book a Service]]',
      subtitle:
        "Whether you're ready to refer a matter, need a specialist opinion, or simply have a question — VERIFY's team responds promptly and guides you through the process from your first contact.",
      metaItems: [
        { icon: 'phone', text: '07 3356 0469', href: 'tel:0733560469' },
        { icon: 'envelope-simple', text: 'admin@vmls.com.au', href: 'mailto:admin@vmls.com.au' },
        { icon: 'clock', text: 'Mon – Fri  08:30 – 17:00' },
      ],
    },
    [
      // ── Enquiry + Online Booking Portal ────────────────────────────────
      // Reference `.ct-enquiry`: ONE light-blue band holding a two-column grid
      // (1fr / 380px). LEFT = the card-styled "Send Us Your Enquiry" form.
      // RIGHT = a light "Online Booking Portal" sidebar card (blue header bar +
      // shield, white body) — NOT a full-width dark band. FormBlock now nests in
      // a Row column, so both sit side-by-side inside the same section.
      {
        blockType: 'section',
        anchorId: 'enquiry',
        background: 'white', // repainted to the reference #eef6fc via .ct-enquiry CSS
        paddingTop: 'spacious',
        paddingBottom: 'spacious',
        cssClass: ['ct-enquiry'],
        content: [
          {
            blockType: 'row',
            gap: 'wide',
            alignY: 'stretch',
            cssClass: ['ct-enquiry-grid'],
            columns: [
              // LEFT — card-styled enquiry form
              {
                content: contactFormId
                  ? [
                      {
                        blockType: 'formBlock',
                        form: contactFormId,
                        enableIntro: true,
                        introContent: lexHeading('Send Us Your Enquiry', 'h3'),
                        // Card comes from the block; the class is kept only for
                        // this page's residual width/margin centring.
                        cardStyle: 'card',
                        cssClass: ['ct-enquiry-form'],
                      },
                    ]
                  : [],
              },
              // RIGHT — light "Online Booking Portal" sidebar card
              {
                content: [
                  {
                    blockType: 'heading',
                    text: 'Online Booking Portal',
                    level: 'h3',
                    size: 'md',
                    align: 'left',
                    cssClass: ['ct-portal-card__head'],
                  },
                  textAtom('Already have an account?', ['ct-portal-card__label']),
                  textAtom(
                    'Log in to the VERIFY Booking Portal to submit referrals, track appointments, and access your matter history.',
                    ['ct-portal-card__text'],
                  ),
                  {
                    blockType: 'button',
                    size: 'md',
                    align: 'left',
                    cssClass: ['ct-portal-card__btn'],
                    links: [
                      custom('https://vmls.kawaconn.com/', 'Log In to Portal', {
                        icon: 'sign-in',
                        newTab: true,
                      }),
                    ],
                  },
                  textAtom('New to VERIFY?', ['ct-portal-card__label']),
                  textAtom(
                    "Portal access is by registration only. Send us an enquiry using the form or contact our team directly and we'll set up your account.",
                    ['ct-portal-card__text'],
                  ),
                  {
                    blockType: 'button',
                    size: 'md',
                    align: 'left',
                    cssClass: ['ct-portal-card__btn'],
                    links: [
                      custom('tel:0733560469', 'Call 07 3356 0469', {
                        icon: 'phone',
                        appearance: 'outline',
                      }),
                    ],
                  },
                  // Beyond the reference, which offers only the phone number
                  // here: registration is enquiry-only, so this opens the
                  // visitor's mail app with the request already written. Wording
                  // is shared with Make a Booking via Site Settings.
                  {
                    blockType: 'button',
                    size: 'md',
                    align: 'left',
                    cssClass: ['ct-portal-card__btn'],
                    links: [
                      {
                        link: {
                          type: 'portalEnquiry',
                          label: 'Email Us to Register',
                          icon: 'envelope-simple',
                          appearance: 'outline',
                          newTab: false,
                        },
                      },
                    ],
                  },
                  {
                    blockType: 'iconList',
                    heading: 'What you can do in the portal',
                    columns: '1',
                    cssClass: ['ct-portal-card__features'],
                    items: [
                      { icon: 'users', text: 'View specialist availability and profiles' },
                      { icon: 'calendar-check', text: 'Book and track appointments' },
                      { icon: 'magnifying-glass', text: 'Monitor matter status in real time' },
                      { icon: 'upload-simple', text: 'Upload paperwork and supporting documents' },
                      { icon: 'download-simple', text: 'Download reports and correspondence' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      findUsMap(),
    ],
    ['ct-page'],
  )

  // ══════════════════════════════════════════════════════════════════
  // Make a Booking
  // ══════════════════════════════════════════════════════════════════
  await authorPage(
    ctx,
    'make-a-booking',
    {
      type: 'pageHero',
      theme: 'dark',
      align: 'center',
      showBreadcrumb: true,
      // Reference make-a-booking hero has no shield graphic (plain centred hero).
      showShield: false,
      heading: 'Make a [[Booking]]',
      subtitle:
        "Log in to your client portal to manage your bookings, or view our specialists' availability and send an appointment enquiry directly.",
    },
    [
      {
        blockType: 'bookingChooser',
        halves: [
          {
            icon: 'calendar-check',
            accent: 'blue',
            eyebrow: "See What's Available",
            title: 'Specialist Availability',
            description:
              'Browse our specialists with current appointment sessions and select the times that suit you.',
            links: [custom('#availability', 'View availability below')],
          },
          {
            icon: 'user-circle',
            accent: 'dark',
            eyebrow: 'Already Registered?',
            title: 'Client Portal',
            description:
              'Access your account to book appointments, manage referrals, and track your matters.',
            links: [
              custom('https://vmls.kawaconn.com/', 'Log In to Portal', {
                newTab: true,
              }),
              {
                link: {
                  type: 'portalEnquiry',
                  label: 'Register an Account',
                  newTab: false,
                },
              },
            ],
          },
        ],
      },
      { blockType: 'availability', showCarousel: true, showLegend: true },
      {
        blockType: 'ctaBand',
        eyebrow: 'Get Started',
        heading: 'Ready to Book Your [[Next Appointment with VERIFY?]]',
        text: 'Whether you have a specific session in mind or need guidance on the right specialist and format, our team is here to make booking simple, efficient, and responsive from the very start.',
        links: [
          custom('/specialists/specialist-panel', 'View Specialist Panel'),
          enquiry('Make an Enquiry'),
        ],
      },
    ],
  )

  // ══════════════════════════════════════════════════════════════════
  // For Clients
  // ══════════════════════════════════════════════════════════════════
  await authorPage(
    ctx,
    'for-clients',
    {
      type: 'pageHero',
      theme: 'dark',
      align: 'center',
      showBreadcrumb: true,
      // Reference for-clients hero hides the deco/shield (page-hero-deco:none).
      showShield: false,
      heading: 'Information for [[Clients]]',
      subtitle:
        'VERIFY provides medico-legal services for plaintiff and defendant lawyers, insurers, and self-insurers — a balanced, unbiased approach that supports a fair and just legal process.',
    },
    [
      // How we support you — two-column intro (text + image placeholder), then a
      // 3-column bordered-card grid (reference `.client-support-grid`).
      {
        blockType: 'section',
        anchorId: 'support',
        background: 'white',
        paddingTop: 'spacious',
        paddingBottom: 'spacious',
        content: [
          {
            blockType: 'splitFeature',
            cssClass: ['vf-client-overview'],
            rows: [
              {
                eyebrow: 'How We Support You',
                title: 'Practical medico-legal support from referral to [[report delivery]]',
                imageSide: 'right',
                imagePlaceholder: true,
                placeholderLabel: 'Image Placeholder',
                placeholderIcon: 'image',
                body: plainTextToLexical(
                  'VERIFY supports legal firms, insurers and self-insurers with coordinated access to independent medical specialists, clear communication, and quality-assured reporting. Our role is to keep each matter moving with the right expert, the right material, and the right checks before the report reaches you.\n\nWe work with both instructing parties and specialists throughout the process, helping reduce administrative friction, clarify brief requirements, and manage the details that can affect timing, cost and report quality.',
                ),
              },
            ],
          },
          {
            blockType: 'featureGrid',
            columns: '3',
            // The reference's support cards are a quieter design than its service
            // tiles — flat white, soft shadow, gentle hover. See `.vf-card--soft`.
            cardStyle: 'soft',
            cssClass: ['vf-client-support'],
            items: [
              featureCard(
                'user-check',
                'Appointment coordination',
                'We help identify suitable specialists, coordinate availability, and manage appointment logistics for in-person, videolink, file review and other assessment pathways.',
              ),
              featureCard(
                'file-text',
                'Brief and document management',
                'We review key requirements early, flag timing or material issues where possible, and support efficient communication between your team, the claimant and the specialist.',
              ),
              featureCard(
                'check-square',
                'Quality-assured reporting',
                'Every report is reviewed before delivery for clarity, completeness, formatting, and alignment with the referral questions and relevant reporting requirements.',
              ),
            ],
          },
        ],
      },
      // Services
      {
        blockType: 'section',
        anchorId: 'services',
        // `--band-accent` is byte-identical to the reference's
        // `linear-gradient(135deg, #eef9ff 0%, #e6f4ff 48%, #d9efff 100%)`, and
        // `--space-normal` caps at exactly its 88px. Both were simply set wrong.
        background: 'accent',
        paddingTop: 'normal',
        paddingBottom: 'normal',
        content: [
          {
            blockType: 'servicesGrid',
            eyebrow: 'Our Services',
            heading: 'Comprehensive [[Medico-Legal]] Services',
            subheading:
              'From independent examinations to professional education, VERIFY supports legal, insurance, and medical professionals with trusted medico-legal expertise.',
            // Hand-picked so the two administrative services (Surrogate / Brief
            // Reduction) appear alongside the medico-legal ones, per the reference.
            source: clientServiceIds.length ? 'manual' : 'auto',
            ...(clientServiceIds.length
              ? { services: clientServiceIds }
              : { category: 'medico-legal' as const, limit: 12 }),
            columns: '4',
            hideDescription: true,
            // The reference renders these as centred tiles, and the homepage's
            // identical grid already does. Unset here, it defaulted to `left`,
            // which is the whole reason this section looked nothing like it.
            cardAlign: 'center',
            // Link from each service's own `linkOverride` (set in seedHomepage) —
            // there is no /services/<slug> route, so auto-linking would 404.
            linkToService: false,
            footerLinks: [
              custom('/services', 'View Medico-Legal Services'),
              custom('/specialists/specialist-panel', 'View Specialist Panel'),
            ],
          },
        ],
      },
      // Our process
      {
        blockType: 'section',
        anchorId: 'process',
        background: 'white',
        paddingTop: 'spacious',
        paddingBottom: 'spacious',
        content: [
          {
            blockType: 'processSteps',
            variant: 'two-row',
            background: 'white',
            eyebrow: 'How We Work',
            heading: 'Our [[Process]]',
            subheading:
              'From the first referral to final delivery, VERIFY manages every step of the medico-legal process with precision and care, so you can focus on your case.',
            columns: '3',
            steps: [
              {
                icon: 'file-plus',
                title: 'Enquiry & Referral',
                description:
                  plainTextToLexical('You submit your referral and claimant details through our secure online booking portal or by contacting our team directly. We acknowledge every referral promptly and confirm all key details.'),
              },
              {
                icon: 'user-check',
                title: 'Specialist Matching',
                description:
                  plainTextToLexical('Our team assists in identifying the most appropriate specialist from our expert panel based on the nature of the claim, required speciality, claimant location, and timeframe, before confirming their availability to proceed.'),
              },
              {
                icon: 'calendar-check',
                title: 'Appointment Coordination',
                description:
                  plainTextToLexical('We manage all scheduling, claimant communication, interpreter bookings where required, and brief preparation so the specialist has everything they need before the examination.'),
              },
              {
                icon: 'user-plus',
                title: 'Examination & Drafting',
                description:
                  plainTextToLexical('The specialist conducts the assessment in person, via telehealth, or by surrogate, and prepares their medico-legal opinion in line with applicable guidelines and legislative requirements.'),
              },
              {
                icon: 'check-square',
                title: 'Quality Assurance Review',
                description:
                  plainTextToLexical('Every report is reviewed by our dedicated QA team before delivery, checked for accuracy, completeness, formatting, and compliance with the referral requirements and relevant legislative framework.'),
              },
              {
                icon: 'paper-plane-tilt',
                title: 'Report Delivery',
                description:
                  plainTextToLexical('The quality-assured report is delivered within the agreed timeframe. We remain available for supplementary reporting, teleconferences, or follow-up queries that arise after delivery.'),
              },
            ],
          },
          // "Good to know" callout beneath the process steps (reference `.process-note`).
          {
            blockType: 'callout',
            style: 'good-to-know',
            tag: 'Good to know',
            body: plainTextToLexical(
              'Each service may follow a slightly different workflow. Our team is always happy to walk you through what to expect for your specific matter.',
            ),
            links: [custom('/contact', 'Contact Us')],
          },
        ],
      },
      // Cost control (dark band, self-anchors via anchorId)
      {
        blockType: 'costGrid',
        anchorId: 'costs',
        eyebrow: 'Cost Control',
        heading: "Minimising Your Client's [[Report Costs]]",
        subheading:
          'Most avoidable reporting costs arise from brief size, late material, or appointment changes. Early, focused instructions help us keep the process efficient.',
        cards: [
          {
            icon: 'file-text',
            title: 'Keep the brief and LOI focused',
            description:
              'Ensure the referral question and speciality are clearly outlined in the letter of instruction. Limit the brief to material relevant to the examination, with records relevant only and duplicates removed where possible. If a brief is unnecessarily large, we can discuss whether it can be reduced before it is sent to the specialist and before additional reading fees are incurred.',
          },
          {
            icon: 'calendar',
            title: 'Send material at least 5 business days before',
            description:
              'Significant preparation is completed by the examiner and VERIFY before an examination. Please ensure all material, including the letter of instruction and brief, is sent in one complete batch wherever possible. If material is not provided in time, the examination may need to be rescheduled or cancelled, and a fee may apply.',
          },
          {
            icon: 'warning',
            title: 'Flag attendance risks early',
            description:
              'Ensure any interpreter, videolink, travel, or claimant communication requirements are raised with VERIFY well in advance. If a claimant may not attend or may need to reschedule, please notify us as soon as possible. Non-attendance or late cancellation fees may apply when less than five business days notice is given.',
          },
        ],
        // Reference hyperlinks "Standard Terms & Conditions" (→ /legal/terms-conditions)
        // and "browse our services" (→ /services).
        note: lexParagraphNodes([
          lexTextNode('For full engagement terms, please see our '),
          lexLink('Standard Terms & Conditions', '/terms-conditions'),
          lexTextNode('. You can also '),
          lexLink('browse our services', '/services'),
          lexTextNode(' for more detail on the support we provide.'),
        ]),
      },
      // Client FAQs
      {
        blockType: 'section',
        anchorId: 'faqs',
        background: 'white',
        containerWidth: 'narrow',
        paddingTop: 'normal',
        paddingBottom: 'normal',
        content: [
          {
            blockType: 'faq',
            eyebrow: 'Common Questions',
            heading: 'Client [[FAQs]]',
            subheading:
              'Answers to common questions from lawyers, insurers, case managers and other instructing parties.',
            columns: '1',
            // The reference lets several answers stay open at once.
            exclusive: false,
            itemStyle: 'divided',
            toggleStyle: 'chevron',
            items: [
              faqItem(
                'What is medico-legal?',
                '"Medico-legal" refers to the intersection of medicine and law. It encompasses situations where medical expertise is required to assist in resolving legal, insurance, or compensation matters. Medico-legal work includes independent medical examinations, the preparation of expert medical reports, assessments of injury causation and permanent impairment, and the provision of expert evidence in court and tribunal proceedings. In Australia, medico-legal services are central to personal injury, workers’ compensation, CTP, and public liability claims.',
              ),
              faqItem(
                'What is a medico-legal report?',
                'A medico-legal report is a formal written document prepared by an independent specialist following an examination or review of available medical material. It addresses specific legal or insurance questions put to the expert by the commissioning party. Unlike a clinical report, it is structured for legal purposes, must comply with applicable rules of evidence, and the author may be required to give evidence in court if the matter proceeds to trial.',
              ),
              faqItem(
                'Why is a medico-legal report needed?',
                'A medico-legal report is required when medical expertise is needed to resolve a legal or insurance dispute. Courts, tribunals, and compensation schemes rely on independent medical opinions to assess the nature, extent, and cause of a claimant’s injuries — matters that cannot be determined without expert input. The report provides an objective opinion on diagnosis, causation, impairment, treatment needs, and prognosis, all of which are essential to reaching a fair and accurate outcome in a compensation claim.',
              ),
              faqItem(
                'Who is VERIFY Medico-Legal Solutions?',
                'VERIFY Medico-Legal Solutions is a specialist medico-legal company based in Brisbane, Queensland. We coordinate independent medical examinations (IMEs), joint medical examinations (JMEs), file reviews, supplementary reports, and a range of expert medico-legal assessments for lawyers, insurers, self-insurers, and government bodies across Australia. We also support continuing professional development through the Australian Academy of Medico-Legal Education (AAMLE).',
              ),
              faqItem(
                "Who uses VERIFY's services?",
                'VERIFY’s clients include plaintiff and defendant law firms, insurers, self-insurers, government departments, and compensation scheme administrators. Our services are relevant across a wide range of claim types, including WorkCover Queensland, compulsory third-party (CTP) insurance, public liability, total and permanent disability (TPD), and common law personal injury matters.',
              ),
              faqItem(
                'What types of specialists conduct medico-legal assessment?',
                'VERIFY works with specialists across a broad range of disciplines, including orthopaedic surgeons, neurosurgeons, neurologists, psychiatrists, psychologists, pain medicine physicians, rehabilitation physicians, occupational therapists, physiotherapists, and general practitioners with medico-legal expertise, among others. The appropriate specialty depends on the nature of the claim and the specific questions to be assessed.',
              ),
              faqItem(
                'How do I make a referral to VERIFY?',
                'You can refer a matter through VERIFY’s online booking portal or by contacting our team directly. We will confirm the claimant details, required specialty, preferred assessment pathway, brief status, and any timing requirements before coordinating the appointment or report.',
              ),
              faqItem(
                'Which specialist should I choose for my matter?',
                'If you are unsure which specialty is most appropriate, our team can help guide the referral based on the injury type, claim issues, questions in the letter of instruction, location, and urgency. We can also suggest suitable specialists from our panel for your consideration.',
              ),
              faqItem(
                'What should be included in the brief?',
                'A strong brief usually includes a clear letter of instruction, relevant medical records, imaging and reports, claim documents, prior expert reports if available, and any material needed to answer the referral questions. Keeping the brief focused helps reduce reading time, cost, and the risk of unnecessary follow-up.',
              ),
              faqItem(
                'How early should I send the brief and letter of instruction?',
                'Please send the brief and letter of instruction as early as possible, ideally at least five business days before the appointment. This gives VERIFY and the specialist time to review the material, identify missing information, and avoid delays, rescheduling, or additional fees.',
              ),
              faqItem(
                'Can VERIFY assist with brief reduction or LOI review?',
                'Yes. VERIFY can assist with brief reduction and letter of instruction review where appropriate. We can help identify duplicate or irrelevant material, clarify referral questions, and support a more efficient brief before it is provided to the specialist.',
              ),
              faqItem(
                'Can you arrange interpreters, videolink appointments or surrogate assessments?',
                'Yes. VERIFY can coordinate interpreter bookings, videolink assessments, surrogate assessments, home visits and other appointment requirements where clinically and procedurally appropriate. Please raise these needs as early as possible so they can be confirmed before the appointment date.',
              ),
              faqItem(
                'Are reports quality reviewed before release?',
                'Yes. Every report is reviewed before delivery for clarity, completeness, formatting, alignment with the referral questions, and relevant reporting requirements. Our quality assurance process is designed to support accurate, defensible and useful medico-legal reporting.',
              ),
              faqItem(
                'What happens if the claimant cancels or does not attend?',
                'Please notify VERIFY as soon as you become aware of an attendance issue. We will advise the specialist and discuss whether the appointment can be rescheduled. Late cancellations or non-attendance may attract fees, particularly where notice is provided less than five business days before the appointment.',
              ),
              faqItem(
                'Can I request a supplementary report after the original report is delivered?',
                'Yes. If further records become available, clarification is required, or additional questions need to be addressed, VERIFY can coordinate a supplementary report with the specialist. Please provide the specific questions and any new material clearly so the specialist can respond efficiently.',
              ),
              faqItem(
                'Can VERIFY assist with urgent matters?',
                'Yes. If your matter is time-sensitive, please let us know the relevant deadline when you make the referral. We will review specialist availability, appointment options, and reporting requirements, then advise what is realistically achievable within the timeframe.',
              ),
            ],
            helpCard: {
              heading: 'Have a question that is not covered here?',
              body: 'We are here to help. Reach out to our team and we will get back to you shortly.',
              email: 'admin@vmls.com.au',
              phone: '07 3356 0469',
            },
          },
        ],
      },
      {
        blockType: 'ctaBand',
        eyebrow: 'Get Started',
        heading: 'Ready to Refer Your [[Next Matter to VERIFY?]]',
        text: 'Whether you have a specific referral or need guidance on the most suitable service, we are here to make the process simple, efficient, and responsive from the very start.',
        links: [
          custom('/specialists/specialist-panel', 'View Specialist Panel'),
          enquiry('Make an Enquiry'),
        ],
      },
    ],
  )

  // ══════════════════════════════════════════════════════════════════
  // For Claimants  (seedVerify pre-fills this with 3 placeholder blocks →
  // use authorPageReplace so our richer layout still lands)
  // ══════════════════════════════════════════════════════════════════
  await authorPageReplace(
    ctx,
    'for-claimants',
    {
      type: 'pageHero',
      theme: 'dark',
      align: 'center',
      showBreadcrumb: true,
      // Reference for-claimants hero hides the deco/shield → clean centred hero.
      showShield: false,
      heading: 'Information for [[Claimants]]',
      subtitle:
        "Attending an independent medico-legal examination? Here's what to expect, how to prepare, and everything you need to know before and on the day.",
    },
    [
      // Process overview — compact two-column: left header + intro, right a
      // simple numbered 01–05 list (reference `.claimant-process-inner`). NOT a
      // heavy vertical stepper.
      {
        blockType: 'processSteps',
        variant: 'claimant',
        anchorId: 'process-overview',
        background: 'white',
        eyebrow: 'Process Overview',
        heading: 'Your Examination [[Step by Step]]',
        subheading:
          'The medico-legal examination process is coordinated through your lawyer, with VERIFY managing the appointment, paperwork, specialist brief and report delivery pathway.',
        steps: [
          {
            title: 'The appointment is booked',
            description:
              plainTextToLexical('Your lawyer or insurer refers your matter to VERIFY. We coordinate the specialist appointment and confirm the date, time and location through your lawyer.'),
          },
          {
            title: 'Paperwork is sent to you or your lawyers',
            description:
              plainTextToLexical('VERIFY sends the Claimant Questionnaire and Informed Consent form to you or your lawyers to complete before the examination.'),
          },
          {
            title: 'The examiner receives the medical brief',
            description:
              plainTextToLexical('Before your appointment, the specialist receives the medical brief, records, imaging and instructions prepared for the assessment.'),
          },
          {
            title: 'You attend the examination',
            description:
              plainTextToLexical('The examiner asks about your injury, symptoms, treatment and daily function, and may complete a physical or clinical assessment.'),
          },
          {
            title: 'The report is provided to your lawyer',
            description:
              plainTextToLexical('The specialist prepares the report, VERIFY completes its quality review, and the report is provided to your lawyer.'),
          },
        ],
      },
      // Appointment guide — anchored header wrapper (eyebrow + heading + intro),
      // then the (headerless) guide which renders its own muted section.
      {
        blockType: 'section',
        anchorId: 'appointment-guide',
        background: 'muted',
        paddingTop: 'spacious',
        paddingBottom: 'none',
        align: 'center',
        content: [
          {
            blockType: 'text',
            richText: plainTextToLexical('Appointment Guide'),
            align: 'center',
            cssClass: ['vf-ic-eyebrow'],
          },
          {
            blockType: 'heading',
            text: 'What to Expect — [[Every Step of the Process]]',
            level: 'h2',
            size: 'xl',
            align: 'center',
          },
          {
            blockType: 'text',
            richText: plainTextToLexical(
              'Select your appointment type for step-by-step guidance on how to prepare and what happens at each stage of your examination.',
            ),
            align: 'center',
          },
        ],
      },
      {
        blockType: 'appointmentGuide',
        selectLabel: 'Select your appointment type',
        types: [
          {
            icon: 'map-pin',
            label: 'In-Person Appointment',
            sublabel: 'At a clinic or examination centre',
            // Deep-link target. The homepage's "In-Person Appointment Guide"
            // link ends #in-person-appointment, which scrolls here and selects
            // this type — the reference puts the same id on its tab button.
            anchorId: 'in-person-appointment',
            tabs: [
              {
                icon: 'calendar-blank',
                label: 'Before You Attend',
                items: [
                  agItem(
                    'clipboard-text',
                    'Complete your paperwork',
                    'VERIFY will send a Claimant Questionnaire and Informed Consent form to you or your lawyer. Both must be completed and returned before your examination date. If you have not received them in time, contact your lawyer immediately.',
                  ),
                  agItem(
                    'bell-ringing',
                    'Notify us of any special needs',
                    "Contact your lawyer or VERIFY's office early if you need to cancel or reschedule, require a qualified interpreter, or wish to bring a support person. All requests must be made in advance. Interpreter services are provided at no cost to you.",
                  ),
                ],
                highlightCards: [
                  agCard('bag-simple', 'What to bring', [
                    'Current photo ID — driver licence or passport',
                    'Completed Claimant Questionnaire and Informed Consent form',
                    'Any X-rays, CT scans, or MRI results relevant to your injury',
                  ]),
                  agCard('t-shirt', 'What to wear', [
                    'Loose, comfortable clothing — you may need to partially disrobe',
                    'Short sleeves for upper-limb injuries; loose shorts or a skirt for lower-limb or hip assessments',
                    'Avoid tight jeans or restrictive trousers',
                  ]),
                  agCard('clock', 'When to arrive', [
                    'Aim to arrive at least 20 minutes before your scheduled time',
                    'Additional paperwork may need to be completed on arrival',
                    'Running late? Call VERIFY on 07 3356 0469',
                  ]),
                ],
              },
              {
                icon: 'stethoscope',
                label: 'On the Day',
                items: [
                  agItem(
                    'identification-card',
                    'Present your ID and paperwork',
                    'Upon arrival, present your photo ID and completed paperwork to reception staff. This is a mandatory step at all examinations and must be completed before you are seen by the specialist.',
                  ),
                  agItem(
                    'chats-circle',
                    'The specialist will interview you',
                    'The specialist will have already reviewed your full medical brief. They will ask about the circumstances of your injury, your symptoms and treatment history, and how your condition affects your work and daily life.',
                  ),
                  agItem(
                    'check-circle',
                    'Answer honestly and fully',
                    'The examination is independent and objective — its purpose is to obtain an accurate medical opinion. Describe your symptoms, limitations, and experience as they genuinely are. Do not minimise or exaggerate.',
                  ),
                  agItem(
                    'stethoscope',
                    'Physical assessment',
                    'For physical injuries, the examiner will conduct a focused clinical assessment. You may be asked to partially disrobe or perform specific movements. The examiner will explain each step — let them know if anything is uncomfortable.',
                  ),
                  agItem(
                    'users',
                    'Support persons',
                    'If you brought a support person, they will wait in reception during the examination. A support person may only be present in the examination room if prior approval has been obtained from all parties.',
                  ),
                ],
                callout: {
                  style: 'info',
                  text: 'The specialist is not your treating doctor and will not provide clinical advice, treatment referrals, or prescriptions. Continue to see your regular treating practitioners for all ongoing medical care.',
                },
              },
              {
                icon: 'check-circle',
                label: 'What Happens Next',
                items: [
                  agItem(
                    'file-text',
                    'The specialist prepares the report',
                    'Following the examination, the specialist prepares a detailed medico-legal report addressing the specific questions raised in the brief. The report reflects their independent clinical opinion based on the examination and documentation provided.',
                  ),
                  agItem(
                    'magnifying-glass',
                    'VERIFY quality assurance review',
                    'Before delivery, VERIFY conducts a quality assurance review to ensure the report is accurate, complete, and meets the required standard. This is a standard step for every report we coordinate.',
                  ),
                  agItem(
                    'paper-plane-tilt',
                    'Report delivered to your lawyer',
                    'The completed report is delivered to the instructing party — typically your lawyer or insurer. You will not receive the report directly from VERIFY. Speak to your lawyer to obtain a copy.',
                  ),
                  agItem(
                    'scales',
                    'Your lawyer advises on next steps',
                    'Your lawyer will review the report and advise you on how it affects your claim. If you have concerns about the findings, discuss them with your lawyer — they are best placed to advise on how to respond.',
                  ),
                ],
                callout: {
                  style: 'info',
                  text: 'Do not contact the specialist directly regarding the report or your claim. All correspondence must be directed through your lawyer.',
                },
              },
            ],
          },
          {
            icon: 'video-camera',
            label: 'Videolink Appointment',
            sublabel: 'From your home or a private location',
            // "Videolink Appointment Guide" on the homepage used to point at the
            // separate YouTube section instead of here, because the guide had no
            // anchor and its toggle ignored the URL.
            anchorId: 'videolink-appointment',
            tabs: [
              {
                icon: 'calendar-blank',
                label: 'Before You Attend',
                items: [
                  agItem(
                    'clipboard-text',
                    'Complete your paperwork',
                    'VERIFY will send a Claimant Questionnaire and Informed Consent form to you or your lawyer. Both must be completed and returned before your examination date. If you have not received them in time, contact your lawyer immediately.',
                  ),
                  agItem(
                    'bell-ringing',
                    'Notify us of any special needs',
                    "Contact your lawyer or VERIFY's office early if you need to cancel or reschedule, require an interpreter, or wish to have a support person attend (subject to prior approval from all parties). All requests must be made well in advance. Interpreter services are at no cost to you.",
                  ),
                ],
                highlightCards: [
                  agCard('monitor', 'Set up your space', [
                    'A device with a camera and microphone — laptop, desktop, smartphone, or tablet',
                    'A stable internet connection',
                    'A quiet, private, well-lit space free from interruptions',
                    'Completed paperwork and photo ID within easy reach',
                  ]),
                  agCard('wifi-high', 'Test at least 3 days before', [
                    'Test your camera, microphone, and internet connection in advance',
                    'VERIFY will contact you to send your secure videolink and assist with testing',
                    'Do not leave technical testing until the day of the appointment',
                  ]),
                  agCard('video-camera', 'Log in 5–10 minutes early', [
                    'Join the videolink at least 5–10 minutes before your scheduled time',
                    'Ensure your device is charged and camera and microphone are enabled',
                    'Your space must be quiet, private, and free from interruptions',
                  ]),
                ],
              },
              {
                icon: 'video-camera',
                label: 'On the Day',
                items: [
                  agItem(
                    'lock',
                    'Ensure a private environment',
                    'You must be alone for the full duration unless a support person has been formally pre-approved. Ensure your surroundings are quiet and free from interruptions — notify household members in advance.',
                  ),
                  agItem(
                    'identification-card',
                    'Confirm your identity',
                    'The specialist will join at the scheduled time and introduce themselves. Have your photo ID ready — you will be asked to confirm your identity at the start of the session before the examination begins.',
                  ),
                  agItem(
                    'check-circle',
                    'Answer honestly and fully',
                    'The examination is independent and objective. Describe your symptoms, limitations, and daily experience as they genuinely are. Answer all questions as completely and honestly as you can.',
                  ),
                  agItem(
                    'person-arms-spread',
                    "Follow the specialist's guidance",
                    'The specialist may ask you to adjust your position, move closer to the camera, or demonstrate certain movements. If you are unable to perform a movement due to pain or limitation, let them know.',
                  ),
                  agItem(
                    'warning-circle',
                    'Technical difficulties',
                    'If your connection drops, remain calm and reconnect using the same link. If you are unable to rejoin, contact VERIFY immediately on 07 3356 0469. Do not exit without first attempting to reconnect.',
                  ),
                ],
                callout: {
                  style: 'info',
                  text: 'The specialist is not your treating doctor and will not provide clinical advice, treatment referrals, or prescriptions. Continue to see your regular treating practitioners for all ongoing medical care.',
                },
              },
              {
                icon: 'check-circle',
                label: 'What Happens Next',
                items: [
                  agItem(
                    'file-text',
                    'The specialist prepares the report',
                    'Following the examination, the specialist prepares a detailed medico-legal report addressing the specific questions raised in the brief. The report reflects their independent clinical opinion based on the videolink examination and the documentation provided.',
                  ),
                  agItem(
                    'magnifying-glass',
                    'VERIFY quality assurance review',
                    'Before delivery, VERIFY conducts a quality assurance review to ensure the report is accurate, complete, and meets the required standard. This is a standard step for every report we coordinate.',
                  ),
                  agItem(
                    'paper-plane-tilt',
                    'Report delivered to your lawyer',
                    'The completed report is delivered to the instructing party — typically your lawyer or insurer. You will not receive the report directly from VERIFY. Speak to your lawyer to obtain a copy.',
                  ),
                  agItem(
                    'scales',
                    'Your lawyer advises on next steps',
                    'Your lawyer will review the report and advise you on how it affects your claim. If you have concerns about the findings, discuss them with your lawyer — they are best placed to advise on how to respond.',
                  ),
                ],
                callout: {
                  style: 'info',
                  text: 'Do not contact the specialist directly regarding the report or your claim. All correspondence must be directed through your lawyer.',
                },
              },
            ],
          },
        ],
      },
      // Video guide (self-anchors)
      {
        blockType: 'videoEmbed',
        anchorId: 'video-guide',
        eyebrow: 'Video Guide',
        heading: 'Watch Our [[Preparation Guide]]',
        subheading:
          'A short walk-through of what to expect and how to prepare for your independent medico-legal examination.',
        provider: 'youtube',
        videoId: 'YCd7aoYTD3Q',
        videoTitle: 'VERIFY IME Preparation Guide',
        aspect: '16:9',
        background: 'muted',
      },
      // Claimant FAQs
      {
        blockType: 'section',
        anchorId: 'claimant-faqs',
        // The reference bands this one pale blue; the Clients FAQ stays white.
        background: 'light',
        containerWidth: 'narrow',
        paddingTop: 'normal',
        paddingBottom: 'normal',
        content: [
          {
            blockType: 'faq',
            eyebrow: 'Common Questions',
            heading: 'Frequently Asked [[Questions]]',
            subheading:
              'Answers to the questions claimants ask us most about the independent medico-legal examination process.',
            columns: '1',
            exclusive: false,
            itemStyle: 'divided',
            toggleStyle: 'chevron',
            items: [
              faqItem(
                'What is an Independent Medico-Legal Examination (IME)?',
                'An IME is a medical examination conducted by a specialist who is not the claimant’s treating doctor. It is commissioned by a party to a legal or insurance claim — typically a lawyer or insurer — to obtain an independent, impartial medical opinion. The examiner assesses the claimant’s injuries or medical conditions, considers causation, and provides opinions on matters such as impairment, treatment, prognosis, and capacity for work. The written report is used in the resolution of legal, insurance, or compensation claims.',
              ),
              faqItem(
                'Who is an independent medical examiner?',
                'An independent medical examiner is a specialist medical practitioner or allied health professional engaged to provide an objective, expert opinion on a claimant’s condition. Importantly, they are not the claimant’s treating doctor — their role is to provide an impartial assessment, not clinical care. Examiners are selected for their expertise in the relevant specialty and their experience in the medico-legal context. Their overriding duty is to the court or tribunal, not to the party that commissioned the report.',
              ),
              faqItem(
                'Why has my lawyer or insurer referred me for an IME?',
                'An IME is a standard step in most personal injury, WorkCover, CTP, and compensation claims. It allows an independent specialist to assess your injury, condition, and functional capacity to assist in resolving your claim. The purpose is not to challenge your account — it is to obtain an objective medical opinion on matters relevant to the legal or insurance process. Your lawyer can explain the specific reasons it has been requested in your matter.',
              ),
              faqItem(
                'Is the IME doctor my treating doctor?',
                'No. The independent medical examiner is not your treating doctor and will not provide clinical care. Their role is to assess your injuries and provide a written report to the commissioning party — usually your lawyer or the insurer. You should continue to see your regular treating doctors for ongoing medical care. Do not expect the IME examiner to prescribe medication, refer you for treatment, or give you medical advice.',
              ),
              faqItem(
                'What happens at the IME?',
                'On arrival, you will complete paperwork and produce photo identification. The examiner — who will have already received and read your medical brief — may ask about how the accident or incident happened, your symptoms and treatment history, and how your condition has affected your work and daily life. For a physical injury, a focused clinical examination of the injured area will be conducted. The examiner then prepares a written report provided to your lawyer.',
              ),
              faqItem(
                'What questions might I be asked during the IME?',
                'The examiner’s questions will depend on your specific injuries and the issues in your claim. Common areas include: how the incident occurred; the nature, location, and severity of your symptoms; the treatment you have received; how your condition has progressed over time; the impact on your ability to work, drive, perform household tasks, and participate in recreational activities; your pre-existing health conditions; and your current daily functioning. Answer honestly and as accurately as you can.',
              ),
              faqItem(
                'What should I bring to the IME?',
                'Bring photographic identification (driver licence or passport), the completed Claimant Questionnaire, and the completed Informed Consent form. For a physical examination, also bring any X-rays, CT scans, or MRI results you have. VERIFY sends the questionnaire and consent form to your lawyer before the appointment. If you have not received them, contact your lawyer as soon as possible.',
              ),
              faqItem(
                'How long will the IME take?',
                'The duration varies with the complexity of your injuries and the specialty involved. As a general guide, allow approximately one hour for an orthopaedic surgeon or neurosurgeon; up to 90 minutes for a neurologist if additional testing is required; 90 minutes to two hours for a psychiatric examination; and two to three hours for an occupational therapist assessment. Your lawyer or VERIFY’s office can give you a more specific estimate for your appointment.',
              ),
              faqItem(
                'Can I bring someone with me?',
                'You are welcome to bring a family member, friend, or support person. However, in most cases they will be asked to wait in reception during the examination itself. If the examiner permits a support person to be present, they are there solely to provide emotional support — not to participate in, answer questions during, or interrupt the examination. Please advise VERIFY’s office in advance if you wish to bring a support person.',
              ),
              faqItem(
                'Can I record the examination?',
                'Recording the examination — whether audio or video — is generally not permitted without the express consent of the examiner and the referring party. If you wish to request permission to record the examination, you should raise this with your lawyer before the appointment. Attempting to make an unauthorised recording may result in the examination being terminated.',
              ),
              faqItem(
                'What if I feel unwell or am unable to attend on the day?',
                'Contact VERIFY’s office immediately on 07 3356 0469 and notify your lawyer as soon as possible. We will inform the examiner and, where possible, arrange a new appointment time. Please be aware that short-notice cancellations may attract a cancellation fee, and failure to attend without adequate notice will result in a non-attendance fee. These fees are generally invoiced to the referring lawyer.',
              ),
              faqItem(
                'What if I am running late?',
                'Contact VERIFY immediately on 07 3356 0469 if you are running late. We will advise the examiner and let you know whether the appointment can proceed. If you arrive significantly late, the examiner may not be able to see you and the appointment may need to be rescheduled, with a late-arrival fee potentially applying.',
              ),
              faqItem(
                'What if I need an interpreter?',
                'VERIFY can arrange a qualified interpreter for your appointment at no cost to you. Please advise your lawyer as soon as possible so that we receive adequate notice to arrange this. Interpreter bookings take time to organise, so early notice is important.',
              ),
              faqItem(
                'What is the Claimant Questionnaire?',
                'The Claimant Questionnaire is a document prepared by VERIFY that asks you to provide background information about yourself, your injury, your treatment history, and how your condition has affected your daily life. The specialist receives and considers this document as part of their pre-examination preparation. Complete it as thoroughly and accurately as you can — it helps the examiner understand your situation before the appointment.',
              ),
              faqItem(
                'Do I have to pay for the examination?',
                'No. You do not pay anything directly to VERIFY or to the examiner. The cost of the examination and the medico-legal report is invoiced to your lawyer (or insurer) — not to you. If you have any concerns about costs, speak to your lawyer.',
              ),
              faqItem(
                'Can I get a copy of the report?',
                'The report is prepared for the commissioning party — usually your lawyer — and is provided directly to them. VERIFY is unable to release the report to you. If you wish to obtain a copy, speak to your lawyer. Whether and when you can see the report will depend on the stage of your claim, applicable legislation, and your lawyer’s advice.',
              ),
            ],
            helpCard: {
              heading: 'Have a question that is not covered here?',
              body: 'We are here to help. Reach out to our team and we will get back to you shortly.',
              email: 'admin@vmls.com.au',
              phone: '07 3356 0469',
            },
          },
        ],
      },
      // Where to find us — the reference page ends here (no closing CTA band).
      {
        blockType: 'section',
        anchorId: 'location',
        background: 'white',
        paddingTop: 'spacious',
        paddingBottom: 'spacious',
        content: [findUsMap()],
      },
    ],
    'appointmentGuide',
    ['fclaim-page'],
  )

  // ══════════════════════════════════════════════════════════════════
  // Information Centre (parent stub)
  // ══════════════════════════════════════════════════════════════════
  await authorPage(
    ctx,
    'information-centre',
    {
      type: 'pageHero',
      theme: 'dark',
      align: 'center',
      showBreadcrumb: true,
      showShield: true,
      heading: 'Information [[Centre]]',
      subtitle:
        'Guidance for the people we work with — the instructing parties who engage VERIFY, and the claimants attending an examination. Choose your pathway below.',
    },
    [
      {
        blockType: 'gatewayCards',
        eyebrow: 'Choose Your Pathway',
        heading: 'Who Are [[You?]]',
        subheading: 'Find the information most relevant to you.',
        background: 'white',
        columns: '2',
        cards: [
          {
            icon: 'briefcase',
            subtitle: 'Legal Professionals & Insurers',
            title: 'For Clients',
            description:
              'Guidance for instructing parties on engaging VERIFY, preparing briefs, our end-to-end process, and minimising your client’s report costs.',
            accent: 'blue',
            links: [
              custom('/information-centre/for-clients#support', 'How We Support You'),
              custom('/information-centre/for-clients#process', 'Our Process'),
              custom('/information-centre/for-clients#costs', 'Cost Control'),
              custom('/information-centre/for-clients#faqs', 'Client FAQs'),
            ],
            ...custom('/information-centre/for-clients', 'For Clients'),
          },
          {
            icon: 'user-check',
            subtitle: 'People Attending an Examination',
            title: 'For Claimants',
            description:
              'What to expect at your independent medico-legal examination — how to prepare, what to bring, and answers to the questions claimants ask most.',
            accent: 'steel',
            links: [
              custom('/information-centre/for-claimants#process-overview', 'Your Examination'),
              custom('/information-centre/for-claimants#appointment-guide', 'Appointment Guide'),
              custom('/information-centre/for-claimants#video-guide', 'Video Guide'),
              custom('/information-centre/for-claimants#claimant-faqs', 'Claimant FAQs'),
            ],
            ...custom('/information-centre/for-claimants', 'For Claimants'),
          },
        ],
      },
      {
        blockType: 'ctaBand',
        eyebrow: 'Get Started',
        heading: 'Not Sure Where to [[Start?]]',
        text: "Our team is happy to point you in the right direction. Get in touch and we'll help you find exactly what you need.",
        links: [enquiry('Make an Enquiry'), custom('/contact', 'Contact Us')],
      },
    ],
  )
}
