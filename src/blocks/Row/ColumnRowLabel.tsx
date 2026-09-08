'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

// Labels each column row as "Column N (span S)" so collapsed columns are scannable.
export const ColumnRowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<{ span?: string | null }>()
  const n = data?.rowNumber !== undefined ? data.rowNumber + 1 : ''
  const span = data?.data?.span && data.data.span !== 'auto' ? ` (span ${data.data.span})` : ''
  return <div>{`Column ${n}${span}`}</div>
}
