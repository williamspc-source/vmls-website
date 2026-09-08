'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

// Shared by every nav level (navItems / subItems / subSubItems): each row is a
// link group, so we label it by its link label.
export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<{ link?: { label?: string | null } }>()

  const label = data?.data?.link?.label
    ? `${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}. ${data.data.link.label}`
    : 'Item'

  return <div>{label}</div>
}
