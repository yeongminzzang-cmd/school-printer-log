-- =========================================================
-- 99_check_queries.sql
-- 상태 확인용 쿼리
-- =========================================================

-- 월 제한 설정 확인
select *
from public.app_settings
where setting_key = 'monthly_limit';

-- 학생 수 / 생일 등록 여부 확인
select
  count(*) as total_students,
  count(*) filter (where verify_code is not null) as verify_code_set_students,
  count(*) filter (where verify_code is null) as verify_code_not_set_students
from public.students;

-- 반별 학생 수 확인
select
  substring(student_id from 2 for 1) as class_no,
  count(*) as student_count
from public.students
group by substring(student_id from 2 for 1)
order by class_no;

-- print_logs purpose 값 확인
select
  purpose,
  count(*) as count
from public.print_logs
group by purpose
order by purpose;

-- 현재 달 학생별 사용량 확인
select
  s.student_id,
  s.name,
  coalesce(sum(p.pages), 0)::integer as monthly_pages
from public.students s
left join public.print_logs p
  on p.student_id = s.student_id
  and p.created_at >= date_trunc('month', now())
  and p.created_at < date_trunc('month', now()) + interval '1 month'
group by s.student_id, s.name
order by s.student_id;

-- 특정 학생 생일 등록 여부 확인 예시
-- select student_id, name, verify_code is not null as verify_code_set
-- from public.students
-- where student_id = '3111';
