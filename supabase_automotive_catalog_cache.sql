-- Cache separado para o catálogo público de veículos e cores.
-- Estes registros são identificações OEM; não são fórmulas de mistura de tinta.

create table if not exists public.automotive_catalog_makes (
  source_id text primary key,
  name text not null,
  country_code text,
  synced_at timestamptz not null default now()
);

create table if not exists public.automotive_catalog_models (
  source_id text primary key,
  make_source_id text not null references public.automotive_catalog_makes(source_id) on delete cascade,
  name text not null,
  synced_at timestamptz not null default now(),
  unique (make_source_id, name)
);

create table if not exists public.automotive_catalog_colors (
  id uuid primary key default gen_random_uuid(),
  source_id text not null unique,
  model_source_id text not null references public.automotive_catalog_models(source_id) on delete cascade,
  name text not null,
  manufacturer_code text,
  hex_code text,
  source_name text not null default 'fleetByte Catalog API',
  synced_at timestamptz not null default now(),
  constraint automotive_catalog_hex_check
    check (hex_code is null or hex_code ~ '^#[0-9A-Fa-f]{6}$')
);

create index if not exists automotive_catalog_models_make_idx
  on public.automotive_catalog_models(make_source_id, lower(name));
create index if not exists automotive_catalog_colors_model_idx
  on public.automotive_catalog_colors(model_source_id);
create index if not exists automotive_catalog_colors_code_idx
  on public.automotive_catalog_colors(upper(manufacturer_code));
create index if not exists automotive_catalog_colors_name_idx
  on public.automotive_catalog_colors(lower(name));

alter table public.automotive_catalog_makes enable row level security;
alter table public.automotive_catalog_models enable row level security;
alter table public.automotive_catalog_colors enable row level security;

drop policy if exists "Public can read automotive catalog makes" on public.automotive_catalog_makes;
create policy "Public can read automotive catalog makes"
  on public.automotive_catalog_makes for select to anon, authenticated using (true);

drop policy if exists "Public can read automotive catalog models" on public.automotive_catalog_models;
create policy "Public can read automotive catalog models"
  on public.automotive_catalog_models for select to anon, authenticated using (true);

drop policy if exists "Public can read automotive catalog colors" on public.automotive_catalog_colors;
create policy "Public can read automotive catalog colors"
  on public.automotive_catalog_colors for select to anon, authenticated using (true);

grant select on public.automotive_catalog_makes to anon, authenticated;
grant select on public.automotive_catalog_models to anon, authenticated;
grant select on public.automotive_catalog_colors to anon, authenticated;

comment on table public.automotive_catalog_makes is 'Fabricantes sincronizados do catálogo público fleetByte; leitura pública e escrita somente pelo backend.';
comment on table public.automotive_catalog_models is 'Modelos sincronizados do catálogo público fleetByte; leitura pública e escrita somente pelo backend.';
comment on table public.automotive_catalog_colors is 'Cores OEM de catálogo automotivo, não fórmulas de mistura. Leitura pública e escrita somente pelo backend.';
