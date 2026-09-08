import React from 'react'

import type { DividerBlock as Props } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

export const DividerBlock: React.FC<Props> = ({ style, width, align, cssClass }) => (
  <div
    className={cn(
      'vf-divider-wrap',
      align && align !== 'left' ? `vf-align-${align}` : undefined,
      toClassName(cssClass),
    )}
  >
    <hr
      className={cn(
        'vf-divider',
        `vf-divider--${style || 'line'}`,
        `vf-divider--${width || 'full'}`,
      )}
    />
  </div>
)
