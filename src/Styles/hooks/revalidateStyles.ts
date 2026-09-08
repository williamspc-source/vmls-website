import type { GlobalAfterChangeHook } from 'payload'

import { safeRevalidateTag as revalidateTag } from '@/utilities/safeRevalidate'

export const revalidateStyles: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating custom styles`)
    revalidateTag('global_custom-styles')
  }
  return doc
}
