-- Painel de Trabalho — Supabase
-- 1) Tabela de equipamentos
create table if not exists public.equipamentos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  codigo text not null,
  andar text,
  equipamento text not null,
  patrimonio text,
  setor text,
  responsavel text,
  observacoes text,
  status text not null default 'Ativo',
  user_id uuid not null default auth.uid()
);

-- 2) Index
create index if not exists equipamentos_created_at_idx on public.equipamentos (created_at desc);
create index if not exists equipamentos_user_id_idx on public.equipamentos (user_id);

-- 3) RLS
alter table public.equipamentos enable row level security;

-- Políticas: cada usuário só vê/edita seus próprios registros.
drop policy if exists "equipamentos_select_own" on public.equipamentos;
create policy "equipamentos_select_own"
on public.equipamentos for select
using (auth.uid() = user_id);

drop policy if exists "equipamentos_insert_own" on public.equipamentos;
create policy "equipamentos_insert_own"
on public.equipamentos for insert
with check (auth.uid() = user_id);

drop policy if exists "equipamentos_update_own" on public.equipamentos;
create policy "equipamentos_update_own"
on public.equipamentos for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "equipamentos_delete_own" on public.equipamentos;
create policy "equipamentos_delete_own"
on public.equipamentos for delete
using (auth.uid() = user_id);

-- Observação:
-- Se você quiser que TODOS os usuários vejam TODOS os registros, remova user_id + políticas e use uma política aberta (não recomendado).
