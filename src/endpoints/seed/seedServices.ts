import { seedCreate, seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

import { storedText } from './repairMatch'
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

// The shared bottom CTA used across every services page (design reference:
// every services/**/*.html closes with the identical `.svc-cta` band).
const closingCta = () => ({
  blockType: 'ctaBand',
  eyebrow: 'Get Started',
  heading: 'Ready to Refer Your [[Next Matter to VERIFY?]]',
  text: 'Whether you have a specific referral or need guidance on the most suitable service, we are here to make the process simple, efficient, and responsive from the very start.',
  links: [custom('/specialists/specialist-panel', 'View Specialist Panel'), enquiry('Make an Enquiry')],
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

/**
 * Authors the Services group of pages to match .design-reference/services/*.
 *
 *  · /services                 — services landing (IME/JME split, reporting +
 *                                administrative feature grids, AAMLE education, CTA)
 *  · /medico-legal/ime         — Independent Medical Examination
 *  · /medico-legal/jme         — Joint Medical Examination
 *  · /medico-legal/reporting-services — File Review, Supplementary, etc.
 *  · /medico-legal/admin-services     — Surrogate, Brief Reduction, etc.
 *  · /medico-legal             — Medico-Legal Services parent stub
 *  · /educational-services     — Educational Services parent stub
 *
 * Everything stays editable in the admin.
 */
export const seedServices = async (ctx: Ctx): Promise<void> => {
  const { payload, req } = ctx

  // ══════════════════════════════════════════════════════════════════════
  // GRANULAR SERVICE DOCS (idempotent)
  // ----------------------------------------------------------------------
  // The Services-landing "Reports & Opinions" grid and the Admin-services
  // page cards are driven by the ServicesGrid block (source: manual), so the
  // reference cards must exist as Service docs. We upsert the reporting +
  // administrative services here (enriching the three that already exist and
  // creating the rest). Copy + icons are ported verbatim from the reference.
  // ══════════════════════════════════════════════════════════════════════
  const ensureService = async (data: Record<string, unknown>): Promise<number | string> => {
    const found = await payload.find({
      collection: 'services',
      where: { slug: { equals: data.slug } },
      limit: 1,
      depth: 0,
      req,
    })
    if (found.docs[0]) {
      await seedUpdate(payload, {
        collection: 'services',
        id: found.docs[0].id,
        data: data as never,
        req,
        context: { disableRevalidate: true },
      })
      return found.docs[0].id
    }
    const created = await seedCreate(payload, {
      collection: 'services',
      data: data as never,
      req,
      context: { disableRevalidate: true },
    })
    return created.id
  }

  // ── Reporting services (Medico-Legal · Reporting) ──
  const fileReviewId = await ensureService({
    slug: 'file-review',
    title: 'File Review',
    category: 'medico-legal',
    serviceGroup: 'reporting',
    icon: 'clipboard-text',
    shortDescription:
      "A specialist reviews the claimant's medical records without a physical examination — ideal where attendance is not possible or a paper-based opinion is sufficient.",
    order: 3,
  })
  const supplementaryId = await ensureService({
    slug: 'supplementary-report',
    title: 'Supplementary Report',
    category: 'medico-legal',
    serviceGroup: 'reporting',
    icon: 'file-plus',
    shortDescription:
      'Additional specialist opinions addressing new records or questions that arise after an initial report has been delivered.',
    order: 4,
  })
  // Deliberately created and deliberately not listed. VERIFY still accepts
  // medical negligence claims — the doc is kept complete so it is one edit away
  // from being usable again — but it is no longer shown on any services page.
  // Removed from the /services grid and from reporting-services on 2026-08-18.
  await ensureService({
    slug: 'medical-negligence',
    title: 'Medical Negligence',
    category: 'medico-legal',
    serviceGroup: 'reporting',
    icon: 'shield-check',
    shortDescription:
      'Expert opinions on whether the applicable standard of care was met — prepared to withstand scrutiny in court or tribunal.',
    order: 5,
  })
  // Repurpose the previously-combined "Teleconference & Expert Evidence" doc as
  // the standalone Teleconference service (the reference lists them separately).
  const teleconferenceId = await ensureService({
    slug: 'teleconference-expert-evidence',
    title: 'Teleconference',
    category: 'medico-legal',
    serviceGroup: 'reporting',
    icon: 'phone',
    shortDescription:
      'Facilitated expert sessions for matters requiring specialist input without a formal written report.',
    order: 6,
  })
  const expertEvidenceId = await ensureService({
    slug: 'expert-evidence',
    title: 'Expert Evidence',
    category: 'medico-legal',
    serviceGroup: 'reporting',
    icon: 'gavel',
    shortDescription:
      'Full coordination for specialists providing oral expert evidence in court or tribunal — from report preparation to hearing logistics.',
    order: 31,
  })

  // ── Administrative services ──
  // shortDescription = the punchy Services-landing card copy; body = the formal
  // Administrative-Services-page accordion copy (both ported from the reference).
  const surrogateId = await ensureService({
    slug: 'surrogate-assessment',
    title: 'Surrogate Assessment Service',
    category: 'administrative',
    serviceGroup: 'administrative',
    icon: 'user-plus',
    shortDescription:
      "Distance or mobility shouldn't delay your matter. We arrange a qualified surrogate so the physical assessment proceeds — and your report stays on track.",
    body: plainTextToLexical(
      "Where a physical examination is clinically necessary but the claimant cannot travel to the specialist's rooms, VERIFY engages an allied health professional to attend the claimant's location and conduct the physical examination under the real-time direction of the specialist via secure videolink — maintaining full clinical accuracy while removing geographic barriers.",
    ),
    order: 32,
  })
  const interpreterId = await ensureService({
    slug: 'interpreter-booking',
    title: 'Interpreter Booking Service',
    category: 'administrative',
    serviceGroup: 'administrative',
    icon: 'chat-circle-text',
    shortDescription:
      'Ensure nothing is lost in translation. We source and manage NAATI-certified interpreters so every claimant is heard clearly and your specialist gets the full picture.',
    body: plainTextToLexical(
      'Where a claimant requires language assistance, VERIFY arranges an accredited, NAATI-certified interpreter to attend the assessment — either in person or via videolink. VERIFY manages the booking, briefing, and all logistics, with interpreter attendance confirmed as part of the standard appointment notice.',
    ),
    order: 33,
  })
  const briefReductionId = await ensureService({
    slug: 'brief-reduction',
    title: 'Brief Reduction Service',
    category: 'administrative',
    serviceGroup: 'administrative',
    icon: 'file-text',
    shortDescription:
      'A sharper brief means a sharper report. We distil voluminous records into a focused clinical summary — so your specialist spends time opining, not reading.',
    body: plainTextToLexical(
      'Legal briefs submitted to specialists often span hundreds of pages. VERIFY condenses these materials into a focused, clinician-ready document — presenting only the most relevant information in a clear, structured format to increase review efficiency and contribute to a more accurate clinical opinion.',
    ),
    order: 34,
  })
  const loiReviewId = await ensureService({
    slug: 'letter-of-instruction-review',
    title: 'Letter of Instruction Review',
    category: 'administrative',
    serviceGroup: 'administrative',
    icon: 'files',
    shortDescription:
      'We review the questions posed and the authority to act before a brief goes out — and, where a firm would like it, work with them to develop and flesh out their instruction templates so every referral starts on the right footing.',
    body: plainTextToLexical(
      'VERIFY reviews letters of instruction before they are issued to specialists, checking that referral questions are clear, relevant records are identified, and the brief supports an accurate medico-legal opinion — reducing ambiguity, delays, and unnecessary follow-up.',
    ),
    order: 35,
  })

  const reportingServices = [fileReviewId, supplementaryId, teleconferenceId, expertEvidenceId]
  // Landing-grid order: Surrogate · Interpreter · Brief Reduction · LOI (single row of four).
  const adminServicesRow = [surrogateId, interpreterId, briefReductionId, loiReviewId]
  // Accordion column order: col 1 = Surrogate + Brief Reduction, col 2 = Interpreter + LOI
  // (the block splits the array in half into two columns → matches the reference layout).
  const adminServicesAccordion = [surrogateId, briefReductionId, interpreterId, loiReviewId]

  // ══════════════════════════════════════════════════════════════════════
  // SERVICES LANDING
  // ══════════════════════════════════════════════════════════════════════
  await authorPage(
    ctx,
    'services',
    {
      type: 'pageHero',
      theme: 'dark',
      align: 'center',
      showBreadcrumb: true,
      showShield: false,
      heading: 'Medico-Legal Services Built on [[Precision & Trust]]',
      subtitle:
        'From independent medical examinations to expert evidence coordination and industry education — VERIFY delivers every service with the rigour, accuracy, and professional care that legal and insurance matters demand.',
    },
    [
      // ── IME + JME: two alternating image/text rows, plain "Learn more →" links ──
      {
        blockType: 'splitFeature',
        background: 'white',
        cssClass: ['svc-learn-rows'],
        rows: [
          {
            imagePlaceholder: true,
            placeholderLabel: 'Image Placeholder',
            imageSide: 'left',
            title: 'Independent Medical Examinations',
            body: plainTextToLexical(
              'Impartial assessments delivered nationally by accredited specialists, supported by full end-to-end coordination and a mandatory quality assurance review on every report.',
            ),
            ...custom('/services/medico-legal/ime', 'Learn more →'),
          },
          {
            imagePlaceholder: true,
            placeholderLabel: 'Image Placeholder',
            imageSide: 'right',
            title: 'Joint Medical Examinations',
            body: plainTextToLexical(
              'A single specialist agreed upon by both parties — delivering a shared, independent medical opinion that reduces duplication, cost, and resolution time across WorkCover, CTP, and TPD matters.',
            ),
            ...custom('/services/medico-legal/jme', 'Learn more →'),
          },
        ],
      },
      // ── Reporting services grid (Enquire → links) — reference `.reporting-header`
      //    is left-aligned (svc-reporting overrides the block's centred header) ──
      {
        blockType: 'servicesGrid',
        eyebrow: 'Other Reporting Services',
        heading: 'Medico-Legal [[Reports & Opinions]]',
        background: 'muted',
        cssClass: ['svc-reporting'],
        source: 'manual',
        services: reportingServices,
        columns: '3',
        showEnquire: true,
      },
      // ── Administrative services grid (dark band, Enquire → links) — reference
      //    `.admin-header` is a split row: eyebrow+heading bottom-left, subtitle
      //    bottom-right (svc-admin-split) ──
      {
        blockType: 'servicesGrid',
        eyebrow: 'Administrative Services',
        heading: 'Coordinated Support for [[Every Matter]]',
        subheading:
          'Behind every strong report is a well-run examination. Our administrative services handle the details that make the difference.',
        background: 'primary',
        cssClass: ['svc-glow-band', 'svc-admin-split'],
        source: 'manual',
        services: adminServicesRow,
        columns: '4',
        showEnquire: true,
      },
      // ── AAMLE education — reference `.aamle-section` is a full-bleed, edge-to-edge
      //    two-column band with square corners (containerWidth full + aamle-full) ──
      {
        blockType: 'aamleEducation',
        background: 'white',
        containerWidth: 'full',
        cssClass: ['aamle-full'],
        eyebrow: 'Educational Services',
        wordmark: 'AAMLE',
        subheading: 'Australian Academy of Medico-Legal Education',
        badge: { icon: 'graduation-cap', text: 'CPD-Eligible Programs' },
        description: plainTextToLexical(
          "AAMLE is VERIFY's educational arm — delivering complimentary, CPD-eligible programs to legal, medical, and insurance professionals across Australia, at no cost to participants.",
        ),
        items: [
          { icon: 'video-camera', label: 'CPD-Eligible Webinars' },
          { icon: 'graduation-cap', label: 'Specialist Training Events' },
          { icon: 'book-open', label: 'Discounted AMA Guides Access' },
          { icon: 'globe', label: 'Open to All — Nationally' },
        ],
        imagePlaceholder: true,
        placeholderLabel: 'Image Placeholder',
        ...custom('https://aamle.com.au/', 'Explore AAMLE', { newTab: true }),
      },
      // ── Closing CTA ──
      closingCta(),
    ],
  )

  // ══════════════════════════════════════════════════════════════════════
  // IME
  // ══════════════════════════════════════════════════════════════════════
  await authorPage(
    ctx,
    'ime',
    {
      type: 'pageHero',
      theme: 'service',
      align: 'left',
      showBreadcrumb: true,
      // Reference `.ime-hero` has no shield graphic — just breadcrumb + heading.
      showShield: false,
      heading: 'Independent Medical [[Examination (IME)]]',
    },
    [
      // ── What is an IME (image left + intro) ──
      {
        blockType: 'splitFeature',
        background: 'white',
        cssClass: ['vf-ime-what'],
        rows: [
          {
            imagePlaceholder: true,
            placeholderLabel: 'Image Placeholder',
            imageSide: 'left',
            eyebrow: 'What is an IME?',
            title: 'An Expert Medical Opinion, [[Independent of All Parties]]',
            body: plainTextToLexical(
              "An Independent Medical Examination (IME) is a formal medico-legal assessment conducted by an accredited specialist who has no treating relationship with the claimant. The specialist provides an objective, evidence-based opinion on the claimant's injuries or medical condition.\n\nVERIFY manages every aspect of the IME process — from specialist selection and appointment scheduling through to report delivery and quality assurance — so your matter progresses without delay.",
            ),
          },
        ],
      },
      // ── The 3 key points as icon-led rows with a BOLD heading + description
      //    (reference `.ime-what-point`). SplitFeature bullets are single-line
      //    only, so the points live in a FeatureGrid (icon + title + description). ──
      {
        blockType: 'featureGrid',
        background: 'white',
        columns: '3',
        cardStyle: 'plain',
        hoverEffect: 'none',
        cssClass: ['ime-what-points'],
        items: [
          {
            icon: 'heartbeat',
            title: 'Injury Stability & Permanence',
            description:
              'Assessment of whether the injury is stable, stationary, or likely to improve, and the degree of any permanent impairment.',
          },
          {
            icon: 'users',
            title: 'Work Capacity & Functional Impact',
            description:
              "Expert opinion on how the injury affects the claimant's ability to work and carry out daily activities.",
          },
          {
            icon: 'shield-check',
            title: 'Causation & Treatment Needs',
            description:
              'Impartial opinion on the cause of the injury and any recommended treatment, rehabilitation, or further investigation.',
          },
        ],
      },
      // ── Claim types accordion (first item open) ──
      {
        blockType: 'faq',
        anchorId: 'claim-types',
        eyebrow: 'Areas of Expertise',
        heading: 'IMEs Across All [[Major Claim Types]]',
        subheading:
          'VERIFY provides independent medical examinations across a broad range of personal injury, occupational, and disability claim categories.',
        columns: '1',
        exclusive: true,
        openFirst: true,
        // The reference draws this as the same divided accordion as the
        // Information Centre, with a circled ± and a tinted icon tile. Its rules
        // are a 15% primary tint, because it sits on the accent band.
        itemStyle: 'divided',
        toggleStyle: 'pill',
        iconStyle: 'tile',
        density: 'compact',
        ruleStyle: 'brand',
        // The reference runs these rows 820px wide inside the full container,
        // rather than in the 772px narrow column the Information Centre uses.
        containerWidth: 'normal',
        cssClass: ['ime-claim-faq'],
        items: [
          {
            icon: 'shield',
            question: 'Motor Vehicle Accident / Compulsory Third-Party Insurance',
            answer: plainTextToLexical(
              "IMEs for road traffic injury claims under Queensland's CTP scheme, addressing physical and psychological injuries, causation, and long-term prognosis.",
            ),
          },
          {
            icon: 'briefcase',
            question: "Workers' Compensation",
            answer: plainTextToLexical(
              'Independent assessments for workplace injury claims covering degree of impairment, work capacity, treatment needs, and fitness for return to work.',
            ),
          },
          {
            icon: 'users-three',
            question: 'Public Liability',
            answer: plainTextToLexical(
              'Expert medical opinions for injury claims arising from incidents on public or private property, supporting both liability and quantum assessments.',
            ),
          },
          {
            icon: 'book-open',
            question: 'Historical or Institutional Abuse',
            answer: plainTextToLexical(
              'Specialist psychiatric and psychological assessments for claimants in matters involving historical or institutional trauma, with sensitivity to complex presentations.',
            ),
          },
          {
            icon: 'wind',
            question: 'Dust Diseases',
            answer: plainTextToLexical(
              'Medical examinations for occupational lung disease claims including asbestosis, mesothelioma, and silicosis, conducted by respiratory and occupational medicine specialists.',
            ),
          },
          {
            icon: 'user',
            question: 'National Disability Insurance Scheme (NDIS)',
            answer: plainTextToLexical(
              'Functional capacity and diagnostic assessments supporting NDIS access requests, plan reviews, and eligibility determinations across a range of disability types.',
            ),
          },
          {
            icon: 'wheelchair',
            question: 'Total & Permanent Disability (TPD)',
            answer: plainTextToLexical(
              'Expert medical opinions on whether a claimant satisfies the TPD definition under their life or income protection insurance policy, based on current functional capacity.',
            ),
          },
          {
            icon: 'shield-check',
            question: 'Medical Negligence',
            answer: plainTextToLexical(
              'Independent expert opinions on breach of duty, causation, and the extent of harm in medical negligence proceedings, drawn from our specialist panel.',
            ),
          },
          {
            icon: 'user-check',
            question: 'Fitness for Work Assessment',
            answer: plainTextToLexical(
              "Independent evaluations of a worker's capacity to safely perform specific duties, tasks, or hours — supporting employers, insurers, and return-to-work coordinators.",
            ),
          },
        ],
      },
      // ── Assessment formats (2 × 2 grid) — reference `.ime-format-card`: the
      //    format NAME is blue and " Assessment" dark; header left-aligned ──
      {
        blockType: 'featureGrid',
        eyebrow: 'Assessment Formats',
        heading: 'Four Ways to Attend [[Your IME]]',
        subheading:
          'VERIFY offers flexible assessment formats to accommodate varying clinical needs, geographic constraints, and personal circumstances — while always maintaining the integrity of the examination.',
        background: 'white',
        columns: '2',
        // Reference `.ime-format-card`: icon + title on a tinted panel across the
        // top, description and "What's Included" below it.
        cardStyle: 'banded',
        cssClass: ['ime-formats'],
        items: [
          {
            icon: 'user',
            title: 'In-Person',
            titleSuffix: 'Assessment',
            description:
              "An independent medico-legal examination conducted at the specialist's consulting rooms. The specialist provides an impartial medical opinion on the claimant's injuries or condition — evaluating stability, permanence, and impact on work capacity.",
            detailsLabel: "What's Included",
            details: [
              {
                icon: 'user',
                title: 'Face-to-Face Examination',
                description:
                  'Direct physical examination conducted by the specialist at their consulting rooms or a designated venue',
              },
              {
                icon: 'file-text',
                title: 'Full Clinical Assessment',
                description:
                  "Comprehensive review of the claimant's medical history, current condition, and all relevant documentation",
              },
              {
                icon: 'check-circle',
                title: 'All Specialties',
                description: 'Available across all medical specialties on the VERIFY panel',
              },
            ],
          },
          {
            icon: 'video-camera',
            title: 'Videolink',
            titleSuffix: 'Assessment',
            description:
              "Available where the claimant is unable to attend the specialist's rooms in person. The examination is conducted remotely via secure videolink, allowing the specialist to provide a full clinical opinion without requiring physical attendance.",
            detailsLabel: "What's Included",
            details: [
              {
                icon: 'desktop',
                title: 'Device Requirements',
                description: 'A computer or tablet with a functioning camera and microphone',
              },
              {
                icon: 'cell-signal-full',
                title: 'Reliable Connection',
                description: 'A reliable, stable internet connection for the duration of the assessment',
              },
              {
                icon: 'house',
                title: 'Private Environment',
                description: 'A private, quiet space for the full duration of the assessment',
              },
            ],
          },
          {
            icon: 'users-three',
            title: 'Surrogate',
            titleSuffix: 'Assessment',
            description:
              'Where in-person attendance is not feasible but a physical examination is clinically necessary, a trained allied health professional conducts the examination locally under real-time specialist direction via videolink — maintaining clinical rigour while expanding access for regional claimants. Available for Orthopaedic Surgeons and Occupational Therapists only.',
            detailsLabel: "What's Included",
            details: [
              {
                icon: 'users-three',
                title: 'Local Examiner',
                description:
                  'An allied health professional (typically a physiotherapist) conducts the physical examination locally on your behalf',
              },
              {
                icon: 'video-camera',
                title: 'Real-Time Direction',
                description: 'The specialist guides the physical examination remotely via videolink in real time',
              },
              {
                icon: 'check-circle',
                title: 'Specialty Availability',
                description: 'Available for IMEs with Orthopaedic Surgeons and Occupational Therapists only',
              },
            ],
          },
          {
            icon: 'house',
            title: 'Home Visit',
            titleSuffix: 'Assessment',
            description:
              'Assessing the claimant in their own home or care facility enables a comprehensive evaluation of their current condition, daily challenges, functional capacity, and living environment — allowing for more thorough recommendations regarding home modifications and ongoing support needs. Available for Occupational Therapists only.',
            detailsLabel: "What's Included",
            details: [
              {
                icon: 'user',
                title: 'At Home or in Care',
                description:
                  "Conducted at the claimant's own home or care facility for a familiar, comfortable environment",
              },
              {
                icon: 'file-text',
                title: 'Holistic Assessment',
                description:
                  'Detailed evaluation of condition, functional capacity, daily challenges, and goals within the actual living environment',
              },
              {
                icon: 'clock',
                title: 'Availability & Requirements',
                description:
                  'Available for IMEs with Occupational Therapists only; suitable environment required for assessment',
              },
            ],
          },
        ],
      },
      // ── The IME process: two side-by-side pathway cards (4 steps each) ──
      {
        blockType: 'audiencePathways',
        eyebrow: 'The IME Process',
        heading: "Whether You're a [[Client or a Claimant]]",
        subheading:
          "We've outlined the IME process from two perspectives — for the legal and insurance professionals who refer matters, and for the claimants attending the assessment.",
        background: 'muted',
        pathways: [
          {
            variant: 'client',
            eyebrow: 'For Clients',
            title: 'How the IME Process Works for Clients',
            description:
              'A step-by-step guide to referring a matter, managing the process, and receiving your report through VERIFY.',
            steps: [
              {
                title: 'Submit Your Referral',
                description:
                  "Lodge your referral via VERIFY's booking portal with the claimant's details and any relevant documentation.",
              },
              {
                title: 'Specialist Allocation',
                description:
                  'VERIFY matches your matter to an appropriate accredited specialist based on claim type, specialty, and availability.',
              },
              {
                title: 'Appointment Coordination',
                description:
                  'VERIFY manages all scheduling, claimant communication, interpreter bookings, and any administrative requirements.',
              },
              {
                title: 'QA Review & Report Delivery',
                description:
                  "The finalised report passes through VERIFY's Quality Assurance review before being delivered to your office.",
              },
            ],
            ...custom('/information-centre/for-clients', 'View Client Process'),
          },
          {
            variant: 'claimant',
            eyebrow: 'For Claimants',
            title: 'What to Expect at Your IME Assessment',
            description:
              'Understand what happens at your appointment and how to prepare so your assessment runs smoothly.',
            steps: [
              {
                title: "You'll Receive an Appointment Letter",
                description:
                  "VERIFY will send you a confirmation letter with the date, time, location, and specialist's details.",
              },
              {
                title: 'Bring Relevant Documentation',
                description:
                  'Bring any medical records, imaging, or correspondence relevant to your injury that you have in your possession.',
              },
              {
                title: 'The Assessment',
                description:
                  'The specialist will review your history, ask questions about your injury and its impact, and may conduct a physical examination.',
              },
              {
                title: 'After Your Assessment',
                description:
                  'The specialist prepares a report for the referring party. VERIFY does not share the report directly with claimants.',
              },
            ],
            ...custom('/information-centre/for-claimants', 'View Claimant Guide'),
          },
        ],
      },
      // ── Closing CTA ──
      closingCta(),
    ],
  )

  // ══════════════════════════════════════════════════════════════════════
  // JME
  // ══════════════════════════════════════════════════════════════════════
  await authorPage(
    ctx,
    'jme',
    {
      type: 'pageHero',
      theme: 'service',
      align: 'left',
      showBreadcrumb: true,
      // Reference `.jme-hero` has no shield graphic — just breadcrumb + heading.
      showShield: false,
      heading: 'Joint Medical [[Examination (JME)]]',
    },
    [
      // ── What is a JME (image right + intro) ──
      {
        blockType: 'splitFeature',
        background: 'white',
        cssClass: ['vf-ime-what'],
        rows: [
          {
            imagePlaceholder: true,
            placeholderLabel: 'Image Placeholder',
            imageSide: 'right',
            eyebrow: 'What is a JME?',
            title: 'One Specialist. [[Jointly Instructed by Both Parties.]]',
            body: plainTextToLexical(
              'A Joint Medical Examination (JME) — also referred to as a Joint Independent Medical Examination (JIME) — is a medico-legal assessment where one independent specialist is engaged and instructed together by both the plaintiff and defendant (or their legal representatives).\n\nRather than each side commissioning their own report, both parties agree on a single specialist, who then assesses the claimant and provides one shared report. This approach eliminates duplicated assessments, conflicting opinions, and unnecessary cost.',
            ),
          },
        ],
      },
      // ── The 3 key points as icon-led rows with a BOLD heading + description
      //    (reference `.jme-what-point`), rendered via a FeatureGrid so each point
      //    shows a bold heading and a separate description (SplitFeature bullets
      //    are single-line only). ──
      {
        blockType: 'featureGrid',
        background: 'white',
        columns: '3',
        cardStyle: 'plain',
        hoverEffect: 'none',
        cssClass: ['jme-what-points'],
        items: [
          {
            icon: 'shield-check',
            title: 'Jointly Instructed & Mutually Agreed',
            description:
              'Both parties agree on the specialist and the letter of instruction before the assessment proceeds.',
          },
          {
            icon: 'info',
            title: 'One Report, Shared by All',
            description:
              "The specialist's report is provided simultaneously to both parties — transparent, consistent, and binding in nature.",
          },
          {
            icon: 'currency-dollar',
            title: 'Lower Cost & Fewer Delays',
            description:
              'Reduces the number of assessments the claimant must attend and lowers the overall costs incurred by both parties.',
          },
        ],
      },
      // ── Why choose a JME ──
      {
        blockType: 'featureGrid',
        eyebrow: 'Why Choose a JME',
        heading: 'The Benefits of a [[Joint Approach]]',
        subheading:
          'A JME is not always the right choice for every matter — but where it is appropriate, the advantages for both parties are significant.',
        background: 'accent',
        columns: '3',
        cssClass: ['jme-benefits'],
        items: [
          {
            icon: 'currency-dollar',
            title: 'Reduced Costs for Both Parties',
            description:
              'A single specialist fee rather than two separate IME fees — directly lowering the overall costs associated with the claim.',
          },
          {
            icon: 'clock',
            title: 'Faster Resolution',
            description:
              'Eliminating the need to schedule and attend multiple assessments across both sides accelerates the overall claims timeline.',
          },
          {
            icon: 'users-three',
            title: 'Less Burden on the Claimant',
            description:
              'The claimant attends one assessment instead of potentially two or more, reducing inconvenience and stress throughout the process.',
          },
          {
            icon: 'shield',
            title: 'Unimpeachable Impartiality',
            description:
              'A jointly-instructed specialist cannot be characterised as biased toward either party, strengthening the credibility of the opinion in proceedings.',
          },
          {
            icon: 'file-text',
            title: 'No Conflicting Reports',
            description:
              'One report means no duelling expert opinions — which can simplify settlement negotiations and reduce time spent in dispute.',
          },
          {
            icon: 'list',
            title: 'Streamlined Court Preparation',
            description:
              'Courts and tribunals often look favourably on matters where parties have agreed to a joint expert, as it demonstrates cooperation and proportionality.',
          },
        ],
      },
      // ── Featured specialists carousel (dark band) ──
      {
        blockType: 'peopleGrid',
        eyebrow: 'Our Specialist Panel',
        heading: 'Specialists Who Conduct JME Assessments',
        subheading:
          "VERIFY's panel includes accredited specialists across a broad range of medical disciplines experienced in jointly-instructed assessments.",
        background: 'primary',
        cssClass: ['svc-glow-band'],
        source: 'specialists',
        // `asmtType` is set by `repairFeaturedSpecialists`, not here: it
        // needs the JME taxonomy row's id, which is resolved by slug at run time
        // rather than hardcoded (a deleted-and-reseeded row returns with a new
        // one). The repair is unconditional, so a fresh install is covered too.
        layout: 'carousel',
        limit: 10,
        linkProfiles: true,
        // 60s and no arrows, matching the reference's own marquee on
        // services/medico-legal/jme.html — 60s per loop (styles.css:1666) and no
        // controls after the track.
        carouselOptions: { speed: 60, direction: 'left', showArrows: false },
        footerLinks: [
          custom('/specialists/specialist-panel', 'View Full Panel'),
          enquiry('Make an Enquiry'),
        ],
      },
      // ── The JME process ──
      {
        blockType: 'processSteps',
        eyebrow: 'How It Works',
        heading: 'The JME Process, [[Step by Step]]',
        subheading:
          'VERIFY manages the entire JME process from initial agreement through to report delivery — keeping both parties informed at every stage.',
        background: 'muted',
        columns: '5',
        // Reference `.jme-process`: 56px circles, plain digits, a 2px connector
        // masked by each circle's band-coloured border, and smaller step type.
        cssClass: ['jme-process'],
        numberStyle: 'plain',
        steps: [
          {
            title: 'Joint Agreement',
            description:
              plainTextToLexical('Both parties agree to engage a single specialist and submit a joint letter of instruction to VERIFY.'),
          },
          {
            title: 'Specialist Selection',
            description:
              plainTextToLexical('VERIFY presents suitable specialists for consideration. Both parties confirm their agreed choice.'),
          },
          {
            title: 'Brief & Scheduling',
            description:
              plainTextToLexical('VERIFY coordinates the brief, manages all scheduling, and handles claimant communication and logistics.'),
          },
          {
            title: 'Assessment',
            description: plainTextToLexical('The jointly-instructed specialist conducts the examination and prepares their report.'),
          },
          {
            title: 'QA & Delivery',
            description:
              plainTextToLexical("VERIFY's QA team reviews the report before it is simultaneously released to both parties."),
          },
        ],
      },
      // ── FAQ — reference `.jme-faq-inner` is a two-column grid: a left heading
      //    column (380px, left-aligned) beside the accordion ──
      {
        blockType: 'faq',
        eyebrow: 'Frequently Asked Questions',
        heading: 'Common Questions [[About JMEs]]',
        subheading:
          'Here are the questions we hear most often from legal professionals and insurers considering a JME for their matter.',
        // `columns: 'split'` IS the two-column layout the `jme-faq-aside` class
        // used to hand-roll, so the page-scoped class goes and the field does the
        // work. Same divided accordion as /ime, on grey rules over white.
        columns: 'split',
        exclusive: true,
        openFirst: true,
        itemStyle: 'divided',
        toggleStyle: 'pill',
        density: 'compact',
        ruleStyle: 'grey',
        items: [
          {
            question: "Does both parties' consent mean the specialist is jointly instructed?",
            answer: plainTextToLexical(
              'Yes. A JME requires both parties — typically through their legal representatives — to jointly agree on the specialist and submit a shared letter of instruction. The specialist then receives direction from both sides equally and reports to both simultaneously. VERIFY facilitates this entire process.',
            ),
          },
          {
            question: 'Can either party request their own IME after receiving the JME report?',
            answer: plainTextToLexical(
              'Generally, once parties have agreed to a joint expert and received the report, seeking a further independent opinion can be difficult to justify — particularly if the matter is before a court. Any decision to seek a further IME after a JME should be made on legal advice. VERIFY can assist with either pathway.',
            ),
          },
          {
            question: 'Who pays for the JME?',
            answer: plainTextToLexical(
              'This is a matter for the parties to agree upon before engaging VERIFY. Common arrangements include splitting the fee equally, one party bearing the cost, or the cost being apportioned as part of a broader costs agreement. VERIFY will invoice the agreed party or parties as instructed.',
            ),
          },
          {
            question: "What happens if the parties can't agree on a specialist?",
            answer: plainTextToLexical(
              'VERIFY can present a shortlist of suitable specialists for both parties to consider. If agreement on a specific specialist cannot be reached, we can assist by providing additional options or discussing alternative approaches — including whether separate IMEs may be more appropriate in the circumstances.',
            ),
          },
          {
            question: 'Is the JME report binding on both parties?',
            answer: plainTextToLexical(
              'The JME report is provided to both parties equally and may carry significant weight in proceedings. Whether it is formally binding depends on the jurisdiction, the terms of any agreement between the parties, and any court or tribunal orders in place. Legal advice should be sought on the effect of the report in your specific matter.',
            ),
          },
        ],
      },
      // ── Closing CTA (standardised) ──
      closingCta(),
    ],
  )

  // ══════════════════════════════════════════════════════════════════════
  // REPORTING SERVICES
  // ══════════════════════════════════════════════════════════════════════
  await authorPage(
    ctx,
    'reporting-services',
    {
      type: 'pageHero',
      theme: 'service',
      align: 'left',
      showBreadcrumb: true,
      showShield: false,
      heading: 'Specialist Reporting [[Beyond the Examination]]',
    },
    [
      // ── Four alternating service rows (plain service-name headings, dot bullets, no buttons).
      //    `imageSide: 'auto'` is the field's own default and alternates from the row's
      //    index, so removing or adding a row keeps the pattern without a manual flip. ──
      {
        blockType: 'splitFeature',
        eyebrow: 'Our Services',
        heading: 'Four Ways to Get [[the Specialist Opinion You Need]]',
        subheading:
          'VERIFY offers a full spectrum of specialist reporting options — each designed to support your matter at the right stage, with the right level of clinical input.',
        background: 'white',
        cssClass: ['rs-services'],
        rowStyle: 'divided',
        density: 'compact',
        bulletStyle: 'dot',
        rows: [
          {
            imagePlaceholder: true,
            placeholderLabel: 'Image Placeholder',
            placeholderIcon: 'image',
            imageSide: 'auto',
            anchorId: 'file-review',
            title: 'File Review',
            body: plainTextToLexical(
              'A specialist reviews the available medical records, imaging, and documentation and provides a written or verbal opinion on the clinical issues in dispute — without directly examining the claimant.',
            ),
            bulletsLabel: 'When to Request',
            bullets: [
              { text: 'The claimant is unwilling or unable to attend an examination' },
              { text: 'The claimant is overseas, incapacitated, or deceased' },
              { text: 'A preliminary opinion on available file materials is needed' },
              { text: 'To assess consistency across existing medical evidence' },
            ],
          },
          {
            imagePlaceholder: true,
            placeholderLabel: 'Image Placeholder',
            placeholderIcon: 'image',
            imageSide: 'auto',
            anchorId: 'supplementary-report',
            title: 'Supplementary Report',
            body: plainTextToLexical(
              'A follow-up to an existing specialist report, addressing additional documents or materials received after the original report was finalised. May require a further examination if the new material is clinically significant.',
            ),
            bulletsLabel: 'When to Request',
            bullets: [
              { text: 'New medical evidence becomes available after the initial report' },
              { text: "A claimant's condition has changed since the original assessment" },
              { text: 'Additional questions arise not addressed in the original report' },
              { text: 'To respond to a report obtained by the opposing party' },
            ],
          },
          {
            imagePlaceholder: true,
            placeholderLabel: 'Image Placeholder',
            placeholderIcon: 'image',
            imageSide: 'auto',
            anchorId: 'teleconference',
            title: 'Teleconference',
            body: plainTextToLexical(
              'A direct discussion between the specialist and instructing lawyers — by telephone or secure videolink — to seek preliminary clinical opinions, clarify findings from an existing report, or obtain specialist input without commissioning a formal written report.',
            ),
            bulletsLabel: 'When to Request',
            bullets: [
              { text: 'Seeking a preliminary opinion before commissioning a formal report' },
              { text: 'Clarifying specific points in an existing specialist report' },
              { text: 'Urgent specialist input is required on a time-sensitive matter' },
              { text: 'General clinical discussion to inform litigation strategy' },
            ],
          },
          {
            imagePlaceholder: true,
            placeholderLabel: 'Image Placeholder',
            placeholderIcon: 'image',
            imageSide: 'auto',
            anchorId: 'expert-evidence',
            title: 'Expert Evidence',
            body: plainTextToLexical(
              'When a matter proceeds to hearing or trial, VERIFY arranges for the specialist to attend and provide expert evidence — in person or via secure videolink — including sworn testimony, cross-examination, and expert conclave attendance.',
            ),
            bulletsLabel: 'When to Request',
            bullets: [
              { text: 'Court, tribunal, or commission hearings requiring specialist testimony' },
              { text: 'Cross-examination of the reporting specialist by the opposing party' },
              { text: 'Expert conclaves or concurrent evidence sessions' },
              { text: 'Mediations requiring specialist attendance or written conclave report' },
            ],
          },
        ],
      },
      // ── Closing CTA ──
      closingCta(),
    ],
  )

  // ══════════════════════════════════════════════════════════════════════
  // ADMINISTRATIVE SERVICES
  // ══════════════════════════════════════════════════════════════════════
  await authorPage(
    ctx,
    'admin-services',
    {
      type: 'pageHero',
      theme: 'service',
      align: 'left',
      showBreadcrumb: true,
      showShield: false,
      heading: 'Administrative & [[Support Services]]',
    },
    [
      // ── Overview (image right, no button) ──
      {
        blockType: 'splitFeature',
        background: 'white',
        rows: [
          {
            imagePlaceholder: true,
            placeholderLabel: 'Image Placeholder',
            imageSide: 'right',
            eyebrow: 'Why Administrative Services Matter',
            title: 'The Detail Work, [[Handled for You]]',
            body: plainTextToLexical(
              "A successful medico-legal assessment depends on far more than the examination itself. Language barriers, geographic constraints, and poorly prepared documentation can each compromise the quality and timeliness of an outcome.\n\nVERIFY's Administrative Services address these challenges directly — providing specialist coordination, interpreter access, and document management as part of a seamless, professionally managed process.",
            ),
          },
        ],
      },
      // ── Four admin services (image + "+" accordion reveal) ──
      {
        blockType: 'servicesGrid',
        eyebrow: 'Our Services',
        heading: 'Four Services. [[One Less Thing to Manage.]]',
        subheading:
          "VERIFY's Administrative Services handle the logistical complexity of medico-legal assessments — so your team can stay focused on the matter.",
        background: 'muted',
        source: 'manual',
        services: adminServicesAccordion,
        layout: 'accordion',
        // The homepage card "Surrogate Assessment & Interpreter Booking Service"
        // names two of these four, so it links to the section rather than to one
        // item — the reference does the same with #as-services-section.
        anchorId: 'as-services-section',
      },
      // ── The process ──
      {
        blockType: 'processSteps',
        eyebrow: 'The Process',
        heading: 'Simple to Request, [[Seamless to Deliver]]',
        subheading:
          'Every VERIFY administrative service follows the same straightforward process — from initial request through to completion, with clear communication at each stage.',
        background: 'accent',
        columns: '4',
        // Reference `.as-how`: same compact treatment as the JME process — 56px
        // circles, plain digits, a masked 2px connector — on a 560px header.
        cssClass: ['as-how'],
        numberStyle: 'plain',
        steps: [
          {
            title: 'Submit Your Request',
            description:
              plainTextToLexical("Contact VERIFY's team with details of your matter and the administrative service required."),
          },
          {
            title: 'VERIFY Confirms',
            description:
              plainTextToLexical('We confirm the service details, logistics, and any requirements specific to your matter.'),
          },
          {
            title: 'We Coordinate',
            description:
              plainTextToLexical('VERIFY manages all logistics — scheduling, briefing, documentation, and communication.'),
          },
          {
            title: 'Seamless Delivery',
            description:
              plainTextToLexical('The service is completed and confirmed, with any relevant documentation delivered to your office.'),
          },
        ],
      },
      // ── Closing CTA (standardised) ──
      closingCta(),
    ],
  )

  // ══════════════════════════════════════════════════════════════════════
  // MEDICO-LEGAL (parent stub)
  // ══════════════════════════════════════════════════════════════════════
  await authorPage(
    ctx,
    'medico-legal',
    {
      type: 'pageHero',
      theme: 'dark',
      align: 'left',
      showBreadcrumb: true,
      showShield: true,
      eyebrow: 'Services',
      heading: 'Medico-Legal [[Services]]',
      subtitle:
        'Independent examinations, joint assessments, specialist reporting, and the administrative coordination that keeps every matter moving.',
    },
    [
      {
        blockType: 'splitFeature',
        background: 'white',
        rows: [
          {
            imagePlaceholder: true,
            placeholderLabel: 'Image Placeholder',
            eyebrow: 'Overview',
            title: 'Everything a Matter Needs, [[Under One Roof]]',
            imageSide: 'left',
            body: plainTextToLexical(
              'VERIFY provides the full range of medico-legal services — from Independent and Joint Medical Examinations through to specialist reporting and the administrative coordination that supports every assessment. Each service is delivered with the same rigour, accuracy, and quality assurance.',
            ),
            ...custom('/services', 'All Services'),
          },
        ],
      },
      {
        blockType: 'featureGrid',
        eyebrow: 'Explore',
        heading: 'Our Medico-Legal [[Service Lines]]',
        subheading: 'Choose a service to learn more about how VERIFY can support your matter.',
        background: 'muted',
        columns: '4',
        items: [
          {
            icon: 'first-aid',
            title: 'Independent Medical Examination',
            titleSuffix: 'IME',
            description:
              'Impartial assessments by accredited specialists, with full coordination and mandatory QA on every report.',
          },
          {
            icon: 'users-three',
            title: 'Joint Medical Examination',
            titleSuffix: 'JME',
            description:
              'A single jointly-instructed specialist agreed by both parties — reducing cost, duplication, and delay.',
          },
          {
            icon: 'file-magnifying-glass',
            title: 'Other Reporting Services',
            description:
              'File Reviews, Supplementary Reports, Teleconferences, and Expert Evidence.',
          },
          {
            icon: 'user-plus',
            title: 'Administrative Services',
            description:
              'Surrogate assessments, interpreter bookings, brief reduction, and letter of instruction review.',
          },
        ],
      },
      closingCta(),
    ],
  )

  // ══════════════════════════════════════════════════════════════════════
  // EDUCATIONAL SERVICES (parent stub)
  // ══════════════════════════════════════════════════════════════════════
  await authorPage(
    ctx,
    'educational-services',
    {
      type: 'pageHero',
      theme: 'dark',
      align: 'left',
      showBreadcrumb: true,
      showShield: true,
      eyebrow: 'Services',
      heading: 'Educational [[Services]]',
      subtitle:
        'Through AAMLE — the Australian Academy of Medico-Legal Education — VERIFY delivers complimentary, CPD-eligible education to legal, medical, and insurance professionals across Australia.',
    },
    [
      {
        blockType: 'aamleEducation',
        background: 'white',
        eyebrow: 'Educational Services',
        wordmark: 'AAMLE',
        subheading: 'Australian Academy of Medico-Legal Education',
        badge: { icon: 'graduation-cap', text: 'CPD-Eligible Programs' },
        description: plainTextToLexical(
          "AAMLE is VERIFY's educational arm — delivering complimentary, CPD-eligible programs to legal, medical, and insurance professionals across Australia, at no cost to participants.",
        ),
        items: [
          { icon: 'video-camera', label: 'CPD-Eligible Webinars' },
          { icon: 'graduation-cap', label: 'Specialist Training Events' },
          { icon: 'book-open', label: 'Discounted AMA Guides Access' },
          { icon: 'globe', label: 'Open to All — Nationally' },
        ],
        imagePlaceholder: true,
        placeholderLabel: 'Image Placeholder',
        ...custom('https://aamle.com.au/', 'Explore AAMLE', { newTab: true }),
      },
      {
        blockType: 'ctaBand',
        eyebrow: 'Stay in the Loop',
        heading: 'Upcoming Webinars & [[Training Events]]',
        text: 'Browse upcoming AAMLE events and register your interest — every session is complimentary and CPD-eligible.',
        links: [custom('/events', 'View Upcoming Events'), enquiry('Make an Enquiry')],
      },
    ],
  )
}

/**
 * Puts the /jme and /admin-services process steps onto the reference's compact
 * treatment: a scope class carrying the 56px circles and type scale, plus plain
 * step numbers. The reference uses BOTH numbering styles across the site — plain
 * on jme.html and admin-services.html, padded on for-clients.html and
 * for-claimants.html — so this is per-instance, not a global default.
 *
 * Unconditional, because `authorPage` early-returns on an authored page.
 */
export const repairCompactProcessSteps = async ({ payload, req }: Ctx): Promise<void> => {
  for (const [slug, scope] of [
    ['jme', 'jme-process'],
    ['admin-services', 'as-how'],
  ] as const) {
    const res = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      req,
    })
    const page = res.docs[0] as
      | {
          id: number | string
          layout?: { blockType?: string; cssClass?: unknown; numberStyle?: string | null }[]
        }
      | undefined
    const layout = page?.layout
    if (!page || !Array.isArray(layout)) continue

    let changed = false
    const next = layout.map((block) => {
      if (block?.blockType !== 'processSteps') return block
      const classes = Array.isArray(block.cssClass) ? (block.cssClass as string[]) : []
      // The scope class is the migration marker, and it has to be: `padded` is
      // both the Payload default AND a legitimate editor choice, so "is it still
      // padded?" cannot tell an untouched block from a deliberate one. Keying on
      // the class makes this one-shot — once present, nothing here is written
      // again. Same shape as `isUnauthored`: write into an absence, never into a
      // value that merely looks like a default.
      if (classes.includes(scope)) return block
      changed = true
      return { ...block, cssClass: [...classes, scope], numberStyle: 'plain' }
    })
    if (!changed) continue

    await seedUpdate(payload, {
      collection: 'pages',
      id: page.id,
      data: { layout: next } as never,
      req,
      context: { disableRevalidate: true },
    })
    payload.logger.info(`— Repaired /${slug}: process steps scoped to the reference treatment`)
  }
}

/**
 * Slows the /jme specialist marquee to the reference's 60s and removes its arrows.
 *
 * The reference makes this section a carousel too, but at 60s per loop and with
 * no controls after the track — the direction arrows exist only on
 * specialist-availability.html and make-a-booking.html. Ours ran at 34s with
 * arrows on.
 *
 * Unconditional, because `authorPage` early-returns on an authored page. Matched
 * exactly against the superseded pair, so an editor who has since retuned either
 * value keeps it.
 */
export const repairJmeSpecialistCarousel = async ({ payload, req }: Ctx): Promise<void> => {
  const res = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'jme' } },
    limit: 1,
    depth: 0,
    req,
  })
  const page = res.docs[0] as
    | {
        id: number | string
        layout?: {
          blockType?: string
          layout?: string
          carouselOptions?: { speed?: number | null; showArrows?: boolean | null } | null
        }[]
      }
    | undefined
  const layout = page?.layout
  if (!page || !Array.isArray(layout)) return

  let changed = false
  const next = layout.map((block) => {
    if (block?.blockType !== 'peopleGrid' || block.layout !== 'carousel') return block
    const opts = block.carouselOptions
    if (opts?.speed !== SUPERSEDED_JME_SPEED || opts?.showArrows !== true) return block
    changed = true
    return { ...block, carouselOptions: { ...opts, speed: 60, showArrows: false } }
  })
  if (!changed) return

  await seedUpdate(payload, {
    collection: 'pages',
    id: page.id,
    data: { layout: next } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info('— Repaired /jme: specialist marquee slowed to 60s, arrows removed')
}

// The value the seed used to write.
const SUPERSEDED_JME_SPEED = 34

/**
 * Puts the /ime "Four Ways to Attend" grid onto the banded card style.
 *
 * Unconditional, because `authorPage` early-returns on an authored page — the
 * fixture change alone reaches no existing install. Only rewrites the Payload
 * default (`card`); anything else is an editor's choice and is left alone.
 */
export const repairImeFormatsCardStyle = async ({ payload, req }: Ctx): Promise<void> => {
  const res = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'ime' } },
    limit: 1,
    depth: 0,
    req,
  })
  const page = res.docs[0] as
    | { id: number | string; layout?: { blockType?: string; cssClass?: unknown; cardStyle?: string | null }[] }
    | undefined
  const layout = page?.layout
  if (!page || !Array.isArray(layout)) return

  let changed = false
  const next = layout.map((block) => {
    const classes = Array.isArray(block?.cssClass) ? block.cssClass : []
    if (block?.blockType !== 'featureGrid' || !classes.includes('ime-formats')) return block
    if (block.cardStyle !== SUPERSEDED_IME_CARD_STYLE) return block
    changed = true
    return { ...block, cardStyle: 'banded' }
  })
  if (!changed) return

  await seedUpdate(payload, {
    collection: 'pages',
    id: page.id,
    data: { layout: next } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info('— Repaired /ime: assessment-format cards set to the banded style')
}

// The Payload default the seed used to leave in place.
const SUPERSEDED_IME_CARD_STYLE = 'card'

/**
 * Clears the icon above "Independent Medical Examinations" on /services.
 *
 * The reference has an icon element there — `<i class="ph-duotone ph-activity">`
 * inside a `.svc-feature-icon` — and none above the JME row below it. It never
 * draws: `ph-activity` is not in Phosphor's duotone set, so measured in the
 * reference that `<i>` computes 0x0 with `::before` content `none`, while
 * `.reporting-card-icon i` on the same page resolves to a real 24px glyph. Ours
 * rendered one because `Icon` maps `activity` → Phosphor React's `Pulse`, which
 * does exist. Removed to match what the reference renders.
 *
 * Runs unconditionally, because `authorPage` early-returns on an authored page —
 * the fixture edit alone would never reach an existing install. Matched exactly
 * against `'activity'` so an editor who later picks an icon deliberately keeps it.
 */
export const repairServicesFeatureIcon = async ({ payload, req }: Ctx): Promise<void> => {
  const res = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'services' } },
    limit: 1,
    depth: 0,
    req,
  })
  const page = res.docs[0] as
    | { id: number | string; layout?: { blockType?: string; rows?: { icon?: string | null }[] }[] }
    | undefined
  const layout = page?.layout
  if (!page || !Array.isArray(layout)) return

  let changed = false
  const next = layout.map((block) => {
    if (block?.blockType !== 'splitFeature' || !Array.isArray(block.rows)) return block
    return {
      ...block,
      rows: block.rows.map((row) => {
        if (row?.icon !== SUPERSEDED_FEATURE_ICON) return row
        changed = true
        return { ...row, icon: null }
      }),
    }
  })
  if (!changed) return

  await seedUpdate(payload, {
    collection: 'pages',
    id: page.id,
    data: { layout: next } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info('— Repaired /services: cleared the IME split-row icon')
}

// The exact value the seed used to write. Anything else is an editor's choice.
const SUPERSEDED_FEATURE_ICON = 'activity'

/**
 * Opts the /services/medico-legal/reporting-services rows into the three Split
 * Feature presentation variants, and gives their placeholders the reference's
 * glyph.
 *
 * The design itself lives in the block's settings rather than in CSS scoped to
 * this page, so the fixture edit above is only half the job — `authorPage`
 * early-returns on an authored page, and every existing install (the box
 * included) holds the pre-variant block.
 *
 * ── Why the predicate is `placeholderIcon`, and nothing else ──
 * The obvious predicate — "all four fields still unset" — does not work, and
 * measuring it is the only way to find that out. A new column does NOT arrive
 * null when its field declares a `defaultValue`: the adapter emits
 * `ADD COLUMN … DEFAULT`, which Postgres backfills into every existing row. So
 * the moment the schema pushed, this block already read `spaced/default/check`
 * — indistinguishable from an editor who chose them. Confirmed against the
 * local DB before this repair had ever run:
 *
 *   select row_style, density, bullet_style … → spaced|default|check
 *   select count(*) filter (where placeholder_icon is not null) … → 0 of 5
 *
 * `placeholderIcon` is the one field here with no `defaultValue`, so it is the
 * one that genuinely reads null on an install that predates this change — an
 * absence no default and no editor produces. Keying on it makes the repair fire
 * exactly once; afterwards every placeholder row has an icon and the predicate
 * is false for good, so a later switch back to Spaced survives.
 *
 * The general rule, worth carrying: **a `defaultValue` forecloses using absence
 * as a migration signal for that field.** Pick the field that has none.
 */
export const repairReportingSplitVariants = async ({ payload, req }: Ctx): Promise<void> => {
  const res = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'reporting-services' } },
    limit: 1,
    depth: 0,
    req,
  })
  type Row = { imagePlaceholder?: boolean | null; placeholderIcon?: string | null }
  type Block = {
    blockType?: string
    rowStyle?: string | null
    density?: string | null
    bulletStyle?: string | null
    rows?: Row[]
  }
  const page = res.docs[0] as { id: number | string; layout?: Block[] } | undefined
  const layout = page?.layout
  if (!page || !Array.isArray(layout)) return

  let changed = false
  const next = layout.map((block) => {
    if (block?.blockType !== 'splitFeature') return block
    const placeholderRows = (block.rows ?? []).filter((row) => row?.imagePlaceholder)
    // No placeholder row means nothing here can carry the absence this keys on,
    // so leave the block alone rather than guess.
    if (placeholderRows.length === 0) return block
    if (!placeholderRows.every((row) => !row?.placeholderIcon)) return block
    changed = true
    return {
      ...block,
      rowStyle: 'divided',
      density: 'compact',
      bulletStyle: 'dot',
      rows: (block.rows ?? []).map((row) =>
        row?.imagePlaceholder ? { ...row, placeholderIcon: 'image' } : row,
      ),
    }
  })
  if (!changed) return

  await seedUpdate(payload, {
    collection: 'pages',
    id: page.id,
    data: { layout: next } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info('— Repaired /services/medico-legal/reporting-services: split-feature variants')
}

/**
 * Removes Medical Negligence from the two services pages that named it, and
 * repairs the consequences of removing it.
 *
 * VERIFY still accepts medical negligence claims — this is a services-page
 * removal, not a withdrawal of the offering. The claim type, the /ime claim
 * accordion, the specialists linked to it and the contact form's "Medical
 * Negligence Opinion" option are all deliberately untouched, and the Services
 * doc itself is still seeded (see `ensureService` above) so it is one edit from
 * being usable again.
 *
 * ── Why the predicate is the old heading, and not the row ──
 * This is the first repair here that DELETES an array row rather than filling an
 * absence, which inverts the usual safety argument: the obvious predicate — "a
 * row with anchorId `medical-negligence` exists" — would delete that row on
 * EVERY future seed run, so an editor who deliberately re-added the service
 * would lose it again with no way to tell why.
 *
 * The superseded heading string is the honest marker instead. It is content, so
 * it has no `defaultValue` to be backfilled (the trap recorded in CLAUDE.md's
 * invariants), it is written by exactly one thing — the old fixture — and this
 * repair is what replaces it. So the repair fires once and then cannot fire
 * again, and a re-added row survives because the heading no longer matches.
 *
 * The /services grid edit rides on the same predicate on purpose: both pages
 * change in one seed run, and a shared marker is what stops them drifting into
 * different states. If that grid has already lost the id, that half is a no-op.
 */
export const repairMedicalNegligenceRemoval = async ({ payload, req }: Ctx): Promise<void> => {
  type Row = { anchorId?: string | null; imageSide?: string | null }
  type Item = { description?: string | null }
  type Block = {
    blockType?: string
    heading?: string | null
    rows?: Row[]
    services?: unknown[]
    items?: Item[]
  }

  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'reporting-services' } },
    limit: 1,
    depth: 0,
    req,
  })
  const page = found.docs[0] as { id: number | string; layout?: Block[] } | undefined
  const layout = page?.layout
  if (!page || !Array.isArray(layout)) return
  if (!layout.some((b) => b?.blockType === 'splitFeature' && storedText(b.heading) === storedText(SUPERSEDED_REPORTING_HEADING))) {
    return
  }

  const next = layout.map((block) => {
    if (
      block?.blockType !== 'splitFeature' ||
      storedText(block.heading) !== storedText(SUPERSEDED_REPORTING_HEADING)
    ) {
      return block
    }
    return {
      ...block,
      heading: 'Four Ways to Get [[the Specialist Opinion You Need]]',
      rows: (block.rows ?? [])
        .filter((row) => row?.anchorId !== 'medical-negligence')
        // Back to the field's own alternating default, so the pattern survives
        // this removal and any future one without a hand-flipped left/right.
        .map((row) => ({ ...row, imageSide: 'auto' })),
    }
  })

  await seedUpdate(payload, {
    collection: 'pages',
    id: page.id,
    data: { layout: next } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info('— Repaired /services/medico-legal/reporting-services: removed Medical Negligence')

  // The parent page's "Other Reporting Services" card names the five services in
  // prose. It is an authored page too, so the fixture edit alone never reaches it —
  // and it would go on advertising a service the page below it no longer has.
  const parentRes = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'medico-legal' } },
    limit: 1,
    depth: 0,
    req,
  })
  const parent = parentRes.docs[0] as { id: number | string; layout?: Block[] } | undefined
  if (parent && Array.isArray(parent.layout)) {
    let proseChanged = false
    const nextParent = parent.layout.map((block) => {
      if (block?.blockType !== 'featureGrid' || !Array.isArray(block.items)) return block
      return {
        ...block,
        items: block.items.map((item) => {
          if (item?.description !== SUPERSEDED_PARENT_PROSE) return item
          proseChanged = true
          return {
            ...item,
            description:
              'File Reviews, Supplementary Reports, Teleconferences, and Expert Evidence.',
          }
        }),
      }
    })
    if (proseChanged) {
      await seedUpdate(payload, {
        collection: 'pages',
        id: parent.id,
        data: { layout: nextParent } as never,
        req,
        context: { disableRevalidate: true },
      })
      payload.logger.info('— Repaired /services/medico-legal: dropped it from the reporting prose')
    }
  }

  // The same service is a card in the /services "Reports & Opinions" grid.
  const negligence = await payload.find({
    collection: 'services',
    where: { slug: { equals: 'medical-negligence' } },
    limit: 1,
    depth: 0,
    req,
  })
  const negligenceId = negligence.docs[0]?.id
  if (negligenceId == null) return

  const servicesRes = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'services' } },
    limit: 1,
    depth: 0,
    req,
  })
  const servicesPage = servicesRes.docs[0] as { id: number | string; layout?: Block[] } | undefined
  const servicesLayout = servicesPage?.layout
  if (!servicesPage || !Array.isArray(servicesLayout)) return

  let gridChanged = false
  const nextServices = servicesLayout.map((block) => {
    if (block?.blockType !== 'servicesGrid' || !Array.isArray(block.services)) return block
    // depth: 0, so `services` is a list of ids — but tolerate populated docs.
    const kept = block.services.filter((s) => {
      const id = s && typeof s === 'object' ? (s as { id?: unknown }).id : s
      return String(id) !== String(negligenceId)
    })
    if (kept.length === block.services.length) return block
    gridChanged = true
    return { ...block, services: kept }
  })
  if (!gridChanged) return

  await seedUpdate(payload, {
    collection: 'pages',
    id: servicesPage.id,
    data: { layout: nextServices } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info('— Repaired /services: dropped the Medical Negligence card')
}

// The exact strings the old fixture wrote. Anything else means this has already
// run, or an editor has since rewritten the copy — either way, leave it alone.
const SUPERSEDED_REPORTING_HEADING = 'Five Ways to Get [[the Specialist Opinion You Need]]'
const SUPERSEDED_PARENT_PROSE =
  'File Reviews, Supplementary Reports, Medical Negligence opinions, Teleconferences, and Expert Evidence.'
