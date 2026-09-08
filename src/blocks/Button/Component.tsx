import React from 'react'

import type { ButtonBlock as Props } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'
import { resolveRegistrationLinks } from '@/utilities/registrationEnquiry'

export const ButtonBlock: React.FC<Props> = async ({ links, size, align, cssClass }) => {
  if (!Array.isArray(links) || links.length === 0) return null

  // Turns any "Registration enquiry email" link into the mailto configured in
  // Site Settings. No-ops (and reads no global) when the block has none.
  const resolved = await resolveRegistrationLinks(links)

  return (
    <div
      className={cn(
        'vf-button-group',
        align && align !== 'left' ? `vf-align-${align}` : undefined,
        toClassName(cssClass),
      )}
    >
      {resolved.map(({ link }, i) => (
        <CMSLink
          key={i}
          {...link}
          appearance="inline"
          className={cn(
            'btn',
            link?.appearance === 'outline' ? 'btn-outline' : 'btn-primary',
            `vf-btn--${size || 'md'}`,
          )}
        />
      ))}
    </div>
  )
}
