import fs from 'node:fs'
import net from 'node:net'

import { migrationConfig } from '../lib/config'
import { run } from '../lib/process'
import { pilotScope } from '../scopes/pilot'

type SourceProbe = {
  acfVersion: string
  home: string
  roots: Array<{
    id: number
    path: string
    postType: string
    status: string
  }>
  tablePrefix: string
}

const waitForPort = (host: string, port: number, timeoutMs = 1_500): Promise<boolean> =>
  new Promise((resolve) => {
    const socket = net.createConnection({ host, port })
    const finish = (result: boolean) => {
      socket.destroy()
      resolve(result)
    }

    socket.setTimeout(timeoutMs)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
  })

const connectionTarget = (
  rawURL: string | undefined,
  fallbackHost: string,
  fallbackPort: number,
): { host: string; port: number } => {
  if (!rawURL) {
    return { host: fallbackHost, port: fallbackPort }
  }

  const url = new URL(rawURL)
  const port = Number.parseInt(url.port, 10)

  return {
    host: url.hostname || fallbackHost,
    port: Number.isNaN(port) ? fallbackPort : port,
  }
}

const probeSource = (): SourceProbe => {
  const expected = JSON.stringify(pilotScope.roots.map(({ legacyId }) => legacyId))
  const php = [
    `$ids = ${expected};`,
    '$roots = [];',
    'foreach ($ids as $id) {',
    '  $roots[] = [',
    "    'id' => (int) $id,",
    "    'postType' => (string) get_post_type($id),",
    "    'status' => (string) get_post_status($id),",
    "    'path' => (string) wp_parse_url(get_permalink($id), PHP_URL_PATH),",
    '  ];',
    '}',
    'global $wpdb;',
    'echo wp_json_encode([',
    "  'home' => home_url(),",
    "  'tablePrefix' => $wpdb->prefix,",
    "  'acfVersion' => defined('ACF_VERSION') ? ACF_VERSION : '',",
    "  'roots' => $roots,",
    ']);',
  ].join(' ')

  const { stdout } = run('docker', [
    'exec',
    '-w',
    migrationConfig.source.root,
    migrationConfig.source.container,
    'wp',
    '--allow-root',
    'eval',
    php,
  ])

  return JSON.parse(stdout.trim()) as SourceProbe
}

export const preflight = async (): Promise<void> => {
  const state = run('docker', [
    'inspect',
    '--format',
    '{{.State.Running}}',
    migrationConfig.source.container,
  ]).stdout.trim()

  if (state !== 'true') {
    throw new Error(
      `WordPress source container is not running: ${migrationConfig.source.container}`,
    )
  }

  const source = probeSource()
  const expectedHome = migrationConfig.source.expectedSiteURL.replace(/\/$/, '')

  if (source.home.replace(/\/$/, '') !== expectedHome) {
    throw new Error(
      `Unexpected WordPress source: expected ${expectedHome}, received ${source.home}`,
    )
  }
  if (source.tablePrefix !== 'wp_') {
    throw new Error(`Unexpected WordPress table prefix: ${source.tablePrefix}`)
  }
  if (!source.acfVersion) {
    throw new Error('Advanced Custom Fields is not active in the source container.')
  }

  for (const expectedRoot of pilotScope.roots) {
    const actual = source.roots.find(({ id }) => id === expectedRoot.legacyId)
    if (!actual) {
      throw new Error(`Missing source root ${expectedRoot.legacyId}`)
    }
    if (actual.postType !== expectedRoot.postType) {
      throw new Error(
        `Source root ${actual.id} has type ${actual.postType}; expected ${expectedRoot.postType}`,
      )
    }
    if (actual.path !== expectedRoot.path) {
      throw new Error(
        `Source root ${actual.id} resolves to ${actual.path}; expected ${expectedRoot.path}`,
      )
    }
  }

  if (!fs.existsSync(migrationConfig.source.uploads)) {
    throw new Error(
      `WordPress uploads directory is not readable: ${migrationConfig.source.uploads}`,
    )
  }

  const postgresTarget = connectionTarget(process.env.DATABASE_URL, '127.0.0.1', 5432)
  const minioTarget = connectionTarget(process.env.S3_ENDPOINT, '127.0.0.1', 9000)
  const [postgres, minio] = await Promise.all([
    waitForPort(postgresTarget.host, postgresTarget.port),
    waitForPort(minioTarget.host, minioTarget.port),
  ])

  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        source: {
          container: migrationConfig.source.container,
          home: source.home,
          acfVersion: source.acfVersion,
          roots: source.roots,
          uploads: migrationConfig.source.uploads,
        },
        targets: {
          postgres,
          minio,
        },
      },
      null,
      2,
    )}\n`,
  )

  if (!postgres || !minio) {
    throw new Error('Target PostgreSQL and MinIO services must be running before migration.')
  }
}
