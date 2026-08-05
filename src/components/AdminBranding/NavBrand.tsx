import Link from 'next/link'

import { Logo as TrayportWordmark } from '@/components/Logo/Logo'

export const AdminNavBrand = () => (
  <Link className="trayport-admin-nav-brand" href="/admin" prefetch={false}>
    <TrayportWordmark
      className="trayport-admin-nav-brand__mark"
      title="TMX Trayport content workspace"
    />
    <span>Content management</span>
  </Link>
)

export default AdminNavBrand
