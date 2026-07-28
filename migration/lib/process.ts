import { spawnSync } from 'node:child_process'

type CommandResult = {
  stdout: string
  stderr: string
}

export const run = (
  command: string,
  args: string[],
  options: {
    env?: NodeJS.ProcessEnv
    quiet?: boolean
  } = {},
): CommandResult => {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: {
      ...process.env,
      ...options.env,
    },
    maxBuffer: 64 * 1024 * 1024,
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    const detail = [result.stderr, result.stdout].filter(Boolean).join('\n').trim()
    throw new Error(
      `${command} ${args.join(' ')} exited with ${result.status}${detail ? `:\n${detail}` : ''}`,
    )
  }

  if (!options.quiet && result.stderr.trim()) {
    process.stderr.write(result.stderr)
  }

  return {
    stdout: result.stdout,
    stderr: result.stderr,
  }
}
