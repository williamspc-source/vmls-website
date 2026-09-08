import type { GlobalAfterChangeHook } from 'payload'

import { safeRevalidateTag as revalidateTag } from '@/utilities/safeRevalidate'

export const revalidateSpecialistAvailability: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating specialist availability settings`)

    revalidateTag('global_specialist-availability')
  }

  return doc
}
