'use client'

import React, { useEffect, useRef, useState } from 'react'

type TocItem = { id: string; text: string }

type Props = {
  items: TocItem[]
  label: React.ReactNode
}

/**
 * Scroll-spy table of contents for the article page.
 *
 * This component used to *assign* the heading ids on mount, which meant they did
 * not exist in the server HTML: clicking a contents link worked, but a pasted
 * `…/article#some-heading` URL landed at the top of the page, because the
 * browser resolves a fragment while parsing and nothing had run yet. The ids now
 * come from the rich-text heading converter (`headingIdAt`), so this component
 * only reads them — to highlight the active link as the reader scrolls (the
 * reference's `.art-toc-link.is-active` behaviour).
 *
 * The links are plain anchors on purpose. Native fragment navigation honours
 * `scroll-padding-top` and `scroll-behavior`, and it puts the fragment in the
 * address bar — so a reader who clicks a contents item can copy a URL that
 * works, which is the same defect from the other end.
 */
export const ArticleToc: React.FC<Props> = ({ items, label }) => {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '')
  const navRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!items.length) return

    const targets = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null)

    if (!targets.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId((entry.target as HTMLElement).id)
        })
      },
      { rootMargin: '-15% 0px -70% 0px' },
    )
    targets.forEach((t) => observer.observe(t))

    return () => observer.disconnect()
  }, [items])

  // The browser does the scrolling; this only moves the highlight ahead of the
  // observer so the clicked item lights up immediately.
  const handleClick = (id: string) => setActiveId(id)

  return (
    <aside ref={navRef} aria-label="Article navigation" className="art-toc">
      <div className="art-toc-label">{label}</div>
      <ul className="art-toc-list">
        {items.map((item) => (
          <li key={item.id}>
            <a
              className={`art-toc-link${item.id === activeId ? ' is-active' : ''}`}
              href={`#${item.id}`}
              onClick={() => handleClick(item.id)}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default ArticleToc
