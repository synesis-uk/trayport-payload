import { extract } from './extract'
import { inventoryProduction } from './inventory'
import { load } from './load'
import { preflight } from './preflight'
import { recoverMedia } from './recover-media'
import { transform } from './transform'
import { validateRun } from './validate'

const args = process.argv.slice(2)
const command = args[0]

const valueAfter = (name: string): string | undefined => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}

const positiveIDsAfter = (name: string): number[] => {
  const value = valueAfter(name)
  if (!value) return []
  return value.split(',').map((candidate) => {
    const parsed = Number(candidate)
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error(`${name} must contain comma-separated positive integer IDs.`)
    }
    return parsed
  })
}

const main = async (): Promise<void> => {
  switch (command) {
    case 'preflight':
      await preflight()
      return
    case 'extract':
      extract(valueAfter('--run-id'))
      return
    case 'inventory': {
      const scope = valueAfter('--scope') || 'production'
      if (scope !== 'production') {
        throw new Error(`Unknown inventory scope: ${scope}. Expected production.`)
      }
      inventoryProduction(valueAfter('--run-id'))
      return
    }
    case 'recover-media': {
      const origin = valueAfter('--origin')
      if (!origin) throw new Error('recover-media requires --origin <https-origin>.')
      await recoverMedia({
        legacyIds: positiveIDsAfter('--legacy-ids'),
        origin,
        runId: valueAfter('--run-id'),
      })
      return
    }
    case 'transform':
      transform(valueAfter('--run-id'))
      return
    case 'load':
      await load({
        dryRun: args.includes('--dry-run'),
        publish: args.includes('--publish'),
        runId: valueAfter('--run-id'),
      })
      return
    case 'validate':
      validateRun(valueAfter('--run-id'))
      return
    default:
      throw new Error(
        'Usage: tsx migration/cli.ts <preflight|inventory|extract|recover-media|transform|load|validate> [--scope production] [--run-id name] [--origin https-origin --legacy-ids id,id] [--dry-run] [--publish]',
      )
  }
}

main()
  .then(() => {
    if (command === 'load') process.exit(0)
  })
  .catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.stack || error.message : String(error)}\n`,
    )
    if (command === 'load') process.exit(1)
    process.exitCode = 1
  })
