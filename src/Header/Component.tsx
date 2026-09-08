import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { resolveBrandLogo } from '@/components/Logo/Logo'
import React from 'react'

export async function Header() {
  // Depth 2, not 1. Depth 1 populates the nav link's `reference` to a document,
  // but that document's own relationships stay as bare ids — and a Post's URL is
  // built from its `stream` (see postPath in src/utilities/routes.ts). At depth 1
  // `stream` was a number, postPath returned null, and CMSLink rendered the nav
  // item as inert text. Any global whose links can point at Posts needs depth 2.
  const headerData = await getCachedGlobal('header', 2)()
  const settings = await getCachedGlobal('site-settings', 1)()

  const logo = resolveBrandLogo(settings?.logo, 182) // .nav-logo img, measured 182px

  return <HeaderClient data={headerData} logo={logo} />
}
