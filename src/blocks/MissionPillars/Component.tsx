import { hasRichText } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import React from 'react'

import type { MissionPillarsBlock as Props } from '@/payload-types'

import { Section, type SectionBackground } from '@/components/Section'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

// Dark full-bleed mission panel: centered header + a 2-up grid of light-blue
// pillar cards, each auto-numbered 01..NN from its index. All copy is editable.
export const MissionPillarsBlock: React.FC<Props & { bare?: boolean }> = ({
  eyebrow,
  heading,
  subheading,
  textColour,
  background,
  pillars,
  containerWidth,
  motion,
  cssClass,
  anchorId,
  bare,
}) => {
  const hasPillars = Array.isArray(pillars) && pillars.length > 0
  if (!hasPillars && !eyebrow && !heading && !subheading) return null

  return (
    <Section
      background={(background as SectionBackground) || 'dark'}
      bare={bare}
      className={cn('mv-mission-panel', toClassName(cssClass))}
      containerWidth={containerWidth}
      motion={motion}
      id={anchorId || undefined}
    >
      {hasRichText(eyebrow) || hasRichText(heading) || hasRichText(subheading) ? (
        <div className="mv-mission-header">
          <InlineRichText as="div" className="section-label" data={eyebrow} colour={textColour} />
          <InlineRichText as="h2" className="section-title" data={heading} colour={textColour} />
          <InlineRichText as="p" className="mv-mission-statement" data={subheading} colour={textColour} />
        </div>
      ) : null}

      {hasPillars ? (
        <div className="mv-pillars">
          {pillars!.map((pillar, i) => (
            <div key={i} className="mv-pillar">
              <div className="mv-pillar-num">{String(i + 1).padStart(2, '0')}</div>
              <InlineRichText as="div" className="mv-pillar-text" data={pillar.text} />
            </div>
          ))}
        </div>
      ) : null}
    </Section>
  )
}
