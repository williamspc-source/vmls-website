'use client'

import { type RichTextValue } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import React, { useState } from 'react'

import { Icon } from '@/components/Icon'
import { cn } from '@/utilities/ui'

export type WhyVerifyItem = {
  icon?: string | null
  title?: RichTextValue
  body?: RichTextValue
  id?: string | null
}

/**
 * Interactive "what sets us apart" accordion. Mirrors the design reference:
 * the grid always carries `is-interactive`, each row toggles `is-active`, and
 * multiple rows may be open at once. The +/− affordance and expand/collapse are
 * driven entirely by the ported `.why-*` CSS.
 */
export const WhyVerifyClient: React.FC<{ items: WhyVerifyItem[] }> = ({ items }) => {
  const [openSet, setOpenSet] = useState<Set<number>>(() => new Set())

  const toggle = (i: number) =>
    setOpenSet((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  return (
    <div className="why-grid is-interactive">
      {items.map((item, i) => {
        const isActive = openSet.has(i)
        return (
          <div
            key={item.id || i}
            className={cn('why-card', isActive && 'is-active')}
            role="button"
            tabIndex={0}
            aria-expanded={isActive}
            onClick={() => toggle(i)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                toggle(i)
              }
            }}
          >
            {item.icon ? (
              <div className="why-icon" aria-hidden>
                <Icon name={item.icon} />
              </div>
            ) : null}
            <InlineRichText as="h3" data={item.title} />
            <InlineRichText as="p" data={item.body} />
          </div>
        )
      })}
    </div>
  )
}
