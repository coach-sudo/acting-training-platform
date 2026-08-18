begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values
('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','coach@test.local','',now(),'{}','{}',now(),now()),
('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','student@test.local','',now(),'{}','{}',now(),now());
insert into public.profiles(id,display_name) values('10000000-0000-0000-0000-000000000001','Coach'),('10000000-0000-0000-0000-000000000002','Student');
insert into public.organizations(id,name,slug,owner_user_id) values('20000000-0000-0000-0000-000000000001','Test Studio','test-studio','10000000-0000-0000-0000-000000000001');
insert into public.organization_memberships(organization_id,user_id,role) values('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','owner'),('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','student');
insert into public.students(id,organization_id,linked_user_id,first_name,last_name) values('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Target','Student'),('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001',null,'Other','Student');
insert into public.sessions(id,organization_id,coach_user_id,student_id,title,session_date) values('40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Test',current_date);
insert into public.session_private_notes(session_id,organization_id,author_user_id,content) values('40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','private');
insert into public.session_recaps(id,session_id,organization_id,student_id,created_by,content) values('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','draft');

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000002',true);
select results_eq('select count(*)::bigint from public.students','values (1::bigint)','student sees only own record');
select results_eq('select count(*)::bigint from public.session_private_notes','values (0::bigint)','student never sees private notes');
select results_eq('select count(*)::bigint from public.session_recaps','values (0::bigint)','student does not see draft recap');
reset role;
update public.session_recaps set published_at=now() where id='50000000-0000-0000-0000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000002',true);
select results_eq('select count(*)::bigint from public.session_recaps','values (1::bigint)','student sees own published recap');
select results_eq('select count(*)::bigint from public.sessions','values (1::bigint)','student sees own session');
select * from finish();
rollback;
