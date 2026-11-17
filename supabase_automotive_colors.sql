create table if not exists public.automotive_color_formulas (
  id uuid primary key default gen_random_uuid(),
  manufacturer text not null,
  model text not null,
  year_start integer,
  year_end integer,
  color_code text not null,
  color_name text,
  color_group text,
  color_hex text,
  finish text,
  paint_system text,
  notes text,
  source_name text,
  source_reference text,
  verified_at timestamptz,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint automotive_color_year_range_check
    check (year_start is null or year_end is null or year_start <= year_end),
  constraint automotive_color_hex_check
    check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$')
);

create index if not exists automotive_color_code_idx
  on public.automotive_color_formulas (upper(color_code));
create index if not exists automotive_color_vehicle_idx
  on public.automotive_color_formulas (manufacturer, model, year_start, year_end);
create index if not exists automotive_color_group_idx
  on public.automotive_color_formulas (color_group);

alter table public.automotive_color_formulas enable row level security;

drop policy if exists "Public can read active automotive color references"
  on public.automotive_color_formulas;

create policy "Public can read active automotive color references"
  on public.automotive_color_formulas
  for select
  to anon, authenticated
  using (is_active = true);

comment on table public.automotive_color_formulas is
  'Referências automotivas de cores e fórmulas licenciadas/validadas. Não inserir dados sem autorização da fonte.';
