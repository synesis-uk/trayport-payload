import type { DashboardViewServerProps } from '@payloadcms/next/views'
import { Gutter } from '@payloadcms/ui'

import { isAdmin } from '@/access/roles'
import type { User } from '@/payload-types'

import { DashboardWorkspace } from './DashboardWorkspace'
import { emptyDashboardContentData, loadDashboardContent } from './dashboardData'

const getUserName = (user: User | null | undefined): string => {
  const name = user?.name?.trim()
  if (name) return name

  const emailName = user?.email?.split('@')[0]?.trim()
  if (emailName) return emailName

  return 'editor'
}

export const TrayportDashboard = async ({ initPageResult }: DashboardViewServerProps) => {
  const { req } = initPageResult
  const typedUser = req.user as User | null | undefined
  const data = req.user ? await loadDashboardContent(req) : emptyDashboardContentData()

  return (
    <Gutter className="trayport-dashboard-view">
      <DashboardWorkspace
        data={data}
        isAdministrator={isAdmin(typedUser)}
        userName={getUserName(typedUser)}
      />
    </Gutter>
  )
}

export default TrayportDashboard
