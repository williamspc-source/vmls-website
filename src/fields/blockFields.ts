import type { Block, Field } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  buildEditorState,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { textColorField } from './richTextColors'

// Shared admin field helpers so blocks stay consistent and DRY. Everything a
// block renders is editable through these fields.

// The section bands, shared by `backgroundField` and `headerBandField` so the two
// cannot offer different colours. Values map to `.vf-section--*` through
// `bgClasses` in components/Section, which is what the "every option has a CSS
// rule" guard checks.
export const BACKGROUND_OPTIONS = [
  { label: 'White', value: 'white' },
  { label: 'Light grey', value: 'muted' },
  { label: 'Light blue accent', value: 'accent' },
  // Flat fill rather than the `accent` gradient. Added so the home hero's band
  // could stop being a hardcoded inline colour; available everywhere since it
  // is a genuinely useful option, not a one-off.
  { label: 'Light blue (solid)', value: 'accent-solid' },
  // The reference's #eef6fc, which is paler than `accent-solid`. It reuses that
  // value on the contact page and the Claimants FAQ, and it was a hardcoded
  // literal in three places in globals.css before this became a preset.
  { label: 'Pale blue', value: 'light' },
  { label: 'Primary (dark blue)', value: 'primary' },
  { label: 'Dark (charcoal)', value: 'dark' },
  { label: 'Hero gradient', value: 'hero' },
]


/**
 * Hide a control on a block that is NESTED inside a Section, Row or Tab.
 *
 * `<Section bare>` returns early and never applies `background`, `containerWidth`
 * or `motion` (src/components/Section/index.tsx) — a nested block inherits the
 * parent band, width and rhythm by design. But the admin went on showing all
 * three selects, so an editor set a background on a nested block, saved, and saw
 * nothing. That is invariant 2's exact failure, and this is invariant 2's own
 * remedy: if it cannot work here, it must not appear here.
 *
 * Nesting is detectable because every child list goes through
 * `contentBlocksField`, which is always named `content` — Section's own children,
 * each of Row's columns, and each Tab. A top-level block's path is
 * `['layout', 2, 'background']` and contains no `content` segment; a nested one's
 * is `['layout', 2, 'content', 0, 'background']` and does. Payload types `path`
 * as `(number | string)[]`.
 */
const hiddenWhenNested = {
  condition: (_data: unknown, _sibling: unknown, { path }: { path?: (number | string)[] }) =>
    !path?.includes('content'),
}

export const backgroundField: Field = {
  name: 'background',
  type: 'select',
  defaultValue: 'white',
  options: BACKGROUND_OPTIONS,
  admin: { description: 'Section background colour.', ...hiddenWhenNested },
}

/**
 * Put a block's heading on its own full-width band, above the block's body.
 *
 * The design reference does this wherever an intro sits above a grid — Meet the
 * Team is `.team-intro` (light blue) over `.team-grid-section` (grey). One block
 * with one background cannot express that, so the header gets its own band.
 *
 * Defaults to the `'default'` sentinel, which emits **no** second band and leaves
 * the block rendering exactly as it did. Same reasoning as the hero spacing
 * fields (src/heros/config.ts): a default that silently reshapes every existing
 * instance of a block is worse than no default at all.
 *
 * Exported standalone rather than folded into `sectionHeaderFields`, which 19
 * blocks share — that would be 38 columns for a capability one page needs today.
 * Any block can opt in by adding this field.
 */
export const headerBandField: Field = {
  name: 'headerBackground',
  type: 'select',
  defaultValue: 'default',
  options: [{ label: 'Same as the section (no separate band)', value: 'default' }, ...BACKGROUND_OPTIONS],
  admin: {
    description:
      'Give the eyebrow/heading/intro their own coloured band above the rest of the block. Leave as "Same as the section" for one continuous band. The colours themselves come from Design System → Section bands.',
  },
}

