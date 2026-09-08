import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { SectionNavBlock as Props } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'
import { hiddenAnchorIds } from '@/blocks/sectionEmptiness'

import { SectionNavClient, type SectionNavItem } from './SectionNavClient'

// Sticky in-page section nav (design ref: `.ni-section-nav`). Rendered as the bare
// reference markup — a full-bleed grey bar with a centred container of pills — NOT
// through the shared <Section>, whose white banding + vertical padding would cover
// the grey bar and hide the light-text tabs (only the active pill stayed visible).
// The scroll-spy (IntersectionObserver + active-state) lives in the client child.
//
// ── Why this is async, and a server component ──
// A tab whose section has taken itself off the page (its "Hide when empty" box,
// with nothing to list) has to go with it, or the nav is a bar of links to
// nothing. Deciding that here — on the server, through the same query the section
// runs (`src/blocks/sectionEmptiness.ts`) — is what makes the two agree. The
// obvious alternative, having the client child drop pills whose `#id` is missing
// from the DOM, cannot drift either, but it costs a visible flash of tabs that
// then vanish and it does nothing at all with JavaScript off.
//
// `siblings` is the page's own block array, handed over by RenderBlocks.
export const SectionNavBlock: React.FC<
  Props & { bare?: boolean; siblings?: unknown[] | null }
> = async ({ items, sticky, cssClass, siblings }) => {
  const candidates: SectionNavItem[] = (items || [])
    .filter((i): i is NonNullable<typeof i> => Boolean(i && i.label && i.anchorId))
    .map((i) => ({ label: i.label!, anchorId: i.anchorId! }))

  let navItems = candidates
  if (candidates.length > 0) {
    const payload = await getPayload({ config: configPromise })
    const hidden = await hiddenAnchorIds(
      payload,
      siblings,
      candidates.map((i) => i.anchorId),
      new Date(),
    )
    navItems = candidates.filter((i) => !hidden.has(i.anchorId))
  }

  if (navItems.length === 0) return null

  const isSticky = sticky !== false

  return (
    <div
      className={cn('ni-section-nav', !isSticky && 'ni-section-nav--static', toClassName(cssClass))}
    >
      <div className="container">
        <SectionNavClient items={navItems} />
      </div>
    </div>
  )
}
