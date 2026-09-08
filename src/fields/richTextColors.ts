import type { Field } from 'payload'

/**
 * The colours an editor can paint text with, and the single place they are defined.
 *
 * ## Two controls, one palette
 *
 * This array feeds both of them:
 *
 *  · the block-level **Text colour** select (`textColorField`, below), which sets
 *    the colour of a whole heading, subheading or card line; and
 *  · the **toolbar swatch** in every rich-text box, registered by
 *    `./richTextColorFeature.ts`, which colours whatever the editor selected.
 *
 * Both emit `.vf-tc-<key>`, so `globals.css` paints them identically and
 * `richTextColors.int.spec.ts` keeps all three in step.
 *
 * The toolbar half was originally left out on the reasoning that two ways to
 * colour a phrase would fight — the bracket against the picker — with the bracket
 * winning and no way for an editor to tell why. That was a real problem and it is
 * now decided rather than avoided: the converter marks a toolbar pick
 * `vf-tc--inline`, and `globals.css` lets it beat the `[[bracket]]` accent, while
 * the block-level select still loses to it. A default yields to the bracket; a
 * selection an editor made by hand does not.
 *
 * What was not reconsidered is where colours come from. Mid-paragraph colour is
 * still drawn from this sixteen-entry brand palette and never from a colour wheel.
 *
 * ## Why keys and tokens rather than stored colour values
 *
 * The field stores `brand`, never `#1c75bc`. The CSS class it emits resolves
 * through the design token, and every one of those tokens is already editable in
 * **Site Settings → Brand colours**. So a rebrand re-paints every coloured word
 * on the site at once. Storing a literal would freeze each word at the hex that
 * was current when someone typed it, and a rebrand would leave them behind —
 * scattered, invisible until someone noticed the wrong blue.
 *
 * ## Light and dark bands
 *
 * `Heading` and `Body` need no dark variant: `.vf-on-dark` (globals.css) already
 * re-points `--text-dark`/`--text-mid` to the on-dark scale, so a card that an
 * editor switches from light to dark carries its text colour with it. That flip
 * is the reason this palette is expressed in tokens rather than colours, and why
 * those two are the sane defaults to reach for.
 *
 * The two that *do* need a dark variant are the ones that would vanish: brand
 * blue is low-contrast on a dark band and deep navy is nearly invisible on one,
 * so both re-point on `.vf-on-dark` — the same treatment
 * `.vf-section--primary .vf-accent` already gets.
 */

export type BrandTextColor = {
  /** Stored value, and the `vf-tc-` class suffix. */
  key: string
  /** What the editor reads in the dropdown. */
  label: string
  /** The design token the class resolves through. */
  token: string
  /** The token's value in `:root`, asserted by the palette guard. */
  fallback: string
  /** Where it re-points inside `.vf-on-dark`, when it would otherwise disappear. */
  onDarkToken?: string
  /**
   * Resolves through a token `.vf-on-dark` re-points, so the band decides the
   * colour rather than this entry. Guarded to be exactly the last two entries,
   * so the flag and the ordering cannot drift apart.
   */
  followsBand?: true
  /** Shown under the control. */
  description?: string
}

