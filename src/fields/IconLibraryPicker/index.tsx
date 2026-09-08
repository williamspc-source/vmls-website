'use client'
import { FieldLabel, useField } from '@payloadcms/ui'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { getClientSideURL } from '@/utilities/getURL'
import { BRAND_TEXT_COLORS, INHERIT_COLOR } from '@/fields/richTextColors'

/**
 * THE icon library. One screen, every icon, ticked or not.
 *
 * ## Why this is one screen and not two
 *
 * It was two: uploads lived in Media → Icons and the Phosphor choice lived here,
 * behind a search box that showed nothing until you typed. Two destinations for
 * one job, and a grid that looked empty on arrival. Both were wrong, and both are
 * gone: uploads happen here, everything is visible on load, and the tick decides
 * what editors are offered.
 *
 * The `icons` collection still exists — Payload needs one to store a file, and
 * the delete guard hangs off it — but it is hidden from the sidebar, so this is
 * the only place to go. Renaming, the default colour and deletion are therefore
 * ON the tile: `admin.hidden` makes Payload 404 the collection's routes outright,
 * not merely drop them from the nav, so a link to the record would have been a
 * broken one. Measured before relying on it — both `/admin/collections/icons` and
 * `…/create` return 404.
 *
 * ## Why the artwork loads as you scroll
 *
 * Every preview is an HTTP request for an SVG, and there are 1,513 of them. All
 * the tiles render immediately, so the grid is complete and scrollable from the
 * first paint; an `IntersectionObserver` sets the mask only when a tile comes
 * near the viewport. Seeing everything and fetching everything are different
 * problems, and only the first one was asked for.
 */

type UploadRecord = { id: string | number; name?: string; colour?: string | null }
type Entry = { value: string; label: string; upload?: UploadRecord }

const UPLOAD = 'upload:'

const artworkUrl = (value: string): string =>
  value.startsWith(UPLOAD)
    ? `${getClientSideURL()}/api/icon/upload/${encodeURIComponent(value.slice(UPLOAD.length))}`
    : `${getClientSideURL()}/api/icon/phosphor/${encodeURIComponent(value)}`

/** A tile's artwork, fetched only once the tile is close to being seen. */
const Artwork: React.FC<{ value: string; observer: IntersectionObserver | null }> = ({
  value,
  observer,
}) => {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [seen, setSeen] = useState(false)

  // DERIVED, not set in an effect: with no observer there is nothing to wait for,
  // so the artwork shows immediately rather than leaving a permanently blank
  // tile. Writing that as `setVisible(true)` inside the effect is what the React
  // compiler rejects as a cascading render.
  const visible = seen || !observer

  useEffect(() => {
    const el = ref.current
    if (!el || !observer) return
    const onSeen = () => setSeen(true)
    el.addEventListener('vf-seen', onSeen)
    observer.observe(el)
    return () => {
      el.removeEventListener('vf-seen', onSeen)
      observer.unobserve(el)
    }
  }, [observer])

  return (
    <span
      ref={ref}
      aria-hidden
      className="vf-icon-select__preview"
      style={{
        width: 26,
        height: 26,
        flex: '0 0 26px',
        ...(visible
          ? {
              WebkitMaskImage: `url("${artworkUrl(value)}")`,
              maskImage: `url("${artworkUrl(value)}")`,
            }
          : {}),
      }}
    />
  )
}

