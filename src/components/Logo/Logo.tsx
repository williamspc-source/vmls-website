import clsx from 'clsx'
import React from 'react'

import { mediaSrc } from '@/utilities/mediaSrc'

export type BrandLogo = {
  src: string
  alt: string
  width: number
  height: number
}

/**
 * Resolves a Site Settings logo upload (populated at depth 1) to render props.
 * Returns null when unset/unpopulated so the component falls back to the file.
 *
 * `boxWidth` is the CSS width the logo renders at — measured 182px in the header
 * and 264px in the footer. Both resolve to the same generated size, which is the
 * point: the header used to build a cache-tagged URL while the footer read the
 * raw `.url`, so the two differed by a query string, neither hit the other's
 * cache entry, and the SAME 4267x1359 / 119 KB PNG was downloaded twice on every
 * page. Going through one function with one width makes the URL identical.
 */
export const resolveBrandLogo = (media: unknown, boxWidth = 264): BrandLogo | null => {
  if (media && typeof media === 'object' && 'url' in media) {
    const m = media as {
      url?: string | null
      alt?: string | null
      width?: number | null
      height?: number | null
    }
    const src = mediaSrc(media, boxWidth * 2)
    if (src) {
      // Intrinsic dimensions only fix the aspect ratio for layout. Note the
      // generated size's ratio is not EXACTLY the original's: Payload rounds,
      // so 4267x1359 (3.13907) becomes 600x191 (3.14136), 0.07% wider. The CSS
      // sets a height with `width: auto`, so the rendered logo grew by 0.1px —
      // measured 182.094 -> 182.188 in the header, 263.734 -> 263.859 in the
      // footer, and that is the only layout movement anywhere from this change.
      return {
        src,
        alt: m.alt || 'VERIFY Medico-Legal Solutions',
        width: m.width || 4267,
        height: m.height || 1359,
      }
    }
  }
  return null
}

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  src?: string | null
  alt?: string | null
  width?: number
  height?: number
}

export const Logo = (props: Props) => {
  const {
    loading: loadingFromProps,
    priority: priorityFromProps,
    className,
    src,
    alt,
    // Intrinsic dimensions of the fallback public/verify-logo.png; overridden
    // by the uploaded media's real dimensions. Visual size comes from the
    // consuming CSS (.nav-logo img / .footer-logo img: height + width:auto).
    width = 4267,
    height = 1359,
  } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt={alt || 'VERIFY Medico-Legal Solutions'}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx('w-auto', className)}
      src={src || '/verify-logo.png'}
    />
  )
}
