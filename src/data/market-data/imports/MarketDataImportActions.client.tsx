'use client'

import { Button, useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

import type { MarketDataImportStatus } from './types'

type EndpointError = {
  error?: {
    message?: unknown
  }
}

const responseMessage = (value: unknown, fallback: string): string => {
  if (!value || typeof value !== 'object') return fallback
  const error = (value as EndpointError).error
  return typeof error?.message === 'string' && error.message.trim() ? error.message : fallback
}

export const MarketDataImportActions = () => {
  const { apiURL = '/api', collectionSlug, data, id } = useDocumentInfo()
  const [busy, setBusy] = useState<'commit' | 'validate' | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const status = (
    typeof data?.status === 'string' ? data.status : 'uploaded'
  ) as MarketDataImportStatus

  const run = async (action: 'commit' | 'validate') => {
    if (!id || !collectionSlug || busy) return
    if (
      action === 'commit' &&
      !window.confirm(
        'Commit this validated CSV to the application market-data store? This action cannot be undone from the CMS.',
      )
    ) {
      return
    }

    setBusy(action)
    setFailed(false)
    setMessage(action === 'validate' ? 'Validating the CSV…' : 'Committing validated rows…')
    try {
      const response = await fetch(`${apiURL}/${collectionSlug}/${id}/${action}`, {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
        method: 'POST',
      })
      const result = (await response.json().catch(() => null)) as unknown
      if (!response.ok) {
        throw new Error(responseMessage(result, `The ${action} request failed.`))
      }
      window.location.reload()
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : `The ${action} request failed.`)
      setBusy(null)
    }
  }

  if (!id) {
    return <p>Save the private CSV upload before validating it.</p>
  }

  const canValidate = !['imported', 'importing', 'validating'].includes(status)
  const canCommit = status === 'validated'

  return (
    <div
      style={{ borderTop: '1px solid var(--theme-elevation-150)', marginTop: 16, paddingTop: 16 }}
    >
      <p>
        Current workflow status: <strong>{status}</strong>
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Button
          buttonStyle="secondary"
          disabled={!canValidate || Boolean(busy)}
          onClick={() => void run('validate')}
          size="small"
          type="button"
        >
          {busy === 'validate' ? 'Validating…' : 'Validate and preview'}
        </Button>
        <Button
          buttonStyle="primary"
          disabled={!canCommit || Boolean(busy)}
          onClick={() => void run('commit')}
          size="small"
          type="button"
        >
          {busy === 'commit' ? 'Committing…' : 'Commit validated data'}
        </Button>
      </div>
      {message ? (
        <p aria-live="polite" style={{ color: failed ? 'var(--theme-error-500)' : undefined }}>
          {message}
        </p>
      ) : null}
      {status === 'invalid' ? (
        <p>Review the validation report below, then upload a new import.</p>
      ) : null}
      {status === 'imported' ? (
        <p>This import is complete and retained as read-only history.</p>
      ) : null}
    </div>
  )
}

export default MarketDataImportActions
