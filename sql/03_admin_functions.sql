-- =========================================================
-- 03_admin_functions.sql
-- 관리자 판별 / 생일 초기화 / 학생 관리 목록 RPC
-- =========================================================

-- 중요: 아래 이메일을 실제 관리자 이메일로 교체하세요.
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select auth.jwt() ->> 'email' = '관리자이메일@example.com';
$$;

-- 학생 생일 4자리 초기화
create or replace function public.reset_student_verify_code(
  input_student_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'ONLY_ADMIN_CAN_RESET_VERIFY_CODE';
  end if;

  update public.students
  set verify_code = null
  where student_id = input_student_id;

  if not found then
    raise exception 'STUDENT_NOT_FOUND';
  end if;
end;
$$;

grant execute on function public.reset_student_verify_code(text)
to authenticated;

-- 학생 관리 탭 목록 조회
-- 선택 월 기준 사용량만 반환. 생일 원본값은 반환하지 않고 등록 여부만 반환.
create or replace function public.get_student_manage_list(
  input_year_month text default null
)
returns table (
  student_id text,
  name text,
  verify_code_set boolean,
  monthly_pages integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_month date;
begin
  if not public.is_admin() then
    raise exception 'ONLY_ADMIN_CAN_VIEW_STUDENT_STATUS';
  end if;

  if input_year_month is null or trim(input_year_month) = '' then
    target_month := date_trunc('month', now())::date;
  else
    if input_year_month !~ '^[0-9]{4}-[0-9]{2}$' then
      raise exception 'INVALID_YEAR_MONTH';
    end if;

    target_month := to_date(input_year_month || '-01', 'YYYY-MM-DD');
  end if;

  return query
  select
    s.student_id,
    s.name,
    s.verify_code is not null as verify_code_set,
    coalesce(sum(p.pages), 0)::integer as monthly_pages
  from public.students s
  left join public.print_logs p
    on p.student_id = s.student_id
    and p.created_at >= target_month
    and p.created_at < target_month + interval '1 month'
  group by
    s.student_id,
    s.name,
    s.verify_code
  order by
    s.student_id;
end;
$$;

grant execute on function public.get_student_manage_list(text)
to authenticated;
