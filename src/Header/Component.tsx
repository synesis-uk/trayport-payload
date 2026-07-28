import { getCachedGlobal } from '@/utilities/getGlobals'

import { HeaderClient } from './Component.client'

export async function Header() {
  const [navigation, settings] = await Promise.all([
    getCachedGlobal('navigation', 3)(),
    getCachedGlobal('site-settings', 2)(),
  ])

  return <HeaderClient navigation={navigation} settings={settings} />
}
