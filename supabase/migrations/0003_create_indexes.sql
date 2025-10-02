-- Migration: create indexes for performance optimization
-- Indexes on frequently queried columns and foreign keys

-- ============================================================
-- INDEXES: users
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_email 
  ON public.users(email);

CREATE INDEX IF NOT EXISTS idx_users_role 
  ON public.users(role);

-- ============================================================
-- INDEXES: terms_agreements
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_terms_agreements_user_id 
  ON public.terms_agreements(user_id);

-- ============================================================
-- INDEXES: influencer_profiles
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_influencer_profiles_user_id 
  ON public.influencer_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_influencer_profiles_status 
  ON public.influencer_profiles(profile_status);

-- ============================================================
-- INDEXES: influencer_channels
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_influencer_channels_profile_id 
  ON public.influencer_channels(influencer_profile_id);

CREATE INDEX IF NOT EXISTS idx_influencer_channels_verification 
  ON public.influencer_channels(verification_status);

-- ============================================================
-- INDEXES: advertiser_profiles
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_advertiser_profiles_user_id 
  ON public.advertiser_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_advertiser_profiles_business_number 
  ON public.advertiser_profiles(business_number);

CREATE INDEX IF NOT EXISTS idx_advertiser_profiles_verification 
  ON public.advertiser_profiles(verification_status);

-- ============================================================
-- INDEXES: campaigns
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser_id 
  ON public.campaigns(advertiser_profile_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_status 
  ON public.campaigns(status);

CREATE INDEX IF NOT EXISTS idx_campaigns_recruit_dates 
  ON public.campaigns(recruit_start_date, recruit_end_date);

CREATE INDEX IF NOT EXISTS idx_campaigns_created_at 
  ON public.campaigns(created_at DESC);

-- ============================================================
-- INDEXES: applications
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_applications_campaign_id 
  ON public.applications(campaign_id);

CREATE INDEX IF NOT EXISTS idx_applications_influencer_id 
  ON public.applications(influencer_profile_id);

CREATE INDEX IF NOT EXISTS idx_applications_status 
  ON public.applications(status);

CREATE INDEX IF NOT EXISTS idx_applications_created_at 
  ON public.applications(created_at DESC);

