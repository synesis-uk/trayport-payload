import { resolvePublicOrigin } from '@/config/publicOrigin'

import canUseDOM from './canUseDOM'

export const getServerSideURL = () => resolvePublicOrigin()

export const getClientSideURL = () => {
  if (canUseDOM) {
    return window.location.origin
  }

  return resolvePublicOrigin()
}
