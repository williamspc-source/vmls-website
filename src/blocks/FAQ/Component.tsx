import { hasRichText, type RichTextValue } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import React from 'react'

import type { FAQBlock as FAQBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { Icon } from '@/components/Icon'
import { SectionHeader } from '@/components/SectionHeader'
import { widthClasses } from '@/components/Section'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

// Server-rendered accordion using native <details>/<summary> (no client JS).
// `exclusive` uses the native [name] grouping so only one stays open.
export const FAQBlock: React.FC<FAQBlockProps & { id?: string; bare?: boolean }> = (props) => {
  const {
    eyebrow,
    heading,
    subheading,
    textColour,
    columns,
    items,
    cssClass,
    exclusive,
    openFirst,
    helpCard,
    itemStyle,
    toggleStyle,
    iconStyle,
    density,
    ruleStyle,
    containerWidth,
    id,
    bare,
  } = props
  const anchorId = (props as { anchorId?: string | null }).anchorId || undefined

  if (!items || items.length === 0) return null
  const groupName = exclusive ? `faq-${id || 'group'}` : undefined
  const help = helpCard as
    | {
        heading?: RichTextValue
        body?: RichTextValue
        email?: string | null
        phone?: string | null
      }
    | undefined

  // "Side by side" ports the design reference's two-panel FAQ
  // (.design-reference/services/medico-legal/jme.html): heading + intro in a
  // narrow left column, questions stacked beside them. It also gives the
  // per-item `image` field somewhere to render — the field's description used to
  // promise an "accordion-with-image layout" that was never built.
  const divided = itemStyle === 'divided'
  const iconTile = iconStyle === 'tile'
  const split = columns === 'split'
  const splitImage = split
    ? (items.find((i) => i.image && typeof i.image === 'object')?.image ?? null)
    : null

  const list = (
      <div
        className="vf-faq__list"
        // `--vf-cols` rather than an inline grid-template-columns, so the
        // mobile rule in globals.css can override it; see GatewayCards.
        style={
          columns === '2'
            ? ({ display: 'grid', '--vf-cols': 2, gap: 'var(--gap-tight)' } as React.CSSProperties)
            : undefined
        }
      >
        {items.map((item, index) => (
          <details
            key={index}
            name={groupName}
            open={Boolean(openFirst) && index === 0}
            className="faq-item vf-faq__item"
          >
            <summary className="vf-faq__question">
              {item.icon ? (
                iconTile ? (
                  <span className="vf-faq__question-icon">
                    <Icon name={item.icon} />
                  </span>
                ) : (
                  <Icon name={item.icon} className="size-5" />
                )
              ) : null}
              {/* The divided variant needs a real element to flex against, so the
                  toggle sits hard right of a text block rather than of an
                  anonymous text node. Card mode keeps the bare text node, which
                  is what makes the unset default byte-identical to before. */}
              {divided ? (
                <InlineRichText as="span" className="vf-faq__question-text" data={item.question} />
              ) : (
                <InlineRichText data={item.question} />
              )}
            </summary>
            <div className="faq-a vf-faq__answer">
              <RichText data={item.answer} enableGutter={false} enableProse={false} />
            </div>
          </details>
        ))}
      </div>
  )

  return (
    <div
      id={anchorId}
      className={cn(
        'vf-faq',
        split && 'vf-faq--split',
        // Every one of these is absent unless an editor picks it, so a FAQ that
        // has never been touched emits exactly the classes it always did.
        divided && 'vf-faq--divided',
        toggleStyle === 'chevron' && 'vf-faq--toggle-chevron',
        toggleStyle === 'pill' && 'vf-faq--toggle-pill',
        iconTile && 'vf-faq--icon-tile',
        density === 'compact' && 'vf-faq--compact',
        ruleStyle === 'grey' && 'vf-faq--rule-grey',
        ruleStyle === 'brand' && 'vf-faq--rule-brand',
        bare
          ? ''
          : split
            ? 'container'
            : containerWidth && containerWidth !== 'narrow'
              ? widthClasses[containerWidth]
              : 'container content-narrow',
        toClassName(cssClass),
      )}
    >
      {split ? (
        <div className="vf-faq__split">
          <div className="vf-faq__aside">
            <SectionHeader eyebrow={eyebrow} title={heading} subtitle={subheading} align="left" colour={textColour} />
            {splitImage ? (
              <Media resource={splitImage} className="vf-faq__image" imgClassName="vf-faq__image-img" />
            ) : null}
          </div>
          {list}
        </div>
      ) : (
        <>
          <SectionHeader eyebrow={eyebrow} title={heading} subtitle={subheading} align="center" colour={textColour} />
          {list}
        </>
      )}

      {help && (hasRichText(help.heading) || hasRichText(help.body)) ? (
        <div className="vf-faq__help vf-callout vf-callout--info">
          {/* The reference runs the heading and body together as one weighted
              paragraph beside an info icon. The two fields stay separate so an
              editor can leave either empty; only the rendering is joined. */}
          <div className="vf-faq__help-message">
            <Icon name="info" className="vf-faq__help-icon" />
            <p className="vf-faq__help-text">
              {/* Joined for display, never with `.join(' ')`: these are rich text
                  now, and joining objects produced a literal
                  "[object Object] [object Object]" on the page — no error, no
                  warning, just wrong words. The space between them is a real
                  text node instead. */}
              <InlineRichText data={help.heading} />
              {hasRichText(help.heading) && hasRichText(help.body) ? ' ' : null}
              <InlineRichText data={help.body} />
            </p>
          </div>
          {help.email || help.phone ? (
            <div className="vf-faq__help-contact">
              {help.email ? (
                <span className="vf-faq__help-contact-item">
                  <Icon name="envelope" className="vf-faq__help-icon" />
                  <a href={`mailto:${help.email}`}>{help.email}</a>
                </span>
              ) : null}
              {help.phone ? (
                <span className="vf-faq__help-contact-item">
                  <Icon name="phone" className="vf-faq__help-icon" />
                  <a href={`tel:${help.phone.replace(/\s+/g, '')}`}>{help.phone}</a>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
