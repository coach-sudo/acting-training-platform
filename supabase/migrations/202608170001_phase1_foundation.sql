create extension if not exists pgcrypto;
create type public.organization_role as enum ('owner','coach','student');
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade,display_name text not null check(char_length(display_name) between 2 and 80),avatar_path text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.organizations(id uuid primary key default gen_random_uuid(),name text not null check(char_length(name) between 2 and 120),slug text not null unique check(slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),owner_user_id uuid not null references auth.users(id),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.organization_memberships(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,role public.organization_role not null,created_at timestamptz not null default now(),unique(organization_id,user_id));
create index organization_memberships_user_id_idx on public.organization_memberships(user_id);
alter table public.profiles enable row level security;alter table public.organizations enable row level security;alter table public.organization_memberships enable row level security;
create policy profiles_select_own on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create function public.is_organization_member(p_organization_id uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.organization_memberships where organization_id=p_organization_id and user_id=auth.uid())$$;
create policy organizations_select_member on public.organizations for select to authenticated using(public.is_organization_member(id));
create policy organizations_update_owner on public.organizations for update to authenticated using(owner_user_id=(select auth.uid())) with check(owner_user_id=(select auth.uid()));
create policy memberships_select_member on public.organization_memberships for select to authenticated using(public.is_organization_member(organization_id));
create function public.create_coach_organization(p_display_name text,p_organization_name text) returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();o uuid;s text;
begin
 if u is null then raise exception 'Authentication required';end if;
 if char_length(trim(p_display_name)) not between 2 and 80 or char_length(trim(p_organization_name)) not between 2 and 120 then raise exception 'Invalid values';end if;
 insert into public.profiles(id,display_name) values(u,trim(p_display_name)) on conflict(id) do update set display_name=excluded.display_name,updated_at=now();
 s:=trim(both '-' from regexp_replace(lower(trim(p_organization_name)),'[^a-z0-9]+','-','g'))||'-'||substr(replace(gen_random_uuid()::text,'-',''),1,8);
 insert into public.organizations(name,slug,owner_user_id) values(trim(p_organization_name),s,u) returning id into o;
 insert into public.organization_memberships(organization_id,user_id,role) values(o,u,'owner');return o;
end$$;
revoke all on function public.create_coach_organization(text,text) from public;grant execute on function public.create_coach_organization(text,text) to authenticated;
