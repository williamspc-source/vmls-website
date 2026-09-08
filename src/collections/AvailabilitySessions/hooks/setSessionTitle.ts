import type { CollectionBeforeChangeHook } from 'payload'

// Compose a human-readable title (e.g. "Dr Reidy — 7 Dec, 08:30–09:30") so the
// admin list / useAsTitle reads well. The field itself is hidden in the UI.
export const setSessionTitle: CollectionBeforeChangeHook = async ({ data, req }) => {
  try {
    let name = ''
    const specialist = data?.specialist
    const id =
      specialist && typeof specialist === 'object' ? specialist.id : (specialist as number | string)

    if (id) {
      const doc = await req.payload.findByID({
        collection: 'specialists',
        id,
        depth: 0,
        req,
      })
      name = doc?.title || ''
    }

    const dateLabel = data?.date
      ? new Date(data.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
      : ''
    const time = [data?.startTime, data?.endTime].filter(Boolean).join('–')
    const when = [dateLabel, time].filter(Boolean).join(', ')

    data.title = [name, when].filter(Boolean).join(' — ') || 'Availability session'
  } catch {
    // Non-fatal: leave whatever title was there.
  }

  return data
}