/**
 * Section heading weight. Defaults to `default`, which emits NO class, so adding
 * this field to a block moves nothing — the same discipline as `headerBandField`
 * above.
 *
 * Exists because the design reference's Join the Expert Panel page is the only
 * one of its 108 pages that overrides `.section-title`'s weight (to 800, in its
 * own inline <style>); every other page renders the shared sheet's 700, which is
 * what globals.css declares. Porting that 800 globally would have re-weighted
 * every heading on the site to satisfy one page — the same mistake already
 * recorded for `.page-hero h1`, which was "aligned" from 800 to 700 across 59
 * pages. A block field keeps it to the blocks that ask for it.
 */
export const headingWeightField: Field = {
  name: 'headingWeight',
  type: 'select',
  defaultValue: 'default',
  options: [
    { label: 'Default', value: 'default' },
    { label: 'Heavy', value: 'heavy' },
  ],
  admin: {
    description:
      'Weight of this section’s heading. “Heavy” is the bolder treatment used on Join the Expert Panel. Leave as “Default” to match the rest of the site.',
  },
}

export const alignField: Field = {
  name: 'align',
  type: 'select',
  defaultValue: 'left',
  options: [
    { label: 'Left', value: 'left' },
    { label: 'Centered', value: 'center' },
  ],
}

// Scroll-reveal animation applied to the section as it enters the viewport.
export const motionField: Field = {
  name: 'motion',
  type: 'select',
  defaultValue: 'none',
  admin: { description: 'Animate the section in as it scrolls into view.', ...hiddenWhenNested },
  options: [
    { label: 'None', value: 'none' },
    { label: 'Fade up', value: 'fade-up' },
    { label: 'Fade in', value: 'fade-in' },
    { label: 'Zoom in', value: 'zoom-in' },
  ],
}

// Hover treatment applied to cards/items within a block.
export const hoverEffectField: Field = {
  name: 'hoverEffect',
  type: 'select',
  defaultValue: 'lift',
  admin: { description: 'Hover effect for cards/items in this block.' },
  options: [
    { label: 'None', value: 'none' },
    { label: 'Lift', value: 'lift' },
    { label: 'Glow', value: 'glow' },
    { label: 'Zoom', value: 'zoom' },
    { label: 'Accent bar', value: 'accent-bar' },
  ],
}

export const containerWidthField: Field = {
  name: 'containerWidth',
  type: 'select',
  defaultValue: 'normal',
  admin: { description: 'Content width for this section.', ...hiddenWhenNested },
  options: [
    { label: 'Normal', value: 'normal' },
    { label: 'Narrow', value: 'narrow' },
    { label: 'Wide', value: 'wide' },
    { label: 'Full width', value: 'full' },
  ],
}

// Resting depth for cards/items → `.vf-shadow-<slug>` (globals.css tail).
// 'default' emits no class, so adding this to a block changes nothing until an
// editor opts in. The presets set the RESTING shadow only; hover treatment
// stays with hoverEffectField, so the two compose rather than fight.
export const shadowField: Field = {
  name: 'shadow',
  type: 'select',
  defaultValue: 'default',
  label: 'Card shadow',
  admin: {
    description:
      'Resting depth/glow for cards in this block. Edit what each preset looks like in Globals → Design System → Shadows & glows.',
  },
  options: [
    { label: "Default (component's own)", value: 'default' },
    { label: 'None (flat)', value: 'none' },
    { label: 'Extra small', value: 'xs' },
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
    { label: 'Extra large', value: 'xl' },
    { label: 'Glow', value: 'glow' },
    { label: 'Glow (strong)', value: 'glow-strong' },
  ],
}

// Drop shadow for the Image atom → `.vf-image--shadow-<slug>`. A narrower scale
// than shadowField on purpose: the glow rungs are a card treatment and read as a
// halo behind a photo. Defaults to none, so existing images are untouched.
export const imageShadowField: Field = {
  name: 'shadow',
  type: 'select',
  defaultValue: 'none',
  label: 'Shadow',
  admin: {
    description: 'Drop shadow behind the image. Edit the values in Globals → Design System.',
  },
  options: [
    { label: 'None', value: 'none' },
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
    { label: 'Extra large', value: 'xl' },
  ],
}

