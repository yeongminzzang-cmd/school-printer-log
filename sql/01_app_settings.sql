-- =========================================================
-- 01_app_settings.sql
-- 월 제한 설정값 관리
-- =========================================================

create table if not exists public.app_settings (
  setting_key text primary key,
  setting_value text not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (setting_key, setting_value)
values ('monthly_limit', '50')
on conflict (setting_key)
do nothing;
