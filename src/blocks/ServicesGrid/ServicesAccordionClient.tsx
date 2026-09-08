'use client'

import React, { useEffect, useId, useRef, useState } from 'react'

export type ServicesAccordionItemProps = {
  title: string
  /** Always-visible 16:9 image/placeholder tile rendered above the trigger. */
  media?: React.ReactNode
  /** RichText body revealed when the row expands. */
  body?: React.ReactNode
  /** Optional DOM id so header/deep-link anchors can scroll to this row. */
  anchorId?: string
}

/**
 * A single expandable service row. Mirrors the design reference's
 * `.as-accordion-item` markup: an always-visible image tile, then a button
 * trigger ([aria-expanded]) showing only the service name + "+", then a
 * [hidden] body that reveals the description on expand — so the ported CSS
 * applies verbatim. Only the collapse state lives on the client; the media and
 * body content are server-rendered and passed in as props.
 */
export const ServicesAccordionItem: React.FC<ServicesAccordionItemProps> = ({
  title,
  media,
  body,
  anchorId,
}) => {
  const [open, setOpen] = useState(false)
  const bodyId = useId()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  // The tile above is always visible; only a body makes the row collapsible.
  const collapsible = Boolean(body)

  // Deep link: open this row and scroll to its TITLE, not to the row's top edge.
  // The row begins with an always-visible 16:9 tile, so landing on the row put
  // the title ~310px below the fold and showed a closed accordion above a
  // picture — reported as "it navigates to the body, not the title". The
  // browser's own jump cannot do better here: it targets the row, and the body
  // is `hidden` until this state flips.
  useEffect(() => {
    if (!anchorId) return
    const apply = () => {
      if (window.location.hash.replace(/^#/, '') !== anchorId) return
      setOpen(true)
      requestAnimationFrame(() =>
        triggerRef.current?.scrollIntoView({ block: 'start' }),
      )
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [anchorId])

  const header = <span className="as-accordion-trigger-title">{title}</span>

  return (
    <div className="as-accordion-item" id={anchorId || undefined}>
      {media}
      {collapsible ? (
        <button
          ref={triggerRef}
          type="button"
          className="as-accordion-trigger"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((prev) => !prev)}
        >
          {header}
          <span className="as-accordion-icon" aria-hidden="true">
            +
          </span>
        </button>
      ) : (
        <div className="as-accordion-trigger as-accordion-trigger--static">{header}</div>
      )}
      {collapsible ? (
        <div className="as-accordion-body" id={bodyId} hidden={!open}>
          {body}
        </div>
      ) : null}
    </div>
  )
}
