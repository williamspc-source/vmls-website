/**
 * Writes `photo-inventory.csv` and `content-inventory.csv` at the repo root.
 *
 *   pnpm payload run scripts/inventory.ts
 *
 * Both are review documents: every place an image can go, and every page,
 * article and event. They go stale the moment content changes — a deleted and
 * reseeded document comes back with a NEW id, so the `admin_url` column starts
 * pointing at a record that no longer exists. Re-run rather than hand-edit.
 *
 * Two things it is careful about, because both produced wrong answers first time:
 *
 *  - It walks documents at depth 0. At depth 1 the walk descends into POPULATED
 *    RELATIONSHIPS and re-reports their slots against the wrong document — 69
 *    phantom rows came from `relatedPosts` alone.
 *  - Every URL comes from `src/utilities/routes.ts`. Interpolating them by hand
 *    produced `/in-the-loop/<slug>`, which 404s: an article's real path carries
 *    its stream, and `postPath` returns null when it has none.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- this script deep-walks
   arbitrary Payload documents, where the shape at each node is genuinely unknown;
   narrowing it would mean restating every collection's generated type to describe
   a traversal that deliberately does not care what it is walking. */
import { getPayload } from 'payload'
import config from '@payload-config'
import { writeFileSync } from 'fs'
import { docPath, postPath, eventPath, specialistPath, teamPath } from '../src/utilities/routes'
import { isEventPast } from '../src/utilities/eventTiming'

const payload = await getPayload({ config })
const esc = (s: unknown) => `"${String(s ?? '').replace(/"/g, '""')}"`
const write = (file: string, header: string[], rows: unknown[][]) =>
  writeFileSync(file, [header, ...rows].map((r) => r.map(esc).join(',')).join('\n') + '\n')

// ─────────────────────────────────────────────────────────── photo inventory ──
const IMAGE_FIELDS = new Set(['image', 'media', 'photo', 'heroImage', 'logo', 'logoFooter', 'favicon', 'shield', 'socialImage'])
const mediaMap = new Map<string, string>()
for (const m of (await payload.find({ collection: 'media', limit: 1000, depth: 0 })).docs as any[]) mediaMap.set(String(m.id), m.filename ?? String(m.id))
const fileOf = (v: unknown) => (v == null ? '' : mediaMap.get(String(typeof v === 'object' ? (v as any).id : v)) ?? String(v))

