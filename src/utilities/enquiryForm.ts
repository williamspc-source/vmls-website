import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

/**
 * Which Payload form the site-wide enquiry drawer submits into.
 *
 * The authoritative answer is Site Settings → Enquiry drawer form, which the seed
 * now sets unconditionally. This resolver exists for the case where it is empty
 * anyway — a database seeded before the field existed, or an editor who cleared
 * it while renaming things.
 *
 * The drawer refuses to fake success, so an unresolved form means the Send button
 * is disabled site-wide and every enquiry CTA is dead. Falling back to a form
 * *titled* `Enquiry` (then `Contact`) is strictly better than that, and it is not
 * the fragile thing it looks like: the drawer independently verifies that the
 * form it was handed actually has a slot for every field the visitor filled in,
 * and refuses to submit if it doesn't. So a title match that resolves the wrong
 * form fails loudly rather than storing a mangled enquiry.
 *
 * The fallback is logged at warn level every time it is used, because relying on
 * it long-term means the pointer is misconfigured. Resolution happens on the
 * server; the client is never asked to guess.
 *
 * Tagged `global_site-settings` so the existing revalidation hook for that global
 * purges this too — otherwise setting the field in admin would leave the cached
 * fallback in place.
 */
const FALLBACK_TITLES = ['Enquiry', 'Contact']

const resolveEnquiryFormId = async (): Promise<string | null> => {
  const payload = await getPayload({ config: configPromise })

  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const configured = settings?.enquiryForm
  const configuredId =
    configured && typeof configured === 'object' ? configured.id : (configured ?? null)

  if (configuredId != null) return String(configuredId)

  for (const title of FALLBACK_TITLES) {
    const { docs } = await payload.find({
      collection: 'forms',
      where: { title: { equals: title } },
      limit: 1,
      depth: 0,
      pagination: false,
    })
    const found = docs[0]
    if (found) {
      payload.logger.warn(
        `Site Settings → Enquiry drawer form is empty; falling back to the form titled ` +
          `"${title}" (id ${found.id}). Set the field in admin — the fallback breaks the ` +
          `moment that form is renamed.`,
      )
      return String(found.id)
    }
  }

  payload.logger.error(
    `Site Settings → Enquiry drawer form is empty and no form titled ${FALLBACK_TITLES.map(
      (t) => `"${t}"`,
    ).join(' or ')} exists. The enquiry drawer is disabled site-wide and will tell visitors so.`,
  )
  return null
}

export const getEnquiryFormId = unstable_cache(resolveEnquiryFormId, ['enquiry-form-id'], {
  tags: ['global_site-settings'],
})
