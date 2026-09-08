'use client'
import { FieldLabel, useField } from '@payloadcms/ui'
import React, { useState } from 'react'

import { tokenDefaults } from './tokenDefaults'

type Props = {
  path: string
  field?: {
    label?: string
    admin?: { description?: string; placeholder?: string }
  }
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

/** #abc → #aabbcc, so <input type="color"> (which only accepts 6-digit) round-trips. */
const toLongHex = (v: string): string =>
  v.length === 4 ? `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}` : v

/**
 * Colour field: a text input with a live swatch beside it.
 *
 * The **text value is authoritative and the swatch is derived** — never the
 * other way round. That matters because a large share of the real values in this
 * project cannot be represented by `<input type="color">` at all: the Design
 * System ships `var(--primary)`, Site Settings ships `rgba(255,255,255,0.82)`
 * and `rgba(255,255,255,0.35)`, and shadcn tokens use `oklch(...)`. A picker
 * that bound the native input directly to the value would silently rewrite every
 * one of those to `#000000` the first time an editor focused the field.
 *
 * So: hex values get the native picker; anything else gets a read-only preview
 * chip and keeps its exact text. Empty stays trivially reachable, because empty
 * means "use the built-in default" everywhere in this codebase.
 */
export const ColorPicker: React.FC<Props> = ({ path, field }) => {
  const { value, setValue, showError, errorMessage } = useField<string>({ path })

  // Local mirror so typing (and dragging in the native picker, which fires on
  // every frame) doesn't thrash Payload's form state on each keystroke.
  //
  // Re-syncs when Payload's own value changes underneath us — a form reset, an
  // autosave revert, or another component calling setValue. Done as a
  // render-phase adjustment rather than an effect: React's documented pattern for
  // "a piece of state derived from a prop that also needs to be editable", and it
  // avoids the extra committed render an effect would cause on every keystroke's
  // round-trip through form state.
  const external = value ?? ''
  const [draft, setDraft] = useState<string>(external)
  const [syncedValue, setSyncedValue] = useState<string>(external)
  if (syncedValue !== external) {
    setSyncedValue(external)
    setDraft(external)
  }

  const commit = (next: string) => {
    setDraft(next)
    if (next !== external) setValue(next)
  }

  const trimmed = draft.trim()
  const isHex = HEX.test(trimmed)
  const isEmpty = trimmed === ''
  const placeholder = field?.admin?.placeholder
  const label = field?.label || 'Colour'
  const description = field?.admin?.description

  return (
    <div className="field-type" data-color-field={path}>
      <FieldLabel label={label} path={path} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* The preview resolves var(--x) against the SITE palette, not Payload's
            admin chrome — see tokenDefaults for why that distinction matters. */}
        <span
          aria-hidden
          style={{
            ...tokenDefaults,
            width: 34,
            height: 34,
            flex: '0 0 auto',
            borderRadius: 6,
            border: '1px solid var(--theme-elevation-150, #ccc)',
            // Checkerboard shows through for empty values and alpha colours.
            backgroundImage: isEmpty
              ? 'linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%),linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%)'
              : undefined,
            backgroundSize: isEmpty ? '10px 10px' : undefined,
            backgroundPosition: isEmpty ? '0 0, 5px 5px' : undefined,
            background: isEmpty ? undefined : trimmed,
          }}
        />

        {isHex ? (
          <input
            aria-label={`${label} colour swatch`}
            type="color"
            value={toLongHex(trimmed)}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            style={{ width: 34, height: 34, padding: 0, border: 'none', background: 'none' }}
          />
        ) : null}

        <input
          type="text"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          style={{
            flex: 1,
            minWidth: 0,
            height: 34,
            padding: '0 10px',
            borderRadius: 4,
            border: '1px solid var(--theme-elevation-150, #ccc)',
            background: 'var(--theme-input-bg, #fff)',
            color: 'var(--theme-elevation-800, #333)',
            fontFamily: 'inherit',
            fontSize: '1rem',
          }}
        />

        {!isEmpty ? (
          <button
            type="button"
            className="btn btn--style-secondary btn--size-small"
            onClick={() => commit('')}
            title="Clear — use the built-in default"
            style={{ margin: 0 }}
          >
            Reset
          </button>
        ) : null}
      </div>

      {!isEmpty && !isHex ? (
        <div className="field-description" style={{ opacity: 0.75 }}>
          Not a plain hex colour, so the picker is hidden and the value is kept exactly as typed.
        </div>
      ) : null}
      {description ? <div className="field-description">{description}</div> : null}
      {showError && errorMessage ? <div className="field-error">{errorMessage}</div> : null}
    </div>
  )
}
