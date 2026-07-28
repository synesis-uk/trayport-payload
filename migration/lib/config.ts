import path from 'node:path'

import 'dotenv/config'

const projectRoot = process.cwd()

const required = (name: string, fallback?: string): string => {
  const value = process.env[name] || fallback
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const migrationConfig = {
  projectRoot,
  workDir: path.resolve(projectRoot, process.env.MIGRATION_WORK_DIR || 'migration/work'),
  exporterPath: path.resolve(projectRoot, 'migration/wp-exporter/export.php'),
  source: {
    container: required('WP_SOURCE_CONTAINER', 'trayport_local_site'),
    root: required('WP_SOURCE_ROOT', '/var/www/html'),
    expectedSiteURL: required('WP_SOURCE_SITE_URL', 'http://trayport.local'),
    uploads: required('WP_SOURCE_UPLOADS', '/home/admin/site/tp/web/app/uploads'),
  },
}
