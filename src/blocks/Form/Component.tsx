'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { getClientSideURL } from '@/utilities/getURL'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  cardStyle?: string | null
  cssClass?: string | string[] | null
  // NOTE: `formTitle` has no field in config.ts, so nothing can populate it —
  // the heading that renders comes from `introContent`. Left in place rather
  // than removed in a pass about layout; it renders nothing today either way.
  formTitle?: string | null
  enableIntro: boolean
  form: FormType
  introContent?: DefaultTypedEditorState
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyField = Record<string, any>

/** Groups consecutive ≤50%-width fields into two-column `.form-row`s. */
function groupFields(fields: AnyField[] = []): AnyField[][] {
  const rows: AnyField[][] = []
  let i = 0
  while (i < fields.length) {
    const f = fields[i]
    const w = typeof f?.width === 'number' ? f.width : 100
    const next = fields[i + 1]
    const nextW = typeof next?.width === 'number' ? next.width : 100
    if (w <= 50 && next && nextW <= 50 && next.blockType !== 'message') {
      rows.push([f, next])
      i += 2
    } else {
      rows.push([f])
      i += 1
    }
  }
  return rows
}

export const FormBlock: React.FC<{ id?: string } & FormBlockType> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
    formTitle,
    cardStyle,
    cssClass,
  } = props

  const formMethods = useForm({ defaultValues: formFromProps.fields })
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const router = useRouter()

  const onSubmit = useCallback(
    (data: FormFieldBlock[]) => {
      let loadingTimerID: ReturnType<typeof setTimeout>
      const submitForm = async () => {
        setError(undefined)
        const dataToSend = Object.entries(data).map(([name, value]) => ({ field: name, value }))
        loadingTimerID = setTimeout(() => setIsLoading(true), 1000)
        try {
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({ form: formID, submissionData: dataToSend }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          })
          const res = await req.json()
          clearTimeout(loadingTimerID)
          if (req.status >= 400) {
            setIsLoading(false)
            setError({ message: res.errors?.[0]?.message || 'Internal Server Error', status: res.status })
            return
          }
          setIsLoading(false)
          setHasSubmitted(true)
          if (confirmationType === 'redirect' && redirect?.url) router.push(redirect.url)
        } catch (err) {
          console.warn(err)
          setIsLoading(false)
          setError({ message: 'Something went wrong.' })
        }
      }
      void submitForm()
    },
    [router, formID, redirect, confirmationType],
  )

  const renderField = (field: AnyField, index: number) => {
    if (!field?.blockType) return null
    const { blockType, name, label, required, defaultValue, options, placeholder } = field
    // `placeholder` was never destructured, so the field the form-builder DOES
    // define on `select` was silently inert, and text/email/textarea had no way
    // to carry one at all. Both halves are fixed: the plugin now declares the
    // field on those types (src/plugins/index.ts) and it is read here.
    const ph = typeof placeholder === 'string' && placeholder ? placeholder : undefined
    const labelEl = label ? (
      <label htmlFor={name}>
        {label}
        {required ? ' *' : ''}
      </label>
    ) : null

    // react-hook-form blocks submission on a missing required field, but the
    // block never rendered formState.errors — so the visitor got a form that
    // silently refused to submit, with no indication which field was at fault.
    const hasError = Boolean(errors?.[name])
    const errorEl = hasError ? (
      <p className="vf-form-error" id={`${name}-error`}>
        {label ? `${label} is required.` : 'This field is required.'}
      </p>
    ) : null
    // Spread onto every control so the invalid field is announced, not just tinted.
    const invalidProps = {
      'aria-invalid': hasError || undefined,
      'aria-describedby': hasError ? `${name}-error` : undefined,
    }

    if (blockType === 'message') {
      return (
        <div className="form-group" key={index}>
          {field.message ? (
            <RichText data={field.message} enableGutter={false} enableProse={false} />
          ) : null}
        </div>
      )
    }
    if (blockType === 'checkbox') {
      return (
        <div className="form-group form-check" key={index}>
          <label className="form-check-label">
            <input
              type="checkbox"
              id={name}
              defaultChecked={defaultValue}
              {...invalidProps}
              {...register(name, { required })}
            />
            <span>{label}</span>
          </label>
          {errorEl}
        </div>
      )
    }
    if (blockType === 'textarea') {
      return (
        <div className="form-group" key={index}>
          {labelEl}
          <textarea
            id={name}
            placeholder={ph}
            defaultValue={defaultValue ?? ''}
            {...invalidProps}
            {...register(name, { required })}
          />
          {errorEl}
        </div>
      )
    }
    if (blockType === 'select' || blockType === 'country' || blockType === 'state') {
      const opts: AnyField[] = Array.isArray(options) ? options : []
      return (
        <div className="form-group" key={index}>
          {labelEl}
          <select
            id={name}
            defaultValue={defaultValue ?? ''}
            {...invalidProps}
            {...register(name, { required })}
          >
            <option value="">{ph ?? 'Select…'}</option>
            {opts.map((o, k) => (
              <option key={k} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {errorEl}
        </div>
      )
    }
    // text, email, number, and any other simple input types
    const inputType = blockType === 'email' ? 'email' : blockType === 'number' ? 'number' : 'text'
    return (
      <div className="form-group" key={index}>
        {labelEl}
        <input
          id={name}
          type={inputType}
          placeholder={ph}
          defaultValue={defaultValue ?? ''}
          {...invalidProps}
          {...register(name, { required })}
        />
        {errorEl}
      </div>
    )
  }

  const rows = groupFields(formFromProps?.fields as AnyField[])

  return (
    <div
      className={cn(
        'vf-form-block',
        cardStyle === 'card' && 'vf-form-block--card',
        toClassName(cssClass),
      )}
    >
      {enableIntro && introContent && !hasSubmitted && (
        <RichText className="mb-6" data={introContent} enableGutter={false} />
      )}
      <FormProvider {...formMethods}>
        <form className="contact-form" id={formID} onSubmit={handleSubmit(onSubmit)}>
          {formTitle ? <h3>{formTitle}</h3> : null}

          {!hasSubmitted &&
            rows.map((row, i) =>
              row.length === 2 ? (
                <div className="form-row" key={i}>
                  {row.map((f, j) => renderField(f, i * 100 + j))}
                </div>
              ) : (
                renderField(row[0], i)
              ),
            )}

          {!hasSubmitted ? (
            <button type="submit" className="btn btn-primary form-submit" disabled={isLoading}>
              {isLoading ? 'Sending…' : submitButtonLabel || 'Submit'}
            </button>
          ) : null}

          {hasSubmitted && confirmationType === 'message' && (
            <div className="form-confirm" role="status">
              {confirmationMessage ? (
                <RichText data={confirmationMessage} enableGutter={false} enableProse={false} />
              ) : (
                'Thank you — your enquiry has been sent.'
              )}
            </div>
          )}
          {error && (
            <div className="form-confirm vf-form-error" role="status">
              {`${error.status || '500'}: ${error.message || ''}`}
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  )
}