const P1 = '1 — placeholder or fallback showing', P2 = '2 — renders without it', P3 = '3 — optional'
const FALLBACK_FILE = 'Yes — built-in fallback file', PLACEHOLDER = 'Yes — placeholder box', NONE = 'No'
type Info = [string, string, string]
const INFO: Record<string, Info> = {
  'site-settings.logo': [P1, 'Bundled VERIFY wordmark', FALLBACK_FILE],
  'site-settings.logoFooter': [P3, 'Falls back to the main logo', 'Yes — the main logo'],
  'site-settings.favicon': [P2, 'public/favicon.png', FALLBACK_FILE],
  'site-settings.shield': [P1, 'Bundled shield PNG — 1166px wide, unoptimisable (OUTSTANDING §12)', FALLBACK_FILE],
  'site-settings.socialImage': [P2, 'No preview image when a page is shared', 'No — link previews only'],
  'meta.image': [P3, 'Falls back to Site Settings → Social image', 'Yes — site-wide share card'],
  'specialists.photo': [P2, "The person's initials on a plain avatar", 'Yes — initials placeholder'],
  'team.photo': [P2, "The person's initials on a plain avatar", 'Yes — initials placeholder'],
  'services.photo': [P1, 'Blue gradient tile with the service icon and "Image Placeholder"', PLACEHOLDER],
  'posts.heroImage': [P2, 'Article header renders with no image behind it', NONE],
  'posts.photo': [P3, 'Byline renders with no avatar; can come from a linked Team member', NONE],
  'events.image': [P2, 'Event card renders without an image', NONE],
  'events.gallery': [P3, 'The recap gallery appears only once a photo is added', NONE],
  'hero.media': [P2, 'Hero renders without its image panel', NONE],
  'whyVerify.image': [P1, 'Labelled gradient box', PLACEHOLDER],
  'leadershipSpotlight.photo': [P1, 'Labelled box with a person icon', PLACEHOLDER],
  'faq.image': [P3, 'Split layout only, and only the FIRST item that has one is used', NONE],
  'slideCarousel.image': [P3, 'Nothing renders for that slide', NONE],
  'mediaBlock.media': ['required', 'Required field — always set', 'Yes — uploaded image'],
  'image.media': ['required', 'Required field — always set', 'Yes — uploaded image'],
}
const infoFor = (key: string, slot: string, ph: boolean): Info => {
  if (slot.endsWith('meta.image')) return INFO['meta.image']!
  if (slot.includes('gallery')) return INFO['events.gallery']!
  if (key === 'splitFeature.image' || key === 'aamleEducation.image')
    return ph ? [P1, 'Pale-blue placeholder tile is on screen now', PLACEHOLDER]
              : [P3, 'The row goes full width — nothing looks unfinished', NONE]
  // Process Steps carries a photo only on the `claimant` layout; the field is
  // hidden on the other three, so a row here always means that one section.
  if (key === 'processSteps.image')
    return ph ? [P1, 'Pale-blue placeholder tile is on screen now', PLACEHOLDER]
              : [P3, 'Nothing renders — the column is intro copy alone', NONE]
  return INFO[key] ?? [P3, 'Nothing renders when empty', NONE]
}

type Hit = { slot: string; label: string; value: unknown; key: string; ph: boolean; variant: string }
const walk = (node: unknown, path: string, ctx: { block: string; label: string; ph: boolean; variant: string }, out: Hit[]): void => {
  if (Array.isArray(node)) { node.forEach((v, i) => walk(v, `${path}[${i}]`, ctx, out)); return }
  if (!node || typeof node !== 'object') return
  const o = node as Record<string, unknown>
  if (path && o.id !== undefined && (o.updatedAt !== undefined || o.filename !== undefined)) return
  const block = typeof o.blockType === 'string' ? o.blockType : ctx.block
  const own = ['eyebrow', 'heading', 'title', 'name', 'label', 'placeholderLabel'].map((k) => (typeof o[k] === 'string' && o[k] ? String(o[k]) : null)).filter(Boolean)
  const label = own.length ? `${block ? block + ' · ' : ''}${own.join(' · ')}` : ctx.label || block
  const ph = typeof o.imagePlaceholder === 'boolean' ? o.imagePlaceholder : ctx.ph
  const variant = typeof o.variant === 'string' ? o.variant : ctx.variant
  for (const [k, v] of Object.entries(o)) {
    if (IMAGE_FIELDS.has(k)) { out.push({ slot: path ? `${path}.${k}` : k, label, value: v, key: `${block}.${k}`, ph, variant }); continue }
    if (v && typeof v === 'object') walk(v, path ? `${path}.${k}` : k, { block, label, ph, variant }, out)
  }
}

const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as any
const photo: unknown[][] = []
/**
 * `INHERITED` is its own state on purpose. An unset field that resolves to a
 * site-wide default which IS set needs no action, and reporting it as EMPTY —
 * beside a `renders_today` of "yes" — read as 112 outstanding jobs when there
 * were none. It is conditional on the parent actually being set.
 */
const push = (pri: string, area: string, doc: string, url: string, admin: string, slot: string, what: string, val: unknown, empty: string, renders: string, supply: string) => {
  const inherits = slot.endsWith('meta.image') ? settings?.socialImage : slot === 'logoFooter' ? settings?.logo : null
  const status = val ? 'SET' : inherits ? 'INHERITED' : 'EMPTY'
  photo.push([pri, area, doc, url ?? '', admin, slot, what, status, val ? 'Yes — uploaded image' : renders, fileOf(val), val ? '' : empty, supply, ''])
}

