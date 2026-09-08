/**
 * The one place a `mailto:` URL is built, for the same reason `routes.ts` is the
 * one place a document path is built: before this there were three inline
 * constructions of a prefilled enquiry email and they had already drifted apart
 * — the specialist profile sent a subject and no body at all, while the seeded
 * Portal CTA carried a hand-percent-encoded body that no editor could maintain.
 *
 * Only the subject and body are encoded, never the recipient — matching the
 * design reference's own script and the availability grid it was ported from.
 * An address is not a query parameter, and encoding the `@` produces a href some
 * mail clients silently refuse to open.
 */
export type MailtoParts = {
  email?: string | null
  subject?: string | null
  body?: string | null
}

/**
 * Returns `null` when there is no recipient.
 *
 * That `null` is load-bearing: `mailto:?subject=…` is a perfectly valid URL that
 * opens an empty, addressless compose window, so a cleared "Send to" field would
 * render a button that looks like it works and quietly goes nowhere. Callers
 * hand the `null` to `CMSLink`, which renders the label as an inert
 * `data-link-unresolved` span — visibly wrong to the editor, per the repo rule
 * that nothing may appear to work when it doesn't.
 */
export const buildMailto = ({ email, subject, body }: MailtoParts): string | null => {
  const to = typeof email === 'string' ? email.trim() : ''
  if (!to) return null

  const params: string[] = []
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`)
  if (body) params.push(`body=${encodeURIComponent(body)}`)

  return params.length ? `mailto:${to}?${params.join('&')}` : `mailto:${to}`
}

// Fallbacks mirror the Site Settings defaults so a global that predates those
// fields still renders the reference's wording rather than an empty subject.
export const REGISTRATION_ENQUIRY_SUBJECT = 'VERIFY Booking Portal Access Request'

export const REGISTRATION_ENQUIRY_BODY = `Hi VERIFY team,

I would like to request access to VERIFY's Online Booking Portal. Please find my details below for account creation:

Full Name: 
Company/Organisation: 
Contact Number: 
Email Address: 

Please let me know if you require any further information to set up my account.

Kind regards,`
