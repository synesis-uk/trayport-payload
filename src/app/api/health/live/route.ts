const responseHeaders = {
  'Cache-Control': 'no-store, max-age=0',
} as const

export const GET = (): Response =>
  Response.json(
    {
      status: 'alive',
    },
    {
      headers: responseHeaders,
      status: 200,
    },
  )
