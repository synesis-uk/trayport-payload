'use client'

import { useEffect, useId, useRef, useState } from 'react'

const sidebarPreferenceKey = 'trayport-admin-document-sidebar'
const sidebarClosedClass = 'trayport-document-sidebar--closed'

export const DocumentSidebarToggle = () => {
  const componentID = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const documentFieldsRef = useRef<HTMLElement | null>(null)
  const [available, setAvailable] = useState(false)
  const [open, setOpen] = useState(true)
  const sidebarID = `trayport-document-sidebar-${componentID.replaceAll(':', '')}`

  useEffect(() => {
    const editView = buttonRef.current?.closest('main')
    const documentFields = editView?.querySelector<HTMLElement>('.document-fields--has-sidebar')
    const sidebar = documentFields?.querySelector<HTMLElement>('.document-fields__sidebar-wrap')

    if (!documentFields || !sidebar) return

    documentFieldsRef.current = documentFields
    sidebar.id = sidebarID

    let initialOpen = true
    try {
      initialOpen = window.localStorage.getItem(sidebarPreferenceKey) !== 'closed'
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }

    documentFields.classList.toggle(sidebarClosedClass, !initialOpen)
    setOpen(initialOpen)
    setAvailable(true)

    return () => {
      documentFields.classList.remove(sidebarClosedClass)
      documentFieldsRef.current = null
    }
  }, [sidebarID])

  const toggleSidebar = () => {
    const nextOpen = !open
    documentFieldsRef.current?.classList.toggle(sidebarClosedClass, !nextOpen)
    setOpen(nextOpen)

    try {
      window.localStorage.setItem(sidebarPreferenceKey, nextOpen ? 'open' : 'closed')
    } catch {
      // The control still works for this page when storage is unavailable.
    }
  }

  return (
    <button
      aria-controls={available ? sidebarID : undefined}
      aria-expanded={open}
      className="trayport-document-sidebar-toggle"
      hidden={!available}
      onClick={toggleSidebar}
      ref={buttonRef}
      title={open ? 'Hide page details' : 'Show page details'}
      type="button"
    >
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <rect height="14" rx="1.5" width="16" x="2" y="3" />
        <path d="M13 3v14" />
        <path className="trayport-document-sidebar-toggle__arrow" d="m10.5 8-2 2 2 2" />
      </svg>
      <span>{open ? 'Hide details' : 'Show details'}</span>
    </button>
  )
}
