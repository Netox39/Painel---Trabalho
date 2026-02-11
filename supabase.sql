-- Execute no Supabase SQL Editor
create extension if not exists pgcrypto;

create table if not exists public.inventario (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  codigo text not null,
  andar text,
  equipamento text not null,
  patrimonio text,
  setor text,
  responsavel text,
  observacoes text,
  status text
);

create table if not exists public.envios_retornos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  item text not null,
  patrimonio text,
  marca_modelo text,
  responsavel text,
  data_envio date,
  data_retorno date,
  status text,
  motivo text,
  observacoes text
);

create table if not exists public.ar_condicionado (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  local text not null,
  andar text,
  setor text,
  marca_modelo text,
  btu text,
  status text,
  ultima_manutencao date,
  observacoes text
);

create table if not exists public.agenda_lab (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  laboratorio text not null,
  dia_semana text not null,
  horario text not null,
  turma text,
  professor text,
  disciplina text,
  observacoes text
);

create table if not exists public.ramais (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  setor text not null,
  responsavel text,
  ramal text not null,
  observacoes text
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_inventario_updated_at') then
    create trigger trg_inventario_updated_at before update on public.inventario
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_envios_updated_at') then
    create trigger trg_envios_updated_at before update on public.envios_retornos
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_ar_updated_at') then
    create trigger trg_ar_updated_at before update on public.ar_condicionado
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_agenda_updated_at') then
    create trigger trg_agenda_updated_at before update on public.agenda_lab
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_ramais_updated_at') then
    create trigger trg_ramais_updated_at before update on public.ramais
    for each row execute function public.set_updated_at();
  end if;
end $$;

alter table public.inventario enable row level security;
alter table public.envios_retornos enable row level security;
alter table public.ar_condicionado enable row level security;
alter table public.agenda_lab enable row level security;
alter table public.ramais enable row level security;

drop policy if exists "read_auth_inventario" on public.inventario;
create policy "read_auth_inventario" on public.inventario for select to authenticated using (true);
drop policy if exists "write_auth_inventario" on public.inventario;
create policy "write_auth_inventario" on public.inventario for all to authenticated using (true) with check (true);

drop policy if exists "read_auth_envios" on public.envios_retornos;
create policy "read_auth_envios" on public.envios_retornos for select to authenticated using (true);
drop policy if exists "write_auth_envios" on public.envios_retornos;
create policy "write_auth_envios" on public.envios_retornos for all to authenticated using (true) with check (true);

drop policy if exists "read_auth_ar" on public.ar_condicionado;
create policy "read_auth_ar" on public.ar_condicionado for select to authenticated using (true);
drop policy if exists "write_auth_ar" on public.ar_condicionado;
create policy "write_auth_ar" on public.ar_condicionado for all to authenticated using (true) with check (true);

drop policy if exists "read_auth_agenda" on public.agenda_lab;
create policy "read_auth_agenda" on public.agenda_lab for select to authenticated using (true);
drop policy if exists "write_auth_agenda" on public.agenda_lab;
create policy "write_auth_agenda" on public.agenda_lab for all to authenticated using (true) with check (true);

drop policy if exists "read_auth_ramais" on public.ramais;
create policy "read_auth_ramais" on public.ramais for select to authenticated using (true);
drop policy if exists "write_auth_ramais" on public.ramais;
create policy "write_auth_ramais" on public.ramais for all to authenticated using (true) with check (true);
