import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import process from 'node:process'
import ts from 'typescript'

const projectRoot = resolve(import.meta.dirname, '..')
const sourceRoots = process.argv.slice(2).length ? process.argv.slice(2) : ['src']

const sourceFiles = sourceRoots.flatMap((sourceRoot) => {
  const absoluteRoot = resolve(projectRoot, sourceRoot)
  const visit = (path) => {
    if (statSync(path).isDirectory())
      return readdirSync(path).flatMap((name) => visit(resolve(path, name)))
    return /\.(?:ts|tsx)$/.test(path) ? [path] : []
  }
  return visit(absoluteRoot)
})

const entries = []

const collectStrings = (node, sourceFile) => {
  if (
    ts.isStringLiteralLike(node) &&
    /[a-z][a-z0-9:[\]_/().,'"%-]*(?:\s+[a-z0-9:[\]_/().,'"%-]+)+/i.test(node.text)
  ) {
    const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
    entries.push({ file: sourceFile.fileName, input: node.text, line: line + 1 })
    return
  }
  ts.forEachChild(node, (child) => collectStrings(child, sourceFile))
}

for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8')
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)

  const visit = (node) => {
    if (
      ts.isJsxAttribute(node) &&
      node.name.getText(sourceFile) === 'className' &&
      node.initializer
    ) {
      collectStrings(node.initializer, sourceFile)
      return
    }

    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(sourceFile)
      if (['cn', 'clsx', 'cva', 'twMerge'].includes(callee)) {
        node.arguments.forEach((argument) => collectStrings(argument, sourceFile))
        return
      }
    }

    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      /ClassName$/.test(node.name.text) &&
      node.initializer
    ) {
      collectStrings(node.initializer, sourceFile)
      return
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
}

const changed = []
const cli = resolve(projectRoot, 'node_modules/.bin/tailwindcss')

for (let index = 0; index < entries.length; index += 75) {
  const chunk = entries.slice(index, index + 75)
  const result = spawnSync(
    cli,
    [
      'canonicalize',
      '--css',
      'src/app/(frontend)/globals.css',
      '--format',
      'json',
      '--',
      ...chunk.map(({ input }) => input),
    ],
    { cwd: projectRoot, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
  )

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout)
    process.exit(result.status || 1)
  }

  const jsonStart = result.stdout.indexOf('[')
  if (jsonStart === -1) {
    process.stderr.write(result.stdout || 'Tailwind canonicalizer returned no JSON output.\n')
    process.exit(1)
  }
  const outputs = JSON.parse(result.stdout.slice(jsonStart))
  outputs.forEach((output, outputIndex) => {
    if (output.changed) changed.push({ ...chunk[outputIndex], output: output.output })
  })
}

if (changed.length) {
  process.stderr.write('Non-canonical Tailwind class lists:\n')
  for (const entry of changed) {
    process.stderr.write(
      `${relative(projectRoot, entry.file)}:${entry.line}\n  ${entry.input}\n  -> ${entry.output}\n`,
    )
  }
  process.exit(1)
}

process.stdout.write(
  `Checked ${entries.length} Tailwind class lists across ${sourceFiles.length} files.\n`,
)
