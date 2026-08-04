const configured = process.env.NEXT_PUBLIC_SERVER_URL?.trim()

if (!configured) {
  throw new Error('Production builds require the NEXT_PUBLIC_SERVER_URL build argument.')
}

let origin
try {
  origin = new URL(configured)
} catch {
  throw new Error('Production builds require an absolute NEXT_PUBLIC_SERVER_URL origin.')
}

const localHostnames = new Set(['localhost', '127.0.0.1', '::1'])

if (origin.protocol !== 'https:' || localHostnames.has(origin.hostname.toLowerCase())) {
  throw new Error('Production builds require a non-local HTTPS NEXT_PUBLIC_SERVER_URL origin.')
}
