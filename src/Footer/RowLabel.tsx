'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

// Labels each footer link column by its title.
export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<{ title?: string | null }>()

  const label = data?.data?.title
    ? `${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}. ${data.data.title}`
    : 'Column'

  return <div>{label}</div>
}
