import type { Field } from 'payload'

/**
 * The shape of a person's photo on their own profile page.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 * Both profile templates framed every portrait as a square — `.staff-photo` at
 * `aspect-ratio: 1/1` and `.profile-avatar` at a fixed 230×230 — while the
 * photography is portrait. The founder's photo is 934×1400, and README's
 * *Deliberate departures* §6 already records that a square box "cropped away the
 * top and bottom of the frame"; that block was changed to 2/3 and the profile
 * pages were not. Staff asked for the profiles to match it.
 *
 * The Media focal point and `zoom` already let an editor choose WHAT is inside
 * the frame. Nothing anywhere let them change the frame itself — every card and
 * profile dimension on this site is a hardcoded literal. This is the first.
 *
 * ── Scope ───────────────────────────────────────────────────────────────────
 * The profile page only. Grid cards, directory rows and article bylines keep
 * their own fixed shapes, so one person cannot make a grid ragged. Same
 * reasoning — and the same wording convention — as Team's `profilePhoto` /
 * `hidePhotoOnProfile` pair, which exist for exactly this "the card and the
 * profile should be able to differ" request.
 *
 * ── The default ─────────────────────────────────────────────────────────────
 * `tall`, not the square that shipped. Payload adds the column with a DEFAULT
 * and Postgres backfills every existing row, so all current profiles become 2:3
 * with no seed repair. The CSS also falls back to 2/3 on a null, so a document
 * written before the column existed renders the same as one written after.
 */
export const portraitShapeField: Field = {
  name: 'profilePhotoShape',
  type: 'select',
  defaultValue: 'tall',
  label: 'Photo shape on the profile page',
  options: [
    { label: 'Tall (2:3) — matches the founder photo', value: 'tall' },
    { label: 'Portrait (4:5)', value: 'portrait' },
    { label: 'Square (1:1)', value: 'square' },
  ],
  admin: {
    description:
      'Changes the shape of the photo frame on this person’s own profile page only — their card on the listing pages, in directories and on article bylines is not affected. If the photo is framed badly rather than the wrong shape, move the focal point on the image in Media instead.',
  },
}

/**
 * Slug → class, spelled out rather than built with a template literal. Same
 * shape as `bgClasses` in `src/components/Section/index.tsx`.
 *
 * The reason is `findDeadCss.mjs`, which reports a class it cannot find built
 * literally in the source, and plain greppability — not the HOOKS §6 guard.
 * That guard was *measured* here: converting one entry to
 * `` `vf-portrait--${'tall'}` `` and re-running left all 94 cases green, because
 * it walks `.css` files too and the rule in `globals.css` satisfies it on its
 * own. See docs/TRAPS.md — it proves a documented class has a RULE, not that
 * anything emits it.
 */
export const PORTRAIT_SHAPE_CLASS: Record<string, string> = {
  tall: 'vf-portrait--tall',
  portrait: 'vf-portrait--portrait',
  square: 'vf-portrait--square',
}

/** The class for a stored shape, falling back to the CSS default when unset. */
export const portraitShapeClass = (shape?: string | null): string | undefined =>
  (shape && PORTRAIT_SHAPE_CLASS[shape]) || undefined
