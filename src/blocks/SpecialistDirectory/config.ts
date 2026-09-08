import type { Block, Field } from 'payload'

import {
  backgroundField,
  cssClassField,
  sectionHeaderFields,
  inlineRichTextField,
  richTextDefault,
} from '@/fields/blockFields'

// This block renders its eyebrow and heading inside the filter panel (see
// Component.tsx) and the reference design has no subheading there — nothing
// reads it, so offering the box would be a control that silently does nothing.
// Hidden rather than removed: dropping the field drops a column, and a
// destructive change stops the dev push on the invisible "Accept warnings?"
// prompt. The stored value is preserved and simply not shown.
const directoryHeaderFields: Field[] = sectionHeaderFields.map((field) =>
  'name' in field && field.name === 'subheading'
    ? ({ ...field, admin: { ...field.admin, condition: () => false } } as Field)
    : field,
)

// The interactive Specialist Panel directory: a searchable, filterable listing of
// the Specialists collection (by specialty / location / accreditation) with a live
// result count and empty state. All the visitor-facing copy is editable here; the
// client-side filtering is applied by the block's component over the queried set.
export const SpecialistDirectory: Block = {
  slug: 'specialistDirectory',
  interfaceName: 'SpecialistDirectoryBlock',
  labels: { singular: 'Specialist Directory', plural: 'Specialist Directories' },
  fields: [
    ...directoryHeaderFields,
    backgroundField,
    {
      type: 'collapsible',
      label: 'Filters',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'enableSearch', type: 'checkbox', defaultValue: true, label: 'Search box', admin: { width: '25%' } },
            { name: 'enableSpecialty', type: 'checkbox', defaultValue: true, label: 'Specialty', admin: { width: '25%' } },
            { name: 'enableLocation', type: 'checkbox', defaultValue: true, label: 'Location', admin: { width: '25%' } },
            { name: 'enableAccreditation', type: 'checkbox', defaultValue: true, label: 'Accreditation', admin: { width: '25%' } },
          ],
        },
        {
          name: 'sortBy',
          type: 'select',
          defaultValue: 'order',
          admin: {
            description:
              'Surname and Given name are alphabetical and fill in automatically from each specialist’s full name. Custom is the order you set by dragging rows on the Specialists list — dragging changes nothing here unless this is set to Custom. Note the drag order starts alphabetical by surname, so switching to Custom looks like nothing happened until you actually move someone.',
          },
          options: [
            { label: 'Custom — the drag order on the Specialists list', value: 'order' },
            { label: 'Surname (A–Z)', value: 'lastName' },
            { label: 'Given name (A–Z)', value: 'firstName' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Copy',
      admin: { initCollapsed: true, description: 'Visitor-facing labels + empty state.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'searchPlaceholder', type: 'text', defaultValue: 'Search by name…', admin: { width: '50%' } },
            { name: 'countTemplate', type: 'text', defaultValue: '{count} specialists', admin: { width: '50%', description: 'Use {count}.' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'searchGroupLabel', type: 'text', defaultValue: 'Search', admin: { width: '50%', description: 'Field label above the search box.' } },
            { name: 'specialtyGroupLabel', type: 'text', defaultValue: 'Filter by specialty', admin: { width: '50%', description: 'Field label above the specialty filter.' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'accreditationGroupLabel', type: 'text', defaultValue: 'Filter by accreditation', admin: { width: '50%', description: 'Field label above the accreditation filter.' } },
            { name: 'locationGroupLabel', type: 'text', defaultValue: 'Filter by location', admin: { width: '50%', description: 'Field label above the location filter.' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'specialtyLabel', type: 'text', defaultValue: 'Specialty', admin: { width: '33%' } },
            { name: 'locationLabel', type: 'text', defaultValue: 'Location', admin: { width: '33%' } },
            { name: 'accreditationLabel', type: 'text', defaultValue: 'Accreditation', admin: { width: '34%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            inlineRichTextField('emptyHeading', { defaultValue: richTextDefault('No specialists found'), admin: { width: '50%' } }),
            inlineRichTextField('emptyBody', { defaultValue: richTextDefault('Try adjusting your filters.'), admin: { width: '50%' } }),
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'cardCtaLabel', type: 'text', defaultValue: 'View Profile', admin: { width: '50%', description: 'Ghost card button (links to the specialist profile).' } },
            { name: 'secondaryCtaLabel', type: 'text', defaultValue: 'Request Availability', admin: { width: '50%', description: 'Solid card button label.' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'secondaryCtaHref', type: 'text', defaultValue: '/contact', admin: { width: '50%', description: 'Solid card button link (e.g. /contact).' } },
            { name: 'resetLabel', type: 'text', defaultValue: 'Clear Filters', admin: { width: '50%', description: 'Filter reset button label.' } },
          ],
        },
        { name: 'locationsLabel', type: 'text', defaultValue: 'Consulting Locations', admin: { description: 'Eyebrow label shown above each card’s consulting locations.' } },
      ],
    },
    cssClassField,
  ],
}