/**
 * Sixteen entries, in three groups: the brand blues, a set of fixed inks staff
 * asked for by name, and the two that follow the band.
 *
 * ── Fixed vs band-following ─────────────────────────────────────────────────
 * Most of this list states a colour and keeps it on every band. `heading` and
 * `body` do not: they resolve to `--text-dark`/`--text-mid`, which `.vf-on-dark`
 * re-points, so they flip to white and pale on a dark band. That is the only way
 * to say "this should stay readable if the band changes".
 *
 * ── Why the band-following pair is LAST ─────────────────────────────────────
 * On a light band they are the colours the text already is. Measured on the
 * homepage heading: **Default and "Heading text" both compute `rgb(65, 64, 66)`**
 * — the same value, to the byte. They used to sit directly under "Default (as
 * designed)", which is where an editor experimenting clicks first. That
 * happened: the control was tried, "Heading text" was picked, nothing changed on
 * the page, and it was reported — correctly — as a colour control that does not
 * colour. So everything that visibly differs comes first. `followsBand` marks
 * them and the guard asserts the flagged set is exactly `slice(-2)`.
 *
 * ── Charcoal is deliberately degenerate on a light band ─────────────────────
 * `charcoal` is #414042, which is what `heading` computes to on a light band, so
 * there it also looks like Default. It is NOT the same control: it stays
 * charcoal on a dark band, where `heading` turns white. Staff asked for black,
 * charcoal and grey they could set and rely on, so those three carry no on-dark
 * re-point at all — `richTextRender.e2e.spec.ts` proves that in both directions.
 *
 * ── Contrast, measured against white ───────────────────────────────────────
 * `white` 1.00, `sky` 1.67, `muted` 2.38 and `definition` 2.73 are below AA for
 * normal text. All four are on-dark colours; their descriptions say so rather
 * than the palette hiding them, because light blue on a photograph is the right
 * use. `bright` 3.38, `success` 3.30 and `warning` 3.19 clear AA for large text
 * only. Everything else clears AA outright, `grey` (#555555, 7.46) included —
 * it is darker than the reference's own mid-greys, which sit at ~4.4 on the
 * site's muted band and would fail there.
 */
export const BRAND_TEXT_COLORS: readonly BrandTextColor[] = [
  {
    key: 'brand',
    label: 'Brand blue',
    token: '--primary',
    fallback: '#1c75bc',
    onDarkToken: '--accent-on-dark',
  },
  {
    key: 'deep',
    label: 'Deep navy',
    token: '--primary-deep',
    fallback: '#1a3a5c',
    onDarkToken: '--text-on-dark',
  },
  {
    key: 'linkblue',
    label: 'Deep link blue',
    token: '--primary-strong',
    fallback: '#155fa0',
    description: 'The darker blue a link turns on hover.',
  },
  { key: 'bright', label: 'Bright blue', token: '--secondary-bright', fallback: '#2d8fe8' },
  {
    key: 'definition',
    label: 'Definition blue',
    token: '--definition-blue',
    fallback: '#5ba3d9',
    description:
      'For a dark band or a photograph. On white it measures 2.7:1, which is hard to read at normal size.',
  },
  {
    key: 'sky',
    label: 'Sky blue',
    token: '--accent-on-dark',
    fallback: '#93d0f7',
    description:
      'The accent colour on dark bands. On white it measures 1.7:1 — close to invisible, so keep it on something dark.',
  },
  {
    key: 'muted',
    label: 'Muted grey-blue',
    token: '--steel',
    fallback: '#93abbf',
    description: 'For a line that should sit back from the copy around it.',
  },
  // ── The fixed inks ────────────────────────────────────────────────────────
  // No `onDarkToken` on any of the three, on purpose: staff asked to be able to
  // set black, charcoal or grey and have it stay that colour. See the doc-block.
  {
    key: 'black',
    label: 'Black',
    token: '--ink-black',
    fallback: '#000000',
    description: 'Stays black on every band, including a dark one.',
  },
  {
    key: 'charcoal',
    label: 'Charcoal',
    token: '--ink-charcoal',
    fallback: '#414042',
    description:
      'Stays charcoal on every band. On a light background it matches the default text colour, so you will see no change there — the point is that it will not turn white if the band is switched to dark.',
  },
  {
    key: 'grey',
    label: 'Mid grey',
    token: '--ink-grey',
    fallback: '#555555',
    description: 'For a caption or an aside. Stays grey on every band.',
  },
  {
    key: 'white',
    label: 'White',
    token: '--text-on-dark',
    fallback: '#ffffff',
    description: 'For text over a photograph or a coloured panel.',
  },
  // ── Status colours ────────────────────────────────────────────────────────
  // The same three the Callout block uses, so a sentence of body copy can match
  // the panel it sits beside instead of approximating it with a brand blue.
  {
    key: 'success',
    label: 'Success green',
    token: '--callout-success',
    fallback: '#16a34a',
    description: 'Matches a Success callout. Clears AA at large sizes only.',
  },
  {
    key: 'warning',
    label: 'Warning amber',
    token: '--callout-warning',
    fallback: '#d97706',
    description: 'Matches a Warning callout. Clears AA at large sizes only.',
  },
  {
    key: 'error',
    label: 'Error red',
    token: '--form-error',
    fallback: '#c0392b',
    description: 'Matches a form error message.',
  },
  // The two below follow the band rather than stating a colour. On a light band
  // they are what the text already is — picking one is a no-op you can see, which
  // is why they are last and why their labels lead with the flip.
  {
    key: 'heading',
    label: 'Follows the band — heading',
    token: '--text-dark',
    fallback: '#414042',
    followsBand: true,
    description: 'Heading grey on a light band, white on a dark one.',
  },
  {
    key: 'body',
    label: 'Follows the band — body',
    token: '--text-mid',
    fallback: '#222222',
    followsBand: true,
    description: 'Body grey on a light band, pale on a dark one.',
  },
] as const

