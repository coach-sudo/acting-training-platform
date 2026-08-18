alter table public.students add constraint students_id_org_unique unique(id,organization_id);
alter table public.cohorts add constraint cohorts_id_org_unique unique(id,organization_id);
alter table public.focus_areas add constraint focus_areas_id_org_unique unique(id,organization_id);
alter table public.sessions add constraint sessions_id_org_unique unique(id,organization_id);

alter table public.cohort_members add column organization_id uuid;
update public.cohort_members cm set organization_id=c.organization_id from public.cohorts c where c.id=cm.cohort_id;
alter table public.cohort_members alter column organization_id set not null;
alter table public.cohort_members add constraint cohort_members_org_fk foreign key(organization_id) references public.organizations(id) on delete cascade;
alter table public.cohort_members add constraint cohort_members_cohort_org_fk foreign key(cohort_id,organization_id) references public.cohorts(id,organization_id) on delete cascade;
alter table public.cohort_members add constraint cohort_members_student_org_fk foreign key(student_id,organization_id) references public.students(id,organization_id) on delete cascade;

alter table public.student_goals add constraint goals_student_org_fk foreign key(student_id,organization_id) references public.students(id,organization_id) on delete cascade;
alter table public.student_goals add constraint goals_focus_org_fk foreign key(focus_area_id,organization_id) references public.focus_areas(id,organization_id);
alter table public.sessions add constraint sessions_student_org_fk foreign key(student_id,organization_id) references public.students(id,organization_id) on delete cascade;
alter table public.sessions add constraint sessions_cohort_org_fk foreign key(cohort_id,organization_id) references public.cohorts(id,organization_id) on delete cascade;

alter table public.session_focus_areas add column organization_id uuid;
update public.session_focus_areas sf set organization_id=s.organization_id from public.sessions s where s.id=sf.session_id;
alter table public.session_focus_areas alter column organization_id set not null;
alter table public.session_focus_areas add constraint session_focus_session_org_fk foreign key(session_id,organization_id) references public.sessions(id,organization_id) on delete cascade;
alter table public.session_focus_areas add constraint session_focus_area_org_fk foreign key(focus_area_id,organization_id) references public.focus_areas(id,organization_id) on delete cascade;
alter table public.session_private_notes add constraint private_notes_session_org_fk foreign key(session_id,organization_id) references public.sessions(id,organization_id) on delete cascade;
alter table public.session_recaps add constraint recaps_session_org_fk foreign key(session_id,organization_id) references public.sessions(id,organization_id) on delete cascade;
alter table public.session_recaps add constraint recaps_student_org_fk foreign key(student_id,organization_id) references public.students(id,organization_id) on delete cascade;

create function public.is_user_organization_coach(org uuid,target_user uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.organization_memberships where organization_id=org and user_id=target_user and role in('owner','coach'))$$;
drop policy memberships_select_member on public.organization_memberships;
create policy memberships_read_authorized on public.organization_memberships for select to authenticated using(user_id=auth.uid() or public.is_organization_coach(organization_id));
drop policy sessions_write on public.sessions;
create policy sessions_write on public.sessions for all to authenticated using(public.is_organization_coach(organization_id)) with check(public.is_organization_coach(organization_id) and public.is_user_organization_coach(organization_id,coach_user_id));
drop policy cohort_members_read on public.cohort_members;drop policy cohort_members_write on public.cohort_members;
create policy cohort_members_read on public.cohort_members for select to authenticated using(public.is_organization_coach(organization_id) or public.is_own_student(student_id));
create policy cohort_members_write on public.cohort_members for all to authenticated using(public.is_organization_coach(organization_id)) with check(public.is_organization_coach(organization_id));
drop policy session_focus_write on public.session_focus_areas;
create policy session_focus_write on public.session_focus_areas for all to authenticated using(public.is_organization_coach(organization_id)) with check(public.is_organization_coach(organization_id));

create function public.enforce_recap_target() returns trigger language plpgsql set search_path='' as $$declare expected uuid;begin select student_id into expected from public.sessions where id=new.session_id and organization_id=new.organization_id;if expected is distinct from new.student_id then raise exception 'Recap target must match session target';end if;return new;end$$;
create trigger recap_target_check before insert or update on public.session_recaps for each row execute function public.enforce_recap_target();
