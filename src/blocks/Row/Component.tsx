import React from 'react'

import type { RowBlock as Props } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Section } from '@/components/Section'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

// Responsive column grid. Column count is derived from the number of columns and
// fed to CSS via `--row-cols`; columns stack on mobile. When nested (`bare`) it
// renders just the grid and inherits the parent Section's width/padding; at the
// top level it wraps itself in a default Section for container width + rhythm.
export const RowBlock: React.FC<Props & { bare?: boolean }> = ({
  columns,
  gap,
  alignY,
  columnRatio,
  cssClass,
  anchorId,
  bare,
}) => {
  const cols = Array.isArray(columns) ? columns : []
  if (cols.length === 0) return null

  const grid = (
    <div
      id={anchorId || undefined}
      className={cn(
        'vf-row',
        `vf-row--gap-${gap || 'normal'}`,
        alignY && alignY !== 'stretch' ? `vf-row--alignY-${alignY}` : undefined,
        // Only meaningful with exactly two tracks — the ratio names two of them.
        columnRatio && columnRatio !== 'equal' && cols.length === 2
          ? `vf-row--ratio-${columnRatio}`
          : undefined,
        toClassName(cssClass),
      )}
      style={{ '--row-cols': String(cols.length) } as React.CSSProperties}
    >
      {cols.map((col, i) => (
        <div
          key={i}
          className={cn(
            'vf-col',
            col.span && col.span !== 'auto' ? `vf-col--span-${col.span}` : undefined,
            col.align && col.align !== 'left' ? `vf-align-${col.align}` : undefined,
          )}
        >
          <RenderBlocks blocks={col.content} context="nested" />
        </div>
      ))}
    </div>
  )

  return bare ? grid : <Section background="white">{grid}</Section>
}
