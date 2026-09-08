import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'
import { isUnauthored } from './authored'

import { plainTextToLexical } from './data/richText'

type Ctx = { payload: Payload; req: PayloadRequest }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const custom = (url: string, label: string, extra: Record<string, unknown> = {}): any => ({
  link: { type: 'custom', url, label, newTab: false, ...extra },
})
async function authorPage(
  { payload, req }: Ctx,
  slug: string,
  hero: Record<string, unknown>,
  layout: unknown[],
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
    data: { hero, layout } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info(`— Authored /${slug}`)
}

// The recurring dark-blue "Online Booking Portal" band (design-ref .portal-opt4).
// All copy matches the block defaults; provided explicitly so the seed is stable.
const portalCtaBlock = () => ({
  blockType: 'portalCta',
  eyebrow: 'Everything You Need, In One Place',
  heading: 'Online Booking Portal',
  subheading:
    "VERIFY's Online Booking Portal gives registered clients immediate access to specialist scheduling, real-time availability, and key specialist documents, bringing everything together in one place. To get started, simply submit an enquiry or contact our team directly, and we will promptly set up your account.",
  tiles: [
    { icon: 'calendar-check', label: 'Specialist Availability' },
    { icon: 'file-text', label: 'Download Specialist CV' },
    { icon: 'magnifying-glass', label: 'Sample Redacted Report' },
  ],
  links: [
    custom(
      'mailto:admin@vmls.com.au?subject=VERIFY%20Booking%20Portal%20Access%20Request&body=Hi%20VERIFY%20Team%2C%0A%0AI%20would%20like%20to%20request%20access%20to%20the%20Online%20Booking%20Portal.%0A%0AFull%20Name%3A%0ACompany%2FOrganisation%3A%0AContact%20Number%3A%0AEmail%3A%0A%0AThank%20you.',
      'Send Enquiry',
    ),
  ],
})

// Signpost to this month's availability, sitting directly under the hero on the
// panel and the specialists landing page. It is the SAME block as the left half
// of the Make a Booking chooser — `bookingChooser` accepts a single half — so the
// treatment stays in one place rather than being rebuilt as a bespoke band.
//
// `density: 'compact'` because the full-height panel is 740px against a 541px
// hero on both pages; the field defaults to 'default', so Make a Booking is
// untouched. The link is cross-page to the availability grid's own anchor —
// `id="availability"` is rendered by the Availability block on /make-a-booking,
// and tests/e2e/links.e2e.spec.ts guards that every #fragment has a target.
const availabilitySignpost = () => ({
  blockType: 'bookingChooser',
  density: 'compact',
  halves: [
    {
      icon: 'calendar-check',
      accent: 'blue',
      eyebrow: "See What's Available",
      title: 'Specialist Availability',
      description:
        'Browse our specialists with current appointment sessions and select the times that suit you.',
      links: [custom('/make-a-booking#availability', "See this month's availability")],
    },
  ],
})

/**
 * Authors the Specialists group to match .design-reference/specialists/*:
 *   specialist-panel      → dark hero + specialistDirectory + portal CTA
 *   specialty-list        → dark hero + specialtyDirectory  + portal CTA
 *   specialist-availability → dark hero + availability (carousel + legend)
 *   join-expert-panel     → dark hero + intro splitFeature + benefits grid + two-column EOI form (no trailing CTA)
 *   specialists (parent)  → dark hero + gateway cards to the sub-pages + CTA
 * Everything stays editable in the admin.
 */
