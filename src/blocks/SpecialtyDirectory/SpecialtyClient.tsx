'use client'

import { hasRichText, type RichTextValue } from '@/utilities/lexicalText'
// Honorifics for the initials avatar, shared with `splitPersonName` so the
// initials and the directory's sort order cannot disagree about what is a title.
import { TITLE_TOKENS } from '@/utilities/personName'
import { InlineRichText } from '@/components/RichText/Inline'
import React, { useState } from 'react'
import Link from 'next/link'

import { Icon } from '@/components/Icon'
import { cn } from '@/utilities/ui'
import { focalImgStyle } from '@/utilities/focalPoint'
import { specialistPath } from '@/utilities/routes'

export type RosterPerson = {
  id: string
  name: string
  position: string | null
  slug: string | null
  locations: string[]
  photoUrl: string | null
  photoFocus: string | null
  photoZoom: number | null
}
export type SpecialtyEntry = {
  id: string
  title: string
  description: RichTextValue
  categoryId: string | null
  keyAreas: string[]
  specialists: RosterPerson[]
}
export type Category = { id: string; title: string; icon?: string | null }

// Fallback filter-bar icons by category title, used when a Specialty Category
// has no `icon` set in the CMS. Category-driven icons take precedence so the
// bar stays fully admin-editable.
const CATEGORY_ICON_FALLBACK: Record<string, string> = {
  Surgery: 'bone',
  'Psychiatry & Psychology': 'chats',
  Medicine: 'stethoscope',
  'Allied Health': 'handshake',
}

const initialsOf = (name: string): string => {
  const words = name.replace(/\./g, '').split(/\s+/).filter(Boolean)
  const significant = words.filter((w) => !TITLE_TOKENS.has(w.toLowerCase()))
  const pool = significant.length ? significant : words
  if (pool.length === 0) return '?'
  if (pool.length === 1) return pool[0].slice(0, 2).toUpperCase()
  return (pool[0][0] + pool[pool.length - 1][0]).toUpperCase()
}

export const SpecialtyClient: React.FC<{
  categories: Category[]
  entries: SpecialtyEntry[]
  showFilterBar: boolean
  showRosters: boolean
  showKeyAreas: boolean
  allTabLabel?: RichTextValue
  emptyLabel?: RichTextValue
}> = ({ categories, entries, showFilterBar, showRosters, showKeyAreas, allTabLabel, emptyLabel }) => {
  const [cat, setCat] = useState<string>('all')
  // Open the first (visible) card by default; multiple cards may be open at once.
  const [openIds, setOpenIds] = useState<Set<string>>(() =>
    entries[0] ? new Set([entries[0].id]) : new Set(),
  )

  const filterFor = (next: string) =>
    next === 'all' ? entries : entries.filter((e) => e.categoryId === next)
  const visible = filterFor(cat)

  const handleFilter = (next: string) => {
    setCat(next)
    // Match the reference: switching filter opens the first visible card, closing the rest.
    const first = filterFor(next)[0]
    setOpenIds(first ? new Set([first.id]) : new Set())
  }

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const nextSet = new Set(prev)
      if (nextSet.has(id)) nextSet.delete(id)
      else nextSet.add(id)
      return nextSet
    })

  return (
    <div className="vf-specialty-directory">
      {showFilterBar && categories.length ? (
        <div className="vf-specialty-filterbar" role="group" aria-label="Filter specialties by category">
          <button
            type="button"
            className={cn('vf-specialty-filter-tile', cat === 'all' && 'is-active')}
            aria-pressed={cat === 'all'}
            onClick={() => handleFilter('all')}
          >
            <Icon name="squares-four" className="vf-specialty-filter-tile__icon" />
            {hasRichText(allTabLabel) ? <InlineRichText data={allTabLabel} /> : 'All Specialties'}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={cn('vf-specialty-filter-tile', cat === c.id && 'is-active')}
              aria-pressed={cat === c.id}
              onClick={() => handleFilter(c.id)}
            >
              <Icon
                name={c.icon || CATEGORY_ICON_FALLBACK[c.title]}
                className="vf-specialty-filter-tile__icon"
              />
              {c.title}
            </button>
          ))}
        </div>
      ) : null}

      <div className="vf-specialty-cards">
        {visible.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            {hasRichText(emptyLabel) ? (
              <InlineRichText data={emptyLabel} />
            ) : (
              'No specialties in this category yet.'
            )}
          </p>
        ) : null}

        {visible.map((e) => {
          const isOpen = openIds.has(e.id)
          const panelId = `vf-specialty-panel-${e.id}`
          const hasRoster = showRosters && e.specialists.length > 0
          return (
            <div key={e.id} className={cn('vf-specialty-card', isOpen && 'is-open')}>
              <div className="vf-specialty-summary">
                <div className="vf-specialty-namerow">
                  <h3>{e.title}</h3>
                </div>
                <InlineRichText as="p" className="vf-specialty-copy" data={e.description} />
                {showKeyAreas && e.keyAreas.length ? (
                  <div className="vf-specialty-tags">
                    {e.keyAreas.map((k) => (
                      <span key={k}>{k}</span>
                    ))}
                  </div>
                ) : null}
                {hasRoster ? (
                  <button
                    type="button"
                    className="vf-specialty-toggle"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(e.id)}
                  >
                    <span>{isOpen ? 'Hide specialists' : 'View specialists'}</span>
                    <span className="vf-specialty-toggle__chevron" aria-hidden />
                  </button>
                ) : null}
              </div>

              {hasRoster && isOpen ? (
                <div className="vf-specialty-panel" id={panelId}>
                  <div className="vf-specialty-people">
                    {e.specialists.map((p) => (
                      <div key={p.id} className="vf-specialty-person">
                        <span className="vf-specialty-avatar">
                          {p.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.photoUrl}
                              alt=""
                              loading="lazy"
                              style={focalImgStyle(p.photoFocus, p.photoZoom)}
                            />
                          ) : (
                            initialsOf(p.name)
                          )}
                        </span>
                        <span>
                          <span className="vf-specialty-person__name">{p.name}</span>
                          {p.position ? (
                            <span className="vf-specialty-person__title">{p.position}</span>
                          ) : null}
                          {p.locations.length ? (
                            <span className="vf-specialty-person__loc">{p.locations.join(' | ')}</span>
                          ) : null}
                        </span>
                        <span className="vf-specialty-person__actions">
                          {specialistPath(p.slug) ? (
                            <Link className="vf-specialty-profile-link" href={specialistPath(p.slug)!}>
                              View Profile
                            </Link>
                          ) : null}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
