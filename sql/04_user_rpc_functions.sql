-- =========================================================
-- 04_user_rpc_functions.sql
-- 사용자 등록 RPC / 월 누적 조회 RPC
-- 현재 최종 버전
-- =========================================================

-- 사용자 프린터 사용 기록 등록
-- 기능:
-- 1) 학생 명단 확인
-- 2) 생일 4자리 최초 등록
-- 3) 이후 등록 시 생일 4자리 검증
-- 4) 월 제한 초과 시 등록 차단
-- 5) purpose는 짧은 값/긴 값 모두 받고, DB에는 긴 값으로 저장
create or replace function public.create_print_log_verified(
  input_student_id text,
  input_verify_code text,
  input_pages integer,
  input_purpose text,
  input_custom_purpose text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_verify_code text;
  monthly_limit_value integer;
  current_month_total integer;
  remaining_pages integer;
  storage_purpose text;
begin
  if input_student_id !~ '^3[1-3](0[1-9]|1[0-9]|20)$' then
    raise exception 'INVALID_STUDENT_ID';
  end if;

  if input_verify_code !~ '^[0-9]{4}$' then
    raise exception 'INVALID_VERIFY_CODE';
  end if;

  if input_pages is null or input_pages < 1 or input_pages > 100 then
    raise exception 'INVALID_PAGES';
  end if;

  -- 프론트에서 짧은 값/긴 값이 와도 DB에는 긴 값으로 저장
  -- print_logs_purpose_check 제약조건과 맞추기 위함
  storage_purpose :=
    case input_purpose
      when '수행' then '수행평가'
      when '수행평가' then '수행평가'
      when '수업' then '수업자료'
      when '수업자료' then '수업자료'
      when '개인' then '개인학습'
      when '개인학습' then '개인학습'
      when '동아리' then '동아리'
      when '기타' then '기타'
      else null
    end;

  if storage_purpose is null then
    raise exception 'INVALID_PURPOSE';
  end if;

  if storage_purpose = '기타'
    and (input_custom_purpose is null or trim(input_custom_purpose) = '') then
    raise exception 'CUSTOM_PURPOSE_REQUIRED';
  end if;

  select verify_code
  into saved_verify_code
  from public.students
  where student_id = input_student_id;

  if not found then
    raise exception 'STUDENT_NOT_FOUND';
  end if;

  -- 핵심: 생일 미등록 학생은 최초 입력값으로 자동 등록
  if saved_verify_code is null then
    update public.students
    set verify_code = input_verify_code
    where student_id = input_student_id;
  elsif saved_verify_code <> input_verify_code then
    raise exception 'VERIFY_CODE_NOT_MATCHED';
  end if;

  -- 월 제한 확인
  select coalesce(max(setting_value::integer), 0)
  into monthly_limit_value
  from public.app_settings
  where setting_key = 'monthly_limit';

  if monthly_limit_value > 0 then
    select coalesce(sum(pages), 0)::integer
    into current_month_total
    from public.print_logs
    where student_id = input_student_id
      and created_at >= date_trunc('month', now())
      and created_at < date_trunc('month', now()) + interval '1 month';

    remaining_pages := monthly_limit_value - current_month_total;

    if current_month_total + input_pages > monthly_limit_value then
      raise exception 'MONTHLY_LIMIT_EXCEEDED|%|%|%|%',
        monthly_limit_value,
        current_month_total,
        input_pages,
        greatest(remaining_pages, 0);
    end if;
  end if;

  insert into public.print_logs (
    student_id,
    pages,
    purpose,
    custom_purpose
  )
  values (
    input_student_id,
    input_pages,
    storage_purpose,
    case
      when storage_purpose = '기타' then nullif(trim(input_custom_purpose), '')
      else null
    end
  );
end;
$$;

grant execute on function public.create_print_log_verified(
  text,
  text,
  integer,
  text,
  text
) to anon, authenticated;

-- 생일 4자리 검증 후 이번 달 누적 사용량 조회
create or replace function public.get_monthly_total_verified(
  input_student_id text,
  input_verify_code text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_verify_code text;
  total_pages integer;
begin
  if input_student_id !~ '^3[1-3](0[1-9]|1[0-9]|20)$' then
    raise exception 'INVALID_STUDENT_ID';
  end if;

  if input_verify_code !~ '^[0-9]{4}$' then
    raise exception 'INVALID_VERIFY_CODE';
  end if;

  select verify_code
  into saved_verify_code
  from public.students
  where student_id = input_student_id;

  if not found then
    raise exception 'STUDENT_NOT_FOUND';
  end if;

  if saved_verify_code is null then
    raise exception 'VERIFY_CODE_NOT_SET';
  end if;

  if saved_verify_code <> input_verify_code then
    raise exception 'VERIFY_CODE_NOT_MATCHED';
  end if;

  select coalesce(sum(pages), 0)::integer
  into total_pages
  from public.print_logs
  where student_id = input_student_id
    and created_at >= date_trunc('month', now())
    and created_at < date_trunc('month', now()) + interval '1 month';

  return total_pages;
end;
$$;

grant execute on function public.get_monthly_total_verified(text, text)
to anon, authenticated;
