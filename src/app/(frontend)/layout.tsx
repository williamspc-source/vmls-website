import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import localFont from 'next/font/local'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { CustomCSS } from '@/components/CustomCSS'
import { MotionObserver } from '@/components/Reveal'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { EnquiryDrawer } from '@/components/EnquiryDrawer'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { buildTokenCss, iconDefaultCss } from '@/utilities/cssTokens'
import { getCachedIconDefaults } from '@/utilities/getIconDefaults'
import { getEnquiryFormId } from '@/utilities/enquiryForm'

// ── Typefaces ───────────────────────────────────────────────────────────────
// Three faces, matching the design reference (.design-reference/assets/css/styles.css):
//   headings → Montserrat        (styles.css:23)
//   body     → Open Sans         (styles.css:24)
//   display  → MuseoSansRounded  (styles.css:1-8, consumed by .hero-def-word alone)
// All self-hosted so the build has no network dependency. Which face each role
// actually uses is decided by --font-heading/--font-body in globals.css, and
// editors can override those from the Design System global.

// Montserrat and Open Sans are variable fonts: one file spans the whole weight
// axis, so an editor dialling in any weight is already covered. Latin subset only
// — next/font/local does no subsetting and its src entries take no unicodeRange,
// so if latin-ext is ever needed, add a hand-written @font-face with a
// unicode-range in globals.css against a file in public/ rather than here.
const montserrat = localFont({
  src: [
    { path: './fonts/montserrat/Montserrat-Variable.latin.woff2', weight: '100 900', style: 'normal' },
  ],
  variable: '--font-montserrat',
  display: 'swap',
  adjustFontFallback: 'Arial',
  fallback: ['Helvetica Neue', 'Arial', 'sans-serif'],
})

const openSans = localFont({
  src: [
    { path: './fonts/open-sans/OpenSans-Variable.latin.woff2', weight: '300 800', style: 'normal' },
    {
      path: './fonts/open-sans/OpenSans-Italic-Variable.latin.woff2',
      weight: '300 800',
      style: 'italic',
    },
  ],
  variable: '--font-open-sans',
  display: 'swap',
  adjustFontFallback: 'Arial',
  fallback: ['Helvetica Neue', 'Arial', 'sans-serif'],
})

// VERIFY brand typeface (licensed — see ./fonts/README.md). Split in two: the 900
// weight is preloaded because the homepage hero definition word renders it above
// the fold, while the full range stays available but unpreloaded so an editor can
// switch the site back to Museo from the Design System global without shipping six
// font files to every visitor who never sees them.
const museoDisplay = localFont({
  src: [{ path: './fonts/museo/MuseoSansRounded900.woff', weight: '900', style: 'normal' }],
  variable: '--font-museo-display',
  display: 'swap',
})

const museo = localFont({
  src: [
    { path: './fonts/museo/MuseoSansRounded100.woff', weight: '100', style: 'normal' },
    { path: './fonts/museo/MuseoSansRounded300.woff', weight: '300', style: 'normal' },
    { path: './fonts/museo/MuseoSansRounded500.woff', weight: '400', style: 'normal' },
    { path: './fonts/museo/MuseoSansRounded500.woff', weight: '500', style: 'normal' },
    { path: './fonts/museo/MuseoSansRounded700.woff', weight: '600', style: 'normal' },
    { path: './fonts/museo/MuseoSansRounded700.woff', weight: '700', style: 'normal' },
    { path: './fonts/museo/MuseoSansRounded900.woff', weight: '800', style: 'normal' },
    { path: './fonts/museo/MuseoSansRounded900.woff', weight: '900', style: 'normal' },
    { path: './fonts/museo/MuseoSansRounded1000.woff', weight: '1000', style: 'normal' },
  ],
  variable: '--font-museo',
  display: 'swap',
  preload: false,
})

