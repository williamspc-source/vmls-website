import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'
import { isUnauthored } from './authored'

type Ctx = { payload: Payload; req: PayloadRequest }

// ── Link helpers (copied verbatim from seedAbout) ──

// ── Minimal Lexical helpers ──
// The shared plainTextToLexical helper only emits paragraphs, but the legal pages
// need real <h2> section headings (styled by the `.prose` CSS family). These build
// the minimal Lexical node shapes Payload expects.
const textNode = (t: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: t,
  version: 1,
})
const paragraph = (t: string) => ({
  type: 'paragraph',
  children: [textNode(t)],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  version: 1,
})
const heading = (t: string, tag: 'h2' | 'h3' = 'h2') => ({
  type: 'heading',
  tag,
  children: [textNode(t)],
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})
const richText = (children: unknown[]) => ({
  root: { type: 'root', children, direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 },
})

// Build a prose richText body from a list of [heading, ...paragraphs] sections.
type Sec = { h: string; p: string[] }
const proseBody = (sections: Sec[]) =>
  richText(sections.flatMap((s) => [heading(s.h), ...s.p.map((para) => paragraph(para))]))

// Wrap a prose richText body in the design-ref page shape:
// Section.content-section > Row > Content(.content-narrow.prose) with one full column.
const proseSection = (sections: Sec[]) => ({
  blockType: 'section' as const,
  background: 'white' as const,
  cssClass: ['content-section'],
  content: [
    {
      blockType: 'row' as const,
      columns: [
        {
          span: 'auto' as const,
          content: [
            {
              blockType: 'content' as const,
              cssClass: ['content-narrow', 'prose'],
              columns: [{ size: 'full' as const, richText: proseBody(sections) }],
            },
          ],
        },
      ],
    },
  ],
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

export const seedLegal = async (ctx: Ctx): Promise<void> => {
  // ── Privacy Policy ──
  await authorPage(
    ctx,
    'privacy-policy',
    {
      type: 'pageHero',
      theme: 'light',
      align: 'left',
      showBreadcrumb: true,
      showShield: false,
      eyebrow: 'Legal',
      heading: 'Privacy Policy',
      subtitle:
        'VERIFY Medico-Legal Solutions Pty Ltd — how we collect, use, and protect your personal information.',
    },
    [
      proseSection([
        {
          h: 'We respect your privacy',
          p: [
            'VERIFY Medico-Legal Solutions Pty Ltd respects your right to privacy and is committed to safeguarding the privacy of our customers and website visitors. We adhere to the Australian Privacy Principles contained in the Privacy Act 1988 (Cth).',
            'This policy sets out how we collect and treat your personal information. "Personal information" is information we hold that is identifiable as being about you.',
          ],
        },
        {
          h: 'Collection of personal information',
          p: [
            'VERIFY will, from time to time, receive and store personal information you enter onto our website, provide to us directly, or give to us in other forms. You may provide basic information such as your name, phone number, address and email address so that we can send information, provide updates and process your service order.',
            'We may collect additional information at other times, including when you provide feedback, change your preferences, respond to surveys or promotions, provide financial information, or communicate with our support team.',
          ],
        },
        {
          h: 'How we collect your personal information',
          p: [
            'We collect personal information from you in a variety of ways, including when you interact with us electronically or in person, when you access our website, and when we provide our services to you.',
            'We may also receive personal information from third parties. If we do, we will protect it as set out in this Privacy Policy.',
          ],
        },
        {
          h: 'Use of your personal information',
          p: [
            'We may use personal information collected from you to provide you with information, updates and our services, and to make you aware of new products, services and opportunities. We may also use it to improve our services and to better understand your needs.',
            'We may contact you by telephone, email, SMS or mail.',
          ],
        },
        {
          h: 'Disclosure of your personal information',
          p: [
            'We may disclose your personal information to our employees, officers, insurers, professional advisers, agents, suppliers or subcontractors insofar as reasonably necessary. Personal information is only supplied to a third party when required for the delivery of our services.',
            'We may also disclose information to comply with a legal requirement and to protect the rights, property or safety of VERIFY, its customers or third parties. By providing us with personal information, you consent to the terms of this Privacy Policy.',
          ],
        },
        {
          h: 'Security of your personal information',
          p: [
            'We are committed to ensuring that the information you provide is secure, and have put in place suitable physical, electronic and managerial procedures to safeguard it.',
            'The transmission and exchange of information is carried out at your own risk. While we take measures to safeguard against unauthorised disclosure, we cannot guarantee the security of information transmitted to or from us.',
          ],
        },
        {
          h: 'Access to your personal information',
          p: [
            'You may request details of the personal information we hold about you in accordance with the Privacy Act 1988 (Cth). A small administrative fee may be payable.',
            'If you would like a copy, or believe any information is inaccurate, out of date, incomplete, irrelevant or misleading, please email us at admin@vmls.com.au. We reserve the right to refuse to provide information in certain circumstances set out in the Privacy Act.',
          ],
        },
        {
          h: 'Complaints about privacy',
          p: [
            'If you have any complaints about our privacy practices, please send the details to admin@vmls.com.au. We take complaints seriously and will respond shortly after receiving written notice.',
          ],
        },
        {
          h: 'Changes to this Privacy Policy',
          p: [
            'We may change this Privacy Policy in the future, at our discretion. Modifications are effective immediately upon posting on our website, so please check back from time to time to review the policy.',
          ],
        },
        {
          h: 'Website, cookies and third-party sites',
          p: [
            'When you visit our website we may collect information such as browser type and operating system, used in aggregate to improve our service. We may use cookies to recognise returning visitors and analyse traffic; most browsers accept cookies automatically, but you can reject them in your settings.',
            'Our site may link to other websites not owned or controlled by us. We are not responsible for the privacy practices of those sites and encourage you to read their privacy statements.',
          ],
        },
      ]),
    ],
  )

  // ── Standard Terms & Conditions ──
  await authorPage(
    ctx,
    'terms-conditions',
    {
      type: 'pageHero',
      theme: 'light',
      align: 'left',
      showBreadcrumb: true,
      showShield: false,
      eyebrow: 'Legal',
      heading: 'Standard Terms & Conditions',
      subtitle:
        "Information for clients — VERIFY's standard terms of engagement, plus helpful information on cost reduction.",
    },
    [
      proseSection([
        {
          h: 'Definitions',
          p: [
            'In these Terms: "Claimant" means the person or entity that You refer to Us; "Report" means the examination, assessment, file review and compilation of a medico-legal report of the Claimant\'s condition; and "Schedule of Fees" means the confidential fee card provided to you at the time of booking.',
            '"Services" means any service provided by Us to You or the Claimant in accordance with these Terms. "We", "Us" and "Our" mean VERIFY Medico-Legal Solutions Pty Ltd, and "You" and "Your" mean the person or entity that has engaged Us to provide the Services.',
          ],
        },
        {
          h: 'Payment',
          p: [
            'You (not the Claimant) are liable to pay Us the fees for providing the Services, calculated in accordance with the Schedule of Fees. Payment must be made within 14 days of receiving an invoice, and our invoice must be paid before We release a Report to You unless otherwise agreed in writing.',
            'We may charge interest on overdue amounts at 1.5% per month, calculated and compounding daily. If amounts are not paid when due, We may refer them to a mercantile agent or solicitor, and You agree to pay the costs of recovery on a full indemnity basis. You give Us permission to search Your credit history.',
          ],
        },
        {
          h: 'Services',
          p: [
            'You warrant that You have obtained all relevant approvals and consents of the Claimant for Us to provide the Services and to provide a copy of any Report to You or any person nominated by You. You will provide the assistance We reasonably require.',
            'If You or the Claimant do not provide all relevant information at least three business days before an appointment, We may cancel the appointment and You must pay the cancellation fee. You are responsible for ensuring the documents and information provided are correct and complete, and the Services may be delayed by acts of third parties beyond Our reasonable control.',
          ],
        },
        {
          h: 'Acceptance',
          p: [
            'Our engagement commences on acceptance of these Terms. You may accept orally, by signing and returning the acknowledgment, or by providing instructions after receiving these Terms.',
          ],
        },
        {
          h: 'Termination',
          p: [
            'We may end our engagement immediately if any amounts are not paid when due, or if in our reasonable opinion You can no longer fulfil Your obligations. You remain responsible for fees for Services provided up to the date of termination.',
          ],
        },
        {
          h: 'Limitations',
          p: [
            'To the maximum extent permitted by law, We exclude all liability for loss or damage arising from provision of the Services. Where liability cannot be excluded, it is limited, at Our option, to supplying the Services again or refunding the fees paid.',
            'You agree to indemnify Us and our officers, employees and contractors against any loss the Claimant or a third party may suffer from provision of the Services.',
          ],
        },
        {
          h: 'General',
          p: [
            'Any unenforceable provision will be read down or severed. These Terms record the entire agreement between the parties and are governed by the law in force in Queensland, with each party submitting to the non-exclusive jurisdiction of its courts.',
          ],
        },
        {
          h: 'Comments',
          p: [
            'We aim to provide high levels of support throughout the entire medico-legal process and value any feedback, positive or negative. It can be sent to admin@vmls.com.au.',
            'For practical guidance on reducing your client\'s report costs, see our information for clients in the Information Centre.',
          ],
        },
      ]),
    ],
  )
}
