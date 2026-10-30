-- =========================================================
-- FitRHJ: family-code sync for table public.fit_kv
-- Paste all of this into Supabase > SQL Editor > New query, then Run. Safe to run again.
-- Table already has: owner uuid, key text, value jsonb, updated_at timestamptz, RLS on.
-- =========================================================

-- 1. Hashing tools (already installed on most Supabase projects)
create extension if not exists pgcrypto with schema extensions;

-- 2. A private secret, so a family code can't be guessed from the database
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists private.fit_secret (id int primary key, salt text not null);
insert into private.fit_secret (id, salt)
values (1, encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (id) do nothing;

-- 3. The table: one row per family + key, no link to email accounts
do $$
declare c text;
begin
  for c in select conname from pg_constraint
           where conrelid = 'public.fit_kv'::regclass and contype = 'f' loop
    execute format('alter table public.fit_kv drop constraint %I', c);
  end loop;
end $$;
alter table public.fit_kv alter column owner drop default;
create unique index if not exists fit_kv_owner_key on public.fit_kv (owner, key);
alter table public.fit_kv enable row level security;
revoke all on public.fit_kv from anon, authenticated;   -- the app never touches the table directly

-- 4. Family code -> family ID (private, not callable from the app)
create or replace function private.fit_owner(code text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare s text;
begin
  if code is null or length(trim(code)) < 8 then
    raise exception 'Family code must be at least 8 characters';
  end if;
  select salt into s from private.fit_secret where id = 1;
  return substr(encode(extensions.digest(s || lower(trim(code)), 'sha256'), 'hex'), 1, 32)::uuid;
end $$;
revoke all on function private.fit_owner(text) from public, anon, authenticated;

-- 5. Download: everything for this family changed after "since" (or everything)
create or replace function public.fit_pull(code text, since timestamptz default null)
returns table (k text, v jsonb, t timestamptz)
language plpgsql security definer set search_path = ''
as $$
#variable_conflict use_column
declare o uuid := private.fit_owner(code);
begin
  return query
    select f.key, f.value, f.updated_at
    from public.fit_kv f
    where f.owner = o and (since is null or f.updated_at > since)
    order by f.updated_at;
end $$;

-- 6. Upload: [{ "key": "corner3:...", "value": {...} or null, "updated_at": "..." }]
--    The newest change wins. Only FitRHJ keys are accepted.
create or replace function public.fit_push(code text, rows jsonb)
returns int
language plpgsql security definer set search_path = ''
as $$
#variable_conflict use_column
declare o uuid := private.fit_owner(code); n int;
begin
  if jsonb_typeof(rows) <> 'array' or jsonb_array_length(rows) > 500 then
    raise exception 'Send a list of at most 500 items';
  end if;
  insert into public.fit_kv (owner, key, value, updated_at)
  select o, r->>'key', r->'value',
         least(coalesce((r->>'updated_at')::timestamptz, now()), now())
  from jsonb_array_elements(rows) r
  where r->>'key' like 'corner3:%' and length(r->>'key') <= 200
  on conflict (owner, key) do update
    set value = excluded.value, updated_at = excluded.updated_at
    where public.fit_kv.updated_at < excluded.updated_at;
  get diagnostics n = row_count;
  return n;
end $$;

-- 7. Only these two functions are open to the app
revoke all on function public.fit_pull(text, timestamptz) from public;
revoke all on function public.fit_push(text, jsonb) from public;
grant execute on function public.fit_pull(text, timestamptz) to anon, authenticated;
grant execute on function public.fit_push(text, jsonb) to anon, authenticated;
