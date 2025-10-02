-- Migration: create triggers for automatic updated_at timestamp updates
-- Applies to all tables with updated_at column

-- ============================================================
-- FUNCTION: update_updated_at_column
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'updated_at 컬럼을 현재 시간으로 자동 업데이트하는 트리거 함수';

-- ============================================================
-- TRIGGERS: updated_at auto-update
-- ============================================================

-- users
DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- terms_agreements
DROP TRIGGER IF EXISTS trigger_terms_agreements_updated_at ON public.terms_agreements;
CREATE TRIGGER trigger_terms_agreements_updated_at
  BEFORE UPDATE ON public.terms_agreements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- influencer_profiles
DROP TRIGGER IF EXISTS trigger_influencer_profiles_updated_at ON public.influencer_profiles;
CREATE TRIGGER trigger_influencer_profiles_updated_at
  BEFORE UPDATE ON public.influencer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- influencer_channels
DROP TRIGGER IF EXISTS trigger_influencer_channels_updated_at ON public.influencer_channels;
CREATE TRIGGER trigger_influencer_channels_updated_at
  BEFORE UPDATE ON public.influencer_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- advertiser_profiles
DROP TRIGGER IF EXISTS trigger_advertiser_profiles_updated_at ON public.advertiser_profiles;
CREATE TRIGGER trigger_advertiser_profiles_updated_at
  BEFORE UPDATE ON public.advertiser_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- campaigns
DROP TRIGGER IF EXISTS trigger_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER trigger_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- applications
DROP TRIGGER IF EXISTS trigger_applications_updated_at ON public.applications;
CREATE TRIGGER trigger_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

