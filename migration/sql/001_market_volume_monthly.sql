create schema if not exists app;

create table if not exists app.market_volume_monthly (
  id bigserial primary key,
  asset_class_legacy_id integer not null,
  hub_legacy_id integer not null,
  year smallint not null check (year between 2000 and 2100),
  month smallint not null check (month between 1 and 12),
  otc_bilateral numeric,
  otc_cleared numeric,
  exchange_traded numeric,
  price numeric,
  source_post_legacy_id integer not null,
  source_fingerprint text not null,
  imported_at timestamptz not null default now(),
  unique (asset_class_legacy_id, hub_legacy_id, year, month)
);

create index if not exists market_volume_monthly_asset_hub_date_idx
  on app.market_volume_monthly (asset_class_legacy_id, hub_legacy_id, year, month);
