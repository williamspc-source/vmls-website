import { seedCreate, seedUpdate } from './seedWrite'
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

// A minimal Lexical richText wrapping a single heading node (used for the enquiry
// form's "Send Us Your Enquiry" intro heading).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const headingRichText = (text: string, tag: 'h2' | 'h3' | 'h4' = 'h3'): any => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'heading',
        tag,
        children: [
          { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

/**
 * Authors the homepage (`/`) block layout to match .design-reference/index.html:
 * home hero (+ definition panel) · audience gateway (light-grey band) · who-we-are
 * (two-column w/ image placeholder) · tabbed "What We Do" (medico-legal services
 * grid + AAMLE education, light-blue band) · two-column "Claims We Support" ·
 * featured-specialists carousel (light-grey band) · testimonials carousel ·
 * two-column enquiry section (contact details + enquiry form).
 * Everything stays editable in the admin.
 */
export const seedHomepage = async ({ payload, req }: Ctx): Promise<void> => {
  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
    req,
  })
  const rec = found.docs[0] as { id: number | string; layout?: unknown[] } | undefined
  if (!rec) {
    payload.logger.warn('— Homepage seed: no "home" page found, skipping')
    return
  }
  // Only fill the stub — a homepage with any real content is left alone, whether
  // this seed authored it on an earlier run or a person did. (This used to read
  // ">2 real blocks", which overwrote any page holding two or fewer.)
  if (!isUnauthored(rec.layout)) {
    payload.logger.info('— Homepage already authored, skipping')
    return
  }

  // ── The 8 medico-legal service cards for the "What We Do" grid ──
  // Reference (index.html) shows exactly 8 icon+title cards, in this order:
  // IME · JME · File Review · Supplementary Report · Teleconference · Expert
  // Evidence · Surrogate Assessment & Interpreter Booking · Brief Reduction & LOI
  // Review. (Excludes Medical Negligence + Educational Services / AAMLE.)
  const serviceSlugs = [
    'independent-medical-examination',
    'joint-medical-examination',
    'file-review',
    'supplementary-report',
    'teleconference-expert-evidence', // rendered as the standalone "Teleconference" card
    'expert-evidence',
    'surrogate-assessment-interpreter-booking',
    'brief-reduction-loi-review',
  ]

  // Create-if-missing / normalise helper so the home grid resolves all 8 cards at
  // seed time. seedDataLayer (which runs BEFORE this module) seeds the *combined*
  // "Teleconference & Expert Evidence" doc and no standalone "Expert Evidence"
  // (that is added later by seedServices, which runs AFTER the homepage). So here
  // we (a) ensure the standalone `expert-evidence` doc exists — mirroring
  // seedServices' definition exactly so it is reused, not duplicated — and
  // (b) normalise the combined doc's title to the reference/author-intended
  // standalone name "Teleconference". Everything stays admin-editable.
  const ensureService = async (
    slug: string,
    createData: Record<string, unknown>,
    normalise: Record<string, unknown> = {},
  ): Promise<void> => {
    const res = await payload.find({
      collection: 'services',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      req,
    })
    const existing = res.docs[0]
    if (!existing) {
      await seedCreate(payload, {
        collection: 'services',
        data: { slug, ...createData } as never,
        req,
        context: { disableRevalidate: true },
      })
      return
    }
    const current = existing as unknown as Record<string, unknown>
    const drift = Object.entries(normalise).filter(([k, v]) => current[k] !== v)
    if (drift.length > 0) {
      await seedUpdate(payload, {
        collection: 'services',
        id: existing.id,
        data: Object.fromEntries(drift) as never,
        req,
        context: { disableRevalidate: true },
      })
    }
  }

  await ensureService('expert-evidence', {
    title: 'Expert Evidence',
    category: 'medico-legal',
    serviceGroup: 'reporting',
    icon: 'gavel',
    shortDescription:
      'Full coordination for specialists providing oral expert evidence in court or tribunal — from report preparation to hearing logistics.',
    order: 31,
  })
  await ensureService('teleconference-expert-evidence', {}, { title: 'Teleconference' })

  // Resolve to service IDs in the exact reference order (independent of each doc's
  // `order` field), dropping any slug that still can't be found.
  const svcRes = await payload.find({
    collection: 'services',
    where: { slug: { in: serviceSlugs } },
    limit: 20,
    depth: 0,
    req,
  })
  const idBySlug = new Map(svcRes.docs.map((d) => [d.slug, d.id]))
  const serviceIds = serviceSlugs
    .map((s) => idBySlug.get(s))
    .filter((id): id is NonNullable<typeof id> => id != null)

  // Service card `linkOverride`s (canonical nested destinations) are set by
  // `repairServiceLinks`, which seedVerify runs unconditionally — this module
  // early-returns on an already-authored homepage, so the repair can't live here.

  // Medico-Legal Services grid: hand-picked (icon + title only). Falls back to the
  // medico-legal category if the service docs aren't seeded yet.
  const servicesGrid =
    serviceIds.length > 0
      ? {
          blockType: 'servicesGrid',
          source: 'manual',
          services: serviceIds,
          columns: '4',
          hideDescription: true,
          cardAlign: 'center',
          linkToService: false,
          footerLinks: [custom('/services', 'View Medico-Legal Services')],
        }
      : {
          blockType: 'servicesGrid',
          source: 'auto',
          category: 'medico-legal',
          columns: '4',
          limit: 8,
          hideDescription: true,
          cardAlign: 'center',
          linkToService: false,
          footerLinks: [custom('/services', 'View Medico-Legal Services')],
        }

  // ── Look up the enquiry form for the bottom contact section ──
  const findForm = async (title: string): Promise<number | string | undefined> => {
    const res = await payload.find({
      collection: 'forms',
      where: { title: { equals: title } },
      limit: 1,
      depth: 0,
      req,
    })
    return res.docs[0]?.id
  }
  const enquiryFormId = (await findForm('Enquiry')) ?? (await findForm('Contact'))

  const hero = {
    type: 'homeHero',
    // Two-line lockup, accent on the second line only (index.html:31-32). The
    // newline is rendered as a <br> by accentText().
    heading: 'Ensuring Accuracy,\n[[Empowering Justice]]',
    subtitle:
      'With a commitment to excellence, accuracy, and timely reporting, we strive to deliver unparalleled service, helping you navigate the complexities of medico-legal matters with the confidence and trust.',
    showShield: true,
    definition: {
      term: 'VERIFY',
      pronunciation: 'verb',
      text: 'to make sure or demonstrate that (something) is true, accurate, or justified',
      definitionStyle: 'glow',
    },
    links: [enquiry('Make an Enquiry'), custom('#services', 'Explore Our Services')],
  }

  // Contact details for the enquiry section (reference-exact copy).
  const contactItems = [
    { icon: 'phone', label: 'Phone', value: '07 3356 0469', href: 'tel:0733560469' },
    {
      icon: 'envelope-simple',
      label: 'Email',
      value: 'admin@vmls.com.au',
      href: 'mailto:admin@vmls.com.au',
    },
    { icon: 'map-pin', label: 'Office', value: 'Level 18, 127 Creek Street, Brisbane QLD 4000' },
    {
      icon: 'clock',
      label: 'Office Hours',
      value: 'Monday – Friday, 08:30 – 17:00',
      note: 'For 7:45am appointments, please be advised that our office is not staffed until 7:30am.',
    },
  ]

  // The enquiry FORM — right-hand card of the two-column enquiry band. FormBlock
  // is now nestable in a Row column, so it renders SIDE-BY-SIDE with the contact
  // info inside one accent band (reference `.contact-grid`), replacing the old
  // stacked "info band, then detached form band" pattern.
  const enquiryFormBlock = enquiryFormId
    ? {
        blockType: 'formBlock',
        form: enquiryFormId,
        enableIntro: true,
        introContent: headingRichText('Send Us Your Enquiry', 'h3'),
        // The card itself is now the block's own `cardStyle`; the class is kept
        // only for the residual this page needs (a tighter 24px heading gap).
        cardStyle: 'card',
        cssClass: ['vf-home-enquiry-formcard'],
      }
    : null

  const layout = [
    // ── Audience gateway (light-grey band) ──
    {
      blockType: 'gatewayCards',
      heading: 'Medico-Legal Support, [[Tailored to You]]',
      background: 'muted',
      columns: '3',
      cards: [
        {
          icon: 'briefcase',
          subtitle: 'Legal Professionals & Case Managers',
          title: 'For Clients',
          description:
            'Refer with confidence. Every report expertly quality-assured before it reaches you.',
          accent: 'blue',
          links: [
            custom('/services', 'Our Services'),
            custom('/specialists/specialist-panel', 'Specialist Panel'),
            custom('/about', 'Why Refer to Us'),
            custom('/information-centre/for-clients#faqs', 'Frequently Asked Questions'),
          ],
          ...custom('/information-centre/for-clients', 'Learn More'),
        },
        {
          icon: 'user',
          subtitle: 'People Attending an Examination',
          title: 'For Claimants',
          description:
            'Helpful information to prepare you for your appointment and understand what to expect.',
          accent: 'steel',
          links: [
            custom('/information-centre/for-claimants#process-overview', 'Process Overview'),
            custom('/information-centre/for-claimants#in-person-appointment', 'In-Person Appointment Guide'),
            custom('/information-centre/for-claimants#videolink-appointment', 'Videolink Appointment Guide'),
            custom('/information-centre/for-claimants#claimant-faqs', 'Frequently Asked Questions'),
          ],
          ...custom('/information-centre/for-claimants', 'Learn More'),
        },
        {
          icon: 'stethoscope',
          subtitle: 'Medical Specialists',
          title: 'For Medical Specialists',
          description:
            'Join a panel that values your expertise and supports your professional growth.',
          accent: 'charcoal',
          links: [
            custom('/specialists/join-expert-panel', "Join VERIFY's Expert Panel"),
            custom('/specialists/join-expert-panel#panel-benefits', 'Working with VERIFY'),
            custom('https://aamle.com.au/', 'AAMLE Education & Training', { newTab: true }),
            custom('/events/upcoming-events', 'Upcoming Webinars & Training'),
          ],
          ...custom('/specialists/join-expert-panel#join-form', 'Join Expert Panel'),
        },
      ],
    },
    // ── Who we are (two-column with image placeholder) ──
    {
      blockType: 'splitFeature',
      background: 'white',
      rows: [
        {
          eyebrow: 'Who We Are',
          title: 'VERIFY [[Medico-Legal]] Solutions',
          imageSide: 'left',
          imagePlaceholder: true,
          placeholderLabel: '[ Company Image Placeholder ]',
          body: plainTextToLexical(
            'VERIFY Medico-Legal Solutions provides independent medico-legal reporting and examination coordination with a focus on accuracy, responsiveness, and clarity. We support legal firms, insurers, and government bodies with reliable reporting services that help complex matters progress with confidence.\n\nFounded by Wes Lerch, who brings more than 25 years of experience in personal injury law and insurance litigation, VERIFY offers a practical understanding of what clients need and what complex matters demand.',
          ),
          ...custom('/about', 'About VERIFY'),
        },
      ],
    },
    // ── What we do (tabbed, light-blue band) ──
    {
      blockType: 'tabs',
      anchorId: 'services',
      eyebrow: 'What We Do',
      heading: 'Comprehensive [[Medico-Legal]] Services',
      subheading:
        'From independent examinations to professional education, VERIFY supports legal, insurance, and medical professionals with trusted medico-legal expertise.',
      background: 'accent',
      tabs: [
        {
          label: 'Medico-Legal Services',
          icon: 'first-aid',
          content: [servicesGrid],
        },
        {
          label: 'Educational Services',
          icon: 'graduation-cap',
          // Reference HOME educational tab (index.html #edu-panel): a "What AAMLE
          // Offers" intro + THREE numbered feature panels + a "Sponsorship
          // Opportunities" soft callout + an "Explore AAMLE" button. Composed from
          // ProcessSteps (auto-numbered 01/02/03 panels) + a one-item FeatureGrid
          // (the soft callout) + a Button, since the aamleEducation block is a
          // fixed two-column wordmark layout that can't express numbered panels.
          content: [
            {
              blockType: 'processSteps',
              variant: 'edu-panels',
              background: 'white',
              eyebrow: 'What AAMLE Offers',
              heading: 'Complimentary Education\n[[for Industry Professionals]]',
              // `introRich` supersedes `subheading` for this variant so the
              // reference's bolded academy name (index.html:246) survives.
              // `subheading` is left populated as the documented fallback — an
              // editor who clears the rich field gets plain copy, not a gap.
              subheading:
                'In 2025, VERIFY expanded its commitment to education with the creation of the Australian Academy of Medico-Legal Education (AAMLE). Under the banner of AAMLE, VERIFY provides a range of complimentary educational offerings across the medico-legal industry.',
              introRich: plainTextToLexical(
                'In 2025, VERIFY expanded its commitment to education with the creation of the **Australian Academy of Medico-Legal Education (AAMLE)**. Under the banner of AAMLE, VERIFY provides a range of complimentary educational offerings across the medico-legal industry.',
              ),
              steps: [
                {
                  icon: 'users',
                  badge: 'Free to Join',
                  title: 'Free Membership & Events',
                  description:
                    plainTextToLexical('Membership is free and facilitates access to complimentary educational events and resources to support continuous learning and professional development across the medico-legal industry.'),
                },
                {
                  icon: 'graduation-cap',
                  badge: 'CPD Eligible',
                  badgeStyle: 'accent',
                  title: 'Non-accredited, CPD-eligible Training',
                  description:
                    plainTextToLexical('AAMLE provides non-accredited, CPD-eligible training on various medico-legal topics, including:'),
                  bullets: [
                    {
                      text: 'Bimonthly webinars featuring insights from guest speakers with extensive medico-legal industry experience',
                    },
                    {
                      text: 'Specialised training tailored to the client, delivered as in-person seminars or webinars including activities and takeaway reference resources',
                    },
                  ],
                },
                {
                  icon: 'book-open',
                  badge: 'AAMLE Exclusive',
                  title: 'Access to Discounted IME Training',
                  // Blank line = paragraph break; `**bold**` / `*italic*` are
                  // parsed by plainTextToLexical. Matches the reference exactly
                  // (index.html:297), which bolds the partner name and italicises
                  // the publication title.
                  description: plainTextToLexical(
                    'AAMLE maintain a training partnership with **Brigham and Associates, Inc.** (‘Brigham & Associates’)—the unparalleled provider of comprehensive and focused courses on the AMA *Guides to the Evaluation of Permanent Impairment* (‘the AMA Guides’).\n\nAccess AAMLE-exclusive discounted training in the AMA Guides, including the Certified Impairment Rater (CIR) Exam.',
                  ),
                },
              ],
            },
            {
              blockType: 'featureGrid',
              background: 'white',
              columns: '1',
              cardStyle: 'plain',
              cssClass: ['vf-home-edu-sponsor'],
              items: [
                {
                  icon: 'handshake',
                  title: 'Sponsorship Opportunities',
                  description:
                    'Industry partners may sponsor AAMLE educational events and initiatives to support professional development across the medico-legal sector.',
                },
              ],
            },
            {
              blockType: 'button',
              align: 'center',
              cssClass: ['vf-home-edu-cta'],
              links: [custom('https://aamle.com.au/', 'Explore AAMLE', { newTab: true })],
            },
          ],
        },
      ],
    },
    // ── Claims we support (two-column: heading/desc/CTA + arrow checklist) ──
    {
      blockType: 'section',
      background: 'white',
      cssClass: ['vf-home-claims'],
      content: [
        {
          blockType: 'row',
          gap: 'wide',
          alignY: 'top',
          columns: [
            {
              content: [
                {
                  blockType: 'text',
                  richText: plainTextToLexical('Areas of Expertise'),
                  cssClass: ['claims-eyebrow'],
                },
                {
                  blockType: 'heading',
                  text: 'Claims We [[Support]]',
                  level: 'h2',
                  size: 'lg',
                },
                {
                  blockType: 'text',
                  richText: plainTextToLexical(
                    'VERIFY has extensive experience across a wide range of claim types, providing expert medico-legal services to support fair and accurate outcomes.',
                  ),
                },
                {
                  blockType: 'button',
                  links: [custom('/services/medico-legal/ime#claim-types', 'Learn More')],
                },
              ],
            },
            {
              content: [
                {
                  blockType: 'specialtyGrid',
                  source: 'auto',
                  taxonomy: 'claim-types',
                  variant: 'checklist',
                },
              ],
            },
          ],
        },
      ],
    },
    // ── Featured specialists (carousel, light-grey band) ──
    {
      blockType: 'peopleGrid',
      eyebrow: 'Featured Specialists',
      heading: 'Meet Our [[Expert Panel]]',
      subheading:
        'VERIFY works with a variety of highly skilled medical experts who are well-versed in legal procedures and understand the importance of their role in supporting the justice system.',
      background: 'muted',
      // Reference .experts is #f0f2f4 (styles.css:1647) — a shade deeper than
      // --band-muted (#f5f6f8), which is correct for the gateway band above.
      cssClass: ['band-grey-deep'],
      source: 'specialists',
      // `featuredOnly` is deliberately NOT set here. It is written by
      // `repairFeaturedSpecialists`, which flags the specialists first — setting
      // the filter in this fixture would turn it on before any specialist carries
      // the flag, and a People Grid matching nothing returns null and removes the
      // whole band. The repair is unconditional, so a fresh install still gets it.
      layout: 'carousel',
      limit: 8,
      linkProfiles: true,
      // The reference homepage marquee has no arrow controls and loops in 60s
      // (styles.css:1667; index.html:359-449 has no control buttons).
      carouselOptions: { showArrows: false, speed: 60 },
      footerLinks: [
        custom('/specialists/specialist-panel', 'View Full Panel'),
        custom('/specialists/join-expert-panel', 'Join Expert Panel'),
      ],
    },
    // ── Testimonials (carousel) ──
    {
      blockType: 'testimonialsGrid',
      eyebrow: 'Testimonials',
      heading: 'What Our [[Clients Say]]',
      subheading:
        'Trusted by legal firms, insurers, and medical professionals across Queensland and Australia.',
      source: 'auto',
      layout: 'carousel',
      // Reference carousel shows all 6 testimonials (3 visible at a time).
      limit: 6,
      carouselOptions: { visible: 3, showArrows: true },
    },
    // ── Enquiry section — ONE accent band, two columns (reference `.contact-grid`
    // 1fr 1.4fr): LEFT = left-aligned contact info, RIGHT = the enquiry form card.
    {
      blockType: 'section',
      background: 'accent',
      anchorId: 'contact',
      // band-flat-blue: reference .contact is a flat #e6f4ff (styles.css:1910-1913),
      // where the `accent` band preset is a three-stop gradient.
      cssClass: ['vf-home-enquiry', 'band-flat-blue'],
      content: [
        {
          blockType: 'row',
          gap: 'wide',
          alignY: 'top',
          cssClass: ['vf-home-enquiry-row'],
          columns: [
            {
              content: [
                {
                  blockType: 'contactDetails',
                  eyebrow: 'Make an Enquiry',
                  heading: 'Request a Booking or Make an Enquiry',
                  subheading:
                    'Have a question or ready to book? Our team is here to help guide you through the medico-legal process with professionalism and care.',
                  useGlobal: false,
                  items: contactItems,
                  cssClass: ['vf-home-enquiry-info'],
                },
              ],
            },
            ...(enquiryFormBlock ? [{ content: [enquiryFormBlock] }] : []),
          ],
        },
      ],
    },
  ]

  await seedUpdate(payload, {
    collection: 'pages',
    id: rec.id,
    data: { hero, layout } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info('— Homepage authored')
}
