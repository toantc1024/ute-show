-- 1. Create the events table
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  event_date timestamp with time zone,
  checkin_start timestamp with time zone,
  checkin_end timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create the guests table
create table if not exists public.guests (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  chuc_vu text not null,
  don_vi text not null,
  event_id uuid references public.events(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create the checkins table
create table if not exists public.checkins (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  chuc_vu text not null,
  don_vi text not null,
  event_id uuid references public.events(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Realtime for all tables
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.guests;
alter publication supabase_realtime add table public.checkins;

-- Enable Row Level Security (RLS)
alter table public.events enable row level security;
alter table public.guests enable row level security;
alter table public.checkins enable row level security;

-- Policies for events
create policy "Enable read access for all users" on public.events for select using (true);
create policy "Enable all access for authenticated users" on public.events for all to authenticated using (true);

-- Policies for guests
create policy "Enable read access for all users" on public.guests for select using (true);
create policy "Enable all access for authenticated users" on public.guests for all to authenticated using (true);

-- Policies for checkins
create policy "Enable read access for all users" on public.checkins for select using (true);
create policy "Enable insert for all" on public.checkins for insert with check (true);
create policy "Enable all access for authenticated users" on public.checkins for all to authenticated using (true);
