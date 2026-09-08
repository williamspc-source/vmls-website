import React from 'react'
import Link from 'next/link'

import { cn } from '@/utilities/ui'
import type { Crumb } from '@/utilities/breadcrumbs'

type BreadcrumbsProps = {
  items?: Crumb[] | null
  /** Separator glyph. Defaults to the design reference's U+203A. */
  separator?: string | null
  /** Accessible name for the landmark. */
  label?: string | null
  className?: string
}

/**
 * The one breadcrumb trail. Ports the design reference's `.page-hero-breadcrumb`
 * — the modal value of its twelve near-identical variants — and replaces the
 * build's `.art-breadcrumb`, `.profile-breadcrumb` and `.staff-hero-breadcrumb`.
 *
 * Tone and alignment are INHERITED, never passed: `.vf-on-dark` re-points the
 * three `--bc-*` colours and `.page-hero--center` re-points `justify-content`.
 * A `tone` prop would mean every call site asserting something a class two
 * levels up already decides, which is exactly how the reference ended up with
 * twelve variants of one component.
 *
 * Styling hangs off classes, never tag selectors, so the current item can be a
 * `<span aria-current>` rather than the reference's `<strong>` without the CSS
 * caring.
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator,
  label,
  className,
}) => {
  const crumbs = (items ?? []).filter((c) => c?.label?.trim())

  // A lone "Home" above a heading is noise, not wayfinding. Enforced here rather
  // than at each call site so it cannot be forgotten by one of them.
  if (crumbs.length < 2) return null

  const sep = separator?.trim() || '›'

  return (
    <nav aria-label={label?.trim() || 'Breadcrumb'} className={cn('vf-breadcrumb-nav', className)}>
      <ol className="vf-breadcrumb">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <li key={`${crumb.url ?? ''}-${i}`} className="vf-breadcrumb__item">
              {i > 0 ? (
                <span className="vf-breadcrumb__sep" aria-hidden="true">
                  {sep}
                </span>
              ) : null}
              {isLast || !crumb.url ? (
                <span
                  className="vf-breadcrumb__current"
                  {...(isLast ? { 'aria-current': 'page' as const } : {})}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.url} className="vf-breadcrumb__link">
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
