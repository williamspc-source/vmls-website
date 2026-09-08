import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'
import { backgroundField, containerWidthField, cssClassField, iconField,
  inlineRichTextField,
} from '@/fields/blockFields'

const isType =
  (...types: string[]) =>
  (_: unknown, siblingData: { type?: string } = {}) =>
    types.includes(siblingData?.type ?? '')

/**
 * Section spacing presets plus a "default" sentinel. The home hero's own 80px
 * padding is not one of the presets (`normal` is ~88px), so defaulting to a
 * preset would silently reshape the hero. 'default' emits no class and leaves
 * the hero's CSS in charge until an editor deliberately picks something.
 */
const heroSpacingField = (name: string, label: string, description: string): Field =>
  ({
    name,
    type: 'select',
    label,
    defaultValue: 'default',
    admin: { width: '50%', description },
    options: [
      { label: "Default (hero's own)", value: 'default' },
      { label: 'None', value: 'none' },
      { label: 'Compact', value: 'compact' },
      { label: 'Normal', value: 'normal' },
      { label: 'Spacious', value: 'spacious' },
      { label: 'Extra large', value: 'xl' },
    ],
  }) as Field

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'pageHero',
      label: 'Type',
      required: true,
      options: [
        { label: 'None', value: 'none' },
        { label: 'Page hero (interior pages)', value: 'pageHero' },
        { label: 'Home hero (with definition panel)', value: 'homeHero' },
        { label: 'High impact (full-bleed image)', value: 'highImpact' },
        { label: 'Medium impact', value: 'mediumImpact' },
        { label: 'Low impact', value: 'lowImpact' },
      ],
    },
    // ── pageHero / homeHero fields ──
    inlineRichTextField('eyebrow', {
      admin: {
        description: 'Small uppercase label above the heading.',
        condition: isType('pageHero', 'homeHero'),
      },
    }),
    // Was a textarea purely so the reference's two-line hero lockup was typable.
    // Rich text keeps that — a paragraph break renders as `<br>` through
    // `InlineRichText` — and adds bold, italic and links to the largest piece of
    // copy on the page.
    inlineRichTextField('heading', {
      admin: {
        condition: isType('pageHero', 'homeHero'),
        description:
          'Wrap a word/phrase in [[brackets]] to highlight it in the brand accent colour. Press Enter to start a new line of the same heading.',
      },
    }),
    inlineRichTextField('subtitle', {
      admin: { condition: isType('pageHero', 'homeHero') },
    }),
    {
      name: 'showBreadcrumb',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show the breadcrumb trail above the heading.',
        condition: isType('pageHero'),
      },
    },
    {
      type: 'row',
      admin: { condition: isType('pageHero') },
      fields: [
        {
          name: 'theme',
          type: 'select',
          defaultValue: 'light',
          admin: { width: '50%', description: 'Light interior hero, a dark gradient band, or a soft-blue service band.' },
          options: [
            { label: 'Light', value: 'light' },
            { label: 'Dark (gradient)', value: 'dark' },
            { label: 'Service (soft blue)', value: 'service' },
          ],
        },
        {
          name: 'align',
          type: 'select',
          defaultValue: 'left',
          admin: { width: '50%' },
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
          ],
        },
      ],
    },
    {
      name: 'showShield',
      type: 'checkbox',
      label: 'Show VERIFY shield watermark',
      admin: {
        description:
          'Decorative brand shield on the definition panel. The image comes from Site Settings → Brand assets → Shield / seal mark, falling back to the bundled VERIFY shield.',
        condition: isType('pageHero', 'homeHero'),
      },
    },
    {
      name: 'imagePanel',
      type: 'checkbox',
      label: 'Show image placeholder panel (right side)',
      admin: {
        description:
          'Two-column hero with a large image placeholder on the right (design-reference In-the-Loop hero).',
        condition: isType('pageHero'),
      },
    },
    {
      type: 'row',
      admin: { condition: isType('pageHero') },
      fields: [
        inlineRichTextField('imagePanelLabel', {
          admin: {
            width: '50%',
            description: 'Caption inside the image placeholder, e.g. "Company Image Placeholder".',
            condition: (_: unknown, s: { imagePanel?: boolean } = {}) => Boolean(s?.imagePanel),
          },
        }),
      ],
    },
    {
      name: 'metaItems',
      type: 'array',
      label: 'Quick-facts row',
      labels: { singular: 'Item', plural: 'Items' },
      admin: {
        condition: isType('pageHero'),
        description: 'Optional icon + text row under the hero (e.g. phone / email / hours on Contact).',
      },
      fields: [
        {
          type: 'row',
          fields: [
            iconField({ admin: { width: '25%' } }),
            inlineRichTextField('text', { required: true, admin: { width: '45%' } }),
            { name: 'href', type: 'text', admin: { width: '30%' } },
          ],
        },
      ],
    },
    // Home hero band. These exist because the band colour and vertical rhythm
    // used to be an inline style on the <section>, which outranks even Custom
    // Styles and so could not be changed from the admin at all.
    // `heroPadding*` default to 'default' (the hero's own 80px) rather than to a
    // spacing preset, because 80px is not one of the presets — so an untouched
    // hero renders exactly as before.
    {
      type: 'row',
      admin: { condition: isType('homeHero') },
      fields: [
        // Cast: spreading a shared Field and overriding `admin` widens the
        // discriminated union past what TS can narrow back to `Field`.
        {
          ...backgroundField,
          name: 'heroBackground',
          label: 'Hero background',
          defaultValue: 'accent-solid',
          admin: { ...backgroundField.admin, width: '50%' },
        } as Field,
        {
          ...containerWidthField,
          admin: { ...containerWidthField.admin, width: '50%' },
        } as Field,
      ],
    },
    {
      type: 'row',
      admin: { condition: isType('homeHero') },
      fields: [
        heroSpacingField('heroPaddingTop', 'Padding top', 'Space above the hero content.'),
        heroSpacingField('heroPaddingBottom', 'Padding bottom', 'Space below the hero content.'),
      ],
    },
    {
      name: 'definition',
      type: 'group',
      label: 'Definition panel',
      admin: {
        description: 'The dictionary-style panel shown beside the home hero.',
        condition: isType('homeHero'),
      },
      fields: [
        inlineRichTextField('term', { admin: { description: 'e.g. "verify"' } }),
        inlineRichTextField('pronunciation', { admin: { description: 'e.g. "/ˈvɛrɪfʌɪ/ · verb"' } }),
        inlineRichTextField('text', { label: 'Definition' }),
        {
          name: 'definitionStyle',
          type: 'select',
          defaultValue: 'glow',
          label: 'Panel style',
          admin: { description: 'Visual treatment for the definition panel.' },
          options: [
            { label: 'Glow (light panel, radial glow)', value: 'glow' },
            { label: 'Frame (grey gradient, inner frame)', value: 'frame' },
          ],
        },
        {
          name: 'interaction',
          type: 'select',
          defaultValue: 'full',
          label: 'Panel interaction',
          admin: {
            description:
              'Pointer effects on the panel. Visitors who have asked their device to reduce motion always get the calm version automatically, and touch devices get no motion at all.',
            condition: (_data, siblingData) =>
              ((siblingData as { definitionStyle?: string })?.definitionStyle ?? 'glow') === 'glow',
          },
          options: [
            { label: 'Full (float + 3D tilt + cursor sheen)', value: 'full' },
            { label: 'Subtle (cursor sheen + shadow lift only)', value: 'subtle' },
            { label: 'Off', value: 'off' },
          ],
        },
      ],
    },
    // ── legacy richText heroes ──
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
      admin: { condition: isType('highImpact', 'mediumImpact', 'lowImpact') },
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Hero image. Background for the impact heroes, the side image on the home hero, and the contents of the image panel on a page hero.',
        // On a page hero the image is only rendered inside the image panel
        // (src/heros/PageHero/index.tsx), so offering the field with the panel
        // switched off gave the editor an upload that went nowhere and said
        // nothing. Hide it there instead.
        condition: (_: unknown, s: { type?: string; imagePanel?: boolean } = {}) =>
          ['highImpact', 'mediumImpact', 'homeHero'].includes(s?.type ?? '') ||
          (s?.type === 'pageHero' && Boolean(s?.imagePanel)),
      },
    },
    { ...cssClassField, admin: { ...cssClassField.admin, condition: isType('pageHero', 'homeHero') } } as Field,
  ],
  label: false,
}
