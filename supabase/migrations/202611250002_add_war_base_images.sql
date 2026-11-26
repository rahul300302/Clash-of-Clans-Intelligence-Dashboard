alter table public.profiles add column if not exists is_admin boolean not null default false;

create table if not exists public.war_base_images (
  id uuid primary key default gen_random_uuid(),
  player_tag text not null unique,
  player_name text not null,
  town_hall_level integer not null check (town_hall_level between 1 and 20),
  base_type text not null default 'War Base',
  image_url text not null,
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists war_base_images_player_tag_idx on public.war_base_images(player_tag);
create index if not exists war_base_images_town_hall_idx on public.war_base_images(town_hall_level);

alter table public.war_base_images enable row level security;

drop policy if exists war_base_images_public_read on public.war_base_images;
create policy war_base_images_public_read on public.war_base_images for select using (true);

drop policy if exists war_base_images_admin_insert on public.war_base_images;
create policy war_base_images_admin_insert on public.war_base_images for insert
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

drop policy if exists war_base_images_admin_update on public.war_base_images;
create policy war_base_images_admin_update on public.war_base_images for update
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

drop policy if exists war_base_images_admin_delete on public.war_base_images;
create policy war_base_images_admin_delete on public.war_base_images for delete
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('war-base-images', 'war-base-images', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists war_base_storage_admin_insert on storage.objects;
create policy war_base_storage_admin_insert on storage.objects for insert to authenticated
with check (bucket_id = 'war-base-images' and exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
));

drop policy if exists war_base_storage_admin_update on storage.objects;
create policy war_base_storage_admin_update on storage.objects for update to authenticated
using (bucket_id = 'war-base-images' and exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
))
with check (bucket_id = 'war-base-images' and exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
));

drop policy if exists war_base_storage_admin_delete on storage.objects;
create policy war_base_storage_admin_delete on storage.objects for delete to authenticated
using (bucket_id = 'war-base-images' and exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
));

drop policy if exists war_base_storage_admin_read on storage.objects;
create policy war_base_storage_admin_read on storage.objects for select to authenticated
using (bucket_id = 'war-base-images' and exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
));
