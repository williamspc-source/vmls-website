import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

type Ctx = { payload: Payload; req: PayloadRequest }

// Canonical destination for each "What We Do" / client service card. There are no
// standalone /services/<slug> routes — the reference links each card to its parent
// service page (under /services/medico-legal) plus a section anchor. Stored on the
// service doc as `linkOverride`, which the ServicesGrid honours over its
// auto-generated path, so this also fixes grids configured with `linkToService`.
export const SERVICE_LINK_OVERRIDES: Record<string, string> = {
  'independent-medical-examination': '/services/medico-legal/ime',
  'joint-medical-examination': '/services/medico-legal/jme',
  'file-review': '/services/medico-legal/reporting-services#file-review',
  'supplementary-report': '/services/medico-legal/reporting-services#supplementary-report',
  'teleconference-expert-evidence': '/services/medico-legal/reporting-services#teleconference',
  'expert-evidence': '/services/medico-legal/reporting-services#expert-evidence',
  'surrogate-assessment-interpreter-booking': '/services/medico-legal/admin-services#as-services-section',
  'brief-reduction-loi-review': '/services/medico-legal/admin-services#brief-reduction',
}

// Idempotent repair: point each service's `linkOverride` at its canonical nested
// destination. Runs unconditionally from seedVerify (NOT from seedHomepage, which
// early-returns on an already-authored homepage and so never reached its old copy
// of this loop on existing installs). Only writes when the value actually drifts.
export const repairServiceLinks = async ({ payload, req }: Ctx): Promise<void> => {
  let updated = 0
  for (const [slug, href] of Object.entries(SERVICE_LINK_OVERRIDES)) {
    const res = await payload.find({
      collection: 'services',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      req,
    })
    const doc = res.docs[0] as { id: number | string; linkOverride?: string | null } | undefined
    if (!doc || doc.linkOverride === href) continue
    await seedUpdate(payload, {
      collection: 'services',
      id: doc.id,
      data: { linkOverride: href } as never,
      req,
      context: { disableRevalidate: true },
    })
    updated++
  }
  payload.logger.info(`— Repaired service link overrides (${updated} updated)`)
}
