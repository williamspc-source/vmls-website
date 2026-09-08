import { richTextToPlain } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import React from 'react'

import type { NewsletterBlock as Props } from '@/payload-types'

import { Section } from '@/components/Section'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'
import { SubscribeForm } from './SubscribeForm'

// Newsletter subscribe band. Reproduces the design-reference `.ni-newsletter`
// gradient CTA. The capture itself lives in SubscribeForm (a client component)
// and posts into the Payload form chosen on the block.
export const NewsletterBlock: React.FC<Props & { bare?: boolean }> = ({
  form,
  eyebrow,
  heading,
  subheading,
  placeholder,
  buttonLabel,
  note,
  anchorId,
  cssClass,
  bare,
}) => {
  if (!heading && !subheading && !eyebrow) return null

  // Populated to a doc at depth > 0, a bare id at depth 0.
  const formId =
    form && typeof form === 'object' ? String(form.id) : form != null ? String(form) : null

  return (
    <Section
      bare={bare}
      id={anchorId || undefined}
      className={cn('ni-newsletter', toClassName(cssClass))}
    >
      <InlineRichText as="div" className="section-label" data={eyebrow} />
      <InlineRichText as="h2" data={heading} />
      <InlineRichText as="p" data={subheading} />

      {/* No form chosen: say so. Rendering the eyebrow, heading and subheading
          with nothing under them produced a "Stay in the Loop / Subscribe to
          receive..." band with no way to subscribe — an invitation that silently
          goes nowhere. The notice is what an editor sees on the page, and what a
          visitor sees instead of a box that would discard their address. */}
      {formId ? (
        <SubscribeForm
          formId={formId}
          placeholder={placeholder}
          // The button label is rich text, but a <button>'s accessible name has
          // to be words — the form control is what a screen reader announces.
          buttonLabel={richTextToPlain(buttonLabel) || undefined}
        />
      ) : (
        <p className="ni-subscribe-note vf-form-error" role="status">
          Signups are temporarily unavailable. Please email admin@vmls.com.au to be added to the
          list.
        </p>
      )}

      <InlineRichText as="p" className="ni-subscribe-note" data={note} />
    </Section>
  )
}