// Display option bundles appended to block configs to keep them DRY.
export const displayFields: Field[] = [containerWidthField, motionField]
export const gridDisplayFields: Field[] = [
  containerWidthField,
  motionField,
  hoverEffectField,
  shadowField,
]

// Eyebrow + heading + subheading, used by most blocks via a SectionHeader.
/**
 * A default value for a rich-text field — as a FUNCTION, deliberately.
 *
 * Payload writes a literal `defaultValue` straight into the DDL, and both ways
 * of doing that for a `jsonb` column fail:
 *
 *  · a plain string produces `"heading" jsonb DEFAULT 'What Sets Us [[Apart]]'`,
 *    which Postgres rejects as invalid JSON;
 *  · the correct Lexical object produces a JSON literal that is *not escaped* —
 *    so the apostrophe in "Minimising Your Client's Report Costs" closes the SQL
 *    string and the statement dies with a bare syntax error (42601), naming the
 *    table and not the field. Apostrophes in real copy are not an edge case.
 *
 * A function cannot be serialised into DDL, so Payload leaves the column with no
 * database default and applies this when a document is created instead — which
 * is where a default belongs anyway. The editor still gets the copy pre-filled.
 *
 * `buildEditorState` is Payload's own builder, so the value is byte-identical to
 * what the editor would have saved had someone typed it.
 */
export const richTextDefault = (text: string) => () => buildEditorState({ text })

/**
 * A rich-text field for a ONE-LINE piece of copy — a heading, an eyebrow, a card
 * title, a button label.
 *
 * Same vocabulary as `richBodyField`: bold, italic, underline, link. What
 * differs is the admin presentation. A heading field that looks like a body
 * editor invites an editor to put a list or a second paragraph in a heading, and
 * the gutter, drag handle and "add block" affordances are all noise on a field
 * holding four words.
 *
 * The four `admin` flags below are the whole of the compact treatment and are
 * built into this Payload version — no custom component. `hideInsertParagraphAtEnd`
 * is the one that matters most: without it every heading field carries a
 * permanent "click to add a paragraph" target beneath it.
 *
 * On pressing Enter: Lexical always stores `root → paragraph → text`, so a second
 * line is a second *paragraph* in the JSON no matter what the editor sees. That
 * is handled at render time — `InlineRichText` renders paragraph breaks as
 * `<br>`, preserving the two-line heading lockups that were literal newlines in
 * a textarea before.
 */
export const inlineRichTextField = (name: string, overrides: Partial<Field> = {}): Field =>
  ({
    name,
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => [
        ...rootFeatures,
        FixedToolbarFeature(),
        InlineToolbarFeature(),
      ],
      admin: {
        hideGutter: true,
        hideInsertParagraphAtEnd: true,
        hideDraggableBlockElement: true,
      },
    }),
    ...overrides,
    admin: {
      className: 'vf-inline-richtext',
      ...(overrides.admin ?? {}),
    },
  }) as Field

/**
 * The eyebrow / heading / subheading trio, spread into 26 block configs.
 *
 * All three are rich text. An editor can bold or italicise a phrase, add a link,
 * and set the colour of the whole line from `textColour` — which is what a
 * WordPress user expects of a heading and what these fields could not do while
 * they were `text` and `textarea`.
 *
 * The heading used to be a `textarea` purely so a line break was typable, for
 * the two-line lockups ("Ensuring Accuracy," / "Empowering Justice"). Pressing
 * Enter in a rich-text field makes a second *paragraph* instead, and
 * `InlineRichText` renders a paragraph break as `<br>` — so the lockups render
 * exactly as they did, and the reason for the textarea is gone.
 *
 * `[[bracketed]]` text still paints in the brand accent, inside rich text as
 * well as in a plain string. It is not superseded by `textColour`: the bracket
 * colours a *phrase*, the field colours the *line*.
 */
