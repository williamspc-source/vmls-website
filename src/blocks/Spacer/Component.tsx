import React from 'react'

import type { SpacerBlock as Props } from '@/payload-types'

import { cn } from '@/utilities/ui'

export const SpacerBlock: React.FC<Props> = ({ size }) => (
  <div className={cn('vf-spacer', `vf-spacer--${size || 'md'}`)} aria-hidden />
)