for (const f of ['logo', 'logoFooter', 'favicon', 'shield', 'socialImage']) {
  const [pri, empty, renders] = INFO[`site-settings.${f}`]!
  push(pri, 'Brand', 'Site Settings', 'site-wide', '/admin/globals/site-settings', f, 'Brand asset', settings[f], empty, renders, 'Upload in the admin')
}

const HONORIFICS = /^(dr|drs|adj|adjunct|prof|professor|assoc|associate|a|aprof|ms|mr|mrs|mx)$/i
const bareName = (t: string) => { const p = t.split(/[^A-Za-z0-9]+/).filter(Boolean); while (p.length && HONORIFICS.test(p[0]!)) p.shift(); return p.join(' ') }

const streamSlugs = new Map<string, string>()
for (const s of (await payload.find({ collection: 'streams', limit: 200, depth: 0 })).docs as any[]) streamSlugs.set(String(s.id), s.slug)

const COLLECTIONS = [
  ['specialists', 'Specialist', 'People', (d: any) => specialistPath(d.slug)],
  ['team', 'Team', 'People', (d: any) => teamPath(d.slug)],
  ['services', 'Service', 'Content', () => '/services'],
  ['posts', 'Article', 'Content', (d: any) => postPath({ slug: d.slug, stream: d.stream ? { slug: streamSlugs.get(String(d.stream)) } : null })],
  ['events', 'Event', 'Content', (d: any) => eventPath(d.slug)],
] as const

for (const [coll, name, area, url] of COLLECTIONS) {
  for (const d of (await payload.find({ collection: coll as never, limit: 500, depth: 0, sort: 'title' })).docs as any[]) {
    const hits: Hit[] = []
    walk(d, '', { block: coll, label: name, ph: false, variant: '' }, hits)
    for (const h of hits) {
      const [pri, empty, renders] = infoFor(`${coll}.${h.slot.split('.').pop()}`, h.slot, h.ph)
      const supply = h.slot === 'photo' && coll === 'specialists' ? `public/assets/images/specialist/${bareName(d.title)}.png   (PNG — transparent)`
        : h.slot === 'photo' && coll === 'team' ? `public/assets/images/team/${d.slug}.jpg   (JPEG fine — opaque)` : 'Upload in the admin'
      push(pri, area, `${name}: ${d.title}`, url(d) ?? '(no URL)', `/admin/collections/${coll}/${d.id}`, h.slot,
        h.slot.endsWith('meta.image') ? `${name} social preview image` : h.label, h.value, empty, renders, supply)
    }
  }
}

const HERO_ALWAYS = ['highImpact', 'mediumImpact', 'homeHero']
const pages = (await payload.find({ collection: 'pages', limit: 400, depth: 0, sort: 'title' })).docs as any[]
for (const p of pages) {
  const url = docPath(p), admin = `/admin/collections/pages/${p.id}`
  // The hero upload is hidden unless the hero type uses it, so listing it
  // everywhere would invent 27 slots the admin does not actually offer.
  const heroOffered = HERO_ALWAYS.includes(p.hero?.type) || (p.hero?.type === 'pageHero' && p.hero?.imagePanel)
  const hits: Hit[] = []
  walk({ hero: p.hero, layout: p.layout, meta: p.meta }, '', { block: '', label: 'Page', ph: false, variant: '' }, hits)
  for (const h of hits) {
    if (h.slot === 'hero.media' && !heroOffered) continue
    // Process Steps stores an `image` column for every block, but the field is
    // shown only on the `claimant` layout — the other three have no column to
    // put a photo in. Listing them would invent five slots nobody can fill.
    if (h.key === 'processSteps.image' && h.variant !== 'claimant') continue
    const [pri, empty, renders] = h.slot === 'hero.media' ? INFO['hero.media']! : infoFor(h.key, h.slot, h.ph)
    push(pri, 'Page', `Page: ${p.title}`, url, admin, h.slot,
      h.slot === 'hero.media' ? `Page hero (${p.hero?.type})` : h.slot.endsWith('meta.image') ? 'Page social preview image' : h.label,
      h.value, empty, renders, 'Upload in the admin')
  }
}

