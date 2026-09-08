import { getCachedGlobal } from '@/utilities/getGlobals'

import {
  buildMailto,
  REGISTRATION_ENQUIRY_BODY,
  REGISTRATION_ENQUIRY_SUBJECT,
} from '@/utilities/enquiryEmail'

/**
 * Server-only, and deliberately separate from `enquiryEmail.ts`.
 *
 * `enquiryEmail.ts` must stay free of Payload imports: `SiteSettings/config.ts`
 * imports its defaults, and reaching `getCachedGlobal` from there would close a
 * SiteSettings → getGlobals → payload.config → SiteSettings cycle. A cycle in
 * this repo does not throw — it evaluates to `undefined`, which is how a block
 * list silently emptied itself once before.
 *
 * Keeping `buildMailto` pure also lets the availability grid's client component
 * use the same builder.
 */
type RegistrationSettings = {
  registrationEnquiryEmail?: string | null
  registrationEnquirySubject?: string | null
  registrationEnquiryBody?: string | null
}

/**
 * The "register for the booking portal" email, as configured in Site Settings.
 *
 * Read at render rather than baked into the stored link, so editing the wording
 * in the admin updates every button that uses it — the whole reason the template
 * lives in one global instead of on each link.
 */
export const getRegistrationEnquiryHref = async (): Promise<string | null> => {
  const settings = (await getCachedGlobal('site-settings', 0)()) as RegistrationSettings

  return buildMailto({
    email: settings?.registrationEnquiryEmail,
    subject: settings?.registrationEnquirySubject || REGISTRATION_ENQUIRY_SUBJECT,
    body: settings?.registrationEnquiryBody || REGISTRATION_ENQUIRY_BODY,
  })
}

/**
 * Link shape after resolution — deliberately the union `CMSLink` accepts, which
 * does NOT include `portalEnquiry`.
 *
 * That omission is the safety property: `CMSLink` cannot resolve this type (it
 * is sync, because client components import it), so a block that forwarded a
 * raw `portalEnquiry` link straight through would render an inert span. Leaving
 * the value out of CMSLink's prop union turns that mistake into a compile error
 * instead of a button that quietly goes nowhere.
 */
type ResolvableLink = { type?: string | null; url?: string | null } | null | undefined

/** The link types `CMSLink` can actually render. Note the absence of `portalEnquiry`. */
type RenderableLinkType = 'reference' | 'custom' | 'enquiry'

/**
 * The same entry with its link type narrowed to what `CMSLink` accepts.
 *
 * This return type is the enforcement: a block that skips the resolver and
 * forwards its raw links to `CMSLink` fails to compile, because the generated
 * type for an opted-in block still includes `'portalEnquiry'`. Verified — both
 * call sites errored with exactly that before they were wired up.
 */
export type ResolvedEntry<T extends { link?: ResolvableLink }> = Omit<T, 'link'> & {
  link?: (Omit<NonNullable<T['link']>, 'type'> & { type?: RenderableLinkType | null }) | null
}

export const hasRegistrationLink = (links: { link?: ResolvableLink }[] | null | undefined): boolean =>
  Array.isArray(links) && links.some((entry) => entry?.link?.type === 'portalEnquiry')

/**
 * Swaps every `portalEnquiry` link for a plain custom link carrying the mailto
 * built from Site Settings. Leaves every other link untouched, and returns the
 * array unchanged (no global read at all) when none is present — this runs on
 * every Button block on the site.
 *
 * A null href becomes `undefined`, so `CMSLink` renders its inert
 * `data-link-unresolved` span rather than an addressless `mailto:?subject=`.
 */
/**
 * Sync half of the swap, so a component that maps over several link lists (the
 * booking chooser has one per panel) can read the global once and apply it to
 * each, instead of awaiting inside a map callback — React cannot render an array
 * of promises.
 *
 * A null href becomes `undefined`, so `CMSLink` renders its inert
 * `data-link-unresolved` span rather than an addressless `mailto:?subject=`.
 */
export const applyRegistrationHref = <T extends { link?: ResolvableLink }>(
  links: T[],
  href: string | null,
): ResolvedEntry<T>[] =>
  links.map((entry) =>
    entry?.link?.type === 'portalEnquiry'
      ? ({ ...entry, link: { ...entry.link, type: 'custom', url: href ?? undefined } })
      : entry,
  ) as ResolvedEntry<T>[]

/**
 * Swaps every `portalEnquiry` link for a plain custom link carrying the mailto
 * built from Site Settings. Returns the array untouched, reading no global at
 * all, when none is present — this runs on every Button block on the site.
 */
export const resolveRegistrationLinks = async <T extends { link?: ResolvableLink }>(
  links: T[] | null | undefined,
): Promise<ResolvedEntry<T>[]> => {
  if (!Array.isArray(links)) return []
  if (!hasRegistrationLink(links)) return links as ResolvedEntry<T>[]

  return applyRegistrationHref(links, await getRegistrationEnquiryHref())
}
