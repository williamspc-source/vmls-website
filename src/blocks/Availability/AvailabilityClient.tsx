'use client'

import { InlineRichText } from '@/components/RichText/Inline'
import { type RichTextValue } from '@/utilities/lexicalText'
import React, { useMemo, useState } from 'react'

import { cn } from '@/utilities/ui'
import { focalImgStyle } from '@/utilities/focalPoint'

export type AvailabilityChip = {
  id: string
  time: string
  end: string
  type: string
  modeClass: string
  /** AvailabilitySessions → Notes. Surfaced as the slot's tooltip/label. */
}

export type AvailabilityRow = {
  id: string
  name: string
  position?: RichTextValue
  initials: string
  photoUrl?: string | null
  photoFocus?: string | null
  photoZoom?: number | null
  accreditations: string[]
  dates: { date: string; chips: AvailabilityChip[] }[]
}

export type EnquiryConfig = {
  email: string
  subject: string
  bodyIntro: string
  bodyFooter: string
}

// Editable UI copy, sourced from the Specialist Availability global's `labels`
// group and threaded in from the server Component.
export type AvailabilityLabels = {
  inPerson: string
  telehealth: string
  either: string
  selectionHint: string
  clear: string
  sendEnquiry: string
  sessionsSelectedTemplate: string
}

type SelectedSession = { spec: string; date: string; time: string; end: string; type: string }

export const AvailabilityClient: React.FC<{
  rows: AvailabilityRow[]
  enquiry: EnquiryConfig
  labels: AvailabilityLabels
  showLegend?: boolean
}> = ({ rows, enquiry, labels, showLegend = true }) => {
  const legend = [
    { cls: 'sa-inperson', label: labels.inPerson },
    { cls: 'sa-telehealth', label: labels.telehealth },
    { cls: 'sa-either', label: labels.either },
  ]

  // id → selected session details, plus the date for grouping the email.
  const [selected, setSelected] = useState<Map<string, SelectedSession>>(new Map())

  const count = selected.size

  const toggle = (chip: AvailabilityChip, specName: string, date: string) => {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(chip.id)) {
        next.delete(chip.id)
      } else {
        next.set(chip.id, { spec: specName, date, time: chip.time, end: chip.end, type: chip.type })
      }
      return next
    })
  }

  const clear = () => setSelected(new Map())

  const sendEnquiry = () => {
    if (selected.size === 0) return

    // Group selected sessions by specialist for a readable email.
    const bySpec = new Map<string, SelectedSession[]>()
    selected.forEach((s) => {
      if (!bySpec.has(s.spec)) bySpec.set(s.spec, [])
      bySpec.get(s.spec)!.push(s)
    })

    const lines: string[] = []
    bySpec.forEach((sessions, spec) => {
      lines.push(`${spec}:`)
      sessions.forEach((s) => lines.push(`  - ${s.date}, ${s.time}-${s.end} (${s.type})`))
      lines.push('')
    })

    const body = `${enquiry.bodyIntro}\n\n${lines.join('\n')}\n${enquiry.bodyFooter}`
    window.location.href = `mailto:${enquiry.email}?subject=${encodeURIComponent(
      enquiry.subject,
    )}&body=${encodeURIComponent(body)}`
  }

  const hasAnySessions = useMemo(() => rows.some((r) => r.dates.length > 0), [rows])

  if (rows.length === 0) return null

  return (
    <div className="sa">
      {showLegend ? (
        <div className="sa-legend" aria-label="Session type colour key">
          {legend.map((l) => (
            <div className="sa-legend-item" key={l.cls}>
              <span className={cn('sa-legend-swatch', l.cls)} />
              <span className="sa-legend-label">{l.label}</span>
            </div>
          ))}
          {hasAnySessions ? (
            <div className="sa-legend-item sa-legend-hint">
              <span className="sa-legend-label">{labels.selectionHint}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="sa-list">
      {rows.map((row) => (
        <div className="sa-card" key={row.id}>
          <div className="sa-card-top">
            <div className="sa-avatar">
              <div className="sa-avatar-inner">
                {row.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="sa-photo-img"
                    src={row.photoUrl}
                    alt={row.name}
                    loading="lazy"
                    width={150}
                    height={170}
                    style={focalImgStyle(row.photoFocus, row.photoZoom)}
                  />
                ) : (
                  <span className="sa-avatar-initials" aria-hidden="true">
                    {row.initials}
                  </span>
                )}
              </div>
            </div>

            <div className="sa-content">
              <div className="sa-name">{row.name}</div>
              <InlineRichText as="div" className="sa-title" data={row.position} />
              {row.accreditations.length > 0 ? (
                <div className="sa-accred">{row.accreditations.join('; ')}</div>
              ) : null}
            </div>

            <div className="sa-slots">
              {row.dates.map((d) => (
                <div className="sa-date-group" key={d.date}>
                  <div className="sa-date">{d.date}</div>
                  <div className="sa-chips">
                    {d.chips.map((chip) => {
                      const isSel = selected.has(chip.id)
                      return (
                        <button
                          type="button"
                          key={chip.id}
                          className={cn('sa-chip', chip.modeClass, isSel && 'is-selected')}
                          aria-pressed={isSel}
                          // The visible text is only the time range, so the mode
                          // (In-person / Telehealth / Either) would otherwise be
                          // conveyed by chip colour alone — which a screen reader
                          // cannot report. AvailabilitySessions → Internal note is
                          // deliberately NOT here: it is staff-only.
                          aria-label={`${chip.time} – ${chip.end}, ${chip.type}`}
                          onClick={() => toggle(chip, row.name, d.date)}
                        >
                          {chip.time} – {chip.end}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      </div>

      <div className={cn('sa-bar', count > 0 && 'active')} role="region" aria-label="Selected sessions">
        <span className="sa-bar-count">
          {labels.sessionsSelectedTemplate
            .replace('{count}', String(count))
            .replace('{noun}', count === 1 ? 'session' : 'sessions')}
        </span>
        <div className="sa-bar-actions">
          <button type="button" className="sa-bar-clear" onClick={clear}>
            {labels.clear}
          </button>
          <button type="button" className="btn btn-primary" onClick={sendEnquiry}>
            {labels.sendEnquiry}
          </button>
        </div>
      </div>
    </div>
  )
}
