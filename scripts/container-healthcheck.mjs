const port = process.env.PORT?.trim() || '3000'
const endpoint = `http://127.0.0.1:${port}/api/health/live/`

try {
  const response = await fetch(endpoint, {
    cache: 'no-store',
    signal: AbortSignal.timeout(2_000),
  })

  if (!response.ok) process.exitCode = 1
} catch {
  process.exitCode = 1
}
