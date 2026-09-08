import type { Block } from 'payload'

import { linkGroup } from '@/fields/linkGroup'
import {
  backgroundField,
  cssClassField,
  elementClassesField,
  gridDisplayFields,
  headerBandField,
  sectionHeaderFields,
} from '@/fields/blockFields'

const sourceIs =
  (value: string) =>
  (_: unknown, siblingData: { source?: string } = {}) =>
    (siblingData?.source ?? 'specialists') === value

export const PeopleGrid: Block = {
  slug: 'peopleGrid',
  interfaceName: 'PeopleGridBlock',
  labels: { singular: 'People Grid', plural: 'People Grids' },
  fields: [
    ...sectionHeaderFields,
    { type: 'row', fields: [backgroundField, headerBandField] },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'specialists',
      options: [
        { label: 'Specialists', value: 'specialists' },
        { label: 'Team', value: 'team' },
        { label: 'Hand-picked', value: 'manual' },
      ],
    },
    // Specialist filters
    {
      type: 'row',
      admin: { condition: sourceIs('specialists') },
      fields: [
        {
          name: 'onlyAdvertised',
          type: 'checkbox',
          label: 'Only advertised specialists',
          admin: { width: '50%' },
        },
        {
          name: 'featuredOnly',
          type: 'checkbox',
          label: 'Only featured specialists',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      admin: { condition: sourceIs('specialists') },
      fields: [
        {
          name: 'specialty',
          type: 'relationship',
          relationTo: 'specialties',
          admin: { width: '50%', description: 'Optional — limit to one specialty.' },
        },
        {
          name: 'location',
          type: 'relationship',
          relationTo: 'locations',
          admin: { width: '50%', description: 'Optional — limit to one location.' },
        },
      ],
    },
    {
      type: 'row',
      admin: { condition: sourceIs('specialists') },
      fields: [
        // Abbreviated, and NOT for tidiness — the full name does not fit.
        //
        // Drizzle names a foreign key `<table>_<column>_<reftable>_id_fk`, and
        // Postgres truncates identifiers at 63 characters. On the version shadow
        // that budget is 63 − 27 (`_pages_v_blocks_people_grid`) − 16
        // (`assessment_types`) − 6 (`_id_fk`) − 2 separators = **12 characters
        // for the column**. `assessment_type_id` is 18, so the name was truncated,
        // Drizzle never found the one it wanted, and it dropped and recreated the
        // constraint on EVERY boot — measured by the oid changing on each
        // `getPayload()`. Two boots racing that DDL fail with `42704`, which is
        // what made `pnpm test:int` fail one run in three. `asmt_type_id` is 12.
        // `dbName` is not a way out: Payload 3.85 rejects it on a relationship
        // field and `pnpm build` fails to type check.
        //
        // Still singular against the Specialist's plural `assessmentTypes`, and
        // still sharing no prefix with it, so the orphan guard's `\b` boundary can
        // tell them apart — the reason the original name was singular.
        //
        // Without this filter a service page could only reach specialists by
        // specialty or location, neither of which answers "who performs this kind
        // of assessment" — so /jme listed the first ten specialists alphabetically
        // under a heading promising the ones who conduct JMEs.
        {
          name: 'asmtType',
          label: 'Assessment Type',
          // NOTE: this column's foreign key hits Postgres's 63-character
          // identifier limit on the `_pages_v` shadow table, so Drizzle drops and
          // recreates the constraint on every boot (measured: the oid changes each
          // time). It is harmless to data but causes intermittent `42704` failures
          // when two boots race. `dbName` is NOT the fix — Payload 3.85 does not
          // accept it on a relationship field and the build fails to type check.
          // The real fix is a shorter field name,
          // which is a rename across the config, component, seed and tests.
          type: 'relationship',
          relationTo: 'assessment-types',
          admin: {
            width: '50%',
            description:
              'Optional — limit to specialists who perform this assessment type (set on their profile).',
          },
        },
      ],
    },
    // Team filter
    {
      // Was one of four hardcoded copies of the department list; it is now a
      // relationship to the Departments taxonomy, the same one each team member
      // is assigned through, so the two lists cannot offer different teams.
      // Written without member-access syntax on purpose: the orphan-field guard's
      // readsField matches that form and does not know what a comment is.
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      hasMany: false,
      admin: {
        condition: sourceIs('team'),
        description: 'Optional — limit to one department.',
      },
    },
    {
      name: 'groupByDepartment',
      type: 'checkbox',
      label: 'Group by department',
      admin: {
        condition: sourceIs('team'),
        description: 'Render each department as its own labelled group (Meet the Team layout).',
      },
    },
    // Manual selection
    {
      name: 'people',
      type: 'relationship',
      relationTo: ['specialists', 'team'],
      hasMany: true,
      admin: { condition: sourceIs('manual') },
    },
    // Display
    {
      type: 'row',
      fields: [
        {
          name: 'layout',
          type: 'select',
          defaultValue: 'grid',
          // Grouping by department forces the grouped grid renderer, so Layout
          // and Limit stop having any effect. They used to stay visible and
          // editable while doing nothing.
          admin: { width: '33%', condition: (_, sib) => !sib?.groupByDepartment },
          options: [
            { label: 'Grid', value: 'grid' },
            { label: 'Carousel', value: 'carousel' },
          ],
        },
        {
          name: 'columns',
          type: 'select',
          defaultValue: '4',
          admin: {
            width: '33%',
            description: 'Grid only.',
            condition: (_, sib) => sib?.layout !== 'carousel',
          },
          options: [
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
          ],
        },
        {
          name: 'limit',
          type: 'number',
          defaultValue: 8,
          admin: {
            width: '33%',
            description: 'Max people to show (0 = show all).',
            condition: (_, sib) => !sib?.groupByDepartment,
          },
        },
      ],
    },
    linkGroup({
      overrides: {
        name: 'footerLinks',
        label: 'Footer buttons',
        maxRows: 2,
        admin: { description: 'Optional buttons shown below the grid (e.g. "View Full Panel").' },
      },
    }),
    {
      name: 'linkProfiles',
      type: 'checkbox',
      label: 'Link cards to profile pages',
      admin: { description: 'Enable once individual profile pages exist.' },
    },
    {
      name: 'carouselOptions',
      type: 'group',
      label: 'Carousel options',
      admin: {
        description:
          'Infinite auto-scrolling marquee (pauses on hover). Arrows flip the scroll direction.',
        condition: (_, siblingData) => (siblingData as { layout?: string })?.layout === 'carousel',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'speed',
              type: 'number',
              // 60s is the design reference's own marquee duration
              // (assets/css/styles.css:1666), used on all four of its instances.
              defaultValue: 60,
              label: 'Loop duration (seconds)',
              admin: {
                width: '50%',
                description:
                  'Seconds for one full loop of the strip — NOT a per-card delay. Lower = faster. The design reference uses 60.',
              },
            },
            {
              name: 'direction',
              type: 'select',
              defaultValue: 'left',
              label: 'Start direction',
              admin: { width: '50%' },
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' },
              ],
            },
          ],
        },
        { name: 'showArrows', type: 'checkbox', defaultValue: true, label: 'Show direction arrows' },
      ],
    },
    cssClassField,
    elementClassesField,
    ...gridDisplayFields,
  ],
}
