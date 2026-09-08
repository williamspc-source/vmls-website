import React from 'react'

import type { TabsBlockType as Props } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Section, type SectionBackground } from '@/components/Section'
import { SectionHeader } from '@/components/SectionHeader'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'
import { TabsClient } from './TabsClient'

export const TabsBlock: React.FC<Props & { bare?: boolean; anchorId?: string | null }> = ({
  eyebrow,
  heading,
  subheading,
  textColour,
  background,
  tabs,
  cssClass,
  elementClasses,
  motion,
  containerWidth,
  tabStyle,
  defaultTab,
  anchorId,
  bare,
}) => {
  if (!tabs || tabs.length === 0) return null

  // Tab panels are nested blocks, rendered server-side here; the client component
  // only switches which panel is visible.
  const items = tabs.map((tab) => ({
    label: tab.label,
    icon: tab.icon ?? null,
    panel: <RenderBlocks blocks={tab.content} context="nested" />,
  }))

  return (
    <Section
      id={anchorId || undefined}
      background={background as SectionBackground}
      className={cn('vf-tabs', toClassName(cssClass))}
      motion={motion}
      containerWidth={containerWidth}
      bare={bare}
    >
      <SectionHeader
        eyebrow={eyebrow}
        title={heading}
        subtitle={subheading}
        colour={textColour}
        align="center"
        titleClassName={toClassName(elementClasses?.heading)}
      />
      <TabsClient items={items} tabStyle={tabStyle ?? 'pills'} defaultTab={defaultTab ?? 0} />
    </Section>
  )
}