export const sectionHeaderFields: Field[] = [
  inlineRichTextField('eyebrow', {
    admin: { description: 'Small uppercase label above the heading (optional).' },
  }),
  inlineRichTextField('heading', {
    admin: {
      description:
        'Wrap a word/phrase in [[brackets]] to highlight it in the brand accent colour, e.g. "Meet Our [[Expert Panel]]". Press Enter to start a new line of the same heading.',
    },
  }),
  inlineRichTextField('subheading'),
  textColorField({
    description:
      'Colours the heading and subheading above — not the cards or list items below them. To colour those, select the words and use the colour swatch in that field’s own toolbar. Brand colours follow Site Settings, so a rebrand updates them everywhere. A phrase in [[double brackets]] keeps the accent colour. The two “Follows the band” choices are the colours the text already is on a light background — they only differ once the band is dark.',
  }),
]

/**
 * `sectionHeaderFields` with fixed design-reference copy pre-filled.
 *
 * Three blocks each had their own `sectionHeaderFields.map(...)` doing this, and
 * all three broke the same way when the fields became rich text: Payload writes
 * a field's default into the DDL, so a string default on a `jsonb` column
 * produced `"heading" jsonb DEFAULT 'What Sets Us [[Apart]]'` and Postgres
 * refused the whole `CREATE TABLE` with a JSON parse error — naming the table,
 * not the field.
 *
 * Taking plain strings and lifting them here means a caller cannot make that
 * mistake again: there is nowhere to put a raw string.
 */
export const sectionHeaderFieldsWithDefaults = (defaults: Record<string, string>): Field[] =>
  sectionHeaderFields.map((field) => {
    const name = 'name' in field ? (field.name as string) : ''
    return name in defaults ? { ...field, defaultValue: richTextDefault(defaults[name]!) } : field
  }) as Field[]

// Optional HTML id so a section/row/item can be targeted by in-page hash links
// and the header nav sub-menu (e.g. #file-review, #surrogate). Slug-validated so
// it produces a stable, valid anchor. Rendered as the element `id`.
export const anchorIdField: Field = {
  name: 'anchorId',
  type: 'text',
  label: 'Anchor ID',
  admin: {
    description:
      'Optional #id for in-page / nav links, e.g. "file-review" is targeted by a link to #file-review. Lowercase letters, numbers and hyphens only.',
  },
  validate: (val: string | null | undefined) =>
    !val ||
    /^[a-z][a-z0-9-]*$/.test(val) ||
    'Use lowercase letters, numbers and hyphens; must start with a letter.',
}

/**
 * Lets a data-driven section take itself off the page when its query returns
 * nothing — and take its Section Nav tab with it (see
 * `src/blocks/sectionEmptiness.ts`).
 *
 * Defaults to OFF so that adding it moves nothing on any page that already
 * exists; the sections meant to use it are switched on as data, by
 * `src/endpoints/seed/repairHubEmptySections.ts`. Unticking it is how an editor
 * previews a section that has no content yet.
 */
export const hideWhenEmptyField: Field = {
  name: 'hideWhenEmpty',
  type: 'checkbox',
  defaultValue: false,
  label: 'Hide this section when it has nothing to show',
  admin: {
    description:
      'With nothing to list, hide the whole section — heading and all — instead of leaving an empty band. Its tab in a sticky Section Nav on the same page is hidden with it. Leave unticked to keep the empty section visible while you are still adding content.',
  },
}

