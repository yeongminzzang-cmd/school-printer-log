# 프린터 사용일지 SQL 백업 정리

이 폴더는 프린터 사용일지 앱에서 사용한 Supabase SQL을 기능별로 정리한 백업입니다.

## 파일 순서

1. `01_app_settings.sql`  
   월 제한 설정값 테이블 및 기본값

2. `02_students_roster_upsert.sql`  
   고3 학생 명단 upsert

3. `03_admin_functions.sql`  
   관리자 판별, 생일 초기화, 학생 관리 목록 RPC

4. `04_user_rpc_functions.sql`  
   사용자 등록 RPC, 월 누적 조회 RPC

5. `05_security_grants_reference.sql`  
   실행 권한, 오래된 함수 차단 관련 참고 SQL

6. `99_check_queries.sql`  
   DB 상태 확인용 쿼리

## 중요

- `03_admin_functions.sql` 안의 `관리자이메일@example.com`은 실제 관리자 이메일로 바꿔야 합니다.
- `create or replace function`은 기존 함수를 덮어씁니다.
- `drop` 문은 일부러 넣지 않았습니다.
- 기존 테이블 구조 전체 생성 SQL은 현재 DB 구조를 Supabase에서 별도로 Export하는 것이 가장 정확합니다.
