import type { Block } from 'payload'

import {
  anchorIdField,
  backgroundField,
  cssClassField,
  elementClassesField,
  gridDisplayFields,
  iconField,
  richBodyField,
  sectionHeaderFields,
  inlineRichTextField,
} from '@/fields/blockFields'

type ClaimantSiblings = { variant?: string | null; imagePlaceholder?: boolean | null }

/** The photo fields exist only on the one variant that has a column to hold them. */
const isClaimant = (_: unknown, sibling: ClaimantSiblings = {}): boolean =>
  sibling?.variant === 'claimant'

export const ProcessSteps: Block = {
  slug: 'processSteps',
  interfaceName: 'ProcessStepsBlock',
  labels: { singular: 'Process Steps', plural: 'Process Steps' },
  fields: [
    ...sectionHeaderFields,
    backgroundField,
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'cards',
      admin: {
        description:
          'Layout. "Cards" = numbered card grid. "Two-row process" = connected numbered rows (01–03 blue, 04+ dark) matching the reference Our Process. "Claimant step list" = left intro + a compact numbered list on the right (reference Your Examination Step by Step).',
      },
      options: [
        { label: 'Cards (numbered grid)', value: 'cards' },
        { label: 'Two-row process (connected)', value: 'two-row' },
        { label: 'Claimant step list', value: 'claimant' },
        { label: 'AAMLE education feature panels', value: 'edu-panels' },
      ],
    },
    {
      // The reference uses BOTH styles: plain digits on jme.html and
      // admin-services.html, zero-padded on for-clients.html and
      // for-claimants.html. So it is a per-instance choice, not a global one.
      name: 'numberStyle',
      type: 'select',
      defaultValue: 'padded',
      label: 'Step number style',
      options: [
        { label: 'Padded — 01, 02, 03', value: 'padded' },
        { label: 'Plain — 1, 2, 3', value: 'plain' },
      ],
    },
    // The shared `subheading` above is plain text, and it is one field on a helper
    // used by 26 blocks — widening it to rich text would touch 58 columns. Only
    // this variant's intro needs emphasis (the reference bolds "Australian Academy
    // of Medico-Legal Education (AAMLE)"), so the rich version is scoped to it and
    // falls back to `subheading` when left empty.
    richBodyField('introRich', {
      label: 'Intro copy (rich text)',
      admin: {
        condition: (_, sibling) => sibling?.variant === 'edu-panels',
        description:
          'Replaces the plain Subheading for this variant, adding bold and italic. Leave empty to keep using Subheading.',
      },
    }),
    // ── Claimant left-column photo ──────────────────────────────────────────
    // The design reference has NO image in this column — `.claimant-process-left`
    // is label + title + paragraph and nothing else. This was added at the
    // client's request; see README.md > Deliberate departures, so it
    // does not get "corrected" back out later.
    //
    // Only the `claimant` variant has a left column to hold a photo; the other
    // three centre their section header and have nowhere to put one. Offering the
    // fields there would be a control an editor can set that silently does
    // nothing — the invariant guarded by tests/int/adminControls.int.spec.ts.
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Left-column photo',
      admin: {
        condition: isClaimant,
        description:
          'Optional photo below the intro copy. It fills a fixed 4:3 frame, cropped around the focal point set on the image in Media — so fix a bad crop there rather than re-exporting the file.',
      },
    },
    {
      name: 'imagePlaceholder',
      type: 'checkbox',
      // Defaults to off so that adding these fields moves nothing on any page
      // that already exists. This one block is switched on by data instead, in
      // src/endpoints/seed/repairClaimantProcessImage.ts.
      defaultValue: false,
      label: 'Show an image placeholder when no photo is set',
      admin: {
        condition: isClaimant,
        description:
          'Draws the pale-blue placeholder tile until a photo is uploaded. Uploading one replaces it outright — caption and glyph with it — so you can leave this ticked.',
      },
    },
    inlineRichTextField('placeholderLabel', {
      admin: {
        condition: (_: unknown, sibling: ClaimantSiblings = {}) =>
          isClaimant(_, sibling) && Boolean(sibling?.imagePlaceholder),
        description: 'Optional caption inside the placeholder (e.g. "IMAGE PLACEHOLDER").',
      },
    }),
    iconField({
      name: 'placeholderIcon',
      admin: {
        condition: (_: unknown, sibling: ClaimantSiblings = {}) =>
          isClaimant(_, sibling) && Boolean(sibling?.imagePlaceholder),
        description:
          'Optional glyph above the placeholder caption. Left unset the tile is the caption alone, which is how the reference draws its empty-photo boxes on /services.',
      },
    }),
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      admin: {
        description: 'How many steps per row on desktop (Cards + Two-row variants).',
      },
      options: [
        { label: '1 (vertical list)', value: '1' },
        { label: '2 per row', value: '2' },
        { label: '3 per row', value: '3' },
        { label: '4 per row', value: '4' },
        { label: '5 per row', value: '5' },
      ],
    },
    {
      name: 'steps',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Step', plural: 'Steps' },
      admin: { description: 'Steps are auto-numbered in order (01, 02, …).' },
      fields: [
        {
          type: 'row',
          fields: [
            iconField({ admin: { width: '50%' } }),
            inlineRichTextField('badge', { admin: { width: '50%', description: 'Optional pill label, e.g. "Free to Join".' } }),
          ],
        },
        {
          name: 'badgeStyle',
          type: 'select',
          defaultValue: 'plain',
          label: 'Badge emphasis',
          admin: {
            condition: (_, sibling: { badge?: string | null } = {}) => Boolean(sibling?.badge),
            description: 'Highlight brightens the pill so one step stands out from the others.',
          },
          options: [
            { label: 'Plain', value: 'plain' },
            { label: 'Highlight', value: 'accent' },
          ],
        },
        inlineRichTextField('title', { admin: { description: 'Optional — leave empty for a number-only step.' } }),
        richBodyField('description', {
          admin: {
            description:
              'Body copy for the step. Bold and italic are available — the reference AAMLE panel bolds an organisation name and italicises a publication title.',
          },
        }),
        {
          name: 'bullets',
          type: 'array',
          labels: { singular: 'Bullet', plural: 'Bullets' },
          admin: { description: 'Optional bulleted list under the description.' },
          fields: [inlineRichTextField('text', { required: true })],
        },
      ],
    },
    anchorIdField,
    cssClassField,
    elementClassesField,
    ...gridDisplayFields,
  ],
}
