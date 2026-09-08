import { InlineRichText } from '@/components/RichText/Inline'
import React from 'react'

import type { CalloutBlock as Props } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { Icon } from '@/components/Icon'
import { Section } from '@/components/Section'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

type BoxVariant = 'info' | 'note' | 'success' | 'warning'

// Colours live in CSS (`.vf-callout--<variant>`) and resolve from the status
// tokens in Site Settings → Brand colours → Status & feedback. They used to be
// inline styles from a constant here, which put the whole four-variant palette
// beyond the admin's reach — inline styles outrank even Custom Styles.

// A sensible leading icon per style when the editor hasn't picked one.
const defaultIcon: Record<BoxVariant, string> = {
  info: 'info',
  note: 'info',
  success: 'check-circle',
  warning: 'warning',
}

export const CalloutBlock: React.FC<Props & { bare?: boolean }> = ({
  style,
  icon,
  tag,
  heading,
  body,
  links,
  cssClass,
  bare,
}) => {
  const hasLinks = Array.isArray(links) && links.length > 0
  if (!tag && !heading && !body && !hasLinks) return null

  const variant = String(style || 'info')

  // ── "Good to know" process note (design-reference .process-note): a horizontal
  // row separated by a top rule, with a light-blue tag pill, the body, and an
  // inline "Contact Us →" link. No box, no left accent bar, no leading icon. ──
  if (variant === 'good-to-know') {
    return (
      <Section bare={bare} className={cn('vf-callout-block', toClassName(cssClass))}>
        <div className="process-note">
          <InlineRichText as="span" className="process-note-tag" data={tag} />
          {body ? <RichText className="process-note-body" data={body} enableGutter={false} enableProse={false} /> : null}
          {hasLinks
            ? links!.map(({ link }, i) => (
                <CMSLink key={i} {...link} appearance="inline" className="process-note-link" />
              ))
            : null}
        </div>
      </Section>
    )
  }

  // ── Reassurance box (design-reference .join-form-note): a bordered box with a
  // leading info icon and a short paragraph (e.g. "We will be in touch within 2
  // business days…"). ──
  if (variant === 'reassurance') {
    return (
      <Section bare={bare} className={cn('vf-callout-block', toClassName(cssClass))}>
        <div className="join-form-note">
          <div className="join-form-note-icon" aria-hidden>
            <Icon name={icon || 'info'} />
          </div>
          <div className="join-form-note-body">
            <InlineRichText as="strong" data={heading} />
            {body ? <RichText data={body} enableGutter={false} enableProse={false} /> : null}
          </div>
        </div>
      </Section>
    )
  }

  const boxVariant = (['info', 'note', 'success', 'warning'].includes(variant)
    ? variant
    : 'info') as BoxVariant
  const iconName = icon || defaultIcon[boxVariant]

  return (
    <Section bare={bare} className={cn('vf-callout-block', toClassName(cssClass))}>
      <div
        role="note"
        className={cn('vf-callout flex gap-4 rounded-lg p-5', `vf-callout--${boxVariant}`)}
      >
        {iconName ? (
          <div className="vf-callout__icon shrink-0" aria-hidden>
            <Icon name={iconName} />
          </div>
        ) : null}

        <div className="vf-callout__content min-w-0 flex-1">
          <InlineRichText
            as="span"
            className="vf-callout__tag mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            data={tag}
          />

          {heading ? (
            <InlineRichText as="h3" className="vf-callout__heading text-lg font-semibold leading-snug" data={heading} />
          ) : null}

          {body ? (
            <RichText className="vf-callout__body mt-1" data={body} enableGutter={false} />
          ) : null}

          {hasLinks ? (
            <div
              className="vf-callout__links mt-4 flex flex-wrap gap-x-5 gap-y-2 font-medium"
            >
              {links!.map(({ link }, i) => (
                <CMSLink key={i} {...link} className="underline underline-offset-2" />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  )
}