export const IconLibraryPicker: React.FC<{
  path: string
  readOnly?: boolean
  field?: { label?: string; admin?: { description?: string } }
}> = ({ path, readOnly, field }) => {
  const { value, setValue } = useField<string[]>({ path })
  const [phosphor, setPhosphor] = useState<string[]>([])
  const [uploads, setUploads] = useState<UploadRecord[]>([])
  const [effective, setEffective] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [onlyTicked, setOnlyTicked] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  // A lazy `useState` initialiser rather than `setObserver(...)` in an effect,
  // which the React compiler rejects. `typeof` guard because a 'use client'
  // component is still server-rendered first, where IntersectionObserver does not
  // exist — and there the derived `visible` above shows every tile, which is the
  // right no-JS answer anyway.
  const [observer] = useState<IntersectionObserver | null>(() =>
    typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (e.isIntersecting) e.target.dispatchEvent(new Event('vf-seen'))
            }
          },
          // A generous margin, so artwork is there by the time a tile is reached.
          { rootMargin: '400px' },
        ),
  )

  useEffect(() => () => observer?.disconnect(), [observer])

  // `.then(...)` rather than `async`/`await`: the setState happens in a callback
  // either way, but the React compiler cannot see that through an awaited
  // expression and rejects it as a synchronous setState inside an effect.
  const loadUploads = useCallback(
    () =>
      fetch(`${getClientSideURL()}/api/icons?depth=0&limit=500&sort=name`, {
        credentials: 'include',
      })
        .then((r) => r.json())
        .then((d) => setUploads((d?.docs ?? []) as UploadRecord[]))
        .catch(() => {}),
    [],
  )

  useEffect(() => {
    void loadUploads()
    void fetch(`${getClientSideURL()}/api/icon/phosphor`)
      .then((r) => r.json())
      .then((d) => setPhosphor((d?.names ?? []) as string[]))
      .catch(() => {})
    // What editors are ACTUALLY offered right now. Needed because an unsaved or
    // empty list still offers the bundled set, and a screen showing nothing
    // ticked beside a picker full of icons is the disagreement this replaced.
    void fetch(`${getClientSideURL()}/api/icon/library`)
      .then((r) => r.json())
      .then((d) => setEffective(((d?.icons ?? []) as Entry[]).map((i) => i.value)))
      .catch(() => {})
  }, [loadUploads])

  const stored = (value ?? []).filter(Boolean)
  // The ticks show what is offered, not what happens to be stored. An empty list
  // means the bundled set is in force, so the bundled set is what appears ticked
  // — and the first tick or untick writes that whole set out explicitly, which is
  // what makes the next save mean exactly what the screen showed.
  const ticked = stored.length ? stored : effective
  const tickedSet = new Set(ticked)

  const toggle = (v: string) => {
    if (readOnly) return
    setValue(tickedSet.has(v) ? ticked.filter((n) => n !== v) : [...ticked, v])
  }

  const upload = async (file: File) => {
    setBusy('Uploading…')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('_payload', JSON.stringify({ name: file.name.replace(/\.svg$/i, ''), colour: 'inherit' }))
      const res = await fetch(`${getClientSideURL()}/api/icons`, {
        method: 'POST',
        credentials: 'include',
        body,
      })
      const json = await res.json()
      const id = json?.doc?.id
      if (!id) {
        // Said out loud rather than swallowed: an SVG Payload refuses (one
        // carrying script, most often) must not look like a silent no-op.
        setBusy(
          json?.errors?.[0]?.data?.errors?.[0]?.message ||
            json?.errors?.[0]?.message ||
            'That file could not be uploaded.',
        )
        return
      }
      await loadUploads()
      // Ticked on arrival: you uploaded it in order to use it.
      setValue([...ticked, `${UPLOAD}${id}`])
      setBusy(null)
    } catch {
      setBusy('That file could not be uploaded.')
    }
  }

  const patchUpload = (id: string | number, data: Record<string, unknown>) =>
    fetch(`${getClientSideURL()}/api/icons/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(() => loadUploads())
      .catch(() => setBusy('That change could not be saved.'))

  const removeUpload = (id: string | number, value: string) =>
    fetch(`${getClientSideURL()}/api/icons/${id}`, { method: 'DELETE', credentials: 'include' })
      .then((r) => r.json())
      .then((json) => {
        // The delete guard refuses an icon still in use and names the documents.
        // Surfaced here rather than swallowed — a Delete button that silently
        // does nothing is worse than one that explains itself.
        if (json?.errors?.length) {
          setBusy(json.errors[0]?.message ?? 'That icon could not be deleted.')
          return
        }
        setBusy(null)
        setEditing(null)
        setValue(ticked.filter((n) => n !== value))
        return loadUploads()
      })
      .catch(() => setBusy('That icon could not be deleted.'))

  // Uploads first — they are the ones somebody chose deliberately.
  const base: Entry[] = [
    ...uploads.map((u) => ({
      value: `${UPLOAD}${u.id}`,
      label: u.name || `Icon ${u.id}`,
      upload: u,
    })),
    ...phosphor.map((n) => ({ value: n, label: n.replace(/-/g, ' ') })),
  ]

  // Anything offered that neither list produced. Ten of the bundled icons are
  // ALIASES — `activity` is Phosphor's Pulse, `mail` its Envelope — so they are
  // absent from the Phosphor name list and would have had no tile: ticked,
  // offered to editors, and impossible to untick from the only screen that
  // manages them. Measured: 101 ticked against 91 tiles.
  const known = new Set(base.map((e) => e.value))
  const entries: Entry[] = [
    ...base,
    ...ticked.filter((v) => !known.has(v)).map((v) => ({ value: v, label: v.replace(/-/g, ' ') })),
  ]

  const q = query.trim().toLowerCase()
  const shown = entries.filter(
    (e) =>
      (!onlyTicked || tickedSet.has(e.value)) &&
      (!q || e.label.toLowerCase().includes(q) || e.value.toLowerCase().includes(q)),
  )

  return (
    <div className="field-type vf-icon-library">
      <FieldLabel label={field?.label || 'Icons editors can choose'} path={path} />

      <div className="vf-icon-library__bar">
        <input
          type="text"
          className="vf-icon-select__search"
          placeholder={`Search ${entries.length.toLocaleString()} icons…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="vf-icon-library__toggle">
          <input
            type="checkbox"
            checked={onlyTicked}
            onChange={(e) => setOnlyTicked(e.target.checked)}
          />
          Only ticked
        </label>
        {!readOnly ? (
          <label className="vf-icon-library__upload">
            Upload SVG
            <input
              type="file"
              accept="image/svg+xml,.svg"
              onChange={(e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (f) void upload(f)
              }}
            />
          </label>
        ) : null}
      </div>

      <p className="vf-icon-library__count">
        {ticked.length ? (
          <>
            <strong>{ticked.length.toLocaleString()}</strong> ticked of{' '}
            {entries.length.toLocaleString()} — showing {shown.length.toLocaleString()}.
            {!stored.length ? ' (The set the site ships with — change any of it and it is saved.)' : ''}
          </>
        ) : (
          // Honest about the backstop: unticking everything cannot leave an
          // editor with no icons, so say what they will actually get.
          <>
            Nothing ticked, so editors are offered the built-in set. Tick an icon and this list takes
            over.
          </>
        )}
        {busy ? <span className="vf-icon-library__busy"> {busy}</span> : null}
      </p>

      {shown.length === 0 ? (
        <p className="vf-icon-select__none">Nothing matches “{query}”.</p>
      ) : (
        <div className="vf-icon-select__grid vf-icon-library__grid">
          {shown.map((e) => (
            <div
              key={e.value}
              className={`vf-icon-select__option vf-icon-library__tile${
                tickedSet.has(e.value) ? ' vf-icon-select__option--selected' : ''
              }`}
            >
              <label className="vf-icon-library__check" title={e.label}>
                <input
                  type="checkbox"
                  checked={tickedSet.has(e.value)}
                  disabled={readOnly}
                  onChange={() => toggle(e.value)}
                />
                <Artwork value={e.value} observer={observer} />
                <span>{e.label}</span>
              </label>
              {e.upload && !readOnly ? (
                <button
                  type="button"
                  className="vf-icon-library__edit"
                  onClick={() => setEditing(editing === e.value ? null : e.value)}
                >
                  {editing === e.value ? 'Close' : 'Edit'}
                </button>
              ) : null}

              {e.upload && editing === e.value ? (
                <div className="vf-icon-library__panel">
                  {/* What the SITE will show, on both bands. Payload previews the
                      uploaded FILE; the site renders markup rebuilt from it with
                      the colours stripped, and the two can look nothing alike —
                      measured, a navy-and-pink upload renders as one shape. The
                      artwork here is the reconstructed one, so it cannot lie. */}
                  <div className="vf-icon-preview__swatches">
                    {(['light', 'dark'] as const).map((band) => (
                      <div
                        key={band}
                        className={`vf-icon-preview__swatch vf-icon-preview__swatch--${band}`}
                      >
                        <span
                          aria-hidden
                          className="vf-icon-select__preview"
                          style={{
                            width: 34,
                            height: 34,
                            WebkitMaskImage: `url("${artworkUrl(e.value)}")`,
                            maskImage: `url("${artworkUrl(e.value)}")`,
                          }}
                        />
                        <span>{band === 'light' ? 'Light band' : 'Dark band'}</span>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    aria-label="Icon name"
                    defaultValue={e.upload.name ?? ''}
                    onBlur={(ev) => void patchUpload(e.upload!.id, { name: ev.target.value })}
                  />
                  <select
                    aria-label="Default colour"
                    defaultValue={e.upload.colour ?? INHERIT_COLOR}
                    onChange={(ev) => void patchUpload(e.upload!.id, { colour: ev.target.value })}
                  >
                    <option value={INHERIT_COLOR}>Follows the band</option>
                    {BRAND_TEXT_COLORS.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="vf-icon-library__delete"
                    onClick={() => void removeUpload(e.upload!.id, e.value)}
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {field?.admin?.description ? (
        <div className="field-description">{field.admin.description}</div>
      ) : null}
    </div>
  )
}

export default IconLibraryPicker
