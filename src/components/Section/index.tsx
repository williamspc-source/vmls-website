import { cn } from '@/utilities/ui'
import React from 'react'

export type SectionBackground =
  | 'white'
  | 'muted'
  | 'accent'
  | 'accent-solid'
  | 'light'
  | 'primary'
  | 'dark'
  | 'hero'

// Background → design section banding (defined in globals.css as `.vf-section--*`).
// Mirrors the design reference: white, grey, light-blue gradient, dark-blue gradient,
// solid charcoal.
// The dark bands also carry `vf-on-dark`, which re-points the text tokens so every
// descendant flips to the on-dark palette (see globals.css). It's a documented hook
// for Custom Styles authors as well, so keep it on the element, not just implied by
// the `.vf-section--*` selector.
export const bgClasses: Record<SectionBackground, string> = {
  white: 'vf-section--white',
  muted: 'vf-section--muted',
  accent: 'vf-section--accent',
  'accent-solid': 'vf-section--accent-solid',
  light: 'vf-section--light',
  primary: 'vf-section--primary vf-on-dark',
  dark: 'vf-section--dark vf-on-dark',
  hero: 'vf-section--hero vf-on-dark',
}

export const widthClasses: Record<string, string> = {
  normal: 'container',
  narrow: 'container content-narrow',
  wide: 'container max-w-[88rem]',
  full: 'w-full',
}

const motionClass = (motion?: string | null): string | undefined => {
  if (!motion || motion === 'none') return undefined
  if (motion === 'fade-up') return 'vf-motion vf-motion--fade-up'
  if (motion === 'zoom-in') return 'vf-motion vf-motion--zoom-in'
  return 'vf-motion' // fade-in
}

type SectionProps = {
  background?: SectionBackground | null
  /** Wrap children in the standard container. Set false for full-bleed content. */
  container?: boolean
  containerWidth?: string | null
  motion?: string | null
  hoverEffect?: string | null
  /** Resting card depth preset → `.vf-shadow-<slug>`. 'default' emits nothing. */
  shadow?: string | null
  className?: string
  innerClassName?: string
  id?: string
  /**
   * Nested/bare mode: the block is rendered inside another Section or Row, so it
   * drops its own banding, vertical padding and container and inherits the
   * parent's background, width and rhythm. The block's own class hook (passed via
   * `className`) is preserved so its internal CSS still applies.
   */
  bare?: boolean
  children: React.ReactNode
}

/**
 * Standard section wrapper — consistent vertical rhythm, background variants,
 * optional scroll-reveal motion and card hover treatment, plus the stable
 * `vf-section` style hook. All blocks render through this.
 */
export const Section: React.FC<SectionProps> = ({
  background = 'white',
  container = true,
  containerWidth = 'normal',
  motion = 'none',
  hoverEffect,
  shadow,
  className,
  innerClassName,
  id,
  bare = false,
  children,
}) => {
  const hasMotion = Boolean(motion && motion !== 'none')
  // 'none' emits `vf-hover-none` rather than nothing. The ported card styles
  // carry their own :hover, so without a class to hook onto there was no way to
  // express "no hover" and the None option did nothing at all.
  const hoverClass = hoverEffect ? `vf-hover-${hoverEffect}` : undefined
  // 'default' means "leave the component's own resting shadow alone".
  const shadowClass = shadow && shadow !== 'default' ? `vf-shadow-${shadow}` : undefined

  // Nested inside a Section/Row: no <section> banding, no padding, no container.
  // `id` is still forwarded — it used to be dropped here, so an Anchor ID set on
  // any nested block rendered nothing at all and every link to it scrolled
  // nowhere. The control looked set in the admin and did nothing, which is the
  // exact failure the orphan-field guard exists to prevent; that guard passed
  // because `anchorId` is whitelisted as "passed to <Section id>" rather than
  // checked.
  if (bare) {
    return (
      <div id={id} className={cn('vf-section-bare', hoverClass, shadowClass, className)}>
        {children}
      </div>
    )
  }

  return (
    <section
      id={id}
      data-vf-motion={hasMotion ? '' : undefined}
      className={cn(
        'vf-section',
        bgClasses[background || 'white'],
        motionClass(motion),
        hoverClass,
        shadowClass,
        className,
      )}
    >
      {container ? (
        <div className={cn('vf-section__inner', widthClasses[containerWidth || 'normal'], innerClassName)}>
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  )
}
