import { InlineRichText } from '@/components/RichText/Inline'
import { hasRichText, richTextToPlain, type RichTextValue } from '@/utilities/lexicalText'
import type { Event } from '@/payload-types'
import { mediaSrc } from '@/utilities/mediaSrc'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { Section } from '@/components/Section'
import type { SectionBackground } from '@/components/Section'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

import { EventsExplorerClient } from './EventsExplorerClient'
import type {
  EventItem,
  EventsExplorerLabels,
  EventsExplorerGroups,
} from './EventsExplorerClient'
import type { EventsExplorerSeparator } from './separator'
import { pastBandClass } from './separator'
import { eventTypeLabel } from '@/utilities/eventTypeLabels'



// Field reads are typed defensively because payload-types have not been
// regenerated for this block yet.
//
// The three header fields are `RichTextValue`, not `string`. This block declares
// its own props rather than using the generated block type, so when they became
// rich text NOTHING failed to compile — `RenderBlocks` spreads a block loosely,
// so the lie stayed inside this file. It surfaced as `a.includes is not a
// function` from `accentText` during a production build of /events, which names
// neither the field nor the block.
type Props = {
  eyebrow?: RichTextValue
  heading?: RichTextValue
  subheading?: RichTextValue
  textColour?: string | null
  mode?: 'all' | 'upcoming-only' | 'past-only' | null
  pageSize?: number | null
  showSearch?: boolean | null
  labels?: EventsExplorerLabels | null
  cardStyle?: 'list' | 'card' | null
  groups?: EventsExplorerGroups | null
  separator?: EventsExplorerSeparator | null
  anchorId?: string | null
  background?: SectionBackground | null
  cssClass?: string | string[] | null
  bare?: boolean
}

/**
 * `photoWidth` is the CSS width the event photo renders at, measured:
 * 310px in a list row, 260px in a hub card. Doubled for retina inside
 * `mediaSrc`, which then serves the smallest generated size that covers it
 * rather than the original upload.
 */
const serialise = (e: Event, photoWidth: number): EventItem => ({
  id: String(e.id),
  title: e.title,
  slug: e.slug ?? '',
  date: e.date ? new Date(e.date).toISOString() : '',
  // Flattened, not rendered: the events list filters on these client-side —
  // `[title, excerpt, typeLabel, location].some(v => v.toLowerCase().includes(q))`
  // — so a tree here would stringify to "[object Object]" and match nothing,
  // silently. The search box would simply stop finding events.
  timeLabel: richTextToPlain(e.timeLabel),
  location: richTextToPlain(e.location),
  // `eventType` is a relationship now, so the slug is on the populated row.
  // Kept on the DTO because the client type declares it — and because the
  // orphan-field guard needs a real `x.eventType` read outside the config.
  eventType: typeof e.eventType === 'object' && e.eventType ? (e.eventType.slug ?? '') : '',
  typeLabel: eventTypeLabel(e.eventType) || 'Event',
  cpdEligible: Boolean(e.cpdEligible),
  cost: richTextToPlain(e.cost),
  excerpt: e.excerpt ?? '',
  registrationUrl: e.registrationUrl ?? '',
  image: mediaSrc(e.image, photoWidth * 2),
})

// Server block: fetches ALL events once (published only) and hands plain,
// serialisable objects to the client, which decides upcoming vs past from the
// live browser date.
export const EventsExplorerBlock: React.FC<Props> = async (props) => {
  const { eyebrow, heading, subheading, textColour, anchorId, background, cssClass, bare } = props
  const mode = (props as { mode?: Props['mode'] }).mode || 'all'
  const pageSize = (props as { pageSize?: number | null }).pageSize || 8
  const showSearch = (props as { showSearch?: boolean | null }).showSearch ?? true
  const labels = (props as { labels?: EventsExplorerLabels | null }).labels ?? undefined
  // Defaults to the list presentation, so the two dedicated listing pages are
  // untouched; only a block explicitly set to `card` takes the hub treatment.
  const cardStyle = (props as { cardStyle?: 'list' | 'card' | null }).cardStyle || 'list'
  const groups = (props as { groups?: EventsExplorerGroups | null }).groups ?? undefined
  const separator =
    (props as { separator?: EventsExplorerSeparator | null }).separator ?? undefined

  // A banded Past group is the last thing in the block and runs to its bottom
  // edge, so the Section's own bottom padding has to come off — otherwise the
  // band stops and a strip of the page background shows beneath it. Decided from
  // the same helper the client renders with, so the two cannot disagree.
  const bandRunsToEdge = Boolean(pastBandClass(mode, separator))

  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'events',
    depth: 1,
    limit: 200,
    pagination: false,
    overrideAccess: false,
    sort: 'date',
  })

  const events = res.docs.map((e) => serialise(e, cardStyle === 'card' ? 260 : 310))

  const hasHeader = hasRichText(eyebrow) || hasRichText(heading) || hasRichText(subheading)

  return (
    <Section
      bare={bare}
      background={background || 'white'}
      id={anchorId || undefined}
      className={cn(
        'events-explorer',
        bandRunsToEdge && 'events-explorer--band-to-edge',
        toClassName(cssClass),
      )}
    >
      {/* The same `.events-section-header` the upcoming/past groups use, so this
          heading matches them by construction rather than by two rules kept in
          step by hand. It previously rendered in a `.events-explorer-header`
          that set only a margin, leaving its <h2> at the base reset: 18px/400,
          against 37.6px/700 for the two headings directly beneath it. */}
      {hasHeader ? (
        <div className="events-section-header events-explorer-header">
          <div>
            <InlineRichText as="div" className="section-label" data={eyebrow} colour={textColour} />
            <InlineRichText as="h2" data={heading} colour={textColour} />
            <InlineRichText as="p" data={subheading} colour={textColour} />
          </div>
        </div>
      ) : null}

      <EventsExplorerClient
        events={events}
        mode={mode || 'all'}
        pageSize={pageSize}
        showSearch={showSearch}
        labels={labels}
        cardStyle={cardStyle}
        groups={groups}
        separator={separator}
      />
    </Section>
  )
}
