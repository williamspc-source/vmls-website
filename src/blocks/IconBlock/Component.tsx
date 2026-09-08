import React from 'react'

import type { IconBlock as Props } from '@/payload-types'

import { Icon } from '@/components/Icon'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

// Named `IconBlockComponent` to avoid clashing with the shared `<Icon>` component.
export const IconBlockComponent: React.FC<Props> = ({ icon, size, color, align, cssClass }) => {
  if (!icon) return null
  return (
    <div
      className={cn(
        'vf-icon-wrap',
        align && align !== 'left' ? `vf-align-${align}` : undefined,
        toClassName(cssClass),
      )}
    >
      <span className={cn('vf-icon', `vf-icon--${size || 'md'}`, `vf-icon--${color || 'primary'}`)}>
        <Icon name={icon} />
      </span>
    </div>
  )
}
