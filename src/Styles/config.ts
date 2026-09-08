import type { GlobalConfig } from 'payload'

import { revalidateStyles } from './hooks/revalidateStyles'

// Central style library. Each preset bundles a class name with its CSS — the
// single source of truth. Presets are injected site-wide and are the ONLY
// classes editors can apply (via the strict picker on blocks/heroes/pages).
// Authors have full CSS freedom inside each preset and the global CSS box.
export const CustomStyles: GlobalConfig = {
  slug: 'custom-styles',
  label: 'Custom Styles',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Design',
    description:
      'Reusable style presets and a box for site-wide CSS. See HOOKS.md before adding CSS — a block option or a Design System value is usually the better tool.',
  },
  fields: [
    {
      name: 'presets',
      type: 'array',
      label: 'Style presets',
      labels: { singular: 'Preset', plural: 'Presets' },
      admin: {
        description:
          'Define a reusable style once, then apply it by name on any block/hero/page. Target the stable vf-* hook classes (e.g. .vf-card, .vf-section-header__title, .vf-carousel__arrow) and brand tokens (var(--primary), var(--accent), var(--vf-shadow-lg), var(--vf-radius-card)…) rather than literal colours, so your styles survive a rebrand. See src/Styles/HOOKS.md for the full reference — it also lists which admin field controls each token. Scope to a block via ".your-class .vf-card { … }".',
        components: { RowLabel: '@/Styles/RowLabel#RowLabel' },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              label: 'Class name',
              admin: { width: '40%', description: 'e.g. "card-elevated" (no dot, no spaces).' },
              validate: (val: string | null | undefined) =>
                !val || /^[a-zA-Z_][\w-]*$/.test(val) ||
                'Use a valid CSS class: letters, numbers, hyphens; no leading dot or spaces.',
            },
            {
              name: 'label',
              type: 'text',
              admin: { width: '60%', description: 'Friendly name shown in the picker.' },
            },
          ],
        },
        { name: 'description', type: 'textarea', admin: { description: 'What this style does / when to use it.' } },
        {
          name: 'css',
          type: 'code',
          required: true,
          label: 'CSS',
          admin: {
            language: 'css',
            description:
              'Full CSS rule(s), e.g. ".card-elevated > * { box-shadow: var(--shadow-lg); }". Match the selector to the class name above.',
          },
        },
      ],
    },
    {
      name: 'globalCss',
      type: 'code',
      label: 'Global CSS',
      admin: {
        language: 'css',
        description:
          'Optional base/root CSS not tied to a class — e.g. ":root { … }", "@font-face { … }". Injected as-is on every page.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateStyles],
  },
}
