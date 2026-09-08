import { InlineRichText } from '@/components/RichText/Inline'
import React from 'react'

import type { AppointmentGuideBlock as Props } from '@/payload-types'

import { Icon } from '@/components/Icon'
import RichText from '@/components/RichText'
import { Section } from '@/components/Section'
import { SectionHeader } from '@/components/SectionHeader'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

import { GuideClient, type ClientType } from './GuideClient'

type ApptType = NonNullable<Props['types']>[number]
type ApptTab = NonNullable<ApptType['tabs']>[number]

const calloutIcon: Record<string, string> = {
  info: 'info',
  note: 'info',
  warning: 'warning',
}

// One tab's content, rendered entirely server-side (rich text included) so the
// client toggle only has to show/hide the finished markup. Markup mirrors the
// design reference: an icon-led `.ag-item-list`, an optional 3-up
// `.ag-highlight-grid`, and an optional `.ag-note` callout.
const TabPanel: React.FC<{ tab: ApptTab }> = ({ tab }) => {
  const items = tab.items || []
  const cards = tab.highlightCards || []
  const callout = tab.callout

  return (
    <>
      {items.length > 0 ? (
        <div className="vf-ag-item-list">
          {items.map((item, i) => (
            <div key={item.id || i} className="vf-ag-item">
              {item.icon ? (
                <div className="vf-ag-item-icon">
                  <Icon name={item.icon} />
                </div>
              ) : null}
              <div className="vf-ag-item-body">
                <InlineRichText as="h3" className="vf-ag-item-heading" data={item.heading} />
                {item.body ? (
                  <RichText
                    data={item.body}
                    enableGutter={false}
                    enableProse={false}
                    className="vf-ag-item-rt"
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {cards.length > 0 ? (
        <div className="vf-ag-highlight-grid">
          {cards.map((card, i) => (
            <div key={card.id || i} className="vf-ag-highlight-card">
              {card.icon ? <Icon name={card.icon} className="vf-ag-highlight-card-icon" /> : null}
              <InlineRichText as="h4" data={card.title} />
              {card.bullets && card.bullets.length > 0 ? (
                <ul>
                  {card.bullets.map((b, j) => (
                    <li key={b.id || j}>
                      <InlineRichText data={b.text} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {callout?.text ? (
        <div className={cn('vf-ag-note', `vf-ag-note--${callout.style || 'info'}`)} role="note">
          <Icon
            name={calloutIcon[callout.style || 'info'] || 'info'}
            className="vf-ag-note-icon"
          />
          <InlineRichText as="p" data={callout.text} />
        </div>
      ) : null}
    </>
  )
}

export const AppointmentGuideBlock: React.FC<Props & { bare?: boolean }> = ({
  eyebrow,
  heading,
  subheading,
  textColour,
  selectLabel,
  types,
  cssClass,
  bare,
}) => {
  if (!types || types.length === 0) return null

  const clientTypes: ClientType[] = types.map((type) => ({
    label: type.label,
    sublabel: type.sublabel,
    anchorId: type.anchorId,
    iconNode: type.icon ? <Icon name={type.icon} /> : null,
    tabs: (type.tabs || []).map((tab) => ({
      label: tab.label,
      iconNode: tab.icon ? <Icon name={tab.icon} /> : null,
      panel: <TabPanel tab={tab} />,
    })),
  }))

  return (
    <Section
      background="muted"
      className={cn('vf-appointment-guide', toClassName(cssClass))}
      bare={bare}
    >
      <SectionHeader eyebrow={eyebrow} title={heading} subtitle={subheading} align="center" colour={textColour} />
      <GuideClient types={clientTypes} selectLabel={selectLabel} />
    </Section>
  )
}
