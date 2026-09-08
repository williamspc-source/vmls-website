'use client'
import { FieldLabel, useField } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import { getClientSideURL } from '@/utilities/getURL'
import { BRAND_TEXT_COLORS, INHERIT_COLOR } from '@/fields/richTextColors'
import { formatIconValue, parseIconValue } from '@/components/Icon/value'

/**
 * The icon picker.
 *
 * ## Why this replaces a `select`
 *
 * `iconField` was a plain select listing icon NAMES, so choosing `chats-circle`
 * over `chat-circle-text` meant guessing from the words. It also could not offer
 * an uploaded icon at all: a Payload `select` is a Postgres **enum**, and an enum
 * can only hold values that existed when the schema was built. The field is
 * `text` now — see `src/fields/blockFields.ts` — and this draws the icons.
 *
 * ## What it must NOT import
 *
 * Not `@/components/Icon`. That module imports 101 Phosphor components at module
 * scope, and this is a client component rendered on every icon field in the
 * admin. The list comes from `/api/icon/library` instead — which is now an
 * EDITABLE list (the Icon Library global), so it could not be imported anyway.
 *
 * ## One fetch, not one per field
 *
 * A big page carries dozens of icon fields. The list is therefore cached at
 * module scope behind a single in-flight promise, so mounting 38 pickers issues
 * ONE request rather than 38 — and the refresh on window focus (an icon added to
 * the library in another tab should appear here) is shared too.
 */

type Choice = { value: string; label: string; kind: 'upload' | 'builtin' | 'orphan' }

const UPLOAD = 'upload:'

/** Enough to show every built-in at once; the message below appears if it is not. */
const VISIBLE_LIMIT = 300

// ── Shared, module-level caches ──────────────────────────────────────────────
// `load()` returns the in-flight promise when one is already running, so N
// simultaneously-mounting pickers share one request each.

type Entry = { value: string; label: string }
type Lists = { library: Entry[] }

let cache: Lists = { library: [] }
let inFlight: Promise<Lists> | null = null
const subscribers = new Set<(l: Lists) => void>()

const loadLists = (force = false): Promise<Lists> => {
  if (inFlight) return inFlight
  if (!force && cache.library.length) return Promise.resolve(cache)

  // ONE request. Uploads and Phosphor icons are one library — Design → Icon
  // Library decides what is in it — so there is nothing to fetch separately and
  // nothing to merge here.
  inFlight = fetch(`${getClientSideURL()}/api/icon/library`)
    .then((r) => r.json())
    .then((d) => {
      cache = { library: (d?.icons ?? []) as Entry[] }
      subscribers.forEach((fn) => fn(cache))
      return cache
    })
    .catch(() => cache)
    .finally(() => {
      inFlight = null
    })

  return inFlight
}

/** The artwork URL for a choice — the same routes the site renders uploads from. */
const previewUrl = (value: string): string =>
  value.startsWith(UPLOAD)
    ? `${getClientSideURL()}/api/icon/upload/${encodeURIComponent(value.slice(UPLOAD.length))}`
    : `${getClientSideURL()}/api/icon/phosphor/${encodeURIComponent(value)}`

const Preview: React.FC<{ value: string; size?: number }> = ({ value, size = 26 }) => (
  // A mask rather than an <img>, so the preview takes the admin's own text colour
  // — the same mechanism the site uses, so a white-on-white upload does not look
  // blank here and then work perfectly on a dark band.
  <span
    aria-hidden
    className="vf-icon-select__preview"
    style={{
      width: size,
      height: size,
      flex: `0 0 ${size}px`,
      WebkitMaskImage: `url("${previewUrl(value)}")`,
      maskImage: `url("${previewUrl(value)}")`,
    }}
  />
)

