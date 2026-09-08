'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'

import type { Header } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { CMSLink } from '@/components/Link'
import { Logo, type BrandLogo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
  logo: BrandLogo | null
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, logo }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close the mobile menu whenever the route changes — including on Back/Forward,
  // which an onClick on the links would miss.
  //
  // Adjusted during render rather than in an effect. React documents this exact
  // pattern ("adjusting state when a prop changes"): the extra render happens
  // before the browser paints, so the menu is never briefly visible on the new
  // page. The effect version rendered the open menu once, then closed it.
  const [renderedPath, setRenderedPath] = useState(pathname)
  if (renderedPath !== pathname) {
    setRenderedPath(pathname)
    setMenuOpen(false)
  }

  const cta = data?.cta

  return (
    <nav className={cn('site-nav', menuOpen && 'nav-open')}>
      <div className="container">
        <div className="nav-inner">
          <Link href="/" className="nav-logo" aria-label="VERIFY Medico-Legal Solutions">
            <Logo {...(logo ?? {})} loading="eager" priority="high" />
          </Link>

          <HeaderNav data={data} menuOpen={menuOpen} />

          {cta?.enabled && cta?.link?.label ? (
            <CMSLink {...cta.link} appearance="inline" className="btn btn-primary nav-cta" />
          ) : null}

          <button
            type="button"
            className="hamburger"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  )
}
