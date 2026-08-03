import * as migration_20260728_201453_initial_schema from './20260728_201453_initial_schema'
import * as migration_20260730_002734_routable_content_foundation from './20260730_002734_routable_content_foundation'
import * as migration_20260730_015904_redirect_status from './20260730_015904_redirect_status'
import * as migration_20260803_175438_production_pilot_content from './20260803_175438_production_pilot_content'
import * as migration_20260803_181505_optional_managed_links from './20260803_181505_optional_managed_links'
import * as migration_20260803_184425_production_pilot_safety from './20260803_184425_production_pilot_safety'

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
  {
    up: migration_20260803_175438_production_pilot_content.up,
    down: migration_20260803_175438_production_pilot_content.down,
    name: '20260803_175438_production_pilot_content',
  },
  {
    up: migration_20260803_181505_optional_managed_links.up,
    down: migration_20260803_181505_optional_managed_links.down,
    name: '20260803_181505_optional_managed_links',
  },
  {
    up: migration_20260803_184425_production_pilot_safety.up,
    down: migration_20260803_184425_production_pilot_safety.down,
    name: '20260803_184425_production_pilot_safety',
  },
]
