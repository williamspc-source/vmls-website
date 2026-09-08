import React from 'react'

import type { TextBlock as Props } from '@/payload-types'

import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

export const TextBlock: React.FC<Props> = ({ richText, size, align, cssClass }) => {
  if (!richText) return null
  return (
    <RichText
      data={richText}
      enableGutter={false}
      enableProse={false}
      className={cn(
        'vf-text',
        `vf-text--${size || 'base'}`,
        align && align !== 'left' ? `vf-align-${align}` : undefined,
        toClassName(cssClass),
      )}
    />
  )
}
