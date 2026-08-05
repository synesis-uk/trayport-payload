#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

import { buildSectionUsageAudit, parseSectionUsageAuditInput } from './editor-layout-audit/audit'
import { renderSectionUsageAuditMarkdown } from './editor-layout-audit/markdown'

type OutputFormat = 'json' | 'markdown'

type Options = {
  format: OutputFormat
  input: string
  source: string | null
}

const usage = `Usage:
  pnpm exec tsx scripts/editor-layout-audit.ts --input <pages.json|transformed.ndjson|-> [--format json|markdown] [--source <label>]

The input may be a Payload { docs: [...] } response, a JSON array of page documents,
one page document, or migration transformed NDJSON. Use --input - to read stdin.
The command only writes the report to stdout.`

const optionValue = (args: string[], index: number, name: string): string => {
  const value = args[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value.`)
  return value
}

const parseOptions = (args: string[]): Options => {
  let format: OutputFormat = 'json'
  let input = ''
  let source: string | null = null

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--help' || argument === '-h') {
      process.stdout.write(`${usage}\n`)
      process.exit(0)
    }
    if (argument === '--input' || argument === '-i') {
      input = optionValue(args, index, argument)
      index += 1
      continue
    }
    if (argument === '--format' || argument === '-f') {
      const value = optionValue(args, index, argument)
      if (value !== 'json' && value !== 'markdown') {
        throw new Error(`Unsupported format: ${value}. Use json or markdown.`)
      }
      format = value
      index += 1
      continue
    }
    if (argument === '--source') {
      source = optionValue(args, index, argument)
      index += 1
      continue
    }
    if (!argument.startsWith('-') && !input) {
      input = argument
      continue
    }
    throw new Error(`Unknown argument: ${argument}`)
  }

  if (!input) throw new Error('Missing --input.')
  return { format, input, source }
}

const normalizedSource = (input: string): string => {
  if (input === '-') return 'stdin'
  const absolute = path.resolve(input)
  const relative = path.relative(process.cwd(), absolute)
  return relative && !relative.startsWith('..')
    ? relative.split(path.sep).join('/')
    : path.basename(input)
}

const main = (): void => {
  const options = parseOptions(process.argv.slice(2))
  const text =
    options.input === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(options.input, 'utf8')
  const audit = buildSectionUsageAudit(
    parseSectionUsageAuditInput(text),
    options.source || normalizedSource(options.input),
  )

  process.stdout.write(
    options.format === 'markdown'
      ? renderSectionUsageAuditMarkdown(audit)
      : `${JSON.stringify(audit, null, 2)}\n`,
  )
}

try {
  main()
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n\n${usage}\n`)
  process.exitCode = 1
}
