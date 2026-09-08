import { richTextToPlain, type RichTextValue } from '@/utilities/lexicalText'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { SpecialtyDirectoryBlock as Props } from '@/payload-types'

import { Section, type SectionBackground } from '@/components/Section'
import { SectionHeader } from '@/components/SectionHeader'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'
import { mediaFocal } from '@/utilities/focalPoint'

import { SpecialtyClient, type Category, type SpecialtyEntry, type RosterPerson } from './SpecialtyClient'

// id of a relationship value whether populated (object) or a raw id.
const relId = (v: unknown): string | null => {
  if (v && typeof v === 'object' && 'id' in v) return String((v as { id: unknown }).id)
  if (typeof v === 'number' || typeof v === 'string') return String(v)
  return null
}
const relTitles = (rels: unknown): string[] =>
  Array.isArray(rels)
    ? rels
        .map((r) => (r && typeof r === 'object' && 'title' in r ? (r as { title?: string }).title : null))
        .filter((t): t is string => Boolean(t))
    : []

export const SpecialtyDirectoryBlock: React.FC<Props & { bare?: boolean }> = async (props) => {
  const { eyebrow, heading, subheading, textColour, background, showFilterBar, showRosters, showKeyAreas, cssClass, bare } =
    props

  // Newer config fields — read defensively so a not-yet-regenerated
  // `payload-types` doesn't fail typecheck.
  const { allTabLabel, emptyLabel } = props as Props & {
    allTabLabel?: RichTextValue
    emptyLabel?: RichTextValue
  }

  const payload = await getPayload({ config: configPromise })
  const [specialtiesRes, specialistsRes, categoriesRes] = await Promise.all([
    payload.find({ collection: 'specialties', depth: 1, limit: 200, sort: 'order' }),
    payload.find({
      collection: 'specialists',
      depth: 1,
      limit: 500,
      sort: '_order',
      where: { _status: { equals: 'published' } },
    }),
    payload.find({ collection: 'specialty-categories', depth: 0, limit: 100, sort: 'order' }),
  ])

  // Group specialists under their specialty id.
  const bySpecialty = new Map<string, RosterPerson[]>()
  for (const s of specialistsRes.docs) {
    const specId = relId(s.specialty)
    if (!specId) continue
    const photo = mediaFocal(s.photo, 150) // .spec-photo-img, measured 150px
    const person: RosterPerson = {
      id: String(s.id),
      name: s.title,
      position: richTextToPlain(s.position) || null,
      slug: s.slug ?? null,
      locations: relTitles(s.locations),
      photoUrl: photo.url,
      photoFocus: photo.focus,
      photoZoom: photo.zoom,
    }
    const list = bySpecialty.get(specId) ?? []
    list.push(person)
    bySpecialty.set(specId, list)
  }

  const entries: SpecialtyEntry[] = specialtiesRes.docs.map((sp) => ({
    id: String(sp.id),
    title: sp.title,
    description: (sp as { description?: string | null }).description ?? null,
    categoryId: relId((sp as { category?: unknown }).category),
    // Flattened: these become filter chips the client also matches on.
    keyAreas: Array.isArray((sp as { keyAreas?: { area?: RichTextValue }[] }).keyAreas)
      ? (sp as { keyAreas: { area?: RichTextValue }[] }).keyAreas
          .map((k) => richTextToPlain(k.area))
          .filter(Boolean)
      : [],
    specialists: bySpecialty.get(String(sp.id)) ?? [],
  }))

  const categories: Category[] = categoriesRes.docs.map((c) => ({
    id: String(c.id),
    title: c.title,
    icon: (c as { icon?: string | null }).icon ?? null,
  }))

  return (
    <Section
      background={background as SectionBackground}
      className={cn('vf-specialty-directory-block', toClassName(cssClass))}
      bare={bare}
    >
      <SectionHeader eyebrow={eyebrow} title={heading} subtitle={subheading} align="center" colour={textColour} />
      <SpecialtyClient
        categories={categories}
        entries={entries}
        showFilterBar={showFilterBar ?? true}
        showRosters={showRosters ?? true}
        showKeyAreas={showKeyAreas ?? true}
        allTabLabel={allTabLabel}
        emptyLabel={emptyLabel}
      />
    </Section>
  )
}
