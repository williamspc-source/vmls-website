'use client'
import { type RichTextValue } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import React, { useId, useState } from 'react'

import { cn } from '@/utilities/ui'
import { Icon } from '@/components/Icon'

type TabItem = { label: RichTextValue; icon?: string | null; panel: React.ReactNode }

export const TabsClient: React.FC<{
  items: TabItem[]
  tabStyle?: 'pills' | 'underline'
  defaultTab?: number
}> = ({ items, tabStyle = 'pills', defaultTab = 0 }) => {
  const [active, setActive] = useState(
    Math.min(Math.max(defaultTab || 0, 0), Math.max(items.length - 1, 0)),
  )
  const baseId = useId()

  if (!items || items.length === 0) return null

  const isPills = tabStyle !== 'underline'

  const tablist = (
    <div
      role="tablist"
      aria-label="Sections"
      className={cn(
        'vf-tabs__tablist',
        isPills ? 'services-tabs' : 'mb-8 flex flex-wrap gap-6 border-b border-border',
      )}
    >
      {items.map((item, i) => {
        const selected = i === active
        return (
          <button
            key={i}
            role="tab"
            id={`${baseId}-tab-${i}`}
            aria-selected={selected}
            aria-controls={`${baseId}-panel-${i}`}
            onClick={() => setActive(i)}
            className={cn(
              'vf-tabs__tab',
              isPills
                ? cn('tab-btn', selected && 'active')
                : cn(
                    'font-heading text-sm font-semibold -mb-px border-b-2 px-1 py-3 transition-colors',
                    selected
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-primary',
                  ),
              selected && 'vf-tabs__tab--active',
            )}
          >
            {item.icon ? (
              <span className="tab-icon">
                <Icon name={item.icon} className="size-5" />
              </span>
            ) : null}
            <InlineRichText data={item.label} />
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="vf-tabs__wrap">
      {/* Pills are centered (inline-flex inside a centered bar); underline stays left-aligned.
          Centring and the gap below live in globals.css — as inline styles they
          outranked every stylesheet, so the spacing could not be corrected or
          overridden by a Custom Styles preset. */}
      {isPills ? (
        <div className="vf-tabs__tabbar">{tablist}</div>
      ) : (
        tablist
      )}

      {items.map((item, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`${baseId}-panel-${i}`}
          aria-labelledby={`${baseId}-tab-${i}`}
          hidden={i !== active}
          className="vf-tabs__panel"
        >
          {i === active ? item.panel : null}
        </div>
      ))}
    </div>
  )
}