/**
 * An icon chooser.
 *
 * ## Why `text` and not `select`
 *
 * A Payload `select` becomes a Postgres **enum**, one type per column, and an
 * enum can only hold values that existed when the schema was built. An uploaded
 * icon is *data* — created after the fact — so an enum column can never store
 * one. That is the whole reason this field is `text`.
 *
 * It is also why the first attempt at this feature took the local site down for
 * an afternoon: converting the columns in place meant DROPPING 112 enum types,
 * which stops the dev push on a prompt nobody can see. See `docs/TRAPS.md`.
 *
 * ## What is stored
 *
 * A string: `brain`, `brain@deep`, `upload:12`, `upload:12@white`. Every value
 * that existed before this change is the first form and renders unchanged.
 * `src/components/Icon/value.ts` is the only place that shape is interpreted.
 *
 * The cost of `text` is that Postgres no longer rejects a nonsense value. That
 * is covered where it matters instead: the picker only offers real icons, and
 * `Icon` renders nothing for a name it cannot resolve rather than throwing.
 *
 * **The same field is declared in `src/fields/link.ts` for link icons.** Both must
 * move together — converting one and not the other is what made the first
 * attempt's damage permanent, and `adminControls.int.spec.ts` now fails if either
 * regresses to a `select`.
 */
export const iconField = (overrides: Partial<Field> = {}): Field => {
  // `admin` is MERGED, not replaced. Spreading `...overrides` over a whole
  // `admin` object looked right and silently unwired the picker on every call
  // site that passes a width or a description — which is most of them: measured,
  // the Streams form rendered `field-icon` as a plain text input, with no error
  // anywhere. `components` is applied last because the picker IS the field; a
  // call site overriding it would be asking for a control that cannot choose an
  // icon.
  const { admin: adminOverrides, ...rest } = overrides as Partial<Field> & {
    admin?: Record<string, unknown>
  }

  return {
    name: 'icon',
    type: 'text',
    ...rest,
    admin: {
      description: 'Icon shown with this item.',
      ...(adminOverrides ?? {}),
      components: { Field: '@/fields/IconSelect#IconSelect' },
    },
  } as Field
}

// Strict preset picker — applies class names defined in the Custom Styles global.
// Editors choose from defined presets only (no free text); stored as a string[].
// Define presets once in Globals → Custom Styles, then apply them anywhere.
export const presetClassField = (overrides: Partial<Field> = {}): Field =>
  ({
    name: 'cssClass',
    type: 'text',
    hasMany: true,
    label: 'Custom CSS class(es)',
    admin: {
      description: 'Pick styles defined in Globals → Custom Styles.',
      components: { Field: '@/fields/CssClassSelect#CssClassSelect' },
    },
    ...overrides,
  }) as Field

export const cssClassField: Field = presetClassField()

// Per-element style slots: apply presets to specific parts of a block.
export const elementClassesField: Field = {
  name: 'elementClasses',
  type: 'group',
  label: 'Element styles',
  admin: { description: 'Apply preset classes to specific parts of this block.' },
  fields: [
    presetClassField({ name: 'heading', label: 'Heading' }),
    presetClassField({ name: 'card', label: 'Cards / items' }),
    presetClassField({ name: 'button', label: 'Buttons' }),
  ],
}

// ---------------------------------------------------------------------------
// Layout-primitive field helpers (Section / Row / atom blocks).
//
// All are fixed-named PRESET selects. Their slugs map to `.vf-*--<slug>` modifier
// classes in globals.css, and those classes resolve their actual values from CSS
// custom properties (e.g. `--space-spacious`, `--gap-wide`, `--size-heading-lg`).
// The VALUES are owner-editable site-wide via the Design System global, so a token
// change re-themes every block that uses it — without touching these field defs.
// ---------------------------------------------------------------------------

// Spacing preset → `var(--space-<slug>)`. Used for section padding top/bottom.
export const spacingField = (name: string, label: string, description?: string): Field =>
  ({
    name,
    type: 'select',
    label,
    defaultValue: 'normal',
    admin: description ? { description } : {},
    options: [
      { label: 'None', value: 'none' },
      { label: 'Compact', value: 'compact' },
      { label: 'Normal', value: 'normal' },
      { label: 'Spacious', value: 'spacious' },
      { label: 'Extra large', value: 'xl' },
    ],
  }) as Field

