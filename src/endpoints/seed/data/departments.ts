// The teams staff are grouped into, in the order the design reference shows them
// on about/meet-the-team.html (Operations → Business Development → Client Support
// → Quality Assurance).
//
// These slugs were the four values of the old `department` enum, which is why
// `repairTeamDepartments.ts` can map every seeded member across: the roster in
// `./team.ts` still carries the same slug per person.
export type DepartmentSeed = { title: string; slug: string; order: number }

export const DEPARTMENTS: DepartmentSeed[] = [
  { title: 'Operations', slug: 'operations', order: 0 },
  { title: 'Business Development', slug: 'business-development', order: 1 },
  { title: 'Client Support', slug: 'client-support', order: 2 },
  { title: 'Quality Assurance', slug: 'quality-assurance', order: 3 },
]