export const seedSpecialists = async (ctx: Ctx): Promise<void> => {
  const { payload, req } = ctx

  // ── Specialist Panel ──
  await authorPage(
    ctx,
    'specialist-panel',
    {
      type: 'pageHero',
      theme: 'dark',
      align: 'left',
      showBreadcrumb: true,
      showShield: true,
      heading: 'Our Panel of [[Medical Specialists]]',
      subtitle:
        'At VERIFY, we work with a variety of medical specialists to provide a service uniquely catered to our clients. Our specialists are highly skilled professionals committed to the highest standards of professionalism, accuracy, and impartiality.',
    },
    [
      availabilitySignpost(),
      {
        blockType: 'specialistDirectory',
        eyebrow: 'Find a specialist',
        heading: 'Search the [[directory]]',
        background: 'accent',
        enableSearch: true,
        enableSpecialty: true,
        enableLocation: true,
        enableAccreditation: true,
        sortBy: 'lastName',
        searchPlaceholder: 'Specialist name, specialty, location…',
        countTemplate: 'Showing {count} of {total} specialists',
        specialtyLabel: 'All specialties',
        locationLabel: 'All locations',
        accreditationLabel: 'All accreditations',
        emptyHeading: 'No specialists match those filters',
        emptyBody: 'Try a broader specialty, accreditation, or location search.',
        cardCtaLabel: 'View Profile',
      },
      portalCtaBlock(),
    ],
  )

  // ── Specialty List ──
  await authorPage(
    ctx,
    'specialty-list',
    {
      type: 'pageHero',
      theme: 'dark',
      align: 'left',
      showBreadcrumb: true,
      showShield: true,
      heading: 'Our [[Specialty List]]',
      subtitle:
        'VERIFY works with a broad panel of medical and allied-health specialists. Browse each specialty to understand the conditions assessed and the experts available.',
    },
    [
      {
        blockType: 'specialtyDirectory',
        // Reference goes straight from the hero into the filter bar (no header).
        background: 'accent',
        showFilterBar: true,
        showRosters: true,
        showKeyAreas: true,
      },
      // Reference "Good to know" note that closes the specialty list. Wrapped in an
      // accent Section so it reads as part of the directory band above it.
      {
        blockType: 'section',
        background: 'accent',
        content: [
          {
            blockType: 'callout',
            style: 'good-to-know',
            tag: 'Good to know',
            body: plainTextToLexical(
              "Can't find the specialty or specialist you need? We work with an extended network of specialists beyond those listed on our website. Contact our team to see how we can assist with your matter.",
            ),
            links: [custom('/contact', 'Contact Us')],
          },
        ],
      },
      portalCtaBlock(),
    ],
  )

  // ── Specialist Availability ──
  await authorPage(
    ctx,
    'specialist-availability',
    {
      type: 'pageHero',
      theme: 'dark',
      align: 'left',
      showBreadcrumb: true,
      showShield: false,
      heading: 'Specialist [[Availability]]',
      subtitle:
        'Need an appointment? Browse our specialists with current availability below, select the in-person or telehealth sessions that suit your matter, and send us an enquiry.',
    },
    [{ blockType: 'availability', showCarousel: true, showLegend: true }],
  )

  // ── Join the Expert Panel ──
  const eoi = await payload.find({
    collection: 'forms',
    where: { title: { equals: 'Expression of Interest' } },
    limit: 1,
    depth: 0,
    req,
  })
  const eoiFormId = eoi.docs[0]?.id

  const joinLayout: unknown[] = [
    {
      blockType: 'splitFeature',
      headingWeight: 'heavy',
      rows: [
        {
          eyebrow: 'About Our Panel',
          title: 'A Specialist Partnership Built on [[Quality & Integrity]]',
          imageSide: 'right',
          imagePlaceholder: true,
          placeholderLabel: 'Image Placeholder',
          body: plainTextToLexical(
            "VERIFY Medico-Legal Solutions coordinates independent medical examinations, joint examinations, and expert reports for legal firms, insurers, and government bodies across Queensland and Australia. At the centre of everything we deliver is our specialist panel — a carefully selected group of medical and allied health professionals committed to accurate, impartial expert opinion.\n\nWe are selective about the specialists we partner with — not because medico-legal work is inaccessible, but because our clients and the legal system depend on reports that are defensible, thorough, and free from bias. Joining VERIFY's panel means entering a professionally supported environment where your clinical expertise is valued, your administrative burden is minimised, and the quality of your work is actively protected.",
          ),
        },
      ],
    },
    {
      // Wrapped in a Section so the benefits carry the #panel-benefits anchor that
      // the homepage "Working with VERIFY" link targets. The nested featureGrid
      // renders bare and inherits the Section's accent background.
      blockType: 'section',
      background: 'accent',
      anchorId: 'panel-benefits',
      content: [
        {
          blockType: 'featureGrid',
          eyebrow: 'Why Join VERIFY',
          heading: 'What We Offer [[Our Panel Specialists]]',
          subheading:
            'We partner with specialists who value quality, impartiality and professional growth. Here is what you can expect as a VERIFY panel member.',
          columns: '3',
          headingWeight: 'heavy',
          // Reference benefit cards are centre-aligned with a plain large primary
          // icon (no icon box) and justified body copy. This was a page-scoped
          // `cssClass: 'vf-join-benefits'`, which never reached the database —
          // authorPage early-returns on an authored page, so the class was absent
          // sitewide and ~50 lines of correct CSS rendered nothing. A card STYLE
          // travels with the block and is visible in the admin, so it cannot go
          // silently missing. Existing installs are fixed by repairJoinBenefits.
          cardStyle: 'benefit',
          items: [
            {
              icon: 'clipboard-text',
              title: 'End-to-End Administrative Support',
              description:
                'We manage all scheduling, consent documentation, brief preparation, and claimant correspondence, with every document organised and ready before your assessment begins. Your time is spent on clinical assessment, not paperwork.',
            },
            {
              icon: 'shield-check',
              title: 'Quality You Can Stand Behind',
              description:
                'Every report you produce is reviewed by our QA team before release, ensuring it meets the highest standards of accuracy, defensibility, and compliance with current legislative requirements.',
            },
            {
              icon: 'arrows-out',
              title: 'Built Around Your Practice',
              description:
                'We accommodate in-person, videolink, surrogate, and home-visit assessments, structured around your schedule and preferred locations. Our model integrates seamlessly into your existing practice without operational disruption.',
            },
            {
              icon: 'scales',
              title: 'Report Writing Mastery',
              description:
                'We provide structured training on producing impartial, consistent, and defensible medico-legal reports that meet the standards clients, legal teams, and tribunals expect. We set you up for credibility from your very first report.',
            },
            {
              icon: 'graduation-cap',
              title: 'Exclusive AAMLE Membership',
              description:
                "Panel specialists gain priority access to AAMLE, Australia's specialist medico-legal education academy, including CPD-accredited seminars, expert workshops, and opportunities to present at industry forums.",
            },
            {
              icon: 'handshake',
              title: 'A Genuine Partnership',
              description:
                'Every specialist is supported by a dedicated team, backed by transparent fee structures and direct access to our staff. We invest in long-term relationships because the best medico-legal outcomes are built on trust, consistency, and mutual respect.',
            },
          ],
        },
      ],
    },
  ]

  // ── Express Your Interest ──
  // Reference is a two-column band (join-form-layout, 1fr 1.5fr): LEFT is a
  // left-aligned "Get in Touch" info column (eyebrow, heading, intro, icon-led
  // email/phone contact items, and a light-blue "within 2 business days" note);
  // RIGHT is the card-styled Expression-of-Interest form. FormBlock now nests
  // cleanly in a Row column, so we author Section > Row > [info column, form
  // column] and the two render side-by-side under the shared #join-form anchor.
  // The reference page ends at the form — no trailing CTA band.
  const eoiFormColumn: unknown[] = []
  if (eoiFormId) {
    eoiFormColumn.push({
      blockType: 'formBlock',
      form: eoiFormId,
      enableIntro: true,
      // Was `cssClass: 'vf-join-eoi__form'` — a page-scoped class, which is
      // STORED DATA, so the CSS written against it never reached this page.
      // `cardStyle` is a real field on the block and travels with it.
      cardStyle: 'card',
      // Card header — matches the reference "Enquiry Form" title on the form card.
      introContent: {
        root: {
          type: 'root',
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'heading',
              tag: 'h3',
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Enquiry Form',
                  version: 1,
                },
              ],
            },
          ],
        },
      },
    })
  } else {
    payload.logger.warn('— join-expert-panel: "Expression of Interest" form not found, omitting form block')
  }

  joinLayout.push({
    blockType: 'section',
    background: 'muted',
    anchorId: 'join-form',
    content: [
      {
        blockType: 'row',
        // Reference `.join-form-layout`: 1fr 1.5fr with a 72px gap — 2 : 3 and
        // the `x-wide` preset here.
        gap: 'x-wide',
        alignY: 'top',
        columnRatio: '2-3',
        columns: [
          // LEFT — "Get in Touch" info column (left-aligned).
          {
            span: 'auto',
            align: 'left',
            content: [
              {
                blockType: 'iconList',
                eyebrow: 'Get in Touch',
                heading: 'Express Your [[Interest]]',
                subheading:
                  'Send us an enquiry form and our team will be in touch to discuss panel membership and next steps. Alternatively, reach us directly by email or phone.',
                columns: '1',
                headingAlign: 'left',
                items: [
                  {
                    icon: 'envelope',
                    text: 'admin@vmls.com.au',
                    link: { url: 'mailto:admin@vmls.com.au' },
                  },
                  { icon: 'phone', text: '07 3356 0469', link: { url: 'tel:0733560469' } },
                ],
              },
              {
                blockType: 'callout',
                style: 'reassurance',
                icon: 'info',
                body: plainTextToLexical(
                  'We will be in touch within 2 business days to discuss the next steps and how we can best assist you.',
                ),
              },
            ],
          },
          // RIGHT — the card-styled Expression-of-Interest form.
          {
            span: 'auto',
            align: 'left',
            content: eoiFormColumn,
          },
        ],
      },
    ],
  })

  await authorPage(
    ctx,
    'join-expert-panel',
    {
      type: 'pageHero',
      theme: 'dark',
      align: 'left',
      showBreadcrumb: true,
      showShield: true,
      heading: 'Join Our [[Expert Panel]]',
      subtitle:
        "VERIFY partners with medical and allied-health specialists who value rigour, fairness, and professional development. If you're interested in medico-legal work, we'd like to hear from you.",
      links: [custom('#join-form', 'Join Expert Panel'), custom('tel:0733560469', '07 3356 0469')],
    },
    joinLayout,
  )

  // ── Specialists (parent hub) ──
  await authorPage(
    ctx,
    'specialists',
    {
      type: 'pageHero',
      theme: 'dark',
      align: 'left',
      showBreadcrumb: true,
      showShield: true,
      heading: 'Our Panel of [[Medical Specialists]]',
      subtitle:
        'At VERIFY, we work with a variety of medical specialists to provide a service uniquely catered to our clients. Our specialists are highly skilled professionals committed to the highest standards of professionalism, accuracy, and impartiality.',
    },
    // The reference Specialists page IS the searchable directory (not a hub).
    [
      availabilitySignpost(),
      {
        blockType: 'specialistDirectory',
        eyebrow: 'Find a specialist',
        heading: 'Search the [[directory]]',
        background: 'accent',
        enableSearch: true,
        enableSpecialty: true,
        enableLocation: true,
        enableAccreditation: true,
        sortBy: 'lastName',
        searchPlaceholder: 'Specialist name, specialty, location…',
        countTemplate: 'Showing {count} of {total} specialists',
        specialtyLabel: 'All specialties',
        locationLabel: 'All locations',
        accreditationLabel: 'All accreditations',
        emptyHeading: 'No specialists match those filters',
        emptyBody: 'Try a broader specialty, accreditation, or location search.',
        cardCtaLabel: 'View Profile',
      },
      portalCtaBlock(),
    ],
  )
}
