'use client'
import { type RichTextValue } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import React, { useMemo, useState } from 'react'

import { Icon } from '@/components/Icon'
import { cn } from '@/utilities/ui'

export type DirectoryCategory = {
  id: string
  title: string
  icon?: string | null
}

export type DirectoryItem = {
  id: string
  categoryId: string | null
  title: string
  iconName?: string | null
  description?: RichTextValue
  keyAreas: string[]
  /** Number of specialists in this specialty's roster. */
  count: number
  /** Server-rendered roster list (specialists), or null when empty. */
  roster: React.ReactNode
}

export const SpecialtyDirectoryClient: React.FC<{
  categories: DirectoryCategory[]
  items: DirectoryItem[]
  showFilterBar?: boolean | null
  showKeyAreas?: boolean | null
  showRosters?: boolean | null
}> = ({ categories, items, showFilterBar, showKeyAreas, showRosters }) => {
  const [activeCat, setActiveCat] = useState<string>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const visible = useMemo(
    () => (activeCat === 'all' ? items : items.filter((i) => i.categoryId === activeCat)),
    [activeCat, items],
  )

  return (
    <div className="vf-spec-dir">
      {showFilterBar && categories.length > 0 ? (
        <div style={{ textAlign: 'center', marginBottom: 'var(--gap-normal)' }}>
          <div className="services-tabs" role="tablist" aria-label="Specialty categories">
            <button
              type="button"
              role="tab"
              aria-selected={activeCat === 'all'}
              className={cn('tab-btn inline-flex items-center gap-1.5', activeCat === 'all' && 'active')}
              onClick={() => setActiveCat('all')}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={activeCat === c.id}
                className={cn('tab-btn inline-flex items-center gap-1.5', activeCat === c.id && 'active')}
                onClick={() => setActiveCat(c.id)}
              >
                {c.icon ? <Icon name={c.icon} className="size-4" /> : null}
                {c.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="vf-spec-dir__list flex flex-col gap-3">
        {visible.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No specialties in this category yet.</p>
        ) : null}

        {visible.map((item) => {
          const open = openId === item.id
          const canExpand = Boolean(showRosters && item.count > 0)

          const header = (
            <>
              <span className="flex min-w-0 items-center gap-3">
                {item.iconName ? (
                  <span className="shrink-0 text-primary">
                    <Icon name={item.iconName} />
                  </span>
                ) : null}
                <span className="min-w-0">
                  <span className="block font-heading text-base font-semibold">{item.title}</span>
                  {item.description ? (
                    <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">
                      <InlineRichText data={item.description} />
                    </span>
                  ) : null}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                {showRosters && item.count > 0 ? (
                  <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                    {item.count} {item.count === 1 ? 'specialist' : 'specialists'}
                  </span>
                ) : null}
                {canExpand ? (
                  <Icon
                    name="caret-right"
                    className={cn('size-5 shrink-0 transition-transform', open && 'rotate-90')}
                  />
                ) : null}
              </span>
            </>
          )

          return (
            <div
              key={item.id}
              className={cn(
                'vf-spec-dir__item overflow-hidden rounded-xl border border-border',
                open && 'is-open',
              )}
            >
              {canExpand ? (
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-black/[0.03]"
                >
                  {header}
                </button>
              ) : (
                <div className="flex items-center justify-between gap-4 px-5 py-4">{header}</div>
              )}

              {showKeyAreas && item.keyAreas.length > 0 ? (
                <div className="flex flex-wrap gap-2 px-5 pb-4">
                  {item.keyAreas.map((area, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              ) : null}

              {open && canExpand ? (
                <div className="vf-spec-dir__panel border-t border-border px-5 py-4">{item.roster}</div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
