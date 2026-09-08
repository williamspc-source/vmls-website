import { InlineRichText } from '@/components/RichText/Inline'
import React from 'react'

import type { IconListBlock as Props } from '@/payload-types'

import { Icon } from '@/components/Icon'
import { CMSLink } from '@/components/Link'
import { Section } from '@/components/Section'
import { SectionHeader } from '@/components/SectionHeader'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

type Item = NonNullable<Props['items']>[number]

// The item link is now just an optional URL — active only when a URL is set.
const isActiveLink = (link: Item['link']): boolean => Boolean(link?.url)

export const IconListBlock: React.FC<Props & { bare?: boolean }> = ({
  eyebrow,
  heading,
  subheading,
  textColour,
  headingAlign,
  columns,
  items,
  cssClass,
  motion,
  containerWidth,
  bare,
}) => {
  if (!Array.isArray(items) || items.length === 0) return null
  const cols = Number(columns) || 1

  return (
    <Section
      className={cn('vf-icon-list-block', toClassName(cssClass))}
      motion={motion}
      containerWidth={containerWidth}
      bare={bare}
    >
      <SectionHeader
        eyebrow={eyebrow}
        title={heading}
        subtitle={subheading}
        colour={textColour}
        align={headingAlign === 'left' ? 'left' : 'center'}
      />

      {/* Geometry lives in CSS, driven by `--vf-cols` like every other grid
          block. It used to be inline, which outranks every stylesheet including
          Custom Styles — so the list gap could not be restyled from the admin,
          nor by a variant. Values are unchanged. */}
      <ul className="vf-icon-list" style={{ '--vf-cols': cols } as React.CSSProperties}>
        {items.map((item, i) => {
          const inner = (
            <>
              {item.icon ? (
                <Icon name={item.icon} className="vf-icon-list__icon" />
              ) : null}
              <InlineRichText as="span" className="vf-icon-list__text" data={item.text} />
            </>
          )

          return (
            <li key={item.id || i} className="vf-icon-list__item">
              {isActiveLink(item.link) ? (
                <CMSLink
                  {...item.link}
                  appearance="inline"
                  className="vf-icon-list__inner vf-icon-list__link"
                >
                  <span className="vf-icon-list__inner-content">{inner}</span>
                </CMSLink>
              ) : (
                <div className="vf-icon-list__inner">{inner}</div>
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
