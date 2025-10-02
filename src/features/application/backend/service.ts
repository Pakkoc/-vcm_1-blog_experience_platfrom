import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  type ApplicationCreateRequest,
  type ApplicationResponse,
  type ApplicationWithCampaign,
  ApplicationResponseSchema,
  ApplicationRowSchema,
} from './schema';
import {
  applicationErrorCodes,
  type ApplicationServiceError,
} from './error';

const mapApplicationRowToResponse = (row: any): ApplicationResponse => {
  const parsed = ApplicationRowSchema.parse(row);
  return {
    id: parsed.id,
    campaignId: parsed.campaign_id,
    influencerProfileId: parsed.influencer_profile_id,
    message: parsed.message,
    visitDate: parsed.visit_date,
    status: parsed.status,
    createdAt: parsed.created_at,
    updatedAt: parsed.updated_at,
  };
};

export const createApplication = async (
  client: SupabaseClient,
  userId: string,
  data: ApplicationCreateRequest
): Promise<HandlerResult<ApplicationResponse, ApplicationServiceError, unknown>> => {
  try {
    const { data: profile } = await client
      .from('influencer_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile) {
      return failure(
        404,
        applicationErrorCodes.profileNotFound,
        '인플루언서 프로필을 찾을 수 없습니다. 먼저 프로필을 등록해주세요.'
      );
    }

    const { data: campaign } = await client
      .from('campaigns')
      .select('id, status')
      .eq('id', data.campaignId)
      .maybeSingle();

    if (!campaign) {
      return failure(
        404,
        applicationErrorCodes.campaignNotFound,
        '체험단을 찾을 수 없습니다'
      );
    }

    if (campaign.status !== 'recruiting') {
      return failure(
        400,
        applicationErrorCodes.campaignNotRecruiting,
        '현재 모집 중이 아닌 체험단입니다'
      );
    }

    const { data: existingApplication } = await client
      .from('applications')
      .select('id')
      .eq('campaign_id', data.campaignId)
      .eq('influencer_profile_id', profile.id)
      .maybeSingle();

    if (existingApplication) {
      return failure(
        409,
        applicationErrorCodes.alreadyApplied,
        '이미 지원한 체험단입니다'
      );
    }

    const { data: applicationData, error: applicationError } = await client
      .from('applications')
      .insert({
        campaign_id: data.campaignId,
        influencer_profile_id: profile.id,
        message: data.message,
        visit_date: data.visitDate,
        status: 'submitted',
      })
      .select()
      .single();

    if (applicationError || !applicationData) {
      return failure(
        500,
        applicationErrorCodes.applicationCreationFailed,
        applicationError?.message || '지원서 제출에 실패했습니다'
      );
    }

    const response = mapApplicationRowToResponse(applicationData);
    const validated = ApplicationResponseSchema.safeParse(response);

    if (!validated.success) {
      return failure(
        500,
        applicationErrorCodes.validationError,
        '응답 데이터 검증에 실패했습니다',
        validated.error.format()
      );
    }

    return success(validated.data, 201);
  } catch (error) {
    return failure(
      500,
      applicationErrorCodes.applicationCreationFailed,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
};

export const getMyApplications = async (
  client: SupabaseClient,
  userId: string
): Promise<HandlerResult<ApplicationWithCampaign[], ApplicationServiceError, unknown>> => {
  try {
    const { data: profile } = await client
      .from('influencer_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile) {
      return failure(
        404,
        applicationErrorCodes.profileNotFound,
        '인플루언서 프로필을 찾을 수 없습니다'
      );
    }

    const { data, error } = await client
      .from('applications')
      .select(`
        id,
        campaign_id,
        message,
        visit_date,
        status,
        created_at,
        campaigns (
          title
        )
      `)
      .eq('influencer_profile_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      return failure(
        500,
        applicationErrorCodes.applicationFetchError,
        error.message
      );
    }

    const applications: ApplicationWithCampaign[] = (data || []).map((row: any) => ({
      id: row.id,
      campaignId: row.campaign_id,
      campaignTitle: row.campaigns?.title || '제목 없음',
      message: row.message,
      visitDate: row.visit_date,
      status: row.status,
      createdAt: row.created_at,
    }));

    return success(applications);
  } catch (error) {
    return failure(
      500,
      applicationErrorCodes.applicationFetchError,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
};

export const getCampaignApplications = async (
  client: SupabaseClient,
  userId: string,
  campaignId: string
): Promise<HandlerResult<any[], ApplicationServiceError, unknown>> => {
  try {
    const { data: profile } = await client
      .from('advertiser_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile) {
      return failure(
        404,
        applicationErrorCodes.profileNotFound,
        '광고주 프로필을 찾을 수 없습니다'
      );
    }

    const { data: campaign } = await client
      .from('campaigns')
      .select('advertiser_profile_id')
      .eq('id', campaignId)
      .maybeSingle();

    if (!campaign) {
      return failure(
        404,
        applicationErrorCodes.campaignNotFound,
        '체험단을 찾을 수 없습니다'
      );
    }

    if (campaign.advertiser_profile_id !== profile.id) {
      return failure(
        403,
        applicationErrorCodes.notOwner,
        '해당 체험단의 지원자를 조회할 권한이 없습니다'
      );
    }

    const { data, error } = await client
      .from('applications')
      .select(`
        id,
        message,
        visit_date,
        status,
        created_at,
        influencer_profiles (
          user_id,
          users (
            name,
            email
          )
        )
      `)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) {
      return failure(
        500,
        applicationErrorCodes.applicationFetchError,
        error.message
      );
    }

    return success(data || []);
  } catch (error) {
    return failure(
      500,
      applicationErrorCodes.applicationFetchError,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
};

export const getApplicationStatusByCampaign = async (
  client: SupabaseClient,
  userId: string,
  campaignId: string
): Promise<HandlerResult<{
  applied: boolean;
  applicationId?: string;
  status?: 'submitted' | 'selected' | 'rejected';
}, ApplicationServiceError, unknown>> => {
  try {
    const { data: profile } = await client
      .from('influencer_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile) {
      return success({ applied: false });
    }

    const { data: application } = await client
      .from('applications')
      .select('id, status')
      .eq('campaign_id', campaignId)
      .eq('influencer_profile_id', profile.id)
      .maybeSingle();

    if (!application) {
      return success({ applied: false });
    }

    return success({
      applied: true,
      applicationId: application.id,
      status: application.status as 'submitted' | 'selected' | 'rejected',
    });
  } catch (error) {
    return failure(
      500,
      applicationErrorCodes.applicationFetchError,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
};

export const bulkUpdateApplicationStatus = async (
  client: SupabaseClient,
  userId: string,
  campaignId: string,
  selectedApplicationIds: string[]
): Promise<HandlerResult<{ selected: number; rejected: number }, ApplicationServiceError, unknown>> => {
  try {
    const { data: profile } = await client
      .from('advertiser_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile) {
      return failure(
        404,
        applicationErrorCodes.profileNotFound,
        '광고주 프로필을 찾을 수 없습니다'
      );
    }

    const { data: campaign } = await client
      .from('campaigns')
      .select('advertiser_profile_id, status')
      .eq('id', campaignId)
      .maybeSingle();

    if (!campaign) {
      return failure(
        404,
        applicationErrorCodes.campaignNotFound,
        '체험단을 찾을 수 없습니다'
      );
    }

    if (campaign.advertiser_profile_id !== profile.id) {
      return failure(
        403,
        applicationErrorCodes.notOwner,
        '지원자를 선정할 권한이 없습니다'
      );
    }

    if (campaign.status !== 'recruit_ended') {
      return failure(
        400,
        applicationErrorCodes.campaignNotRecruiting,
        '모집 종료 상태에서만 선정이 가능합니다'
      );
    }

    // 선정된 지원자 업데이트
    const { error: selectError } = await client
      .from('applications')
      .update({ status: 'selected' })
      .eq('campaign_id', campaignId)
      .in('id', selectedApplicationIds);

    if (selectError) {
      return failure(
        500,
        applicationErrorCodes.applicationCreationFailed,
        selectError.message
      );
    }

    // 선정되지 않은 지원자 업데이트
    const { error: rejectError } = await client
      .from('applications')
      .update({ status: 'rejected' })
      .eq('campaign_id', campaignId)
      .not('id', 'in', `(${selectedApplicationIds.join(',')})`);

    if (rejectError) {
      return failure(
        500,
        applicationErrorCodes.applicationCreationFailed,
        rejectError.message
      );
    }

    // 체험단 상태 업데이트
    const { error: campaignError } = await client
      .from('campaigns')
      .update({ status: 'selection_completed' })
      .eq('id', campaignId);

    if (campaignError) {
      return failure(
        500,
        applicationErrorCodes.applicationCreationFailed,
        campaignError.message
      );
    }

    return success({
      selected: selectedApplicationIds.length,
      rejected: 0,
    });
  } catch (error) {
    return failure(
      500,
      applicationErrorCodes.applicationCreationFailed,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
};

export const updateApplicationStatus = async (
  client: SupabaseClient,
  userId: string,
  applicationId: string,
  newStatus: 'selected' | 'rejected'
): Promise<HandlerResult<ApplicationResponse, ApplicationServiceError, unknown>> => {
  try {
    const { data: profile } = await client
      .from('advertiser_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile) {
      return failure(
        404,
        applicationErrorCodes.profileNotFound,
        '광고주 프로필을 찾을 수 없습니다'
      );
    }

    const { data: application } = await client
      .from('applications')
      .select(`
        campaign_id,
        campaigns (
          advertiser_profile_id
        )
      `)
      .eq('id', applicationId)
      .maybeSingle();

    if (!application) {
      return failure(
        404,
        applicationErrorCodes.applicationNotFound,
        '지원서를 찾을 수 없습니다'
      );
    }

    if ((application as any).campaigns.advertiser_profile_id !== profile.id) {
      return failure(
        403,
        applicationErrorCodes.notOwner,
        '지원서 상태를 변경할 권한이 없습니다'
      );
    }

    const { data: updatedData, error: updateError } = await client
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError || !updatedData) {
      return failure(
        500,
        applicationErrorCodes.applicationCreationFailed,
        updateError?.message || '상태 변경에 실패했습니다'
      );
    }

    const response = mapApplicationRowToResponse(updatedData);
    const validated = ApplicationResponseSchema.safeParse(response);

    if (!validated.success) {
      return failure(
        500,
        applicationErrorCodes.validationError,
        '응답 데이터 검증에 실패했습니다',
        validated.error.format()
      );
    }

    return success(validated.data);
  } catch (error) {
    return failure(
      500,
      applicationErrorCodes.applicationCreationFailed,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
};

