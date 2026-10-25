-- FIXA FILE STORE: run this whole file in Supabase SQL Editor.
-- Uses Supabase Auth for accounts and a private Storage bucket.
-- Never place service_role / secret keys in browser code.

create extension if not exists pgcrypto;

create table if not exists public.user_files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  object_path text not null unique,
  original_name text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  mime_type text not null default 'application/octet-stream',
  created_at timestamptz not null default now()
);

alter table public.user_files enable row level security;

drop policy if exists "Users can read own file metadata" on public.user_files;
create policy "Users can read own file metadata"
on public.user_files for select to authenticated
using (auth.uid() = owner_id);

drop policy if exists "Users can insert own file metadata" on public.user_files;
create policy "Users can insert own file metadata"
on public.user_files for insert to authenticated
with check (
  auth.uid() = owner_id
  and split_part(object_path, '/', 1) = auth.uid()::text
);

drop policy if exists "Users can delete own file metadata" on public.user_files;
create policy "Users can delete own file metadata"
on public.user_files for delete to authenticated
using (auth.uid() = owner_id);

-- Private bucket. 100 MiB per object; browser app also enforces this limit.
insert into storage.buckets (id, name, public, file_size_limit)
values ('fixa-files', 'fixa-files', false, 104857600)
on conflict (id) do update set public = false, file_size_limit = 104857600;

drop policy if exists "Fixa users can read own objects" on storage.objects;
create policy "Fixa users can read own objects"
on storage.objects for select to authenticated
using (
  bucket_id = 'fixa-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Fixa users can upload own objects" on storage.objects;
create policy "Fixa users can upload own objects"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'fixa-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Fixa users can update own objects" on storage.objects;
create policy "Fixa users can update own objects"
on storage.objects for update to authenticated
using (
  bucket_id = 'fixa-files'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'fixa-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Fixa users can delete own objects" on storage.objects;
create policy "Fixa users can delete own objects"
on storage.objects for delete to authenticated
using (
  bucket_id = 'fixa-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Optional: confirm policies after running:
-- select schemaname, tablename, policyname, cmd
-- from pg_policies
-- where tablename in ('user_files', 'objects')
-- order by tablename, policyname;
