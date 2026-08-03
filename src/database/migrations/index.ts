import * as migration_20260728_201453_initial_schema from './20260728_201453_initial_schema'
import * as migration_20260730_002734_routable_content_foundation from './20260730_002734_routable_content_foundation'
import * as migration_20260730_015904_redirect_status from './20260730_015904_redirect_status'

export const migrations = [
  {
    up: migration_20260728_201453_initial_schema.up,
    down: migration_20260728_201453_initial_schema.down,
    name: '20260728_201453_initial_schema',
  },
  {
    up: migration_20260730_002734_routable_content_foundation.up,
    down: migration_20260730_002734_routable_content_foundation.down,
    name: '20260730_002734_routable_content_foundation',
  },
  {
    up: migration_20260730_015904_redirect_status.up,
    down: migration_20260730_015904_redirect_status.down,
    name: '20260730_015904_redirect_status',
  },
]
