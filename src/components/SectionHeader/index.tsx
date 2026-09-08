import React from 'react'

import { InlineRichText } from '@/components/RichText/Inline'
import { hasRichText, type RichTextValue } from '@/utilities/lexicalText'
import { cn } from '@/utilities/ui'

type SectionHeaderProps = {
  eyebrow?: RichTextValue
  title?: RichTextValue
  subtitle?: RichTextValue
  align?: 'left' | 'center' | null
  showDivider?: boolean | null
  as?: 'h1' | 'h2' | 'h3'
  className?: string
  titleClassName?: string
  /** A palette key from the block's `textColour` field. */
  colour?: string | null
}

/**
 * Shared section heading using the ported design-reference classes
 * (`section-label` / `section-title` / `divider` / `section-subtitle`).
 *
 * There is deliberately no `onDark` prop. Dark and primary Sections already
 * carry `.vf-on-dark` (see `components/Section`), and globals.css re-points the
 * text tokens from there — so the colours flip on their own. This component used
 * to hardcode `#8bb9dd` / `#fff` / `rgba(255,255,255,.75)` inline, which
 * outranked those rules and meant the four "on dark" colour fields in Site
 * Settings had no effect on any section header anywhere on the site.
 *
 * All three strings are rich text now, rendered through `InlineRichText` so the
 * elements are unchanged: `section-title` stays on the `<h2>` itself rather than
 * on a wrapper, which is what keeps the ported CSS and the heading-wrap e2e
 * guard matching. It still accepts a plain string, so a caller that passes one
 * (a collection `title`, a field not converted) behaves exactly as before.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  showDivider = false,
  as: Heading = 'h2',
  className,
  titleClassName,
  colour,
}) => {
  // `hasRichText`, not truthiness: an untouched rich-text field is an empty
  // object, which is truthy. With `if (!eyebrow && !title && !subtitle)` this
  // component would have started rendering an empty header band on every block
  // whose heading is blank, the moment these fields were converted.
  if (!hasRichText(eyebrow) && !hasRichText(title) && !hasRichText(subtitle)) return null
  const centered = align === 'center'

  return (
    <div
      className={cn(
        'vf-section-header',
        centered && 'text-center vf-section-header--centered',
        className,
      )}
    >
      <InlineRichText
        as="p"
        className="vf-section-header__eyebrow section-label"
        colour={colour}
        data={eyebrow}
      />

      {showDivider && centered ? <div className="divider" /> : null}

      <InlineRichText
        as={Heading}
        className={cn('vf-section-header__title section-title', titleClassName)}
        colour={colour}
        data={title}
      />

      <InlineRichText
        as="p"
        className="vf-section-header__subtitle section-subtitle"
        colour={colour}
        data={subtitle}
      />
    </div>
  )
}
