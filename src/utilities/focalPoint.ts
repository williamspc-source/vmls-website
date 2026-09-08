import type { CSSProperties } from 'react'

import { mediaSrc } from './mediaSrc'

/**
 * Image framing helpers driven by Payload's native focal point.
 *
 * The Media collection has `focalPoint: true`, so every media doc carries
 * `focalX`/`focalY` (percentages) plus our custom `zoom` (percent). These
 * helpers surface that data as CSS so editors control the crop of every
 * headshot/avatar from the admin — no hardcoded `object-position` needed.
 */

export type FocalMedia = { url: string | null; focus: string | null; zoom: number | null }

type MediaLike = {
  url?: string | null
  focalX?: number | null
  focalY?: number | null
  zoom?: number | null
}

/**
 * Extract the url + a CSS `object-position` string + zoom from a (possibly
 * populated) media relationship. `focus` is null when the value is not a
 * populated media object (a bare id / missing), so callers can fall back to a
 * sensible default.
 */
export const mediaFocal = (m: unknown, boxWidth?: number): FocalMedia => {
  if (m && typeof m === 'object') {
    const o = m as MediaLike
    const hasFocal = typeof o.focalX === 'number' || typeof o.focalY === 'number'
    const focus = hasFocal
      ? `${typeof o.focalX === 'number' ? o.focalX : 50}% ${typeof o.focalY === 'number' ? o.focalY : 50}%`
      : null
    // `boxWidth` is the CSS width the photo renders at; doubling it keeps a
    // retina screen sharp. Omit it and the original file is served, which is
    // what every caller used to get — a 5246px headshot into a 265px card.
    // Callers pass a measured width, not a guess.
    const sized = typeof boxWidth === 'number' ? mediaSrc(o, boxWidth * 2) : null
    return {
      url: sized ?? (typeof o.url === 'string' ? o.url : null),
      focus,
      zoom: typeof o.zoom === 'number' ? o.zoom : null,
    }
  }
  return { url: null, focus: null, zoom: null }
}

/**
 * Inline `<img>` style for a headshot/avatar. `focus` is a CSS `object-position`
 * (from the Media focal point); when absent we keep the historical `top center`
 * framing so un-tuned images don't regress. `zoom` (percent) scales the image
 * about the focal point.
 */
export const focalImgStyle = (
  focus?: string | null,
  zoom?: number | null,
  base?: CSSProperties,
): CSSProperties => {
  const objectPosition = focus || 'top center'
  const style: CSSProperties = { objectFit: 'cover', objectPosition, ...base }
  if (typeof zoom === 'number' && zoom > 100) {
    style.transform = `scale(${zoom / 100})`
    style.transformOrigin = objectPosition
  }
  return style
}

/**
 * Inline style for the shared `<Media>` component. Applies the focal point /
 * zoom only when the resource is a populated media object carrying that data,
 * so generic imagery keeps its CSS-driven positioning and only person photos
 * (which we seed with a focal point) shift.
 */
export const focalMediaStyle = (resource: unknown): CSSProperties | undefined => {
  const { focus, zoom } = mediaFocal(resource)
  const zoomed = typeof zoom === 'number' && zoom > 100
  if (!focus && !zoomed) return undefined
  const objectPosition = focus || '50% 50%'
  const style: CSSProperties = { objectPosition }
  if (zoomed) {
    style.transform = `scale(${(zoom as number) / 100})`
    style.transformOrigin = objectPosition
  }
  return style
}