export const IconSelect: React.FC<{
  path: string
  readOnly?: boolean
  field?: { label?: string; admin?: { description?: string } }
}> = ({ path, readOnly, field }) => {
  const { value, setValue } = useField<string>({ path })
  const [lists, setLists] = useState<Lists>(cache)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const parsed = parseIconValue(value)
  const currentKey = parsed?.key ?? ''
  const currentColour = parsed?.colour ?? INHERIT_COLOR

  useEffect(() => {
    const update = (l: Lists) => setLists({ ...l })
    subscribers.add(update)
    void loadLists()

    const refresh = () => void loadLists(true)
    window.addEventListener('focus', refresh)
    return () => {
      subscribers.delete(update)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  // Not `useMemo`. The React compiler refuses to preserve a manual memo whose
  // dependency it thinks may be mutated later, and reports it as "Existing
  // memoization could not be preserved" — which disables optimisation for the
  // WHOLE component rather than just this value. Computing a list of a few
  // hundred small objects per render is cheaper than that, and the compiler
  // memoizes it anyway. Invariant 50: do not cache what is already cheap.
  const choices = ((): Choice[] => {
    const base: Choice[] = lists.library.map((o) => ({
      value: o.value,
      label: o.label,
      kind: o.value.startsWith(UPLOAD) ? ('upload' as const) : ('builtin' as const),
    }))

    // Whatever this document already holds, if neither list knows about it — an
    // icon since removed from the library, or an upload since deleted. Offered so
    // the current value is always visible and re-selectable; without it the
    // control would name a value it could neither display nor restore.
    //
    // Built by concatenation rather than `push`: mutating inside a `useMemo`
    // defeats the React compiler, which reports it as
    // "Existing memoization could not be preserved" rather than as a bug.
    const orphan: Choice[] =
      currentKey && !base.some((c) => c.value === currentKey)
        ? [{ value: currentKey, label: currentKey.replace(/-/g, ' '), kind: 'orphan' }]
        : []

    return [...base, ...orphan]
  })()

  const matches = ((): Choice[] => {
    const q = query.trim().toLowerCase()
    if (!q) return choices
    return choices.filter(
      (c) => c.label.toLowerCase().includes(q) || c.value.toLowerCase().includes(q),
    )
  })()

  const selected = choices.find((c) => c.value === currentKey)
  const label = field?.label || 'Icon'
  const description = field?.admin?.description

  const groups: { title: string; items: Choice[] }[] = [
    { title: 'Your icons', items: matches.filter((c) => c.kind === 'upload') },
    { title: 'Icon library', items: matches.filter((c) => c.kind === 'builtin') },
    // An icon this document already uses that the library no longer lists. Shown
    // so a stored value is never un-reselectable — the rule `CssClassSelect`
    // applies to an unknown class. Without it, removing an icon from the library
    // would leave every page using it with a picker that cannot show what is
    // selected.
    { title: 'Used here, not in the library', items: matches.filter((c) => c.kind === 'orphan') },
  ]

  // An uploaded icon carries its own default colour, so "no choice here" means
  // something different for the two tiers — and saying which avoids an editor
  // reading "Follows the band" and wondering why their icon is brand blue.
  const inheritLabel = currentKey.startsWith(UPLOAD)
    ? "Follows the icon's own colour"
    : 'Follows the band (as designed)'

  return (
    <div className="field-type vf-icon-select">
      <FieldLabel label={label} path={path} />

      <div className="vf-icon-select__current">
        {currentKey ? (
          <>
            <Preview value={currentKey} />
            <span className="vf-icon-select__current-label">{selected?.label || currentKey}</span>
            {!readOnly ? (
              <button
                type="button"
                className="vf-icon-select__clear"
                onClick={() => setValue(null)}
              >
                Clear
              </button>
            ) : null}
          </>
        ) : (
          <span className="vf-icon-select__empty">No icon</span>
        )}
        {!readOnly ? (
          <button type="button" className="vf-icon-select__toggle" onClick={() => setOpen(!open)}>
            {open ? 'Done' : currentKey ? 'Change' : 'Choose an icon'}
          </button>
        ) : null}
      </div>

      {/* Colour rides in the same stored value (`brain@deep`) — see
          src/components/Icon/value.ts for why it is not a second field. Hidden
          until an icon is chosen, since it would otherwise be a control with
          nothing to act on. */}
      {currentKey && !readOnly ? (
        <div className="vf-icon-select__colour">
          <label htmlFor={`${path}-colour`}>Colour</label>
          <select
            id={`${path}-colour`}
            value={currentColour}
            onChange={(e) => setValue(formatIconValue(currentKey, e.target.value))}
          >
            <option value={INHERIT_COLOR}>{inheritLabel}</option>
            {BRAND_TEXT_COLORS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className="vf-icon-select__swatch"
            style={{
              background:
                currentColour === INHERIT_COLOR
                  ? 'transparent'
                  : `var(${
                      BRAND_TEXT_COLORS.find((c) => c.key === currentColour)?.token ?? '--primary'
                    }, ${BRAND_TEXT_COLORS.find((c) => c.key === currentColour)?.fallback ?? '#1c75bc'})`,
            }}
          />
        </div>
      ) : null}

      {open && !readOnly ? (
        <div className="vf-icon-select__panel">
          <input
            type="text"
            className="vf-icon-select__search"
            placeholder={`Search ${choices.length.toLocaleString()} icons…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          {groups.every((g) => !g.items.length) ? (
            <p className="vf-icon-select__none">
              Nothing matches “{query}”. Try a plainer word — icons are named for what they show, so
              “document” finds more than “LOI”.
            </p>
          ) : null}

          {groups.map((group) =>
            group.items.length ? (
              <div key={group.title} className="vf-icon-select__group">
                <p className="vf-icon-select__group-title">
                  {group.title} <span>({group.items.length.toLocaleString()})</span>
                </p>
                <div className="vf-icon-select__grid">
                  {group.items.slice(0, VISIBLE_LIMIT).map((choice) => (
                    <button
                      key={choice.value}
                      type="button"
                      title={choice.label}
                      className={`vf-icon-select__option${
                        choice.value === currentKey ? ' vf-icon-select__option--selected' : ''
                      }`}
                      onClick={() => {
                        // Keep whatever colour was already chosen, so swapping the
                        // artwork does not silently reset it.
                        setValue(formatIconValue(choice.value, parsed?.colour))
                        setOpen(false)
                      }}
                    >
                      <Preview value={choice.value} />
                      <span>{choice.label}</span>
                    </button>
                  ))}
                </div>
                {group.items.length > VISIBLE_LIMIT ? (
                  // Saying so, rather than truncating silently — an editor who
                  // cannot see their icon should know there are more rather than
                  // concluding it is not there.
                  <p className="vf-icon-select__more">
                    Showing {VISIBLE_LIMIT} of {group.items.length.toLocaleString()} — keep typing to
                    narrow it down.
                  </p>
                ) : null}
              </div>
            ) : null,
          )}
        </div>
      ) : null}

      {description ? <div className="field-description">{description}</div> : null}
    </div>
  )
}

export default IconSelect