export const paddingTopField = spacingField('paddingTop', 'Padding top', 'Space above the content.')
export const paddingBottomField = spacingField(
  'paddingBottom',
  'Padding bottom',
  'Space below the content.',
)
// Bundle appended to Section configs (presented as one admin row).
export const spacingFields: Field[] = [
  { type: 'row', fields: [paddingTopField, paddingBottomField] },
]

// Gap between columns → `var(--gap-<slug>)`.
export const gapField: Field = {
  name: 'gap',
  type: 'select',
  defaultValue: 'normal',
  label: 'Gap',
  admin: { description: 'Space between columns.' },
  options: [
    { label: 'None', value: 'none' },
    { label: 'Tight', value: 'tight' },
    { label: 'Normal', value: 'normal' },
    { label: 'Wide', value: 'wide' },
    // The design reference's asymmetric bands use 72px between columns (the
    // join-expert-panel enquiry section and the JME split FAQ both do), which is
    // a step wider than `wide`. Added as a preset rather than widening `wide`,
    // which 20+ rows already use.
    { label: 'Extra wide', value: 'x-wide' },
  ],
}

// Vertical alignment of columns within a Row → `.vf-row--alignY-<slug>`.
export const alignYField: Field = {
  name: 'alignY',
  type: 'select',
  defaultValue: 'stretch',
  label: 'Vertical alignment',
  admin: { description: 'How columns line up vertically.' },
  options: [
    { label: 'Top', value: 'top' },
    { label: 'Center', value: 'center' },
    { label: 'Bottom', value: 'bottom' },
    { label: 'Stretch', value: 'stretch' },
  ],
}

// Per-column grid span → `.vf-col--span-<slug>`.
export const columnSpanField: Field = {
  name: 'span',
  type: 'select',
  defaultValue: 'auto',
  label: 'Column span',
  admin: { description: 'How many grid columns this column occupies (Auto = equal share).' },
  options: [
    { label: 'Auto (equal)', value: 'auto' },
    { label: 'Span 1', value: '1' },
    { label: 'Span 2', value: '2' },
    { label: 'Span 3', value: '3' },
    { label: 'Span 4', value: '4' },
  ],
}

// Text/content alignment for atoms → `.vf-align-<slug>`.
export const textAlignField: Field = {
  name: 'align',
  type: 'select',
  defaultValue: 'left',
  label: 'Alignment',
  options: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ],
}

// Heading semantic level (HTML tag) — decoupled from visual size for a11y.
export const headingLevelField: Field = {
  name: 'level',
  type: 'select',
  defaultValue: 'h2',
  label: 'Heading level',
  admin: { description: 'HTML tag for SEO/accessibility. Visual size is set separately.' },
  options: [
    { label: 'H1', value: 'h1' },
    { label: 'H2', value: 'h2' },
    { label: 'H3', value: 'h3' },
    { label: 'H4', value: 'h4' },
  ],
}

// Heading visual size → `var(--size-heading-<slug>)`.
export const headingSizeField: Field = {
  name: 'size',
  type: 'select',
  defaultValue: 'lg',
  label: 'Heading size',
  admin: { description: 'Visual size, independent of the heading level.' },
  options: [
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
    { label: 'Extra large', value: 'xl' },
    { label: 'Display', value: 'display' },
  ],
}

// Body text size → `var(--size-text-<slug>)`.
export const textSizeField: Field = {
  name: 'size',
  type: 'select',
  defaultValue: 'base',
  label: 'Text size',
  options: [
    { label: 'Small', value: 'sm' },
    { label: 'Base', value: 'base' },
    { label: 'Large', value: 'lg' },
  ],
}

export const buttonSizeField: Field = {
  name: 'size',
  type: 'select',
  defaultValue: 'md',
  label: 'Button size',
  options: [
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
  ],
}

