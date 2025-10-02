-- Migration: create core tables for blog experience platform
-- Creates users, profiles, campaigns, applications tables

-- Ensure pgcrypto is available for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('influencer', 'advertiser');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE profile_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE channel_type AS ENUM ('instagram', 'youtube', 'blog', 'tiktok');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE campaign_status AS ENUM ('recruiting', 'recruit_ended', 'selection_completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('submitted', 'selected', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- TABLE: users
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  phone varchar(20) NOT NULL,
  email varchar(255) NOT NULL UNIQUE,
  role user_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS '사용자 기본 정보 및 역할 관리';
COMMENT ON COLUMN public.users.role IS '사용자 역할: influencer(인플루언서) 또는 advertiser(광고주)';

ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: terms_agreements
-- ============================================================

CREATE TABLE IF NOT EXISTS public.terms_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  terms_version varchar(50) NOT NULL,
  agreed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.terms_agreements IS '약관 동의 이력';
COMMENT ON COLUMN public.terms_agreements.terms_version IS '약관 버전 (예: v1.0.0)';

ALTER TABLE IF EXISTS public.terms_agreements DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: influencer_profiles
-- ============================================================

CREATE TABLE IF NOT EXISTS public.influencer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  birth_date date NOT NULL,
  profile_status profile_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.influencer_profiles IS '인플루언서 프로필 상세 정보';
COMMENT ON COLUMN public.influencer_profiles.profile_status IS '프로필 상태: draft(임시저장), pending(검증대기), approved(승인), rejected(거부)';

ALTER TABLE IF EXISTS public.influencer_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: influencer_channels
-- ============================================================

CREATE TABLE IF NOT EXISTS public.influencer_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_profile_id uuid NOT NULL REFERENCES public.influencer_profiles(id) ON DELETE CASCADE,
  channel_type channel_type NOT NULL,
  channel_name varchar(200) NOT NULL,
  channel_url varchar(500) NOT NULL,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.influencer_channels IS '인플루언서 SNS 채널 정보';
COMMENT ON COLUMN public.influencer_channels.channel_type IS '채널 유형: instagram, youtube, blog, tiktok';
COMMENT ON COLUMN public.influencer_channels.verification_status IS '검증 상태: pending(대기), verified(검증완료), failed(검증실패)';

ALTER TABLE IF EXISTS public.influencer_channels DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: advertiser_profiles
-- ============================================================

CREATE TABLE IF NOT EXISTS public.advertiser_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  company_name varchar(200) NOT NULL,
  location varchar(500) NOT NULL,
  category varchar(100) NOT NULL,
  business_number varchar(50) NOT NULL UNIQUE,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.advertiser_profiles IS '광고주 프로필 상세 정보';
COMMENT ON COLUMN public.advertiser_profiles.business_number IS '사업자등록번호 (고유값)';
COMMENT ON COLUMN public.advertiser_profiles.verification_status IS '검증 상태: pending(대기), verified(검증완료), failed(검증실패)';

ALTER TABLE IF EXISTS public.advertiser_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: campaigns
-- ============================================================

CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_profile_id uuid NOT NULL REFERENCES public.advertiser_profiles(id) ON DELETE CASCADE,
  title varchar(200) NOT NULL,
  description text NOT NULL,
  location varchar(500) NOT NULL,
  benefits text NOT NULL,
  mission text NOT NULL,
  recruit_count integer NOT NULL CHECK (recruit_count > 0),
  recruit_start_date timestamptz NOT NULL,
  recruit_end_date timestamptz NOT NULL,
  experience_start_date date NOT NULL,
  experience_end_date date NOT NULL,
  status campaign_status NOT NULL DEFAULT 'recruiting',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_recruit_dates CHECK (recruit_end_date >= recruit_start_date),
  CONSTRAINT valid_experience_dates CHECK (experience_end_date >= experience_start_date)
);

COMMENT ON TABLE public.campaigns IS '체험단 모집 정보';
COMMENT ON COLUMN public.campaigns.recruit_count IS '모집 인원 (1 이상)';
COMMENT ON COLUMN public.campaigns.status IS '상태: recruiting(모집중), recruit_ended(모집종료), selection_completed(선정완료), cancelled(취소)';

ALTER TABLE IF EXISTS public.campaigns DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: applications
-- ============================================================

CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  influencer_profile_id uuid NOT NULL REFERENCES public.influencer_profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  visit_date date NOT NULL,
  status application_status NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_application_per_campaign UNIQUE (campaign_id, influencer_profile_id)
);

COMMENT ON TABLE public.applications IS '체험단 지원 정보';
COMMENT ON COLUMN public.applications.message IS '각오 한마디';
COMMENT ON COLUMN public.applications.visit_date IS '방문 예정일자';
COMMENT ON COLUMN public.applications.status IS '지원 상태: submitted(신청완료), selected(선정), rejected(반려)';

ALTER TABLE IF EXISTS public.applications DISABLE ROW LEVEL SECURITY;

