import type { Block, Field } from 'payload'

import {
  anchorIdField,
  containerWidthField,
  cssClassField,
  iconField,
  motionField,
  sectionHeaderFieldsWithDefaults,
  inlineRichTextField,
  richTextDefault,
} from '@/fields/blockFields'

// Sensible starter copy for the section header. Applied by cloning the shared
// `sectionHeaderFields` (so the block still reuses the canonical helper) rather
// than mutating it. Editors can freely change all of it in the admin.
const headerDefaults: Record<string, string> = {
  eyebrow: 'Why Choose VERIFY',
  heading: 'What Sets Us [[Apart]]',
  subheading:
    'VERIFY delivers accurate and consistent medico-legal support, guided by a strong understanding of both legal and medical demands. We bridge that gap through careful coordination and trusted service.',
}

const whyHeaderFields: Field[] = sectionHeaderFieldsWithDefaults(headerDefaults)

// The six "what sets us apart" reasons from the about-verify reference, provided
// as defaults so a fresh block renders the full accordion out of the box. Every
// field remains editable and rows are add/remove/reorderable.
const defaultItems = [
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
    icon: 'star',
    title: 'Client-Centred Service',
    body: 'Every engagement is tailored to the specific requirements of each client, whether you are a litigation firm, insurer, self-insurer, or government body. From dedicated account management to bespoke referral workflows, VERIFY ensures seamless coordination and responsive communication at every stage of your matter.',
  },
  {
    icon: 'lock-simple',
    title: 'Confidential & Compliant',
    body: 'All matters are handled under strict confidentiality protocols and in full compliance with Australian privacy legislation, professional standards, and applicable jurisdictional requirements. This protects the integrity of every engagement from referral through to report delivery.',
  },
  {
    icon: 'chart-bar',
    title: 'End-to-End Operation',
    body: 'Every referral placed with VERIFY is our responsibility, from booking through to report delivery. We take our obligations seriously, aligning our service delivery to your needs with precision, accountability, and care so that nothing falls through the cracks.',
  },
]

export const WhyVerify: Block = {
  slug: 'whyVerify',
  interfaceName: 'WhyVerifyBlock',
  labels: { singular: 'Why VERIFY', plural: 'Why VERIFY' },
  fields: [
    ...whyHeaderFields,
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Reason', plural: 'Reasons' },
      defaultValue: defaultItems,
      admin: {
        initCollapsed: true,
        description:
          'Each reason renders as a +/− disclosure row: the title is always visible and the body expands on click.',
      },
      fields: [
        iconField({
          admin: {
            description:
              'Optional icon for this reason (kept in markup for structure; hidden in the current light design).',
          },
        }),
        inlineRichTextField('title', { required: true }),
        inlineRichTextField('body', { admin: { description: 'Shown when the row is expanded.' } }),
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Company image shown beside the reasons. Falls back to a gradient placeholder when empty.',
      },
    },
    inlineRichTextField('placeholderLabel', { defaultValue: richTextDefault('[ Company Image Placeholder ]'),
      admin: {
        description: 'Text shown inside the image placeholder when no image is set.',
      } }),
    anchorIdField,
    containerWidthField,
    motionField,
    cssClassField,
  ],
}
