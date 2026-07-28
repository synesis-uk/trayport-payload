import fs from 'node:fs'
import path from 'node:path'

const requiredReportNames = [
  'acceptance-source.json',
  'acceptance-transform.json',
  'content-review.json',
] as const

export type AcceptanceReport = {
  checks: Record<string, boolean | number | string>
  ok: true
  runId: string
}

export type ContentReviewReport = {
  altTextReview: Array<{ legacyId: number }>
  missingMedia: Array<{ legacyId: number }>
  runId: string
}

const workRoot = path.resolve(process.cwd(), 'migration/work')

const isCompleteRun = (runDirectory: string): boolean =>
  requiredReportNames.every((name) => fs.existsSync(path.join(runDirectory, 'reports', name)))

const requestedRunDirectory = (): string | null => {
  const explicitDirectory = process.env.MIGRATION_RUN_DIR
  if (explicitDirectory) return path.resolve(explicitDirectory)

  const explicitID = process.env.MIGRATION_RUN_ID
  if (explicitID) return path.join(workRoot, explicitID)

  return null
}

/**
 * `latest-run.txt` can legitimately point at an extraction still in progress.
 * Fall back to the newest fully validated run in that case.
 */
export const resolveCompleteMigrationRun = (): string => {
  const requested = requestedRunDirectory()
  if (requested) {
    if (!isCompleteRun(requested)) {
      throw new Error(
        `Migration run "${requested}" is incomplete. Expected reports: ${requiredReportNames.join(', ')}.`,
      )
    }
    return requested
  }

  const latestFile = path.join(workRoot, 'latest-run.txt')
  if (fs.existsSync(latestFile)) {
    const latestID = fs.readFileSync(latestFile, 'utf8').trim()
    const latestDirectory = path.join(workRoot, latestID)
    if (latestID && isCompleteRun(latestDirectory)) return latestDirectory
  }

  if (fs.existsSync(workRoot)) {
    const completeRuns = fs
      .readdirSync(workRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(workRoot, entry.name))
      .filter(isCompleteRun)
      .sort(
        (left, right) =>
          fs.statSync(right).mtimeMs - fs.statSync(left).mtimeMs || right.localeCompare(left),
      )

    if (completeRuns[0]) return completeRuns[0]
  }

  throw new Error(
    'No complete migration run was found. Run extract, transform, validate, and load first, or set MIGRATION_RUN_ID.',
  )
}

export const readRunReport = <T>(runDirectory: string, name: string): T =>
  JSON.parse(fs.readFileSync(path.join(runDirectory, 'reports', name), 'utf8')) as T
