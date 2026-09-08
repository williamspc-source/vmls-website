import { hasRichText, type RichTextValue } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { Icon } from '@/components/Icon'
import Link from 'next/link'
import React from 'react'

import { referencePath, type LinkableCollection } from '@/utilities/routes'

type CMSLinkType = {
  anchor?: string | null
  appearance?: 'inline' | ButtonProps['variant']
  children?: React.ReactNode
  className?: string
  icon?: string | null
  label?: RichTextValue
  newTab?: boolean | null
  reference?: {
    relationTo: LinkableCollection
    // `unknown` on purpose: Payload generates a discriminated union with one
    // arm per collection, and referencePath() narrows by `relationTo` anyway.
    value: unknown
  } | null
  size?: ButtonProps['size'] | null
  type?: 'custom' | 'reference' | 'enquiry' | null
  url?: string | null
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    anchor,
    appearance = 'inline',
    children,
    className,
    icon,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    url,
  } = props

  const iconEl = icon ? <Icon name={icon} className="size-4" /> : null

  // "Open enquiry form" action: no navigation — a button carrying the
  // data-enquiry-panel hook the site-wide enquiry drawer listens for.
  if (type === 'enquiry') {
    const content = (
      <>
        {iconEl}
        <InlineRichText data={label} />
        {children}
      </>
    )
    if (appearance === 'inline') {
      return (
        <button type="button" data-enquiry-panel className={cn(className)}>
          {content}
        </button>
      )
    }
    return (
      <Button className={className} size={sizeFromProps} variant={appearance} data-enquiry-panel>
        {content}
      </Button>
    )
  }

  let href = url
  if (type === 'reference' && typeof reference?.value === 'object') {
    // One resolver for every linkable collection (src/utilities/routes.ts).
    // This used to be `pages` vs everything-else-is-a-post, which meant a link
    // to a specialist resolved through postPath() and came back null.
    href = referencePath(reference.relationTo, reference.value) ?? undefined

    // Append the optional section anchor. Deliberately only on the resolved
    // path and only when the path resolved: appending to `undefined` would turn
    // an unresolvable link into a bare "#…" that scrolls the *current* page,
    // which looks like a working link and is worse than the inert span below.
    if (href && anchor) href = `${href}#${anchor.replace(/^#/, '')}`
  }

  // No resolvable destination — an unsaved reference, a collection with no public
  // route, or a Post whose stream has not been populated by the caller's query
  // depth. Render the label as plain text rather than returning null.
  //
  // Returning null made the link *vanish*: a "Latest articles" item in the header
  // disappeared entirely, so the nav looked deliberately short rather than broken,
  // and nothing anywhere said why. Visible-but-inert is the honest rendering — it
  // shows the editor exactly which link needs attention, and `data-link-unresolved`
  // gives the guard suite and anyone debugging something to grep for.
  if (!href) {
    if (!hasRichText(label) && !children) return null
    return (
      <span className={cn(className)} data-link-unresolved="true">
        {iconEl}
        <InlineRichText data={label} />
        {children}
      </span>
    )
  }

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {iconEl}
        <InlineRichText data={label} />
        {children && children}
      </Link>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance}>
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {iconEl}
        <InlineRichText data={label} />
        {children && children}
      </Link>
    </Button>
  )
}
