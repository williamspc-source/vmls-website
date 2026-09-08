'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

// Labels each preset row by its label or class name.
export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<{ label?: string | null; name?: string | null }>()
  const text = data?.data?.label || data?.data?.name
  const prefix = data?.rowNumber !== undefined ? `${data.rowNumber + 1}. ` : ''
  return <div>{text ? `${prefix}${text}` : 'Preset'}</div>
}
