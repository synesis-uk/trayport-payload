import { checkReadiness } from '../readiness'

const responseHeaders = {
  'Cache-Control': 'no-store, max-age=0',
} as const

export const GET = async (): Promise<Response> => {
  const result = await checkReadiness()

  return Response.json(result, {
    headers: responseHeaders,
    status: result.status === 'ready' ? 200 : 503,
  })
}
