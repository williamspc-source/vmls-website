import type { Payload } from 'payload'

import { liftForCollection, liftForGlobal } from './liftRichText'

/**
 * The seed's write boundary.
 *
 * Every `payload.create` / `payload.update` / `updateGlobal` in the seed goes
 * through one of these, so fixture copy written as a plain string is lifted into
 * a Lexical value wherever the config says the field is rich text.
 *
 * It has to be a boundary rather than a habit: Payload accepts a string into a
 * rich-text field without complaint and stores it verbatim (measured), so a
 * fixture that bypasses these leaves a string in a `jsonb` column — which the
 * front end still renders, and which no editor can open. Nothing fails, which is
 * why `tests/int/seedWrites.int.spec.ts` asserts that no file under
 * `src/endpoints` calls `payload.create(` or `payload.update(` directly.
 *
 * The args are passed through untouched apart from `data`, so every option the
 * seed relies on — `req`, `depth`, `context: { disableRevalidate: true }`,
 * `filePath` for media — behaves exactly as before.
 */

// `data` is widened to `unknown` on the way in and cast back on the way out.
// Payload's own arg types resolve `data` against a *specific* collection or
// global slug, so a generic wrapper otherwise picks one arm of the union and
// rejects every field belonging to any other — the seed writes to twenty-odd
// slugs through these three functions. The lift itself is driven by the
// sanitised config, which knows the real shape, so nothing is lost by not
// re-stating it in the type.
type CreateArgs = Parameters<Payload['create']>[0]
type UpdateArgs = Parameters<Payload['update']>[0]
type UpdateGlobalArgs = Parameters<Payload['updateGlobal']>[0]

type LooseData<T> = Omit<T, 'data'> & { data?: unknown }

export const seedCreate = (payload: Payload, args: LooseData<CreateArgs>) =>
  payload.create({
    ...args,
    data: liftForCollection(payload, args.collection, args.data),
  } as CreateArgs)

export const seedUpdate = (payload: Payload, args: LooseData<UpdateArgs>) =>
  payload.update({
    ...args,
    data: liftForCollection(payload, args.collection, args.data),
  } as UpdateArgs)

export const seedUpdateGlobal = (payload: Payload, args: LooseData<UpdateGlobalArgs>) =>
  payload.updateGlobal({
    ...args,
    data: liftForGlobal(payload, args.slug, args.data),
  } as UpdateGlobalArgs)
