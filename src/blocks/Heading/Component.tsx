import { InlineRichText } from '@/components/RichText/Inline'
import React from 'react'

import type { HeadingBlock as Props } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

export const HeadingBlock: React.FC<Props> = ({ text, level, size, align, cssClass }) => {
  const Tag = (level || 'h2') as 'h1' | 'h2' | 'h3' | 'h4'
  // `as={Tag}` rather than a nested <span>: InlineRichText renders the heading
  // element itself. Wrapping the text in a span inside the heading looks
  // harmless and is not — `.section-title span` and `.vf-heading span` are the
  // *accent* colour rules, so a structural wrapper silently takes the brand
  // colour that `[[brackets]]` are supposed to own. Caught by computedSnapshot,
  // which reported the heading turning grey and a new span turning blue.
  return (
    <InlineRichText
      as={Tag}
      className={cn(
        'vf-heading',
        `vf-heading--${size || 'lg'}`,
        align && align !== 'left' ? `vf-align-${align}` : undefined,
        toClassName(cssClass),
      )}
      data={text}
    />
  )
}
