import type { GlobalAfterChangeHook } from 'payload'

import { safeRevalidateTag as revalidateTag } from '@/utilities/safeRevalidate'

export const revalidateFooter: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating footer`)

    revalidateTag('global_footer')
  }

  return doc
}
