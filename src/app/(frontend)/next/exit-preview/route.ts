import { cookies, draftMode } from 'next/headers'

import { previewRouteCookieName } from '@/routing/previewAccess'

export async function GET(): Promise<Response> {
  const draft = await draftMode()
  draft.disable()
  const cookieStore = await cookies()
  cookieStore.delete(previewRouteCookieName)
  return new Response('Draft mode is disabled')
}
