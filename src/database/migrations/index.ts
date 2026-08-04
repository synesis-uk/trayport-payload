import * as migration_20260728_201453_initial_schema from './20260728_201453_initial_schema'
import * as migration_20260730_002734_routable_content_foundation from './20260730_002734_routable_content_foundation'
import * as migration_20260730_015904_redirect_status from './20260730_015904_redirect_status'
import * as migration_20260803_175438_production_pilot_content from './20260803_175438_production_pilot_content'
import * as migration_20260803_181505_optional_managed_links from './20260803_181505_optional_managed_links'
import * as migration_20260803_184425_production_pilot_safety from './20260803_184425_production_pilot_safety'
import * as migration_20260803_231412_visual_parity from './20260803_231412_visual_parity'
import * as migration_20260804_024704_footer_navigation_shell from './20260804_024704_footer_navigation_shell'
import * as migration_20260804_025213_cookie_policy_url from './20260804_025213_cookie_policy_url'
import * as migration_20260804_031832_home_joule_presentation_semantics from './20260804_031832_home_joule_presentation_semantics'
import * as migration_20260804_040104 from './20260804_040104'
import * as migration_20260804_041753_insights_display_date from './20260804_041753_insights_display_date'
import * as migration_20260804_044451_home_market_coverage_presentation from './20260804_044451_home_market_coverage_presentation'
import * as migration_20260804_082210_action_forward_icon from './20260804_082210_action_forward_icon'
import * as migration_20260804_093914_market_matrix_component from './20260804_093914_market_matrix_component'
import * as migration_20260804_103936_data_chart_asset_class from './20260804_103936_data_chart_asset_class'
import * as migration_20260804_104200_data_chart_asset_class_backfill from './20260804_104200_data_chart_asset_class_backfill'
import * as migration_20260804_113221_data_chart_semantics from './20260804_113221_data_chart_semantics'

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
  {
    up: migration_20260803_231412_visual_parity.up,
    down: migration_20260803_231412_visual_parity.down,
    name: '20260803_231412_visual_parity',
  },
  {
    up: migration_20260804_024704_footer_navigation_shell.up,
    down: migration_20260804_024704_footer_navigation_shell.down,
    name: '20260804_024704_footer_navigation_shell',
  },
  {
    up: migration_20260804_025213_cookie_policy_url.up,
    down: migration_20260804_025213_cookie_policy_url.down,
    name: '20260804_025213_cookie_policy_url',
  },
  {
    up: migration_20260804_031832_home_joule_presentation_semantics.up,
    down: migration_20260804_031832_home_joule_presentation_semantics.down,
    name: '20260804_031832_home_joule_presentation_semantics',
  },
  {
    up: migration_20260804_040104.up,
    down: migration_20260804_040104.down,
    name: '20260804_040104',
  },
  {
    up: migration_20260804_041753_insights_display_date.up,
    down: migration_20260804_041753_insights_display_date.down,
    name: '20260804_041753_insights_display_date',
  },
  {
    up: migration_20260804_044451_home_market_coverage_presentation.up,
    down: migration_20260804_044451_home_market_coverage_presentation.down,
    name: '20260804_044451_home_market_coverage_presentation',
  },
  {
    up: migration_20260804_082210_action_forward_icon.up,
    down: migration_20260804_082210_action_forward_icon.down,
    name: '20260804_082210_action_forward_icon',
  },
  {
    up: migration_20260804_093914_market_matrix_component.up,
    down: migration_20260804_093914_market_matrix_component.down,
    name: '20260804_093914_market_matrix_component',
  },
  {
    up: migration_20260804_103936_data_chart_asset_class.up,
    down: migration_20260804_103936_data_chart_asset_class.down,
    name: '20260804_103936_data_chart_asset_class',
  },
  {
    up: migration_20260804_104200_data_chart_asset_class_backfill.up,
    down: migration_20260804_104200_data_chart_asset_class_backfill.down,
    name: '20260804_104200_data_chart_asset_class_backfill',
  },
  {
    up: migration_20260804_113221_data_chart_semantics.up,
    down: migration_20260804_113221_data_chart_semantics.down,
    name: '20260804_113221_data_chart_semantics',
  },
]
