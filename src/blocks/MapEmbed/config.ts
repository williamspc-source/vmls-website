import type { Block } from 'payload'

import { linkGroup } from '@/fields/linkGroup'
import {
  cssClassField,
  displayFields,
  sectionHeaderFields,
  inlineRichTextField,
} from '@/fields/blockFields'

// Embeds a map (or any iframe embed, incl. a YouTube video) with optional action
// buttons — the "Where to Find Us" module on Contact / For-Claimants, and the
// prep-video on For-Claimants. Can reference an Office record or take a raw URL.
export const MapEmbed: Block = {
  slug: 'mapEmbed',
  interfaceName: 'MapEmbedBlock',
  labels: { singular: 'Map / Embed', plural: 'Maps / Embeds' },
  fields: [
    ...sectionHeaderFields,
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'map',
      options: [
        { label: 'Map', value: 'map' },
        { label: 'Video / iframe embed', value: 'embed' },
      ],
    },
    {
      name: 'office',
      type: 'relationship',
      relationTo: 'offices',
      admin: {
        condition: (_, s) => s?.kind === 'map',
        description: 'Optional — pull the address + office info panel from an Office record.',
      },
    },
    {
      name: 'embedUrl',
      type: 'text',
      label: 'Embed URL',
      admin: {
        description: 'Map embed src, or a YouTube/Vimeo URL. Overrides the office map if set.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'aspect',
          type: 'select',
          defaultValue: '16-9',
          admin: { width: '50%' },
          options: [
            { label: '16:9', value: '16-9' },
            { label: '4:3', value: '4-3' },
            { label: 'Square', value: '1-1' },
            { label: 'Tall (map)', value: 'map' },
          ],
        },
        { name: 'title', type: 'text', admin: { width: '50%', description: 'Accessible title.' } },
      ],
    },
    {
      name: 'showOfficeInfo',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show office info panel (address/hours/transport/parking)',
      admin: { condition: (_, s) => s?.kind === 'map' },
    },
    inlineRichTextField('officeHoursHeading', { label: 'Office hours heading',
      admin: {
        condition: (_, s) => s?.kind === 'map',
        description: 'Info-panel heading above the office hours. Defaults to "Office Hours".',
      } }),
    inlineRichTextField('transportHeading', { label: 'Public transport heading',
      admin: {
        condition: (_, s) => s?.kind === 'map',
        description:
          'Info-panel heading above the transport list. Defaults to "Recommended Public Transport".',
      } }),
    inlineRichTextField('parkingHeading', { label: 'Car parks heading',
      admin: {
        condition: (_, s) => s?.kind === 'map',
        description: 'Info-panel heading above the parking list. Defaults to "Nearby Car Parks".',
      } }),
    // Appearance is deliberately offered: the generic map variant renders these
    // as btn / btn-outline and honours the choice. The contact variant renders
    // them as `.ct-map-action`, a single treatment, and ignores it — noted in
    // the field description rather than removing a control that does work.
    linkGroup({
      overrides: {
        name: 'actions',
        label: 'Action buttons',
        maxRows: 3,
        admin: {
          description:
            'e.g. Get directions / Call / Email. Each link’s Appearance (Default/Outline) applies on the standard map layout; the contact-details layout renders them all in one style.',
        },
      },
    }),
    cssClassField,
    ...displayFields,
  ],
}
