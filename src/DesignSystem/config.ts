import type { GlobalConfig } from 'payload'

import { revalidateDesignSystem } from './hooks/revalidateDesignSystem'
import { UNSAFE_TOKEN_VALUE } from '@/utilities/cssTokens'

// One editable value behind a named preset. Stored as text so authors can enter
// any CSS length (px, rem, clamp(...)). Empty falls back to the built-in default
// defined in globals.css (:root).
//
// The `validate` is load-bearing, not defensive polish. Every value here passes
// through cssTokens.safeTokenValue, which SILENTLY drops anything containing
// `< > { } ; \` or comment markers, or longer than 200 characters, and falls
// back to the built-in default. Without validation an editor pasting a shadow
// with a trailing semicolon — the single most natural thing to paste — saw the
// save succeed and nothing change, with no way to find out why. Site Settings'
// colorField has always validated; these fields never did, while HOOKS.md §5
// promised editors that both would.
const tokenField = (
  name: string,
  label: string,
  fallback: string,
  hint = 'Any CSS length (px, rem, clamp…).',
) => ({
  name,
  type: 'text' as const,
  label,
  admin: {
    width: '50%',
    placeholder: fallback,
    description: `Default: ${fallback}. ${hint} Empty = default.`,
  },
  validate: (value?: string | null) => {
    const v = value?.trim()
    if (!v) return true
    if (v.length > 200) return 'Too long for a CSS value (200 characters max).'
    if (UNSAFE_TOKEN_VALUE.test(v))
      return 'Remove < > { } ; \\ and comment markers — a value here is a single CSS value, so it needs no trailing semicolon.'
    return true
  },
})

const FONT_HINT = 'Any CSS font-family list.'
const SHADOW_HINT = 'Any CSS box-shadow value (comma-separate multiple layers).'
const COLOR_HINT = 'Any CSS colour.'

