'use client'

import React, { useEffect, useRef, useState } from 'react'

import { cn } from '@/utilities/ui'

export type SectionNavItem = { label: string; anchorId: string }

// Client-side scroll-spy for the sticky section nav. An IntersectionObserver
// watches each target section (#anchorId) and marks the topmost in-view item as
// active (`.is-active`). Clicking a pill smooth-scrolls to its section, offset by
// the sticky header + nav height so the section heading isn't hidden underneath.
export const SectionNavClient: React.FC<{ items: SectionNavItem[] }> = ({ items }) => {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.anchorId ?? null)
  const navRef = useRef<HTMLElement | null>(null)
  const visibleRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const targets = items
      .map((i) => document.getElementById(i.anchorId))
      .filter((el): el is HTMLElement => Boolean(el))
    if (targets.length === 0) return

    const recompute = () => {
      // Active = the first item (in nav/document order) currently in view.
      for (const item of items) {
        if (visibleRef.current.has(item.anchorId)) {
          setActiveId(item.anchorId)
          return
        }
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id
          if (entry.isIntersecting) visibleRef.current.add(id)
          else visibleRef.current.delete(id)
        }
        recompute()
      },
      // Activation band just below the sticky header, ignoring the lower half of
      // the viewport so the section that owns the top of the screen wins.
      { rootMargin: '-140px 0px -55% 0px', threshold: [0, 0.01] },
    )

    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [items])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, anchorId: string) => {
    const target = document.getElementById(anchorId)
    if (!target) return // no matching section — fall back to default anchor behaviour
    e.preventDefault()
    setActiveId(anchorId)
    const navHeight = navRef.current?.offsetHeight ?? 0
    const offset = 72 + navHeight // sticky header (72px) + this nav's own height
    const y = target.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top: y, behavior: 'smooth' })
    if (typeof history !== 'undefined') history.replaceState(null, '', `#${anchorId}`)
  }

  return (
    <nav className="ni-nav-inner" ref={navRef} aria-label="Section navigation">
      {items.map((item, i) => {
        const isActive = activeId === item.anchorId
        return (
          <a
            key={i}
            href={`#${item.anchorId}`}
            className={cn('ni-nav-link', isActive && 'is-active')}
            aria-current={isActive ? 'true' : undefined}
            onClick={(e) => handleClick(e, item.anchorId)}
          >
            <span className="ni-nav-link-dot" aria-hidden="true" />
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}
