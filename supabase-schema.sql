-- Run this in your Supabase SQL Editor

create table matches (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  day text not null check (day in ('Lundi', 'Vendredi')),
  score_jamal integer not null default 0,
  score_hajj integer not null default 0,
  note text,
  created_at timestamp with time zone default now()
);

-- Public can read matches (for the public page)
alter table matches enable row level security;

create policy "Public read"
  on matches for select
  using (true);

-- Only authenticated users can insert/update/delete
create policy "Admin insert"
  on matches for insert
  to authenticated
  with check (true);

create policy "Admin update"
  on matches for update
  to authenticated
  using (true);

create policy "Admin delete"
  on matches for delete
  to authenticated
  using (true);
