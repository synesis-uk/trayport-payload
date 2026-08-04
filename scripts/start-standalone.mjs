import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const projectRoot = process.cwd()
const standaloneRoot = resolve(projectRoot, '.next/standalone')
const serverEntry = resolve(standaloneRoot, 'server.js')

if (!existsSync(serverEntry)) {
  throw new Error('The standalone Next.js server is missing. Run `pnpm build` before `pnpm start`.')
}

const sourceStatic = resolve(projectRoot, '.next/static')
const targetStatic = resolve(standaloneRoot, '.next/static')
mkdirSync(targetStatic, { recursive: true })
cpSync(sourceStatic, targetStatic, { force: true, recursive: true })

const sourcePublic = resolve(projectRoot, 'public')
if (existsSync(sourcePublic)) {
  cpSync(sourcePublic, resolve(standaloneRoot, 'public'), { force: true, recursive: true })
}

await import(pathToFileURL(serverEntry).href)
