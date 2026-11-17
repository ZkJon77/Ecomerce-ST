-- Destaques de veículos e ranking de cores baseado em pesquisas reais do site.
create table if not exists public.automotive_featured_vehicles (
  id uuid primary key default gen_random_uuid(),
  manufacturer text not null,
  model text not null,
  sales_rank integer not null,
  reference_month text not null,
  source_name text not null default 'FENABRAVE',
  source_url text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (manufacturer, model, reference_month)
);
create index if not exists automotive_featured_vehicles_rank_idx
  on public.automotive_featured_vehicles(active, sales_rank);

create table if not exists public.automotive_color_search_stats (
  source_color_id text primary key,
  manufacturer text not null,
  model text not null,
  color_name text not null,
  manufacturer_code text,
  hex_code text,
  searches bigint not null default 0 check (searches >= 0),
  last_searched_at timestamptz not null default now()
);
create index if not exists automotive_color_search_stats_rank_idx
  on public.automotive_color_search_stats(searches desc, last_searched_at desc);

alter table public.automotive_featured_vehicles enable row level security;
alter table public.automotive_color_search_stats enable row level security;

drop policy if exists "Public can read featured automotive vehicles" on public.automotive_featured_vehicles;
create policy "Public can read featured automotive vehicles"
  on public.automotive_featured_vehicles for select to anon, authenticated using (active = true);
drop policy if exists "Public can read popular automotive color stats" on public.automotive_color_search_stats;
create policy "Public can read popular automotive color stats"
  on public.automotive_color_search_stats for select to anon, authenticated using (true);
grant select on public.automotive_featured_vehicles to anon, authenticated;
grant select on public.automotive_color_search_stats to anon, authenticated;

insert into public.automotive_featured_vehicles
(manufacturer, model, sales_rank, reference_month, source_name, source_url)
values
('BYD', 'Dolphin Mini', 1, '2026-10', 'FENABRAVE', 'https://www.fenabrave.org.br/portal/files/2026_10_02%202.pdf'),
('GWM', 'Haval H6', 2, '2026-10', 'FENABRAVE', 'https://www.fenabrave.org.br/portal/files/2026_10_02%202.pdf'),
('Toyota', 'Yaris Cross', 3, '2026-10', 'FENABRAVE', 'https://www.fenabrave.org.br/portal/files/2026_10_02%202.pdf'),
('Volkswagen', 'T-Cross', 4, '2026-10', 'FENABRAVE', 'https://www.fenabrave.org.br/portal/files/2026_10_02%202.pdf'),
('Chevrolet', 'Onix', 5, '2026-10', 'FENABRAVE', 'https://www.fenabrave.org.br/portal/files/2026_10_02%202.pdf'),
('Volkswagen', 'Tera', 6, '2026-10', 'FENABRAVE', 'https://www.fenabrave.org.br/portal/files/2026_10_02%202.pdf'),
('Caoa Chery', 'Tiggo 7', 7, '2026-10', 'FENABRAVE', 'https://www.fenabrave.org.br/portal/files/2026_10_02%202.pdf'),
('Hyundai', 'Creta', 8, '2026-10', 'FENABRAVE', 'https://www.fenabrave.org.br/portal/files/2026_10_02%202.pdf'),
('Chevrolet', 'Tracker', 9, '2026-10', 'FENABRAVE', 'https://www.fenabrave.org.br/portal/files/2026_10_02%202.pdf'),
('Fiat', 'Fastback', 10, '2026-10', 'FENABRAVE', 'https://www.fenabrave.org.br/portal/files/2026_10_02%202.pdf')
on conflict (manufacturer, model, reference_month) do update
set sales_rank = excluded.sales_rank, source_name = excluded.source_name,
    source_url = excluded.source_url, active = true;

create or replace function public.record_automotive_color_search(
  p_source_color_id text, p_manufacturer text, p_model text, p_color_name text,
  p_manufacturer_code text default null, p_hex_code text default null
) returns void
language sql security definer set search_path = public
as $$
  insert into public.automotive_color_search_stats
    (source_color_id, manufacturer, model, color_name, manufacturer_code, hex_code, searches, last_searched_at)
  values
    (p_source_color_id, p_manufacturer, p_model, p_color_name, p_manufacturer_code, p_hex_code, 1, now())
  on conflict (source_color_id) do update
  set searches = automotive_color_search_stats.searches + 1,
      manufacturer = excluded.manufacturer, model = excluded.model,
      color_name = excluded.color_name, manufacturer_code = excluded.manufacturer_code,
      hex_code = excluded.hex_code, last_searched_at = now();
$$;
revoke all on function public.record_automotive_color_search(text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.record_automotive_color_search(text,text,text,text,text,text) to service_role;

comment on table public.automotive_featured_vehicles is 'Modelos em destaque com base no ranking de emplacamentos Fenabrave; não representa popularidade de cores.';
comment on table public.automotive_color_search_stats is 'Popularidade calculada somente a partir das pesquisas reais realizadas no site Silver Tintas.';
