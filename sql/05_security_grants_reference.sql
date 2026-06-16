-- =========================================================
-- 05_security_grants_reference.sql
-- 보안/권한 관련 참고 SQL
-- 이미 적용된 내용 정리용. 현재 DB 상태에 맞게 확인 후 실행하세요.
-- =========================================================

-- 예전 함수가 남아 있다면 anon/authenticated 실행 권한 차단
-- 함수 시그니처가 다르면 에러가 날 수 있음.
revoke execute on function public.get_monthly_total(text)
from anon, authenticated;

-- 현재 사용하는 RPC 실행 권한

grant execute on function public.create_print_log_verified(
  text,
  text,
  integer,
  text,
  text
) to anon, authenticated;

grant execute on function public.get_monthly_total_verified(text, text)
to anon, authenticated;

grant execute on function public.reset_student_verify_code(text)
to authenticated;

grant execute on function public.get_student_manage_list(text)
to authenticated;

-- RLS 정책은 프로젝트별 현재 정책명을 확인한 뒤 수정해야 하므로
-- 이 파일에는 drop/create policy를 일부러 넣지 않았습니다.
-- Supabase Dashboard > Authentication/Policies 또는 Table Editor > RLS에서 현재 정책명을 확인하세요.
