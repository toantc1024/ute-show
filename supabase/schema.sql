-- 1. Create the checkins table
create table if not exists public.checkins (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  chuc_vu text not null,
  don_vi text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Realtime for the table
alter publication supabase_realtime add table public.checkins;

-- 3. Enable Row Level Security (RLS)
alter table public.checkins enable row level security;

-- 4. Policies
create policy "Enable read access for all users"
on public.checkins for select
using (true);

create policy "Enable insert for authenticated users only"
on public.checkins for insert
to authenticated
with check (true);

create policy "Enable delete for authenticated users only"
on public.checkins for delete
to authenticated
using (true);
