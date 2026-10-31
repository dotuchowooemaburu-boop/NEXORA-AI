-- NEXORA AI Supabase setup
-- Run this entire script in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  prompt text not null check (char_length(prompt) between 1 and 10000),
  status text not null default 'Brief saved',
  result_url text,
  output_text text,
  created_at timestamptz not null default now()
);

-- Expand older starter-project type constraints safely.
alter table public.projects drop constraint if exists projects_type_check;
alter table public.projects add constraint projects_type_check
  check (type in ('video','image','audio','director','world','factory','assistant'));
alter table public.projects add column if not exists result_url text;
alter table public.projects add column if not exists output_text text;

create table if not exists public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  task text not null,
  model_id text not null,
  request_id text not null unique,
  status_url text not null,
  response_url text not null,
  status text not null default 'IN_QUEUE',
  queue_position integer,
  prompt text not null default '',
  output_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.generation_jobs enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "Users create own profile" on public.profiles;
create policy "Users create own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users read own projects" on public.projects;
create policy "Users read own projects" on public.projects for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users create own projects" on public.projects;
create policy "Users create own projects" on public.projects for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users update own projects" on public.projects;
create policy "Users update own projects" on public.projects for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users delete own projects" on public.projects;
create policy "Users delete own projects" on public.projects for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "Users read own generation jobs" on public.generation_jobs;
create policy "Users read own generation jobs" on public.generation_jobs for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users create own generation jobs" on public.generation_jobs;
create policy "Users create own generation jobs" on public.generation_jobs for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users update own generation jobs" on public.generation_jobs;
create policy "Users update own generation jobs" on public.generation_jobs for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update on public.generation_jobs to authenticated;

-- Automatically create a profile when a new auth user registers.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Public read is required because the AI provider fetches uploaded source media by URL.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('nexora-inputs', 'nexora-inputs', true, 52428800, array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','video/webm','audio/mpeg','audio/wav','audio/mp4','audio/x-m4a','audio/aac','audio/ogg'])
on conflict (id) do update set public = true, file_size_limit = 52428800;

drop policy if exists "Users upload own NEXORA inputs" on storage.objects;
create policy "Users upload own NEXORA inputs" on storage.objects for insert to authenticated
with check (bucket_id = 'nexora-inputs' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users update own NEXORA inputs" on storage.objects;
create policy "Users update own NEXORA inputs" on storage.objects for update to authenticated
using (bucket_id = 'nexora-inputs' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'nexora-inputs' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users delete own NEXORA inputs" on storage.objects;
create policy "Users delete own NEXORA inputs" on storage.objects for delete to authenticated
using (bucket_id = 'nexora-inputs' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Public can read NEXORA input assets" on storage.objects;
create policy "Public can read NEXORA input assets" on storage.objects for select to public
using (bucket_id = 'nexora-inputs');
