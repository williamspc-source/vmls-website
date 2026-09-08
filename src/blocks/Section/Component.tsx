import React from 'react'

import type { SectionBlock as Props } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Section as SectionWrapper, type SectionBackground } from '@/components/Section'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

// The container primitive. Always rendered at the top level (never nested), so it
// owns the real <section> banding/padding and renders its children in nested
// context (they render bare and inherit this Section's background + width).
export const SectionBlock: React.FC<Props> = ({
  background,
  containerWidth,
  paddingTop,
  paddingBottom,
  motion,
  align,
  content,
  cssClass,
  anchorId,
}) => {
  if (!Array.isArray(content) || content.length === 0) return null

  return (
    <SectionWrapper
      background={background as SectionBackground}
      containerWidth={containerWidth}
      motion={motion}
      id={anchorId || undefined}
      className={cn(
        'vf-section-block',
        paddingTop ? `vf-section--pt-${paddingTop}` : undefined,
        paddingBottom ? `vf-section--pb-${paddingBottom}` : undefined,
        align && align !== 'left' ? `vf-align-${align}` : undefined,
        toClassName(cssClass),
      )}
    >
      <RenderBlocks blocks={content} context="nested" />
    </SectionWrapper>
  )
}