// Resolves a Site Settings upload field (populated at depth 1) to a media doc.
type MediaLike = { url?: string | null; updatedAt?: string | null; mimeType?: string | null }
const asMedia = (value: unknown): MediaLike | null =>
  value && typeof value === 'object' && 'url' in value ? (value as MediaLike) : null

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const settings = await getCachedGlobal('site-settings', 1)()
  const designTokens = await getCachedGlobal('design-system', 0)()
  // Brand colours + editable design-system tokens become CSS vars on :root.
  // Emitted as a real stylesheet rather than an inline style on <html>: an
  // inline style outranks every selector, which made Custom Styles → Global CSS
  // unable to override any token. See src/utilities/cssTokens.ts for the
  // three-layer ordering contract this relies on.
  // The shield rides along as a token because two of its three consumers are
  // CSS-only (`.page-hero-shield`, the contact portal cards) and used to hardcode
  // the bundled asset — so a new upload changed the home hero alone.
  const shield = asMedia(settings?.shield)
  const tokenCss = buildTokenCss(
    settings?.colors,
    designTokens,
    shield?.url ? getMediaUrl(shield.url, shield.updatedAt) : null,
  )

  // Each uploaded icon's own default colour, as `[data-vf-icon="12"]{color:…}`.
  // It rides in the same <style> tag because it belongs to the same layer: a
  // value an editor set, resolving through a brand token. See getIconDefaults.ts
  // for why this is published rather than read at render time.
  const iconCss = iconDefaultCss(await getCachedIconDefaults())

  // Site Settings → Enquiry drawer form, with a logged server-side fallback when
  // the pointer is empty. See src/utilities/enquiryForm.ts.
  const enquiryFormId = await getEnquiryFormId()

  return (
    <html
      className={cn(
        montserrat.variable,
        openSans.variable,
        museoDisplay.variable,
        museo.variable,
        GeistMono.variable,
      )}
      lang="en"
      suppressHydrationWarning
    >
      <body>
        {/* First focusable thing on the page, and invisible until it is focused.
            Without it a keyboard or screen-reader user traverses the whole nav on
            every page. The label is editable (Site Settings → Accessibility) but
            the link itself is not optional, so an empty value falls back rather
            than removing the only way past the navigation. */}
        <a className="skip-link" href="#main-content">
          {settings?.accessibility?.skipLinkLabel || 'Skip to content'}
        </a>
        {/* Order is load-bearing: CMS token values first, then Custom Styles,
            so an editor's Global CSS can override any token. Both sit above any
            painted element, so neither causes a flash of unstyled content. */}
        {tokenCss || iconCss ? (
          <style
            id="verify-design-tokens"
            dangerouslySetInnerHTML={{ __html: [tokenCss, iconCss].filter(Boolean).join('\n') }}
          />
        ) : null}
        <CustomCSS />
        <MotionObserver />
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header />
          {/* The site's main landmark. It lives here rather than on each page's
              own <article> because /search has no <article> at all, and a landmark
              that most pages have is the kind of gap an audit finds. The footer
              keeps `mt-auto` as a direct flex child of <body>, so the sticky
              footer is unaffected by this wrapper. */}
          <main id="main-content">{children}</main>
          <Footer />
          <EnquiryDrawer formId={enquiryFormId} />
        </Providers>
      </body>
    </html>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedGlobal('site-settings', 1)()
  const siteName = settings?.siteName || 'VERIFY Medico-Legal Solutions'

  const favicon = asMedia(settings?.favicon)
  const iconHref = favicon?.url
    ? getMediaUrl(favicon.url, favicon.updatedAt)
    : '/favicon.png'
  const appleHref = favicon?.url
    ? getMediaUrl(favicon.url, favicon.updatedAt)
    : '/apple-touch-icon.png'

  const social = asMedia(settings?.socialImage)
  const socialPath =
    (settings?.socialImage as { sizes?: { og?: { url?: string | null } } } | undefined)?.sizes?.og
      ?.url || social?.url
  const ogImages = socialPath ? [{ url: `${getServerSideURL()}${socialPath}` }] : undefined

  return {
    metadataBase: new URL(getServerSideURL()),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    icons: {
      icon: [{ url: iconHref, ...(favicon?.mimeType ? { type: favicon.mimeType } : {}) }],
      apple: [{ url: appleHref }],
    },
    openGraph: mergeOpenGraph({
      siteName,
      title: siteName,
      ...(ogImages ? { images: ogImages } : {}),
    }),
    twitter: {
      card: 'summary_large_image',
    },
  }
}
