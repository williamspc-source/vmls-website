import { TextStateFeature } from '@payloadcms/richtext-lexical'

import { BRAND_TEXT_COLORS } from './richTextColors'

/**
 * The brand colour swatches in the rich-text toolbar.
 *
 * ## Why this is a separate file from `richTextColors.ts`
 *
 * `TextStateFeature` comes from the *server* export of
 * `@payloadcms/richtext-lexical`. `richTextColors.ts` holds `colorClass()`, which
 * `InlineRichText` and the shared text converter both call while rendering the
 * site — client code. Putting the feature beside them would pull the editor
 * package into every heading's bundle. One palette, two importers, two files.
 *
 * ## What is stored
 *
 * Nothing but the key. `TextStateFeature` writes Lexical NodeState onto the text
 * node, which serialises under `$` (lexical's `NODE_STATE_KEY`):
 *
 *     { "type": "text", "text": "Expert Panel", "$": { "color": "brand" } }
 *
 * The `css` below is **the editor's swatch and preview only** — it is not written
 * into the document, which is what makes this free of any schema change: no new
 * column and no migration. ADDING a colour is therefore free.
 *
 * ## Retiring a colour is NOT free — it deletes stored data
 *
 * Measured in `node_modules`, both ends of it:
 *
 *   · `registerTextStates` (…/features/textState/textState.js) compiles
 *     `parse: value => Object.keys(stateValues).includes(value) ? value : undefined`
 *     — so a stored key that is no longer in this palette parses to `undefined`;
 *   · lexical 0.41's `NodeState.toJSON` then runs
 *     `if (stateConfig.isEqual(v, stateConfig.defaultValue)) delete state[key]`,
 *     and that default IS `undefined`.
 *
 * So the next time an editor opens and saves a document containing a retired
 * colour, the key is **removed from the stored JSON**. Rendering degrades
 * gracefully — `colorClass()` returns undefined and the text renders uncoloured
 * — but the value is gone, and re-adding the key to the palette will not bring
 * it back. Retire a colour only with a repair that rewrites the affected nodes
 * first. This is a constraint on removal; it does not apply to adding.
 *
 * The page gets its colour from the class instead. That is deliberate and it is
 * the same reasoning as the block-level control: `.vf-tc-brand` resolves through
 * `--primary`, which **Site Settings** owns, so a rebrand repaints every coloured
 * word at once. A stored `#1c75bc` would freeze each word at the blue that
 * happened to be current when someone typed it.
 *
 * ## The literal hexes here
 *
 * The admin has no `--primary` — `brandColorStyle()` puts the brand tokens on
 * `<html>` in the front-end layout only — so the swatch cannot use `var()`. It
 * uses the `fallback` each palette entry already records, and
 * `richTextColors.int.spec.ts` asserts every one of those matches the token's
 * value in `:root`. So the swatch can drift from the page only by making that
 * guard go red.
 *
 * ## `@experimental`
 *
 * Payload marks `TextStateFeature` experimental in 3.85, so its API may move on
 * an upgrade. The exposure is two call sites — this file and the `text` converter
 * in `src/components/RichText/shared.tsx`. Stored content is a bare key, so a
 * breaking API change cannot leave a stale hex behind — but see the retirement
 * note above before assuming stored keys are safe in general.
 *
 * ## The swatch list cannot be made editor-editable
 *
 * Asked for, and checked before answering. `state.color` is resolved once inside
 * `sanitizeConfig` — which is what `getPayload()` awaits — and memoised for the
 * process lifetime; `initLexicalFeatures` copies `clientFeatureProps` verbatim
 * per request with no hook, and `toolbarGroups` iterates the record with no
 * per-item predicate. There is no point at which a database read could reach it,
 * and the `parse` above would reject any key not compiled in anyway. Pre-declared
 * empty slots do not rescue it: an unfilled slot still renders as a pickable
 * swatch whose `var()` resolves to nothing, which is a control that visibly does
 * nothing — the exact failure invariant 2 exists to prevent, and it cannot be
 * hidden. The palette is a code-time list by construction. What an editor *can*
 * change is every colour's VALUE, in Site Settings → Brand colours.
 */
export const brandTextColorFeature = () =>
  TextStateFeature({
    state: {
      color: Object.fromEntries(
        BRAND_TEXT_COLORS.map((colour) => [
          colour.key,
          {
            label: colour.label,
            css: {
              color: colour.fallback,
              // White on the editor's white background is an invisible swatch and
              // invisible text the moment it is applied — the editor would look
              // like it had deleted the words. The outline is an admin-only
              // affordance; the page renders `.vf-tc-white` with no shadow.
              ...(colour.key === 'white' ? { 'text-shadow': '0 0 2px rgba(0, 0, 0, 0.65)' } : {}),
            },
          },
        ]),
      ),
    },
  })