const rank = (r: any[]) => (String(r[0]).startsWith('1') ? 0 : String(r[0]).startsWith('2') ? 1 : r[0] === 'required' ? 3 : 2)
photo.sort((a: any, b: any) => rank(a) - rank(b) || String(a[1]).localeCompare(String(b[1])) || String(a[2]).localeCompare(String(b[2])))
write('photo-inventory.csv',
  ['priority', 'area', 'document', 'public_url', 'admin_url', 'slot', 'what_it_is', 'field_status', 'renders_today', 'current_file', 'if_left_empty', 'supply_via', 'your_file_or_notes'], photo)

// ───────────────────────────────────────────────────────── content inventory ──
const content: unknown[][] = []
const day = (v: unknown) => (typeof v === 'string' && v ? v.slice(0, 10) : '')
const stat = (d: any) => (d._status === 'draft' ? 'DRAFT' : 'Published')
const countBlocks = (n: unknown): number => {
  if (Array.isArray(n)) return n.reduce<number>((t, v) => t + countBlocks(v), 0)
  if (!n || typeof n !== 'object') return 0
  const o = n as Record<string, unknown>
  let t = typeof o.blockType === 'string' ? 1 : 0
  for (const v of Object.values(o)) if (v && typeof v === 'object') t += countBlocks(v)
  return t
}
for (const p of pages) {
  const crumbs = (p.breadcrumbs ?? []) as { url?: string }[]
  const url = docPath(p)
  content.push(['Page', p.title, url, `/admin/collections/pages/${p.id}`, stat(p), day(p.updatedAt),
    crumbs.length > 1 ? crumbs[crumbs.length - 2]?.url : url === '/' ? '' : '/',
    `${p.hero?.type ?? 'none'} hero · ${countBlocks(p.layout)} blocks · depth ${Math.max(0, crumbs.length - 1)}`, ''])
}
for (const a of (await payload.find({ collection: 'posts', limit: 500, depth: 0, sort: '-publishedAt' })).docs as any[]) {
  const slug = a.stream ? streamSlugs.get(String(a.stream)) : undefined
  content.push(['Article', a.title, postPath({ slug: a.slug, stream: slug ? { slug } : null }) ?? '(no URL — no stream, so it cannot be linked)',
    `/admin/collections/posts/${a.id}`, stat(a), day(a.publishedAt), slug ?? '(no stream)',
    [a.author?.name && `by ${a.author.name}`, a.readTime].filter(Boolean).join(' · '), ''])
}
for (const e of (await payload.find({ collection: 'events', limit: 400, depth: 0, sort: '-date' })).docs as any[]) {
  content.push(['Event', e.title, eventPath(e.slug), `/admin/collections/events/${e.id}`, stat(e), day(e.date),
    isEventPast({ date: e.date }) ? 'Past' : 'Upcoming',
    [e.timeLabel, e.location, e.host && `host: ${e.host}`, e.cpdEligible && `CPD${e.cpdPoints ? ` ${e.cpdPoints}` : ''}`, e.cost].filter(Boolean).join(' · '), ''])
}
write('content-inventory.csv', ['type', 'title', 'public_url', 'admin_url', 'status', 'date', 'group', 'detail', 'your_notes'], content)

const by = (rows: unknown[][], i: number) => { const c: Record<string, number> = {}; for (const r of rows) c[String(r[i])] = (c[String(r[i])] ?? 0) + 1; return c }
console.log('photo-inventory.csv  ', photo.length, 'slots', JSON.stringify(by(photo, 7)))
console.log('content-inventory.csv', content.length, 'documents', JSON.stringify(by(content, 0)))
process.exit(0)
