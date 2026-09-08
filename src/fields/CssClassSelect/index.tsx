'use client'
import { FieldLabel, ReactSelect, useField } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import { getClientSideURL } from '@/utilities/getURL'
import { CODE_DEFINED_CLASSES } from '../codeDefinedClasses'

type Option = { label: string; value: string }

type Props = {
  path: string
  field?: { label?: string; admin?: { description?: string } }
}

/**
 * Strict multi-select of class names defined in the Custom Styles global. Editors
 * can ONLY pick defined presets (no free text). Stores a string[] of class names.
 */
export const CssClassSelect: React.FC<Props> = ({ path, field }) => {
  const { value, setValue } = useField<string[]>({ path })
  const [options, setOptions] = useState<Option[]>([])

  useEffect(() => {
    let active = true
    const load = () =>
      fetch(`${getClientSideURL()}/api/globals/custom-styles?depth=0`, { credentials: 'include' })
        .then((r) => r.json())
        .then((data) => {
          if (!active) return
          const presets = (data?.presets || []) as { name?: string; label?: string }[]
          setOptions(
            presets
              .filter((p) => p.name)
              .map((p) => ({ label: p.label || (p.name as string), value: p.name as string })),
          )
        })
        .catch(() => {})

    load()
    // Presets are usually created in a second tab (Globals → Custom Styles).
    // Without this, the new class wouldn't appear here until a full page reload.
    window.addEventListener('focus', load)
    return () => {
      active = false
      window.removeEventListener('focus', load)
    }
  }, [])

  // Options = Custom Styles presets + the layout classes defined in globals.css
  // (see codeDefinedClasses.ts for why) + anything already stored that neither
  // list knows about, so no stored value is ever un-reselectable.
  const known = new Set(options.map((o) => o.value))
  const codeDefined: Option[] = CODE_DEFINED_CLASSES.filter((c) => !known.has(c.name)).map((c) => ({
    label: `${c.label} — in code`,
    value: c.name,
  }))
  const listed = new Set([...known, ...codeDefined.map((o) => o.value)])
  const orphans: Option[] = (value || [])
    .filter((v) => !listed.has(v))
    .map((v) => ({ label: v, value: v }))
  const allOptions: Option[] = [...options, ...codeDefined, ...orphans]

  const selected: Option[] = (value || []).map(
    (v) => allOptions.find((o) => o.value === v) || { label: v, value: v },
  )

  const label = field?.label || 'Custom CSS class(es)'
  const description = field?.admin?.description

  return (
    <div className="field-type">
      <FieldLabel label={label} path={path} />
      <ReactSelect
        isMulti
        isClearable
        options={allOptions}
        value={selected}
        noOptionsMessage={() => 'No presets defined yet (Globals → Custom Styles)'}
        onChange={(opt: unknown) => {
          const arr = Array.isArray(opt) ? (opt as Option[]) : opt ? [opt as Option] : []
          setValue(arr.map((o) => o.value))
        }}
      />
      {description ? <div className="field-description">{description}</div> : null}
    </div>
  )
}
