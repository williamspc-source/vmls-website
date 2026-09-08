import { type RichTextValue } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import React from 'react'

import type { ContactDetailsBlock as Props } from '@/payload-types'

import { Icon } from '@/components/Icon'
import { Section } from '@/components/Section'
import { SectionHeader } from '@/components/SectionHeader'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getPrimaryOffice } from '@/utilities/primaryOffice'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

// Normalised shape shared by the manual (block-authored) and global-sourced items.
type ContactItem = {
  key: string
  icon?: string | null
  label: RichTextValue
  value: RichTextValue
  href?: string | null
  note?: RichTextValue
}

/**
 * Business contact details (phone / email / address / hours). When `useGlobal`
 * is set, the values are pulled from the Footer global's `contact` group + `hours`
 * array (the single source of truth); otherwise the block's own `items` array is
 * rendered. Reuses the design-reference `.contact-*` classes.
 */
export const ContactDetailsBlock: React.FC<Props & { bare?: boolean }> = async ({
  eyebrow,
  heading,
  subheading,
  textColour,
  useGlobal,
  items,
  cssClass,
  containerWidth,
  motion,
  bare,
}) => {
  let contactItems: ContactItem[] = []

  if (useGlobal) {
    const footer = await getCachedGlobal('footer', 1)()
    // Same precedence as the footer: Offices is the source of truth, the Footer
    // global's fields are overrides. Before this, the Offices phone/email were
    // editable and unreachable while the footer copy was the only live one.
    const office = await getPrimaryOffice()
    // `phoneHref` only applies when the number it belongs to is the one being
    // shown. Taking it unconditionally meant that clearing the footer's phone
    // (so it falls back to the office) while leaving its phoneHref in place
    // displayed the office's number and dialled the footer's — a link that lies
    // about where it goes, with nothing on screen to reveal it.
    const usingFooterPhone = Boolean(footer?.contact?.phone)
    const c = {
      phone: footer?.contact?.phone || office?.phone || null,
      phoneHref: usingFooterPhone ? footer?.contact?.phoneHref || null : null,
      email: footer?.contact?.email || office?.email || null,
      address: footer?.contact?.address || office?.address || null,
    }
    const hoursSource =
      (Array.isArray(footer?.hours) && footer.hours.length ? footer.hours : office?.hours) || []

    if (c?.phone) {
      contactItems.push({
        key: 'phone',
        icon: 'phone',
        label: 'Phone',
        value: c.phone,
        href: c.phoneHref || `tel:${c.phone.replace(/[^\d+]/g, '')}`,
      })
    }
    if (c?.email) {
      contactItems.push({
        key: 'email',
        icon: 'envelope',
        label: 'Email',
        value: c.email,
        href: `mailto:${c.email}`,
      })
    }
    if (c?.address) {
      contactItems.push({ key: 'address', icon: 'map-pin', label: 'Address', value: c.address })
    }

    const hoursLines = hoursSource
      .map((h) => [h?.days, h?.time].filter(Boolean).join(' — '))
      .filter(Boolean)
    if (hoursLines.length > 0) {
      contactItems.push({
        key: 'hours',
        icon: 'clock',
        label: 'Office Hours',
        value: hoursLines.join('\n'),
      })
    }
  } else {
    contactItems = (items || [])
      .filter((i) => i?.label && i?.value)
      .map((i, idx) => ({
        key: i.id || String(idx),
        icon: i.icon,
        label: i.label,
        value: i.value,
        href: i.href,
        note: i.note,
      }))
  }

  if (contactItems.length === 0) return null

  return (
    <Section
      className={cn('vf-contact-details', toClassName(cssClass))}
      motion={motion}
      containerWidth={containerWidth}
      bare={bare}
    >
      <SectionHeader eyebrow={eyebrow} title={heading} subtitle={subheading} align="center" colour={textColour} />

      <div className="contact-details" style={{ maxWidth: 'var(--vf-measure-narrow, 560px)', marginInline: 'auto' }}>
        {contactItems.map(({ key, icon, label, value, href, note }) => (
          <div key={key} className="contact-item">
            {icon ? (
              <span className="contact-icon">
                <Icon name={icon} />
              </span>
            ) : null}
            <div>
              <InlineRichText as="p" className="contact-item-label" data={label} />
              {href ? (
                <a href={href} className="contact-item-value">
                  <InlineRichText data={value} />
                </a>
              ) : (
                <InlineRichText as="p" className="contact-item-value" data={value} />
              )}
              <InlineRichText as="p" className="contact-item-note" data={note} />
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
