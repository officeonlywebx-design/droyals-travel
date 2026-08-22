-- ==========================================================
-- D'Royals Travels & Tours — Supabase setup
-- Run this in Supabase: Project → SQL Editor → New query → Run
-- ==========================================================

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_type text not null,              -- 'flight' | 'hotel' | 'package' | 'visa' | 'general'
  full_name text,
  phone text,
  email text,
  details jsonb,                        -- everything else from the form (route, dates, message, etc.)
  status text not null default 'new'    -- 'new' | 'contacted' | 'booked' | 'closed'
);

-- Lock the table down: the public site can only INSERT, never read/edit/delete.
alter table public.leads enable row level security;

create policy "Public can submit leads"
  on public.leads
  for insert
  to anon
  with check (true);

-- No SELECT/UPDATE/DELETE policy is created for 'anon' on purpose —
-- that means the public key can never read back what's in this table.
-- To view leads, use the Supabase Table Editor while logged in as
-- the project owner, or build an authenticated admin view later.

-- Optional: index for sorting the newest leads first in the dashboard
create index if not exists leads_created_at_idx on public.leads (created_at desc);
