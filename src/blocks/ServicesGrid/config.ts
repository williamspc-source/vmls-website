import type { Block } from 'payload'

import { link } from '@/fields/link'
import {
  anchorIdField,
  backgroundField,
  cssClassField,
  elementClassesField,
  gridDisplayFields,
  sectionHeaderFields,
} from '@/fields/blockFields'

const sourceIs =
  (value: string) =>
  (_: unknown, siblingData: { source?: string } = {}) =>
    (siblingData?.source ?? 'auto') === value

export const ServicesGrid: Block = {
  slug: 'servicesGrid',
  interfaceName: 'ServicesGridBlock',
  labels: { singular: 'Services Grid', plural: 'Services Grids' },
  fields: [
    ...sectionHeaderFields,
    backgroundField,
    {
      name: 'source',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { label: 'Auto — list the Services collection', value: 'auto' },
        { label: 'Hand-picked', value: 'manual' },
      ],
    },
    {
      type: 'row',
      admin: { condition: sourceIs('auto') },
      fields: [
        {
          name: 'category',
          type: 'select',
          admin: { width: '50%', description: 'Optional — limit to one category.' },
          options: [
            { label: 'Medico-Legal', value: 'medico-legal' },
            { label: 'Administrative', value: 'administrative' },
            { label: 'Educational', value: 'educational' },
          ],
        },
        {
          name: 'serviceGroup',
          type: 'select',
          admin: { width: '50%', description: 'Optional — finer group (examinations vs reporting).' },
          options: [
            { label: 'Examination', value: 'examination' },
            { label: 'Reporting', value: 'reporting' },
            { label: 'Administrative', value: 'administrative' },
            { label: 'Education', value: 'education' },
          ],
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      admin: { description: 'Card grid, or an expandable accordion (with per-service image + body).' },
      options: [
        { label: 'Card grid', value: 'grid' },
        { label: 'Accordion', value: 'accordion' },
      ],
    },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: { condition: sourceIs('manual') },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'columns',
          type: 'select',
          defaultValue: '3',
          admin: { width: '50%' },
          options: [
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
          ],
        },
        {
          name: 'limit',
          type: 'number',
          defaultValue: 12,
          admin: { width: '50%', description: 'Max services to show (auto source).' },
        },
      ],
    },
    {
      name: 'linkToService',
      type: 'checkbox',
      label: 'Link each card to its service page',
      admin: { description: 'Enable once service pages exist.' },
    },
    {
      name: 'showEnquire',
      type: 'checkbox',
      label: 'Show an “Enquire →” link on each card',
      admin: { description: 'Adds an enquiry-drawer link at the bottom of every card (reference: Reports & Opinions / Administrative Services cards).' },
    },
    {
      name: 'hideDescription',
      type: 'checkbox',
      label: 'Hide card descriptions (icon + title only)',
      admin: { description: 'Reference home-page style: a tidy icon + title grid with no blurb.' },
    },
    {
      name: 'cardAlign',
      type: 'select',
      defaultValue: 'left',
      label: 'Card alignment',
      admin: {
        description:
          'Centred gives the reference home-page treatment — icon and title stacked and centred, with an equal minimum card height. Best paired with “Hide card descriptions”; a long blurb reads poorly centred.',
      },
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Centred', value: 'center' },
      ],
    },
    {
      name: 'servicePathPrefix',
      type: 'text',
      defaultValue: '/services',
      admin: {
        condition: (_, d) => Boolean((d as { linkToService?: boolean })?.linkToService),
        description: 'Links become <prefix>/<slug>.',
      },
    },
    {
      name: 'footerLinks',
      type: 'array',
      label: 'Buttons below the grid',
      labels: { singular: 'Button', plural: 'Buttons' },
      maxRows: 3,
      admin: { description: 'Optional CTAs under the grid (e.g. "View Medico-Legal Services").' },
      fields: [link({ appearances: false })],
    },
    // Lets a link target this grid as a whole (e.g. the homepage's combined
    // "Surrogate Assessment & Interpreter Booking" card, which names two of the
    // four items and so should land on the section, not on one of them).
    anchorIdField,
    cssClassField,
    elementClassesField,
    ...gridDisplayFields,
  ],
}
