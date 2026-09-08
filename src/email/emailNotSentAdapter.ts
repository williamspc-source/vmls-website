import type { EmailAdapter } from 'payload'

/**
 * The adapter used when `SMTP_HOST` is not configured.
 *
 * Payload's built-in fallback (`consoleEmailAdapter`) logs at **info** level and
 * resolves successfully, so a form notification or a password reset that was
 * never sent is indistinguishable from one that was — the caller gets a clean
 * promise and the admin shows nothing. That is the exact failure this codebase
 * refuses to ship: see the "Invariants" section of CLAUDE.md.
 *
 * This adapter behaves identically from the caller's point of view (it must —
 * throwing here would roll back the Form Submission the visitor just made, which
 * would lose the enquiry outright), but it reports every unsent message at
 * **error** level with a `[EMAIL NOT SENT]` prefix. So a misconfigured server is
 * loud in the logs on every single send, rather than quietly discarding mail.
 *
 * In production the boot check in `payload.config.ts` normally prevents ever
 * reaching this; this is the second line of defence for the `LOCAL_PROD_REPRO`
 * escape hatch and for local development.
 */
export const emailNotSentAdapter: EmailAdapter = ({ payload }) => ({
  name: 'email-not-sent',
  defaultFromAddress: process.env.SMTP_FROM_ADDRESS || 'no-reply@vmls.com.au',
  defaultFromName: process.env.SMTP_FROM_NAME || 'VERIFY Medico-Legal Solutions',
  sendEmail: async (message) => {
    const to = Array.isArray(message.to)
      ? message.to.map((t) => (typeof t === 'string' ? t : t?.address || '')).join(', ')
      : typeof message.to === 'string'
        ? message.to
        : message.to?.address || '(no recipient)'

    payload.logger.error(
      `[EMAIL NOT SENT] to="${to}" subject="${message.subject ?? ''}" — SMTP_HOST is not set, so ` +
        `no mail server was contacted. The action that triggered this email still completed ` +
        `(e.g. the Form Submission was stored); only the notification was dropped.`,
    )

    return Promise.resolve()
  },
})
