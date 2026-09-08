import { InlineRichText } from '@/components/RichText/Inline'
import { hasRichText, type RichTextValue } from '@/utilities/lexicalText'
import React from 'react'

import type { Page } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'
import { CMSLink } from '@/components/Link'
import { Icon } from '@/components/Icon'
import { Media } from '@/components/Media'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import type { Crumb } from '@/utilities/breadcrumbs'

type MetaItem = { icon?: string | null; text?: string | null; href?: string | null }
type HeroLink = { link?: Record<string, unknown> | null }

/**
 * `heading` and `subtitle` accept a plain string as well as the stored rich
 * text. Not every hero comes from an editor — `/in-the-loop/[stream]` builds one
 * in code from the stream's own title and description, which are plain fields —
 * and `InlineRichText` renders both. Widening the type says that out loud
 * instead of leaving the call site to cast the mismatch away.
 */
type PageHeroProps = Omit<NonNullable<Page['hero']>, 'heading' | 'subtitle'> & {
  heading?: RichTextValue
  subtitle?: RichTextValue
} & {
  /** Derived in the route (see `@/utilities/breadcrumbs`), so this stays sync. */
  crumbs?: Crumb[] | null
  crumbSeparator?: string | null
  crumbNavLabel?: string | null
  title?: string | null
}

/**
 * Interior-page hero — ports the design-reference `.page-hero` band.
 * theme: light | dark (blue gradient) | service (soft blue #cbe5fa).
 */
export const PageHero: React.FC<PageHeroProps> = (props) => {
  const { eyebrow, heading, subtitle, title, links, crumbs, crumbSeparator, crumbNavLabel } = props
  const showBreadcrumb = (props as { showBreadcrumb?: boolean | null }).showBreadcrumb
  const cssClass = (props as { cssClass?: string | string[] | null }).cssClass
  const theme = (props as { theme?: string | null }).theme || 'light'
  const align = (props as { align?: string | null }).align || 'left'
  const showShield = Boolean((props as { showShield?: boolean | null }).showShield)
  // Hero image, rendered in the image panel below.
  const heroMedia =
    props.media && typeof props.media === 'object' ? props.media : null
  const metaItems = ((props as { metaItems?: MetaItem[] | null }).metaItems || []).filter(
    (m) => m?.text,
  )
  const heroLinks = ((links as HeroLink[] | null | undefined) || []).filter((l) => l?.link)
  const headingText = heading || title
  const imagePanel = Boolean((props as { imagePanel?: boolean | null }).imagePanel)
  // The `|| 'Company Image Placeholder'` fallback has to survive the field
  // becoming rich text: an empty rich text is a truthy object, so `||` alone
  // would stop falling back the day the field was converted and the placeholder
  // panel would render with no caption at all.
  const imagePanelLabelField = (props as { imagePanelLabel?: RichTextValue }).imagePanelLabel
  const imagePanelLabel = hasRichText(imagePanelLabelField)
    ? imagePanelLabelField
    : 'Company Image Placeholder'

  // The trail and the eyebrow compete for one slot directly above the heading,
  // and they are near-identical in texture (uppercase, letter-spaced, ~13px), so
  // stacking them is the classic bad-breadcrumb look. The reference never shows
  // both. Crumb wins; the eyebrow copy stays in the CMS and returns the moment
  // an editor switches the trail off. Matching the component's own floor of 2
  // means a trail too short to render restores the eyebrow rather than leaving
  // an empty gap.
  const trail = showBreadcrumb === false ? [] : (crumbs ?? []).filter((c) => c?.label?.trim())
  const hasCrumb = trail.length >= 2

  const inner = (
    <div className="page-hero-inner">
          {hasCrumb ? (
            <Breadcrumbs items={trail} separator={crumbSeparator} label={crumbNavLabel} />
          ) : null}
          {!hasCrumb ? (
            <InlineRichText
              as="div"
              className="section-label page-hero-eyebrow"
              data={eyebrow}
            />
          ) : null}
          {/* `headingText` falls back to the page's own `title`, which stays a
              plain string — the admin uses it as the record's name. Both shapes
              render through here. */}
          <InlineRichText as="h1" data={headingText} />
          <InlineRichText as="p" className="page-hero-sub" data={subtitle} />

          {heroLinks.length ? (
            <div className="page-hero-actions">
              {/* The button style follows the editor's Appearance choice. It used
                  to follow list position, so the Appearance select on every hero
                  link did nothing. Position is still the fallback for links saved
                  before the choice was honoured (appearance unset). */}
              {heroLinks.map(({ link }, i) => {
                const appearance = (link as { appearance?: string | null })?.appearance
                const outline = appearance ? appearance === 'outline' : i > 0
                return (
                  <CMSLink
                    key={i}
                    {...(link as Record<string, unknown>)}
                    appearance="inline"
                    className={outline ? 'btn-hero-outline' : 'btn-hero-primary'}
                  />
                )
              })}
            </div>
          ) : null}

          {metaItems.length ? (
            <div className="vf-page-hero__meta">
              {metaItems.map((m, i) => {
                const inner = (
                  <>
                    {m.icon ? <Icon name={m.icon} className="size-5" /> : null}
                    <InlineRichText as="span" data={m.text} />
                  </>
                )
                return m.href ? (
                  <a key={i} href={m.href} className="vf-page-hero__meta-item">
                    {inner}
                  </a>
                ) : (
                  <span key={i} className="vf-page-hero__meta-item">
                    {inner}
                  </span>
                )
              })}
            </div>
          ) : null}
    </div>
  )

  return (
    <section
      className={cn(
        'page-hero',
        `page-hero--${theme}`,
        // Carries the on-dark token context, same as Section does for its dark
        // bands. Needed as a real class (not just a selector-list entry) so
        // descendant rules like `.vf-on-dark .vf-breadcrumb` can match.
        theme === 'dark' && 'vf-on-dark',
        align === 'center' && 'page-hero--center',
        showShield && 'page-hero--has-shield',
        imagePanel && 'page-hero--image-panel',
        toClassName(cssClass),
      )}
    >
      <div className="container">
        {imagePanel ? (
          <div className="ph-grid">
            {inner}
            <div className="ph-card-wrap">
              {/* The hero's Image field is rendered here. It was previously
                  ignored entirely, and the placeholder used <Icon name="image">
                  — "image" is not a key in iconMap, so it rendered an empty 48px
                  gap. There was no working way to put an image on an interior
                  page hero at all. */}
              <div className="ph-company-img">
                {heroMedia ? (
                  <Media resource={heroMedia} imgClassName="ph-company-img__media" />
                ) : (
                  <InlineRichText as="span" className="ph-card-img-label" data={imagePanelLabel} />
                )}
              </div>
            </div>
          </div>
        ) : (
          inner
        )}
      </div>

      {showShield ? (
        <div className="page-hero-deco" aria-hidden>
          <span className="page-hero-shield" />
        </div>
      ) : null}
    </section>
  )
}
