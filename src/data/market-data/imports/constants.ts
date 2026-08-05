import path from 'node:path'

export const MARKET_DATA_IMPORT_COLLECTION = 'market-data-imports'
export const MARKET_DATA_IMPORT_PARSER_VERSION = 'trayport-market-csv/v1'
export const MARKET_DATA_IMPORT_MAX_BYTES = 5 * 1024 * 1024
export const MARKET_DATA_IMPORT_MAX_ROWS = 10_000
export const MARKET_DATA_IMPORT_MAX_COLUMNS = 500
export const MARKET_DATA_IMPORT_MAX_CELLS = 250_000
export const MARKET_DATA_IMPORT_MAX_ISSUES = 100
export const MARKET_DATA_IMPORT_PREVIEW_ROWS = 25

export const MARKET_DATA_IMPORT_STATIC_DIR = path.resolve(
  process.cwd(),
  process.env.MARKET_DATA_IMPORT_PATH || '.data/market-data-imports',
)