// Spacer height → `var(--space-<slug>)` (shares the spacing scale).
export const spacerSizeField: Field = {
  name: 'size',
  type: 'select',
  defaultValue: 'md',
  label: 'Spacer height',
  options: [
    { label: 'Extra small', value: 'xs' },
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
    { label: 'Extra large', value: 'xl' },
  ],
}

// Shared so the Divider atom and any block drawing its own rule offer the same
// choices and emit the same `.vf-divider--<slug>` classes. Same shape as
// BACKGROUND_OPTIONS above: the plain field takes the list as-is, a block that
// needs an "off" state prefixes its own entry. Two copies of these three styles
// would be free to drift, and a drifted pair renders a class with no rule.
export const DIVIDER_STYLE_OPTIONS = [
  { label: 'Line', value: 'line' },
  { label: 'Dots', value: 'dots' },
  { label: 'Gradient', value: 'gradient' },
]

export const DIVIDER_WIDTH_OPTIONS = [
  { label: 'Full', value: 'full' },
  { label: 'Narrow', value: 'narrow' },
]

export const dividerStyleField: Field = {
  name: 'style',
  type: 'select',
  defaultValue: 'line',
  label: 'Divider style',
  options: DIVIDER_STYLE_OPTIONS,
}

export const dividerWidthField: Field = {
  name: 'width',
  type: 'select',
  defaultValue: 'full',
  label: 'Divider width',
  options: DIVIDER_WIDTH_OPTIONS,
}

// Image display width → `.vf-image--<slug>`.
export const imageWidthField: Field = {
  name: 'width',
  type: 'select',
  defaultValue: 'full',
  label: 'Image width',
  options: [
    { label: 'Full', value: 'full' },
    { label: 'Wide', value: 'wide' },
    { label: 'Normal', value: 'normal' },
    { label: 'Narrow', value: 'narrow' },
  ],
}

// Corner rounding → `var(--radius-<slug>)` (full = pill/circle).
export const roundedField: Field = {
  name: 'rounded',
  type: 'select',
  defaultValue: 'md',
  label: 'Corner rounding',
  options: [
    { label: 'None', value: 'none' },
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Full (pill/circle)', value: 'full' },
  ],
}

export const iconSizeField: Field = {
  name: 'size',
  type: 'select',
  defaultValue: 'md',
  label: 'Icon size',
  options: [
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
  ],
}

// Icon colour → `.vf-icon--<slug>` (mapped to brand tokens).
export const iconColorField: Field = {
  name: 'color',
  type: 'select',
  defaultValue: 'primary',
  label: 'Icon colour',
  options: [
    { label: 'Primary', value: 'primary' },
    { label: 'Accent', value: 'accent' },
    { label: 'Muted', value: 'muted' },
    { label: 'Inherit (text colour)', value: 'inherit' },
  ],
}

/**
 * A rich-text body field with the standard toolbars.
 *
 * The five-line `lexicalEditor({ features: … })` literal below is repeated in a
 * dozen block configs; new fields should use this instead of adding another
 * copy. No feature list is passed on purpose — `defaultLexical`
 * (`src/fields/defaultLexical.ts`, wired in `payload.config.ts`) already limits
 * `rootFeatures` to paragraph, bold, italic, underline and link, which is the
 * right vocabulary for body copy inside a block.
 */
export const richBodyField = (name: string, overrides: Partial<Field> = {}): Field =>
  ({
    name,
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => [
        ...rootFeatures,
        FixedToolbarFeature(),
        InlineToolbarFeature(),
      ],
    }),
    ...overrides,
  }) as Field

// The nested-blocks field that makes Section/Row containers recursive. The caller
// passes the allowed child blocks (atoms + rich blocks) — kept generic here to
// avoid a circular import between this file and the block configs.
export const contentBlocksField = (blocks: Block[], overrides: Partial<Field> = {}): Field =>
  ({
    name: 'content',
    type: 'blocks',
    label: 'Content',
    blocks,
    admin: { initCollapsed: true },
    ...overrides,
  }) as Field
