-- Usage + quotas (tenant metering)
create table tenant_usage_daily (
  tenant_id uuid references tenants(id) on delete cascade,
  day date not null,
  api_calls bigint not null default 0,
  storage_bytes bigint not null default 0,
  exports bigint not null default 0,
  primary key (tenant_id, day)
);

create table tenant_quotas (
  tenant_id uuid primary key references tenants(id) on delete cascade,
  api_calls_per_day bigint not null default 10000,
  storage_bytes bigint not null default 1073741824, -- 1GB
  exports_per_day bigint not null default 25,
  seats int not null default 3
);
