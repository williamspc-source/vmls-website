import { seedUpdateGlobal } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

import { SPECIALIST_INDEX_PATH } from '@/utilities/routes'
import { plainTextToLexical } from './data/richText'

type Ctx = { payload: Payload; req: PayloadRequest }

const RECIPIENT = 'admin@vmls.com.au'

/**
 * Seeds the three content globals that drive the specialist-profile portal CTA,
 * the In-the-Loop article sidebar, and the event-detail host boilerplate. All
 * fields remain editable in the admin; this just fills them so the templates
 * render on a fresh DB. Uses updateGlobal (idempotent).
 */
export const seedContentGlobals = async ({ payload, req }: Ctx): Promise<void> => {
  const opts = { req, depth: 0, context: { disableRevalidate: true } } as const

  // 1) Specialist Profile — Online Booking Portal CTA band (portal-opt4).
  await seedUpdateGlobal(payload, {
    slug: 'specialist-profile',
    data: {
      portalCta: {
        eyebrow: 'Online Booking Portal',
        heading: 'Book This Specialist',
        subheading:
          'Register for the VERIFY booking portal to view live availability, submit referrals, and track your matters.',
        tiles: [
          { icon: 'calendar-check', label: 'Specialist Availability' },
          { icon: 'clipboard-text', label: 'Download CV' },
          { icon: 'certificate', label: 'Sample Redacted Report' },
        ],
        enquiryLabel: 'Make an Enquiry',
        enquiryEmail: RECIPIENT,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    ...opts,
  })
  payload.logger.info('— Seeded Specialist Profile portal CTA')

  // Repair the specialist breadcrumb's parent link. It was stored as
  // '/specialist-panel', which only resolves via a 308 — the page actually lives
  // at /specialists/specialist-panel. Only the known-stale value is rewritten, so
  // a deliberate admin choice survives and re-running is a no-op.
  const specialistProfile = await payload.findGlobal({ slug: 'specialist-profile', depth: 0, req })
  const parentHref = (
    specialistProfile as { breadcrumb?: { breadcrumbParentHref?: string | null } } | null
  )?.breadcrumb?.breadcrumbParentHref
  if (parentHref === '/specialist-panel') {
    await seedUpdateGlobal(payload, {
      slug: 'specialist-profile',
      data: { breadcrumb: { breadcrumbParentHref: SPECIALIST_INDEX_PATH } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(opts as any),
    })
    payload.logger.info(`— Repaired specialist breadcrumb href → ${SPECIALIST_INDEX_PATH}`)
  }

  // 2) Article settings — the two fixed sidebar CTA cards on In-the-Loop articles.
  await seedUpdateGlobal(payload, {
    slug: 'article-settings',
    data: {
      sidebarCards: [
        {
          icon: 'chat',
          heading: 'Have a Question?',
          body: 'Our team is here to help with any medico-legal enquiry.',
          link: { type: 'custom', url: '/contact', label: 'Contact Us', newTab: false },
        },
        {
          icon: 'clipboard-text',
          heading: 'Make a Referral',
          body: 'Ready to refer a matter? Start a booking with our team.',
          link: { type: 'custom', url: '/make-a-booking', label: 'Make a Booking', newTab: false },
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    ...opts,
  })
  payload.logger.info('— Seeded Article settings sidebar cards')

  // 3) Events settings — host boilerplate for AAMLE vs VERIFY event detail pages.
  await seedUpdateGlobal(payload, {
    slug: 'events-settings',
    data: {
      // `blurb` and `callout` are richText. The `**…**` runs are parsed into
      // Lexical bold nodes by plainTextToLexical — the design reference bolds the
      // academy's name in both, and the old plain-text fields could not.
      aamle: {
        blurb: plainTextToLexical(
          'This session is presented by the **Australian Academy of Medico-Legal Education (AAMLE)**, VERIFY’s education and training arm, as part of its complimentary, CPD-eligible program for legal, insurance, and medical professionals.',
        ),
        callout: plainTextToLexical('Run by **AAMLE** — VERIFY’s education & training arm.'),
        attendHeading: 'How to Attend',
        recapHeading: 'Event Recap',
        attendBody:
          'AAMLE events are complimentary for members. Register your interest and our team will confirm your place and share joining details.',
        registerLabel: 'Register Your Interest',
        contactLabel: 'Contact Us',
        hostEventLinkLabel: 'View this event on AAMLE',
      },
      verify: {
        blurb: plainTextToLexical(
          'This event is hosted by **VERIFY Medico-Legal Solutions** as part of our commitment to supporting best practice across the industry.',
        ),
        callout: plainTextToLexical('Hosted by **VERIFY** Medico-Legal Solutions.'),
        attendHeading: 'How to Attend',
        recapHeading: 'Event Recap',
        attendBody:
          'Places are limited. Register your interest and our team will be in touch with confirmation and joining details.',
        registerLabel: 'Register Your Interest',
        contactLabel: 'Contact Us',
        hostEventLinkLabel: 'View this event on the VERIFY site',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    ...opts,
  })
  payload.logger.info('— Seeded Events settings host copy')
}