/** The value meaning "leave it as the design intends" — emits no class at all. */
/**
 * The ancestors that mean "this is a dark band", in the order globals.css writes
 * them for `.vf-tc-*`.
 *
 * Exported because a SECOND thing now needs the same re-point: the per-icon
 * default colours the layout publishes (`iconDefaultCss`), which are keyed by id
 * rather than by class and so cannot inherit `.vf-tc-*`'s own dark rules.
 *
 * Two lists that must name the same selectors is the drift this repo keeps
 * recording, so there is one list, here, and `richTextColors.int.spec.ts` asserts
 * globals.css uses exactly these for `.vf-tc-*`. Measured before adding it: an
 * uploaded icon defaulting to Brand blue painted `rgb(28,117,188)` on the navy
 * portal band, beside a built-in painting `rgb(147,208,247)`.
 */
export const ON_DARK_SELECTORS = ['.vf-on-dark', '.vf-section--primary', '.vf-section--dark'] as const

export const INHERIT_COLOR = 'inherit'

/**
 * The class for a stored colour key, or `undefined` for "no class".
 *
 * Returns `undefined` — rather than throwing or emitting `vf-tc-undefined` — for
 * a key that is absent, `inherit`, or no longer in the palette. A colour retired
 * from the list therefore degrades to the design's own colour rather than to
 * unstyled text, and old content keeps rendering.
 */
export const colorClass = (key?: string | null): string | undefined => {
  if (!key || key === INHERIT_COLOR) return undefined
  return BRAND_TEXT_COLORS.some((c) => c.key === key) ? `vf-tc-${key}` : undefined
}

/**
 * A "Text colour" select.
 *
 * Defaults to `inherit`, which is what makes adding this control to a block a
 * no-op: every existing page keeps the colour it has, and the field only does
 * something once an editor chooses. That is also what makes the claim "this
 * change moves no pixels" provable with `computedSnapshot.mjs`.
 */
export const textColorField = (
  overrides: { name?: string; label?: string; description?: string } = {},
): Field =>
  ({
    name: overrides.name ?? 'textColour',
    type: 'select' as const,
    label: overrides.label ?? 'Text colour',
    defaultValue: INHERIT_COLOR,
    options: [
      { label: 'Default (as designed)', value: INHERIT_COLOR },
      ...BRAND_TEXT_COLORS.map((c) => ({ label: c.label, value: c.key })),
    ],
    admin: {
      description:
        overrides.description ??
        'Colours this block’s heading and subheading — not its cards. To colour anything else, select the words and use the colour swatch in that field’s toolbar. The two “Follows the band” choices — and Charcoal — look identical to Default on a light background. The difference is on a dark band: the first two turn white, Charcoal stays charcoal.',
    },
  }) as Field
