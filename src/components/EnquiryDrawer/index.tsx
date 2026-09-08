'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

type Field = { name: string }

export type EnquiryDrawerProps = {
  /**
   * Payload Forms id, from Site Settings → Enquiry drawer form. Resolved on the
   * server so the drawer never has to guess: it used to look the form up by the
   * literal title "Enquiry", which meant renaming the form in admin silently
   * routed every enquiry into the "no form seeded" branch below.
   */
  formId?: string | null
}

const ENQUIRY_TYPES = [
  'Medico-Legal Services',
  'Educational Services (AAMLE)',
  'Specialist Panel Information',
  'Register for Online Booking Portal',
  'Join Our Expert Panel',
  'General Enquiry',
]

/**
 * Site-wide slide-out enquiry drawer. Opens on any `[data-enquiry-panel]`
 * click (the hook the CMSLink "enquiry" action emits) and submits to the
 * Payload form chosen in Site Settings → Enquiry drawer form.
 *
 * ── This component must never claim success it cannot prove ─────────────────
 * It previously fell through to `setStatus('sent')` whenever the form lookup
 * had not resolved, had thrown, or matched nothing — so a visitor saw "your
 * enquiry has been sent" and the enquiry was discarded. There is no acceptable
 * local-acknowledgement branch for a lead-capture form: every path below either
 * gets a 2xx from Payload or tells the visitor it failed.
 */
export const EnquiryDrawer: React.FC<EnquiryDrawerProps> = ({ formId }) => {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'sending' | 'sent' | 'error' | 'unavailable'
  >(formId ? 'loading' : 'unavailable')
  const [presetType, setPresetType] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const formMeta = useRef<{ id: string; fields: Set<string> } | null>(null)

  // Fetch the chosen form's field names so we can detect a config mismatch
  // before submitting. The id itself comes from the server, so a failure here
  // is a genuine outage rather than "not seeded yet".
  //
  // `attempt` is bumped when the drawer is opened while unavailable, so a single
  // transient failure (a 502 from a restarting server, a dropped connection on a
  // flaky mobile network) doesn't disable enquiries for the whole lifetime of the
  // page. Without it the first fetch was the only one that ever ran.
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!formId) return
    let active = true
    fetch(`/api/forms/${formId}?depth=0`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`forms ${r.status}`))))
      .then((doc) => {
        if (!active) return
        if (!doc?.id) throw new Error('form not found')
        formMeta.current = {
          id: String(doc.id),
          fields: new Set((doc.fields || []).map((f: Field) => f.name).filter(Boolean)),
        }
        setStatus('idle')
      })
      .catch(() => {
        if (active) setStatus('unavailable')
      })
    return () => {
      active = false
    }
  }, [formId, attempt])

  const close = useCallback(() => {
    setOpen(false)
    document.body.style.overflow = ''
  }, [])

  // Delegate clicks from any [data-enquiry-panel] trigger.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const trigger = (e.target as HTMLElement)?.closest?.('[data-enquiry-panel]')
      if (trigger) {
        e.preventDefault()
        const t = trigger.getAttribute('data-enquiry-type')
        if (t) setPresetType(t)
        // Only clear a previous send result — never overwrite 'loading' or
        // 'unavailable', which describe whether the drawer can submit at all.
        setStatus((s) => (s === 'sent' || s === 'error' ? 'idle' : s))
        // Retry the form lookup if it previously failed. Guarded on `formMeta`
        // rather than on status alone: when the server resolved no form at all
        // there is nothing to retry, and 'unavailable' is the honest final answer.
        if (!formMeta.current && formId) {
          setStatus('loading')
          setAttempt((n) => n + 1)
        }
        setOpen(true)
        document.body.style.overflow = 'hidden'
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [close, formId])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = formRef.current
    if (!form) return
    const meta = formMeta.current
    if (!meta) {
      setStatus('unavailable')
      return
    }

    const fd = new FormData(form)
    const entries = Array.from(fd.entries()).map(
      ([field, value]) => [field, String(value)] as const,
    )

    // A field the visitor filled in that the Payload form has no slot for would
    // be dropped on the floor by a filtered submit. Renaming a field in admin
    // is enough to cause it, so refuse the whole submission rather than store a
    // partial enquiry that looks complete in the admin list.
    const dropped = entries.filter(([field, value]) => value !== '' && !meta.fields.has(field))
    if (dropped.length) {
      console.error(
        `[EnquiryDrawer] Payload form ${meta.id} has no field named ${dropped
          .map(([f]) => `"${f}"`)
          .join(', ')} — refusing to submit a partial enquiry. Add the field(s) to the form in admin.`,
      )
      setStatus('error')
      return
    }

    setStatus('sending')
    try {
      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: meta.id,
          submissionData: entries
            .filter(([field]) => meta.fields.has(field))
            .map(([field, value]) => ({ field, value })),
        }),
      })
      if (!res.ok) throw new Error(`form-submissions ${res.status}`)
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <div
        className={`enquiry-overlay${open ? ' is-open' : ''}`}
        onClick={close}
        aria-hidden={!open}
      />
      <aside
        className={`enquiry-panel${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Make an Enquiry"
      >
        <div className="enquiry-panel-head">
          <h3>Make an Enquiry</h3>
          <button className="enquiry-panel-close" onClick={close} aria-label="Close" type="button">
            ×
          </button>
        </div>
        <div className="enquiry-panel-body">
          <form ref={formRef} onSubmit={onSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input type="text" name="first_name" placeholder="First name" required />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input type="text" name="last_name" placeholder="Last name" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" name="email" placeholder="you@company.com" required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" placeholder="07 XXXX XXXX" />
              </div>
            </div>
            <div className="form-group">
              <label>Company / Organisation</label>
              <input type="text" name="company" placeholder="Your firm or company" />
            </div>
            <div className="form-group">
              <label>Type of Enquiry</label>
              <select name="enquiry_type" defaultValue={presetType} key={presetType}>
                <option value="">Select enquiry type...</option>
                {ENQUIRY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Message / Enquiry *</label>
              <textarea
                name="message"
                placeholder="Please provide details of your enquiry..."
                required
              />
            </div>
            {/* Same classes as the in-page FormBlock submit
                (src/blocks/Form/Component.tsx). This used to be a private
                `.enquiry-panel-submit` that re-implemented the primary button,
                so the .vf-btn--* sizes, the glow ladder and any Custom Styles
                preset written against .btn silently skipped it. */}
            <button
              type="submit"
              className="btn btn-primary form-submit"
              disabled={status === 'sending' || status === 'loading' || status === 'unavailable'}
            >
              {status === 'sending' ? 'Sending…' : status === 'loading' ? 'Loading…' : 'Send Enquiry'}
            </button>
            <div className={`enquiry-panel-confirm${status === 'sent' ? ' is-visible' : ''}`}>
              Thank you — your enquiry has been sent. We&apos;ll be in touch shortly.
            </div>
            {status === 'error' ? (
              <div className="enquiry-panel-confirm is-visible vf-form-error">
                Something went wrong. Please email admin@vmls.com.au directly.
              </div>
            ) : null}
            {status === 'unavailable' ? (
              <div className="enquiry-panel-confirm is-visible vf-form-error">
                This form is temporarily unavailable. Please email admin@vmls.com.au directly.
              </div>
            ) : null}
          </form>
        </div>
      </aside>
    </>
  )
}
