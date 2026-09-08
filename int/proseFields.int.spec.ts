import type { Field, Payload } from 'payload'
import { getPayload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

/**
 * Every field an editor types words into is rich text — or it says why not.
 *
 * The site is handed to people who came from WordPress and expect to be able to
 * bold a phrase, colour a line, or add a link without asking a developer. This
 * asserts that from the *config*, which is the only place that knows the whole
 * surface: 22 collections, 10 globals and 52 blocks, including every field
 * nested inside an array, a group, a tab or a row.
 *
 * ## The list is the point
 *
 * A plain `text` field is not a failure — plenty of them must stay plain, and
 * rich text in a URL or an `<option>` would be a control that silently does
 * nothing, which is the worse fault. What must not happen is a field quietly
 * staying plain because nobody looked. So every exception is **data with a
 * reason**, in the shape `NOT_PORTED` uses in `referenceCssDiff.mjs`: add a
 * plain text field and this test fails until you either convert it or write down
 * why it stays.
 *
 * Proven red: turning `ValueCards`' card title back into a plain text field
 * fails with `pages.layout.valueCards.cards.title` — the full path, so you can
 * see which of the many `title` fields regressed.
 *
 * Note what that break costs. Running it boots Payload, and booting Payload runs
 * a dev schema push, so the deliberately-broken config is applied to the local
 * database: the column really does go back to varchar and has to be converted
 * again afterwards (`src/migrations/REFERENCE-inline-richtext.sql`, which is
 * idempotent for exactly this reason). Breaking a config here is not free.
 */

/**
 * Field names that stay plain wherever they appear, and why.
 *
 * Keyed by name rather than by path because these are properties of the *kind*
 * of value, not of one location: a URL is a URL on every block that has one.
 */
const PLAIN_BY_NAME: Record<string, string> = {
  // ── Icon keys ──
  // These were `select` fields, and so invisible to this guard, until uploads
  // made an enum impossible (an enum cannot hold a value created after the
  // schema was built) and `iconField` became `text`. They are keys a machine
  // resolves — `brain`, `upload:4`, `brain@deep` — chosen from a picker that
  // draws the icons, never words an editor types. Formatting one would be markup
  // inside a lookup key.
  icon: 'icon key, resolved by <Icon>; chosen from the icon picker, never typed',
  placeholderIcon: 'icon key, resolved by <Icon>',
  defaultIcon: 'icon key, resolved by <Icon>',
  badgeIcon: 'icon key, resolved by <Icon>',
  viewBox: 'derived from an uploaded SVG, read-only',
  icons: 'icon keys the Icon Library offers; chosen from a grid of pictures, never typed',
  markup: 'shape data rebuilt from an uploaded SVG, read-only',

  // ── Identifiers and routing ──
  slug: 'URL segment; slugField() and routes.ts read it',
  slugLock: 'slugField() internal',
  anchorId: 'rendered as an element id and targeted by #fragment links',
  anchor: 'appended to a link as #fragment',
  id: 'Payload/plugin-owned',

  // ── URLs and paths ──
  url: 'href',
  href: 'href',
  embedUrl: 'iframe src',
  videoId: 'provider id, interpolated into an embed URL',
  eventId: 'TryBooking event id — interpolated into a booking URL and a data-eid attribute',
  externalUrl: 'href',
  linkOverride: 'href',
  registrationUrl: 'href',
  hostEventUrl: 'href',
  bookingUrl: 'href',
  mapEmbedUrl: 'iframe src',
  contactUrl: 'href',
  servicePathPrefix: 'path prefix, joined with a slug',
  directoryPath: 'path, joined with a query string',
  secondaryCtaHref: 'href',
  breadcrumbParentHref: 'href',
  phoneHref: 'tel: href',
  uri: 'search index canonical URL, written by beforeSync',
  from: 'redirect source path',
  upcomingLinkUrl: 'href',
  pastLinkUrl: 'href',

  // ── Email and the enquiry mailto bodies ──
  email: 'mailto: address',
  enquiryEmail: 'mailto: address',
  registrationEnquiryEmail: 'mailto: address',
  enquirySubject: 'mailto: subject',
  portalEnquirySubject: 'mailto: subject',
  registrationEnquirySubject: 'mailto: subject',
  enquiryBodyIntro: 'mailto: body — markup cannot render in an email client',
  enquiryBodyFooter: 'mailto: body',
  registrationEnquiryBody: 'mailto: body; blank lines are preserved verbatim',
  portalEnquiryType: 'enquiry-type tag sent with the CTA',
  phone: 'tel: href and display number',

  // ── Attributes: alt, title, placeholder, aria ──
  alt: 'img alt attribute',
  videoTitle: 'iframe title attribute',
  placeholder: 'input placeholder attribute',
  searchPlaceholder: 'input placeholder attribute',
  navLabel: 'aria-label on the breadcrumb landmark',
  separator: 'a single character between crumbs',
  skipLinkLabel: 'the keyboard bypass link; kept plain so it is always announced',
  homeLabel: 'first breadcrumb crumb, rendered inside a link and read by assistive tech',
  breadcrumbSectionLabel: 'breadcrumb crumb',
  breadcrumbParentLabel: 'breadcrumb crumb',

  // ── Styling and tokens: these ARE the CSS ──
  cssClass: 'class names',
  elementClasses: 'class names',

  // ── Values with a format, or that feed a comparison ──
  startTime: 'HH:MM, validated',
  endTime: 'HH:MM, validated',
  days: 'opening-hours line, joined with the time',
  time: 'opening-hours line, joined with the days',
  address: 'interpolated into a Google Maps URL',
  firstName: 'directory sort key',
  lastName: 'directory sort key',
  availabilityNote: 'admin.hidden; written by a hook',
  region: 'grouping key for the locations list',
  excerpt: 'copied into the search index and used as a meta description',
  countTemplate: 'a {count} template, string-replaced',
  sessionsSelectedTemplate: 'a {count} template, string-replaced',
  cpdPointsTemplate: 'a {points} template, string-replaced',
  specialtyLabel: 'rendered inside <option>, which cannot contain markup',
  locationLabel: 'rendered inside <option>',
  accreditationLabel: 'rendered inside <option>',
  siteName: 'appended to every <title>',

  // ── Client-component chrome: passed as a string prop, not rendered as JSX ──
  moreInfoLabel: 'events list renders client-side; passed as a button label',
  viewRecapLabel: 'events list; button label',
  upcomingHeading: 'events list; section label prop',
  pastHeading: 'events list; section label prop',
  emptyUpcoming: 'events list; empty-state string prop',
  emptyUpcomingSearch: 'events list; empty-state string prop',
  emptyPast: 'events list; empty-state string prop',
  emptyPastSearch: 'events list; empty-state string prop',
  loadingLabel: 'events list; status string prop',
  datesLabel: 'events list; filter label prop',
  searchButtonLabel: 'events list; button label prop',
  modeInPersonLabel: 'availability picker; chip/legend label and part of the enquiry email',
  modeTelehealthLabel: 'availability picker; chip/legend label',
  modeEitherLabel: 'availability picker; chip/legend label',
  selectionHint: 'availability picker; status line',
  clearLabel: 'availability picker; button label',
  sendEnquiryLabel: 'availability picker; button label',
  notes: 'AvailabilitySessions internal staff note — staff-only, never rendered, so it is not visitor copy',
  cardCtaLabel: 'specialist directory renders client-side; button label',
  secondaryCtaLabel: 'specialist directory; button label',
  resetLabel: 'specialist directory; button label',
  locationsLabel: 'specialist directory; filter label',
  searchGroupLabel: 'specialist directory; the accessible name of a form control',
  specialtyGroupLabel: 'specialist directory; the accessible name of a form control',
  accreditationGroupLabel: 'specialist directory; the accessible name of a form control',
  allTabLabel: 'specialty directory; tab label prop',
  emptyLabel: 'specialty directory; empty-state string prop',
  enquiryLabel: 'profile CTA; button label',
  bookingLabel: 'profile CTA; button label',
  cvLabel: 'profile CTA; button label',
  sampleReportLabel: 'profile CTA; button label',
  registerLabel: 'event CTA; button label',
  contactLabel: 'event CTA; button label',
  hostEventLinkLabel: 'event CTA; button label',
  backToEventsLabel: 'event nav; link label',
  statusUpcomingLabel: 'event status badge',
  statusPastLabel: 'event status badge',
  freeLabel: 'event meta chip',
  cpdEligibleLabel: 'event meta chip',
  recapTocLabel: 'event recap nav; also its aria-label',
  bylinePrefix: 'article byline prefix, joined with the author name',
  minReadSuffix: 'reading-time suffix, joined with a number',
  shareLinkedinLabel: 'share button label',
  shareCopyLabel: 'share button label',
  readMoreLabel: 'card link label',
  ctaLabel: 'card link label',
  buttonLabel: 'form submit button label',
  timeLabel: 'joined into a meta line and searched client-side',
  walkTime: 'car-park meta line',
  heightLimit: 'car-park meta line',
  hoursNote: 'opening-hours footnote',
}

/**
 * Framework- and plugin-owned fields, and the two `elementClasses` leaves.
 *
 * These are not editor copy at all: `blockName` is Payload's own per-block admin
 * label (231 of them, one per block per nesting level), the upload fields are
 * written by the file handler, and the form-builder/auth fields belong to their
 * plugins. Matched on the whole path so that a *real* field of the same name
 * elsewhere is still checked.
 */
const PLAIN_BY_LEAF: Record<string, string> = {
  blockName: "Payload's own admin label for a block instance; never rendered",
  card: 'elementClasses leaf — CSS class names',
  button: 'elementClasses leaf — CSS class names',
  filename: 'upload field, written by the file handler',
  mimeType: 'upload field',
  thumbnailURL: 'upload field',
  hash: 'auth field',
  salt: 'auth field',
  resetPasswordToken: 'auth field',
  relationTo: 'polymorphic relationship discriminator',
  categoryID: 'search plugin, written by beforeSync',
  defaultValue: "form-builder: a form field's own default, submitted as data",
  submitButtonLabel: 'form-builder button label, rendered by the form component',
  emailTo: 'form-builder recipient',
  emailFrom: 'form-builder sender',
  replyTo: 'form-builder reply-to',
  cc: 'form-builder cc',
  bcc: 'form-builder bcc',
  subject: 'form-builder email subject',
  locationGroupLabel: 'specialist directory; the accessible name of a form control',
}

/**
 * Names that are ambiguous, allowed only at specific PATHS.
 *
 * This half exists because the first version of this guard was name-keyed
 * throughout, and that made it blind in the way `readsField` is blind to a
 * shared name: `title` was excused as "the record name", so turning a *card*
 * title back into a plain text field passed. Measured — the break stayed green.
 *
 * A regex here is a claim about one location. `heading` is plain only as a CSS
 * class slot; `title` only as a collection's own record name.
 */
const PLAIN_BY_PATH: { pattern: RegExp; reason: string }[] = [
  { pattern: /\.elementClasses\.(heading|card|button)$/, reason: 'CSS class names' },
  { pattern: /^[a-z-]+\.title$/, reason: "a collection's own record name (admin.useAsTitle)" },
  { pattern: /^[a-z-]+\.name$/, reason: "a collection's own record name" },
  { pattern: /^forms\.fields\./, reason: 'form-builder owns these: field name, label, options' },
  { pattern: /^custom-styles\.presets\./, reason: 'a CSS class name and its admin-only description' },
  { pattern: /\.breadcrumbs\.label$/, reason: 'breadcrumb crumb, written by the nested-docs plugin' },
  { pattern: /^categories\.color$/, reason: 'a hex for the category chip' },
  { pattern: /^events\.guestPresenters\.name$/, reason: 'presenter name, joined into a meta line' },
  {
    pattern: /^posts\.author\.name$/,
    reason: 'byline name — joined with the prefix and used as the avatar alt text',
  },
  { pattern: /^posts\.populatedAuthors\./, reason: 'readOnly; written by a Payload hook' },
  { pattern: /^search\./, reason: 'search index, written by beforeSync; never edited' },
  {
    pattern: /^specialist-availability\.heading$/,
    reason: 'admin.hidden — a superseded field kept only so old data still validates',
  },
  {
    pattern: /^specialists\.languages\.language$/,
    reason: 'joined with ", " into one line, so formatting would be dropped',
  },
  { pattern: /^map-embed\.title$|\.mapEmbed\.title$/, reason: 'iframe title attribute' },
  { pattern: /\.sectionNav\.items\.label$/, reason: 'nav pill paired 1:1 with an anchorId' },
  { pattern: /\.(section|row)\.(title|label|text)$/, reason: 'layout primitive admin labels' },
]

/**
 * Whole collections Payload and its plugins own, plus the SEO meta fields.
 *
 * `payload-kv`, `payload-jobs`, `payload-locked-documents` and
 * `payload-preferences` are framework tables that appear in the config but hold
 * no editor content at all; `form-submissions` holds what visitors typed; and
 * `site-settings.colors.*` is the 38-field brand palette and `design-system.*` the
 * 51 spacing/size/radius tokens — all of them CSS *values*, validated against the
 * same regex the runtime emitter uses.
 */
const PLAIN_PREFIXES = [
  'meta.',
  'payload-kv.',
  'payload-jobs.',
  'payload-locked-documents.',
  'payload-preferences.',
  'form-submissions.',
  'site-settings.colors.',
  'design-system.',
  '_order',
]

let payload: Payload

type Found = { path: string; type: string }

const collectFields = (fields: Field[], prefix: string, out: Found[]): void => {
  for (const field of fields) {
    const f = field as unknown as {
      type: string
      name?: string
      fields?: Field[]
      tabs?: { name?: string; fields?: Field[] }[]
      blocks?: { slug: string; fields: Field[] }[]
    }
    const path = f.name ? `${prefix}${f.name}` : prefix

    if (f.type === 'text' || f.type === 'textarea') {
      out.push({ path, type: f.type })
      continue
    }
    if (Array.isArray(f.fields)) collectFields(f.fields, f.name ? `${path}.` : prefix, out)
    if (Array.isArray(f.tabs))
      for (const tab of f.tabs)
        if (Array.isArray(tab.fields))
          collectFields(tab.fields, tab.name ? `${prefix}${tab.name}.` : prefix, out)
    if (Array.isArray(f.blocks))
      for (const block of f.blocks) collectFields(block.fields, `${path}.${block.slug}.`, out)
  }
}

const unexplained = (found: Found[]): string[] =>
  found
    .filter(({ path }) => {
      const name = path.split('.').pop()!
      if (PLAIN_BY_NAME[name]) return false
      if (PLAIN_BY_LEAF[name]) return false
      if (PLAIN_BY_PATH.some(({ pattern }) => pattern.test(path))) return false
      if (PLAIN_PREFIXES.some((p) => path.includes(p))) return false
      return true
    })
    .map(({ path, type }) => `${path} (${type})`)

describe('every field an editor types words into', () => {
  // 30s, not the 10s default: booting Payload takes ~7s now that the config
  // carries 521 rich-text fields (measured 2026-08-21), and a cold schema pull
  // pushes it past the default hook timeout. The symptom is a *skipped* test,
  // not a failed one — the suite reports green while checking nothing.
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
 }, 30_000)

  it('finds a surface to check', () => {
    // Positive control. Both assertions below iterate a list; an empty list
    // would pass while checking nothing, which is how a guard reports success
    // about a config it is no longer reading.
    expect(payload.config.collections.length).toBeGreaterThan(15)
    expect(payload.config.globals.length).toBeGreaterThan(5)
  })

  it('is rich text, or is named in the list above with a reason', () => {
    const found: Found[] = []
    for (const collection of payload.config.collections)
      collectFields(collection.fields, `${collection.slug}.`, found)
    for (const global of payload.config.globals)
      collectFields(global.fields, `${global.slug}.`, found)

    // Sanity: the walk must actually reach the nested fields, not just the top
    // level. Without this, a broken recursion reads as "everything converted".
    expect(found.length, 'the walk found no plain text fields at all').toBeGreaterThan(50)

    const gaps = unexplained(found)
    expect(
      gaps,
      `these are plain text with no recorded reason. Either convert them with ` +
        `inlineRichTextField(), or add the name to PLAIN_BY_NAME saying why editors ` +
        `cannot format them:\n  ${gaps.join('\n  ')}`,
    ).toEqual([])
  })
})
