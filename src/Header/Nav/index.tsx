'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { richTextToPlain } from '@/utilities/lexicalText'
import { CMSLink } from '@/components/Link'

type NavItem = NonNullable<HeaderType['navItems']>[number]
type SubItem = NonNullable<NavItem['subItems']>[number]

/**
 * Renders the (up to) three-level nav menu from the Header global.
 *
 * Two behaviours over one markup tree:
 *
 * - **Desktop (>1024px)** — dropdowns open on hover (and now `:focus-within`),
 *   driven entirely by CSS. No state is involved and none should be: see the
 *   `.nav-dropdown` / `.sub-dropdown` rules in globals.css.
 * - **Below 1024px** — the drawer is an ACCORDION. It used to force every level
 *   visible at once (`position: static; visibility: visible` on both dropdown
 *   levels), which flattened 7 top-level items, 13 sub-items and 8 sub-sub-items
 *   into a 28-link scroll. Now a group opens only when its toggle is pressed.
 *
 * The toggle is a SIBLING of the parent's link, never a wrapper around it —
 * wrapping would make the parent's own page unreachable on touch, since the tap
 * would always be caught by the expander.
 */
export const HeaderNav: React.FC<{ data: HeaderType; menuOpen?: boolean }> = ({
  data,
  menuOpen = false,
}) => {
  const navItems = data?.navItems || []

  // One group open at a time. A `Set` would allow several, but the drawer is
  // capped at 78vh and scrolls; keeping one open means the item you just tapped
  // is still on screen after it expands.
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  // Collapse every group when the drawer closes, so reopening it starts from the
  // grouped view rather than wherever the last visit was left. Adjusted during
  // render, matching the route-change reset in Component.client.tsx — an effect
  // would paint the stale open group for one frame.
  const [wasOpen, setWasOpen] = React.useState(menuOpen)
  if (wasOpen !== menuOpen) {
    setWasOpen(menuOpen)
    if (!menuOpen) setOpenIndex(null)
  }

  return (
    <ul className="nav-links">
      {navItems.map((item, i) => {
        const subItems: SubItem[] = item.subItems || []
        const hasDropdown = subItems.length > 0
        const isOpen = openIndex === i
        const panelId = `nav-group-${i}`

        return (
          <li key={i} className={cn(hasDropdown && 'has-dropdown', isOpen && 'is-open')}>
            <CMSLink
              {...item.link}
              appearance="inline"
              className={cn('nav-top', hasDropdown && 'nav-caret')}
            />

            {hasDropdown ? (
              <>
                {/* Drawer-only control; hidden above the collapse breakpoint,
                    where hover does this job. */}
                <button
                  type="button"
                  className="nav-expand"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  // `richTextToPlain`, not interpolation: a link's `label` is an
                  // inlineRichTextField, so `${item.link.label}` renders the
                  // literal "[object Object]" — inaudibly wrong, since this only
                  // ever reaches a screen reader. Invariant 46.
                  aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${
                    richTextToPlain(item.link?.label) || 'menu'
                  }`}
                  onClick={() => setOpenIndex((cur) => (cur === i ? null : i))}
                />
                <div className="nav-dropdown" id={panelId}>
                  {subItems.map((sub, j) => {
                    const subSubItems = sub.subSubItems || []

                    if (subSubItems.length > 0) {
                      return (
                        <div className="has-submenu" key={j}>
                          <CMSLink {...sub.link} appearance="inline" />
                          <div className="sub-dropdown">
                            {subSubItems.map((subSub, k) => (
                              <CMSLink key={k} {...subSub.link} appearance="inline" />
                            ))}
                          </div>
                        </div>
                      )
                    }

                    return <CMSLink key={j} {...sub.link} appearance="inline" />
                  })}
                </div>
              </>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
