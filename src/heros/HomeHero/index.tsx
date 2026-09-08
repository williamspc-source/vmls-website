import { InlineRichText } from '@/components/RichText/Inline'
import { mediaSrc } from '@/utilities/mediaSrc'
import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { bgClasses, widthClasses, type SectionBackground } from '@/components/Section'
import { toClassName } from '@/utilities/cssClass'
import { DefinitionPanel } from './DefinitionPanel'
import { getCachedGlobal } from '@/utilities/getGlobals'

type HomeHeroProps = Page['hero']

/** Homepage hero using the ported `.hero` layout + definition panel. */
export const HomeHero = async (props: HomeHeroProps) => {
  const { eyebrow, heading, subtitle, links, media } = props
  // `showShield` was defined on the hero but never read, and the shield image
  // was a hardcoded path — while the field's own description promised it came
  // from Site Settings. Both are now true: the toggle hides it, and the image
  // is editable, falling back to the bundled mark.
  const showShield = (props as { showShield?: boolean | null }).showShield !== false
  const settings = (await getCachedGlobal('site-settings', 1)()) as {
    shield?: { url?: string | null; updatedAt?: string | null } | null
  }
  // Measured 50px on screen. The bundled fallback is a static 1166px / 73 KB PNG
  // that mediaSrc cannot help with (no derivatives exist for a file outside the
  // Media collection) — see README.md > Known issues; an uploaded shield IS sized.
  const shieldSrc = settings?.shield?.url
    ? (mediaSrc(settings.shield, 50 * 2) ?? '/assets/images/VERIFY Shield.png')
    : '/assets/images/VERIFY Shield.png'
  const definition = (props as { definition?: { term?: string | null; pronunciation?: string | null; text?: string | null; definitionStyle?: string | null; interaction?: string | null } }).definition
  const cssClass = (props as { cssClass?: string | string[] | null }).cssClass
  const p = props as {
    heroBackground?: SectionBackground | null
    containerWidth?: string | null
    heroPaddingTop?: string | null
    heroPaddingBottom?: string | null
  }
  const heroBackground: SectionBackground = p.heroBackground ?? 'accent-solid'
  const padTop = p.heroPaddingTop ?? 'default'
  const padBottom = p.heroPaddingBottom ?? 'default'
  const widthClass = widthClasses[p.containerWidth ?? 'normal'] ?? widthClasses.normal
  const hasDefinition = Boolean(definition?.term || definition?.text)
  const definitionStyle = definition?.definitionStyle === 'frame' ? 'frame' : 'glow'

  return (
    <section
      className={cn(
        'vf-home-hero',
        // Deliberately NOT `vf-section`: that carries its own vertical padding
        // (--space-normal, 88px) which would override the hero's designed 80px.
        // The band and padding modifier classes stand alone without it.
        bgClasses[heroBackground],
        // 'default' emits nothing, so .vf-home-hero's own padding stays in force.
        padTop !== 'default' ? `vf-section--pt-${padTop}` : undefined,
        padBottom !== 'default' ? `vf-section--pb-${padBottom}` : undefined,
        toClassName(cssClass),
      )}
    >
      <div className={cn(widthClass)}>
        <div className="hero-layout">
          <div>
            <InlineRichText as="div" className="section-label" data={eyebrow} />
            <InlineRichText
              as="h1"
              className="hero-heading vf-home-hero__title"
              data={heading}
            />
            <InlineRichText as="p" className="hero-subtext" data={subtitle} />
            {Array.isArray(links) && links.length > 0 ? (
              <div className="hero-cta-row">
                {/* Style follows the editor's Appearance choice; list position is
                    the fallback for links saved before it was honoured. */}
                {links.map(({ link }, i) => {
                  const outline = link?.appearance ? link.appearance === 'outline' : i > 0
                  return (
                    <CMSLink
                      key={i}
                      {...link}
                      appearance="inline"
                      className={outline ? 'hero-cta-secondary' : 'hero-cta-primary'}
                    />
                  )
                })}
              </div>
            ) : null}
          </div>

          {/* The reference offsets the definition panel down the grid
              (index.html:48, an inline padding-top: 48px). Kept as a class so a
              Custom Styles preset can change it. */}
          <div className="vf-home-hero__aside">
            {hasDefinition ? (
              <DefinitionPanel
                className={cn('hero-panel hero-definition-panel', `hero-definition-panel--${definitionStyle}`, 'vf-home-hero__definition')}
                interaction={definitionStyle === 'glow' ? definition?.interaction : 'off'}
              >
                {showShield ? (
                  <div className="definition-seal" aria-hidden>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={shieldSrc} alt="" className="definition-seal-logo" />
                  </div>
                ) : null}
                <div className="hero-definition-block">
                  <InlineRichText as="div" className="hero-def-word" data={definition?.term} />
                  <InlineRichText
                    as="div"
                    className="hero-def-pos"
                    data={definition?.pronunciation}
                  />
                  <InlineRichText
                    as="div"
                    className="hero-def-meaning"
                    data={definition?.text}
                  />
                </div>
              </DefinitionPanel>
            ) : media && typeof media === 'object' ? (
              <Media resource={media} imgClassName="w-full h-auto rounded-2xl object-cover" />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
