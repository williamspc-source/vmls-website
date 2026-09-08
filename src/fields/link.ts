import type { Field, GroupField } from 'payload'
import { inlineRichTextField } from '@/fields/blockFields'

import deepMerge from '@/utilities/deepMerge'

export type LinkAppearances = 'default' | 'outline'

export const appearanceOptions: Record<LinkAppearances, { label: string; value: string }> = {
  default: {
    label: 'Default',
    value: 'default',
  },
  outline: {
    label: 'Outline',
    value: 'outline',
  },
}

type LinkType = (options?: {
  appearances?: LinkAppearances[] | false
  disableLabel?: boolean
  // Offers the "Registration enquiry email" type. Opt-in, because that type has
  // to be resolved into a mailto by the *block* before it reaches CMSLink —
  // CMSLink cannot read the global itself (it is imported by client components,
  // so it cannot be async). On a block that does not resolve it the link would
  // render as an inert span, i.e. a control an editor can set that silently does
  // nothing. Only pass this from a block that calls getRegistrationEnquiryHref().
  portalEnquiry?: boolean
  // When true, the whole link is optional — reference/url/label are not required,
  // so a row/card can render no CTA at all (reference pages with no button).
  optional?: boolean
  overrides?: Partial<GroupField>
}) => Field

export const link: LinkType = ({
  appearances,
  disableLabel = false,
  optional = false,
  portalEnquiry = false,
  overrides = {},
} = {}) => {
  const req = !optional
  const linkResult: GroupField = {
    name: 'link',
    type: 'group',
    admin: {
      hideGutter: true,
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'type',
            type: 'radio',
            admin: {
              layout: 'horizontal',
              width: '50%',
            },
            defaultValue: 'reference',
            options: [
              {
                label: 'Internal link',
                value: 'reference',
              },
              {
                label: 'Custom URL',
                value: 'custom',
              },
              {
                label: 'Open enquiry form',
                value: 'enquiry',
              },
              ...(portalEnquiry
                ? [
                    {
                      label: 'Registration enquiry email',
                      value: 'portalEnquiry',
                    },
                  ]
                : []),
            ],
          },
          {
            name: 'newTab',
            type: 'checkbox',
            admin: {
              style: {
                alignSelf: 'flex-end',
              },
              width: '50%',
            },
            label: 'Open in new tab',
          },
        ],
      },
    ],
  }

  const linkTypes: Field[] = [
    {
      name: 'reference',
      type: 'relationship',
      label: 'Document to link to',
      // Specialists / Team / Events are linkable so an editor never has to type
      // a path by hand. A hand-typed path bypasses src/utilities/routes.ts and
      // silently 404s the day a prefix moves — which has already happened once.
      relationTo: ['pages', 'posts', 'specialists', 'team', 'events'],
      required: req,
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
        description:
          'You can link to a draft. The link will 404 for visitors until that document is published.',
      },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
      },
      label: 'Custom URL',
      required: req,
    },
  ]

  // Jump to a section of the linked page. This exists so an anchored link can
  // still be an *internal* link: before it, `reference` had nowhere to put a
  // `#fragment`, so the moment a link needed one the editor had to switch to
  // Custom URL and type the whole path — which is precisely the hand-typed path
  // the comment above warns about. Every anchored link on the site was written
  // that way, and eight of them had gone stale onto flat legacy paths that only
  // still worked because of a redirect.
  //
  // Appended by CMSLink to whatever `routes.ts` resolves, so the page can move
  // and the link follows it. Stored without the `#`.
  const anchorField: Field = {
    name: 'anchor',
    type: 'text',
    label: 'Jump to section (optional)',
    admin: {
      condition: (_, siblingData) => siblingData?.type === 'reference',
      description:
        'Optional #id on the target page, e.g. "file-review" to land on the File Review section. Enter it without the #. Must match that section\'s Anchor ID.',
    },
    validate: (val: string | null | undefined) =>
      !val ||
      /^[a-z][a-z0-9-]*$/.test(val) ||
      'Use lowercase letters, numbers and hyphens; must start with a letter.',
  }

  if (!disableLabel) {
    linkTypes.map((linkType) => ({
      ...linkType,
      admin: {
        ...linkType.admin,
        width: '50%',
      },
    }))

    linkResult.fields.push({
      type: 'row',
      fields: [
        ...linkTypes,
        inlineRichTextField('label', {
          label: 'Label',
          required: req,
          admin: { width: '50%' },
        }),
      ],
    })
  } else {
    linkResult.fields = [...linkResult.fields, ...linkTypes]
  }

  // After the type row either way, so it reads as a modifier on the chosen
  // document rather than as a third kind of destination.
  linkResult.fields.push(anchorField)

  // `text` + the picker, for the reason written up on `iconField` in
  // blockFields.ts: a select is an enum and an enum cannot hold an uploaded
  // icon. This is the SECOND declaration of the same field — 45 of the 112 icon
  // columns are link icons — and the first attempt at icon uploads converted
  // only the other one, leaving drift the schema push could never settle.
  //
  // Deliberately no colour default of its own: a link icon sits inside a button
  // whose colour comes from its appearance, so it follows that. An editor can
  // still force one through the picker.
  linkResult.fields.push({
    name: 'icon',
    type: 'text',
    admin: {
      description: 'Optional leading icon shown before the label.',
      components: { Field: '@/fields/IconSelect#IconSelect' },
    },
  })

  if (appearances !== false) {
    let appearanceOptionsToUse = [appearanceOptions.default, appearanceOptions.outline]

    if (appearances) {
      appearanceOptionsToUse = appearances.map((appearance) => appearanceOptions[appearance])
    }

    linkResult.fields.push({
      name: 'appearance',
      type: 'select',
      admin: {
        description: 'Choose how the link should be rendered.',
      },
      defaultValue: 'default',
      options: appearanceOptionsToUse,
    })
  }

  return deepMerge(linkResult, overrides)
}
