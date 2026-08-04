'use client'

import dynamic from 'next/dynamic'

const AdminBarImplementation = dynamic(() => import('./index').then((module) => module.AdminBar), {
  ssr: true,
})

export function DynamicAdminBar({ preview = false }: { preview?: boolean }) {
  return <AdminBarImplementation adminBarProps={{ preview }} />
}
