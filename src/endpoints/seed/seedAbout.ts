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

export const seedAbout = async (ctx: Ctx): Promise<void> => {
  // ── About VERIFY ──
  await authorPage(
    ctx,
    'about',
    {
      type: 'pageHero',
      theme: 'dark',
      align: 'left',
      showBreadcrumb: true,
      showShield: true,
      heading: 'Who We Are & [[What We Stand For]]',
      subtitle:
        'Built on a clear conviction, VERIFY delivers accurate, timely, and defensible medico-legal reporting that supports confident decision making and strengthens the integrity of every case.',
    },
    [
      // ── About VERIFY — two-column with company photo placeholder (no CTA) ──
      {
        blockType: 'splitFeature',
        rows: [
          {
            eyebrow: 'About VERIFY',
            title: 'Medico-Legal Solutions Built on [[Trust & Precision]]',
            imageSide: 'left',
            imagePlaceholder: true,
            placeholderLabel: 'COMPANY PHOTO PLACEHOLDER',
            body: plainTextToLexical(
              'VERIFY Medico-Legal Solutions (VERIFY) is an Australian-owned medico-legal reporting provider founded in 2021 by Wes Lerch. We specialise in delivering independent, high-quality medico-legal assessments and coordinating expert examinations for law firms, insurers, and government agencies.\n\nAt VERIFY, we recognise that every report shapes real world decisions. Accuracy, objectivity, and integrity are built into every stage of our process, from initial referral to final report delivery. Our systems and workflows ensure consistency, reliability, and efficiency, giving clients confidence in clear and defensible expert opinions, even in complex matters.',
            ),
          },
        ],
      },
      // ── Our Mission — dark panel, six auto-numbered pillars in a checkerboard ──
      {
        blockType: 'missionPillars',
        eyebrow: 'Our Mission',
        heading: 'Excellence in [[Medico-Legal Reporting]]',
        subheading:
          'VERIFY provides high levels of support to both our clients and medical specialists throughout every step of the medico-legal process. At VERIFY, we dedicate ourselves to achieving excellence in medico-legal reporting through:',
        // Scope hook for the light-blue / white checkerboard treatment (see returned CSS).
        anchorId: 'about-mission',
        pillars: [
          { text: 'Delivering expert, evidence-based medico-legal reports with accuracy, clarity, and integrity — reflecting the highest professional standards.' },
          { text: 'Providing exceptional service that fosters long-term, trust-based partnerships with our clients.' },
          { text: 'Ensuring reliable, timely turnaround supported by efficient systems and clear communication.' },
          { text: 'Upholding accountability and respect in every interaction, both within our team and with external stakeholders.' },
          { text: 'Fostering continuous learning through internal development and industry-wide education to support excellence and raise standards across the sector.' },
          { text: 'Driving innovation and improvement in our processes and technology to deliver dependable, client-focused solutions.' },
        ],
      },
      // ── Our Vision — two-column with vision photo placeholder on the right (no CTA) ──
      {
        blockType: 'splitFeature',
        rows: [
          {
            eyebrow: 'Our Vision',
            title: "Queensland's Leading [[Medico-Legal Reporting Company]]",
            imageSide: 'right',
            imagePlaceholder: true,
            placeholderLabel: 'Vision Photo Placeholder',
            body: plainTextToLexical(
              "VERIFY's vision is to become the leading medico-legal reporting company in Queensland, recognised for excellence in service delivery and commitment to the highest industry standards.",
            ),
          },
        ],
      },
      // ── Our Values — CCARRE ──
      {
        blockType: 'valueCards',
        eyebrow: 'Our Values',
        heading: 'CCARRE — The Principles That [[Guide Us]]',
        subheading:
          'These six values define how we build our team, our systems, and our relationships with every client and specialist we work with.',
        cards: [
          { title: 'Client Focus', description: 'We build trusted partnerships through integrity, care, and clear communication.' },
          { title: 'Continuous Learning', description: 'We grow through professional development and industry knowledge-sharing.' },
          { title: 'Accountability', description: 'We take ownership of our actions, decisions, and commitments.' },
          { title: 'Reliability', description: 'We deliver timely, accurate, and dependable services.' },
          { title: 'Respect', description: 'We treat everyone with fairness, inclusivity, and dignity.' },
          { title: 'Excellence', description: 'We set the standard for quality, detail, and professionalism.' },
        ],
      },
      // ── What Sets Us Apart ──
      {
        blockType: 'whyVerify',
        eyebrow: 'Why Choose VERIFY',
        heading: 'What Sets Us [[Apart]]',
        subheading:
          'VERIFY delivers accurate and consistent medico-legal support, guided by a strong understanding of both legal and medical demands. We bridge that gap through careful coordination and trusted service.',
        placeholderLabel: '[ Company Image Placeholder ]',
        items: [
          {
            icon: 'target',
            title: 'Quality Assured Reporting',
            body: 'Every report is reviewed through a structured quality assurance process by our dedicated QA team, who bring extensive expertise in medico-legal practice and legal procedure and hold the Certified Impairment Rater (CIR) certification. This multi-layered approach ensures every report is consistent, clear, and defensible.',
          },
          {
            icon: 'medal',
            title: 'Expert Specialist Panel',
            body: "Our curated network of highly qualified medical specialists are trained through VERIFY's own medico-legal academy in the craft of delivering credible, defensible, and impartial expert opinions that directly serve the rigorous evidentiary standards of legal proceedings.",
          },
          {
            icon: 'clock',
            title: 'Timely Reporting',
            body: 'Legal proceedings are time-critical. VERIFY is committed to delivering accurate, thorough reports within agreed timeframes, helping your team meet court-imposed deadlines, respond to urgent instructions, and keep complex matters progressing without unnecessary delay.',
          },
          {
            icon: 'chart-bar',
            title: 'End-to-End Operation',
            body: 'Every referral placed with VERIFY is our responsibility, from booking through to report delivery. We take our obligations seriously, aligning our service delivery to your needs with precision, accountability, and care so that nothing falls through the cracks.',
          },
        ],
      },
      // ── Meet Our Founder ──
      {
        blockType: 'leadershipSpotlight',
        eyebrow: 'Meet Our Founder',
        heading: 'Built by Someone Who [[Lived the Problem]]',
        name: 'Wes Lerch',
        role: 'Founder & Managing Director',
        placeholderIcon: 'user-circle',
        tagline:
          '"I built VERIFY because I knew what the industry needed — and I knew it wasn\'t being delivered."',
        body: plainTextToLexical(
          "Wes Lerch is the Founder and Managing Director of VERIFY Medico-Legal Solutions. With more than 25 years of experience in personal injury law and insurance litigation, Wes brings a practitioner perspective that sets VERIFY apart in the medico-legal industry. His background gives him a deep understanding of what clients need, what specialists require, and what is expected of medical evidence in complex matters.\n\nAlongside leading VERIFY's strategic direction, Wes also serves as Queensland Delegate of the Australasian Association of Medico-Legal Providers (AAMLP), reflecting his commitment to advancing professional standards across the field.",
        ),
        credentials: [
          { cred: '25+ Years — Personal Injury Law' },
          { cred: 'Insurance Litigation' },
          { cred: 'AAMLP QLD Delegate (2024)' },
          { cred: 'Founder, AAMLE' },
        ],
        ...custom('/about/meet-the-team', 'Meet the Full Team'),
      },
      // ── Standard bottom CTA ──
      {
        blockType: 'ctaBand',
        eyebrow: 'Get Started',
        heading: 'Ready to Refer Your [[Next Matter to VERIFY?]]',
        text: 'Whether you have a specific referral or need guidance on the most suitable service, we are here to make the process simple, efficient, and responsive from the very start.',
        links: [custom('/specialists/specialist-panel', 'View Specialist Panel'), enquiry('Make an Enquiry')],
      },
    ],
  )

  // ── Meet the Team ──
  await authorPage(
    ctx,
    'meet-the-team',
    {
      type: 'pageHero',
      theme: 'dark',
      align: 'left',
      showBreadcrumb: true,
      showShield: true,
      heading: 'The People Behind [[VERIFY]]',
      subtitle:
        'Our team brings together expertise in medico-legal coordination, client services, quality assurance, and administration — united by a shared commitment to accuracy, integrity, and outstanding service.',
    },
    [
      {
        blockType: 'peopleGrid',
        // No eyebrow/heading/subheading on purpose: Meet the Team runs straight
        // from its hero into the staff grid. `SectionHeader` returns null when
        // all three are empty, and PeopleGrid guards on `hasHeader`, so nothing
        // renders rather than an empty band.
        source: 'team',
        groupByDepartment: true,
        linkProfiles: true,
        limit: 0,
        // Two bands, as the reference has them: `.team-intro` light blue over
        // `.team-grid-section` grey. Mirrored in seedBlockBands.ts, which is what
        // reaches an install whose page is already authored.
        background: 'muted',
        headerBackground: 'accent',
      },
      {
        blockType: 'ctaBand',
        eyebrow: 'Get Started',
        heading: 'Ready to Refer Your [[Next Matter to VERIFY?]]',
        text: 'Whether you have a specific referral or need guidance on the most suitable service, we are here to make the process simple, efficient, and responsive from the very start.',
        links: [custom('/specialists/specialist-panel', 'View Specialist Panel'), enquiry('Make an Enquiry')],
      },
    ],
  )
}
