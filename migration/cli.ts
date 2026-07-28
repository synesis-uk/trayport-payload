import { extract } from './extract'
import { load } from './load'
import { preflight } from './preflight'
import { transform } from './transform'
import { validateRun } from './validate'

const args = process.argv.slice(2)
const command = args[0]

const valueAfter = (name: string): string | undefined => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}

const main = async (): Promise<void> => {
  switch (command) {
    case 'preflight':
      await preflight()
      return
    case 'extract':
      extract(valueAfter('--run-id'))
      return
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
        'Usage: tsx migration/cli.ts <preflight|extract|transform|load|validate> [--scope poc] [--run-id name] [--dry-run] [--publish]',
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
