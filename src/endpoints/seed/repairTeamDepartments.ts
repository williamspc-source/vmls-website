import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

import { TEAM } from './data/team'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Points every team member at a Departments record.
 *
 * ── Why a repair, and why it maps from the fixture ──
 * `Team.department` was a `select` backed by a Postgres enum. Converting it to a
 * relationship REPLACES that column, so the old values are destroyed by the
 * schema change itself — there is nothing left to read afterwards, and no
 * ordering of the migration can preserve them in place.
 *
 * The mapping therefore comes from `./data/team.ts`, which carries each member's
 * department slug. Measured before this was written: all 19 live values matched
 * the fixture exactly, and no live member was absent from it — so nothing is
 * lost. On the box it is the only possible source anyway, that being a fresh
 * install with no old values at all.
 *
 * ── The predicate ──
 * Writes only into an absence: a member whose `department` is already set is left
 * alone, so an editor who moves someone between teams keeps that choice. Runs
 * unconditionally from `seedVerify` because `authorPage`-style early returns are
 * exactly how a fix reaches a virgin database and nowhere else.
 *
 * ── What it says when it cannot ──
 * A member added by hand in the admin has no fixture entry and cannot be mapped.
 * That is logged by name at WARN, not skipped silently: `department` is required,
 * Meet the Team groups by it, and a member with none simply stops appearing there
 * while their profile still says Published.
 */
export const repairTeamDepartments = async ({ payload, req }: Ctx): Promise<void> => {
  const members = await payload.find({
    collection: 'team',
    limit: 500,
    depth: 0,
    pagination: false,
    // Drafts included: an unpublished member still needs a department, and
    // leaving them out would fix the site while leaving the admin broken.
    draft: true,
    req,
  })

  const unset = (members.docs as unknown as { id: number | string; slug?: string; department?: unknown }[])
    .filter((m) => !m.department)
  if (unset.length === 0) return

  const departments = await payload.find({
    collection: 'departments',
    limit: 100,
    depth: 0,
    pagination: false,
    req,
  })
  const bySlug = new Map<string, number | string>()
  for (const d of departments.docs as unknown as { id: number | string; slug?: string }[]) {
    if (d.slug) bySlug.set(d.slug, d.id)
  }
  if (bySlug.size === 0) {
    payload.logger.warn('— Team departments: no Departments records exist yet, nothing to map to')
    return
  }

  const fixtureBySlug = new Map(TEAM.map((m) => [m.slug, m.department]))

  let mapped = 0
  const unmapped: string[] = []
  for (const member of unset) {
    const departmentSlug = member.slug ? fixtureBySlug.get(member.slug) : undefined
    const departmentId = departmentSlug ? bySlug.get(departmentSlug) : undefined
    if (!departmentId) {
      unmapped.push(member.slug ?? String(member.id))
      continue
    }
    await seedUpdate(payload, {
      collection: 'team',
      id: member.id,
      data: { department: departmentId } as never,
      req,
      context: { disableRevalidate: true },
    })
    mapped += 1
  }

  if (mapped) payload.logger.info(`— Team departments: ${mapped} member(s) assigned`)
  if (unmapped.length) {
    payload.logger.warn(
      `— Team departments: ${unmapped.length} member(s) have no department and are not in the ` +
        `seed roster, so they cannot be mapped automatically — set one in the admin or they will ` +
        `not appear on Meet the Team: ${unmapped.join(', ')}`,
    )
  }
}
