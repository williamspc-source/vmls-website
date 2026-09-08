'use client'

import React, { useEffect, useState } from 'react'

type Field = { name?: string }

/**
 * The newsletter band's email capture.
 *
 * This used to be a bare `<form method="post">` with no action, which POSTed to
 * the page's own URL, got a 405 from Next, and showed the visitor nothing —
 * every signup was lost silently. It now submits into the Payload form chosen
 * on the block, and never reports success without a 2xx.
 *
 * It also checks, before enabling the button, that the chosen form actually has
 * a field named `email`. The submit body hardcodes that name, and Payload's
 * form-submissions endpoint accepts a `submissionData` entry whose `field` does
 * not exist on the form — it stores the row and drops the value, so the admin
 * shows a submission with no email address in it. That is the same failure the
 * EnquiryDrawer already guards against; the two do it the same way on purpose.
 */
export const SubscribeForm: React.FC<{
  formId: string
  placeholder?: string | null
  buttonLabel?: string | null
}> = ({ formId, placeholder, buttonLabel }) => {
  const [status, setStatus] = useState<
    'loading' | 'idle' | 'sending' | 'sent' | 'error' | 'unavailable'
  >('loading')
  const label = placeholder || 'Enter your email'

  useEffect(() => {
    let active = true
    fetch(`/api/forms/${formId}?depth=0`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`forms ${r.status}`))))
      .then((doc) => {
        if (!active) return
        const names: string[] = (doc?.fields || []).map((f: Field) => f.name).filter(Boolean)
        if (!names.includes('email')) {
          console.error(
            `[SubscribeForm] Payload form ${formId} has no field named "email" ` +
              `(has: ${names.join(', ') || 'none'}). Refusing to submit — the address would be ` +
              `stored as an empty submission. Add an "email" field to the form in admin.`,
          )
          setStatus('unavailable')
          return
        }
        setStatus('idle')
      })
      .catch(() => {
        // Distinguish the two ways this check can fail.
        //
        // A configuration problem (form loaded, no `email` field) is permanent
        // and latches to 'unavailable' above — submitting would store a blank row.
        //
        // A transient failure (offline, a 502 from a restarting server) tells us
        // nothing about the form, so it must NOT disable signup for the life of
        // the page. Fall through to 'idle': the submit is the real test, and it
        // reports its own outcome truthfully either way.
        if (active) setStatus('idle')
      })
    return () => {
      active = false
    }
  }, [formId])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const email = String(new FormData(form).get('email') || '').trim()
    if (!email) return

    setStatus('sending')
    try {
      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: formId, submissionData: [{ field: 'email', value: email }] }),
      })
      if (!res.ok) throw new Error(`form-submissions ${res.status}`)
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <p className="ni-subscribe-note" role="status">
        Thanks — you&apos;re subscribed.
      </p>
    )
  }

  // The chosen form has no `email` field to store the address in. Never show a
  // working-looking input in that state.
  if (status === 'unavailable') {
    return (
      <p className="ni-subscribe-note vf-form-error" role="alert">
        Signups are temporarily unavailable. Please email admin@vmls.com.au to be added to the list.
      </p>
    )
  }

  return (
    <>
      <form className="ni-subscribe-form" onSubmit={onSubmit}>
        <input
          className="ni-subscribe-input"
          type="email"
          name="email"
          required
          placeholder={label}
          aria-label={label}
          disabled={status === 'loading'}
        />
        <button
          className="ni-subscribe-btn"
          type="submit"
          disabled={status === 'sending' || status === 'loading'}
        >
          {status === 'sending' ? 'Subscribing…' : status === 'loading' ? 'Loading…' : buttonLabel || 'Subscribe'}
        </button>
      </form>
      {status === 'error' ? (
        <p className="ni-subscribe-note vf-form-error" role="alert">
          Something went wrong. Please try again, or email admin@vmls.com.au.
        </p>
      ) : null}
    </>
  )
}