// The values BEHIND the presets used by Section/Row/atom blocks. Each maps to a
// CSS custom property emitted into a :root stylesheet at runtime (see cssTokens), so a
// change here re-themes every block that uses that preset — site-wide.
export const DesignSystem: GlobalConfig = {
  slug: 'design-system',
  label: 'Design System',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Design',
    description:
      'Edit what each spacing/size preset means. Changes apply across the whole site instantly. These set the values; pick a preset per block in the page editor.',
  },
  fields: [
    {
      name: 'typography',
      type: 'group',
      label: 'Typography',
      admin: {
        description:
          'Font families used site-wide. Empty = the brand defaults, Montserrat for headings and Open Sans for body. (MuseoSansRounded is also bundled and is used for the hero “VERIFY” wordmark.) To use a font that is not bundled, first load it via Globals → Custom Styles → Global CSS (@font-face), then enter its family name here. Text colours live in Site Settings → Brand colours.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            tokenField('headingFont', 'Heading font', "'Montserrat', sans-serif", FONT_HINT),
            tokenField('bodyFont', 'Body font', "'Open Sans', sans-serif", FONT_HINT),
          ],
        },
        tokenField('baseSize', 'Base body text size', '1.125rem'),
        {
          name: 'textScale',
          type: 'select',
          label: 'Overall size',
          defaultValue: '1',
          admin: {
            description:
              'Scales the whole site proportionally — text and the spacing around it. Use this rather than editing individual sizes. 100% is the designed size. Page width is unaffected, so larger settings mean bigger type in the same column.',
          },
          options: [
            { label: '90% — compact', value: '0.9' },
            { label: '95%', value: '0.95' },
            { label: '100% — default', value: '1' },
            { label: '105%', value: '1.05' },
            { label: '110%', value: '1.1' },
            { label: '115%', value: '1.15' },
            { label: '125% — large', value: '1.25' },
          ],
        },
      ],
    },
    {
      name: 'spacing',
      type: 'group',
      label: 'Section spacing',
      admin: { description: 'Vertical padding presets for sections (also drives Spacer atoms).' },
      fields: [
        {
          type: 'row',
          fields: [
            tokenField('compact', 'Compact', 'clamp(2rem, 4vw, 3rem)'),
            tokenField('normal', 'Normal', 'clamp(3.5rem, 8vw, 5.5rem)'),
          ],
        },
        {
          type: 'row',
          fields: [
            tokenField('spacious', 'Spacious', 'clamp(5rem, 10vw, 7.5rem)'),
            tokenField('xl', 'Extra large', 'clamp(7rem, 12vw, 10rem)'),
          ],
        },
      ],
    },
    {
      name: 'gaps',
      type: 'group',
      label: 'Column gaps',
      admin: { description: 'Space between columns in a Row.' },
      fields: [
        {
          type: 'row',
          fields: [tokenField('tight', 'Tight', '1rem'), tokenField('normal', 'Normal', '2rem')],
        },
        tokenField('wide', 'Wide', '3.5rem'),
      ],
    },
    {
      name: 'headings',
      type: 'group',
      label: 'Heading sizes',
      admin: { description: 'Visual sizes for the Heading atom (independent of level).' },
      fields: [
        {
          type: 'row',
          fields: [
            tokenField('sm', 'Small', 'clamp(1.1rem, 2vw, 1.25rem)'),
            tokenField('md', 'Medium', 'clamp(1.35rem, 2.5vw, 1.6rem)'),
          ],
        },
        {
          type: 'row',
          fields: [
            tokenField('lg', 'Large', 'clamp(1.75rem, 3.5vw, 2.4rem)'),
            tokenField('xl', 'Extra large', 'clamp(2.25rem, 5vw, 3.25rem)'),
          ],
        },
        tokenField('display', 'Display', 'clamp(2.75rem, 7vw, 4.5rem)'),
      ],
    },
    {
      name: 'text',
      type: 'group',
      label: 'Text block sizes',
      admin: {
        description:
          'Sizes for the Text block’s Small/Base/Large options only. This does NOT set the size of body copy generally — for that use Typography → Base body text size.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            tokenField('sm', 'Small', '0.9rem'),
            tokenField('base', 'Base', '1rem'),
          ],
        },
        tokenField('lg', 'Large', '1.2rem'),
      ],
    },
    {
      name: 'radius',
      type: 'group',
      label: 'Corner rounding',
      admin: {
        description:
          'How rounded each kind of element is. Set every one to 0 for a fully square look. The names below are a rough guide only — usage has drifted, so several element types are rounded by a token whose name suggests something else (most cards, for example, take their radius from “Tile”). If one field does not change what you expected, try its neighbours before assuming the control is broken.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            tokenField('none', 'Square', '0'),
            tokenField('sm', 'Small — inputs, small chips', '8px'),
          ],
        },
        {
          type: 'row',
          fields: [
            tokenField('chip', 'Chip / tag', '10px'),
            tokenField('card', 'Card', '12px'),
          ],
        },
        {
          type: 'row',
          fields: [
            tokenField('tile', 'Tile', '14px'),
            tokenField('md', 'Medium — images, media', '16px'),
          ],
        },
        {
          type: 'row',
          fields: [
            tokenField('panel', 'Panel — large surfaces', '20px'),
            tokenField('pill', 'Pill / fully rounded', '999px'),
          ],
        },
        {
          type: 'row',
          fields: [
            tokenField('circle', 'Circle / avatar', '50%'),
            tokenField('base', 'Form-control base', '0.5rem', 'Any CSS length. Used by inputs, buttons and other form controls.'),
          ],
        },
      ],
    },
    {
      name: 'gradients',
      type: 'group',
      label: 'Gradients',
      admin: {
        description:
          'Reusable gradient recipes. The colours inside them follow the brand palette automatically, so you only need to edit these to change a gradient’s angle or stop layout. Section band gradients live under “Section bands” above.',
      },
      fields: [
        tokenField(
          'imageTint',
          'Image placeholder tint',
          'linear-gradient(145deg, var(--accent), var(--accent-light))',
          'Any CSS gradient or colour.',
        ),
        tokenField(
          'deep',
          'Deep blue',
          'linear-gradient(135deg, var(--primary-deep) 0%, var(--primary) 100%)',
          'Any CSS gradient or colour.',
        ),
        tokenField(
          'hero',
          'Hero band',
          'linear-gradient(160deg, var(--gradient-start) 0%, var(--primary) 100%)',
          'Any CSS gradient or colour.',
        ),
        tokenField(
          'avatarTint',
          'Avatar / initials tint',
          'linear-gradient(145deg, #f2f9ff, #d8eefc)',
          'Any CSS gradient or colour.',
        ),
      ],
    },
    {
      name: 'bands',
      type: 'group',
      label: 'Section bands',
      admin: { description: 'Background colour/gradient for each section banding option.' },
      fields: [
        tokenField('muted', 'Muted (grey)', '#f5f6f8'),
        tokenField('accent', 'Accent (light blue)', 'linear-gradient(135deg, #eef9ff, #e6f4ff, #d9efff)'),
        tokenField('primary', 'Primary (dark blue)', 'linear-gradient(135deg, #0d4f85, #1c75bc)'),
        tokenField('dark', 'Dark (charcoal)', '#414042'),
      ],
    },
    {
      name: 'effects',
      type: 'group',
      label: 'Shadows & glows',
      admin: {
        description:
          'Depth and glow presets, picked per block via "Card shadow". "Shadow colour" tints the whole scale at once — it follows the brand primary from Site Settings unless overridden here, so a darker brand colour makes every shadow heavier. Large-panel shadows use their own slate colour, because brand blue reads wrong at big blur radii.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            tokenField('color', 'Shadow colour', 'var(--primary)', COLOR_HINT),
            tokenField('colorDeep', 'Large-panel shadow colour', '#2b4a62', COLOR_HINT),
          ],
        },
        {
          type: 'row',
          fields: [
            tokenField(
              'xs',
              'Extra small',
              '0 1px 8px color-mix(in srgb, var(--vf-shadow-color) 5%, transparent)',
              SHADOW_HINT,
            ),
            tokenField(
              'sm',
              'Small',
              '0 4px 24px color-mix(in srgb, var(--vf-shadow-color) 10%, transparent)',
              SHADOW_HINT,
            ),
          ],
        },
        {
          type: 'row',
          fields: [
            tokenField(
              'md',
              'Medium',
              '0 12px 32px color-mix(in srgb, var(--vf-shadow-color) 13%, transparent)',
              SHADOW_HINT,
            ),
            tokenField(
              'lg',
              'Large',
              '0 8px 40px color-mix(in srgb, var(--vf-shadow-color) 16%, transparent)',
              SHADOW_HINT,
            ),
          ],
        },
        {
          type: 'row',
          fields: [
            tokenField(
              'xl',
              'Extra large (panels)',
              '0 24px 60px color-mix(in srgb, var(--vf-shadow-color-deep) 13%, transparent)',
              SHADOW_HINT,
            ),
            tokenField(
              'xxl',
              'Huge (panel hover)',
              '0 32px 72px color-mix(in srgb, var(--vf-shadow-color-deep) 22%, transparent)',
              SHADOW_HINT,
            ),
          ],
        },
        {
          type: 'row',
          fields: [
            tokenField(
              'glowSm',
              'Glow — soft',
              '0 4px 18px color-mix(in srgb, var(--vf-shadow-color) 28%, transparent)',
              SHADOW_HINT,
            ),
            tokenField(
              'glowMd',
              'Glow — medium',
              '0 6px 20px color-mix(in srgb, var(--vf-shadow-color) 30%, transparent)',
              SHADOW_HINT,
            ),
          ],
        },
        {
          type: 'row',
          fields: [
            tokenField(
              'glowLg',
              'Glow — strong',
              '0 8px 28px color-mix(in srgb, var(--vf-shadow-color) 38%, transparent)',
              SHADOW_HINT,
            ),
            tokenField(
              'ring',
              'Focus ring',
              '0 0 0 3px color-mix(in srgb, var(--vf-shadow-color) 12%, transparent)',
              SHADOW_HINT,
            ),
          ],
        },
        {
          type: 'row',
          fields: [
            tokenField(
              'insetHighlight',
              'Inset top highlight',
              'inset 0 1px 0 rgba(255,255,255,0.95)',
              SHADOW_HINT,
            ),
            tokenField('hard', 'Hard offset (card hover)', '6px 6px 0 var(--primary)', SHADOW_HINT),
          ],
        },
        {
          type: 'row',
          fields: [
            tokenField(
              'transition',
              'Transition',
              '0.28s cubic-bezier(0.4, 0, 0.2, 1)',
              'Duration and easing for hover/focus animations site-wide. Use “0s” to switch transitions off.',
            ),
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateDesignSystem],
  },
}
