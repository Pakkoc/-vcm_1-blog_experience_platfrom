import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  type CampaignCreateRequest,
  type CampaignUpdateRequest,
  type CampaignResponse,
  type CampaignListItem,
  CampaignResponseSchema,
  CampaignRowSchema,
  CampaignListItemSchema,
} from './schema';
import {
  campaignErrorCodes,
  type CampaignServiceError,
} from './error';

const mapCampaignRowToResponse = (row: any): CampaignResponse => {
  const parsed = CampaignRowSchema.parse(row);
  return {
    id: parsed.id,
    advertiserProfileId: parsed.advertiser_profile_id,
    title: parsed.title,
    description: parsed.description,
    location: parsed.location,
    benefits: parsed.benefits,
    mission: parsed.mission,
    recruitCount: parsed.recruit_count,
    recruitStartDate: parsed.recruit_start_date,
    recruitEndDate: parsed.recruit_end_date,
    experienceStartDate: parsed.experience_start_date,
    experienceEndDate: parsed.experience_end_date,
    status: parsed.status,
    createdAt: parsed.created_at,
    updatedAt: parsed.updated_at,
  };
};

export const createCampaign = async (
  client: SupabaseClient,
  userId: string,
  data: CampaignCreateRequest
): Promise<HandlerResult<CampaignResponse, CampaignServiceError, unknown>> => {
  try {
    const { data: profile } = await client
      .from('advertiser_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile) {
      return failure(
        404,
        campaignErrorCodes.profileNotFound,
        '광고주 프로필을 찾을 수 없습니다'
      );
    }

    const { data: campaignData, error: campaignError } = await client
      .from('campaigns')
      .insert({
        advertiser_profile_id: profile.id,
        title: data.title,
        description: data.description,
        location: data.location,
        benefits: data.benefits,
        mission: data.mission,
        recruit_count: data.recruitCount,
        recruit_start_date: data.recruitStartDate,
        recruit_end_date: data.recruitEndDate,
        experience_start_date: data.experienceStartDate,
        experience_end_date: data.experienceEndDate,
        status: 'recruiting',
      })
      .select()
      .single();

    if (campaignError || !campaignData) {
      return failure(
        500,
        campaignErrorCodes.campaignCreationFailed,
        campaignError?.message || '체험단 생성에 실패했습니다'
      );
    }

    const response = mapCampaignRowToResponse(campaignData);
    const validated = CampaignResponseSchema.safeParse(response);

    if (!validated.success) {
      return failure(
        500,
        campaignErrorCodes.validationError,
        '응답 데이터 검증에 실패했습니다',
        validated.error.format()
      );
    }

    return success(validated.data, 201);
  } catch (error) {
    return failure(
      500,
      campaignErrorCodes.campaignCreationFailed,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
};

export const getAllCampaigns = async (
  client: SupabaseClient,
  queryParams: {
    status?: string;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<HandlerResult<{
  campaigns: CampaignListItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}, CampaignServiceError, unknown>> => {
  try {
    const { status = 'all', sort = 'latest', page = 1, limit = 20 } = queryParams;

    // 카운트 쿼리
    let countQuery = client
      .from('campaigns')
      .select('*', { count: 'exact', head: true });

    if (status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      return failure(
        500,
        campaignErrorCodes.campaignFetchError,
        countError.message
      );
    }

    const total = count || 0;

    // 데이터 쿼리
    let query = client
      .from('campaigns')
      .select('id, title, location, recruit_count, recruit_end_date, status');

    // 필터링
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // 정렬
    if (sort === 'latest') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'ending_soon') {
      query = query.order('recruit_end_date', { ascending: true });
    } else if (sort === 'popular') {
      query = query.order('recruit_count', { ascending: false });
    }

    // 페이지네이션
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      return failure(
        500,
        campaignErrorCodes.campaignFetchError,
        error.message
      );
    }

    const campaigns: CampaignListItem[] = (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      location: row.location,
      recruitCount: row.recruit_count,
      recruitEndDate: row.recruit_end_date,
      status: row.status,
    }));

    const validated = z.array(CampaignListItemSchema).safeParse(campaigns);

    if (!validated.success) {
      return failure(
        500,
        campaignErrorCodes.validationError,
        '데이터 검증에 실패했습니다',
        validated.error.format()
      );
    }

    const hasMore = offset + campaigns.length < total;

    return success({
      campaigns: validated.data,
      total,
      page,
      limit,
      hasMore,
    });
  } catch (error) {
    return failure(
      500,
      campaignErrorCodes.campaignFetchError,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
};

export const getCampaignById = async (
  client: SupabaseClient,
  id: string
): Promise<HandlerResult<CampaignResponse, CampaignServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return failure(
        500,
        campaignErrorCodes.campaignFetchError,
        error.message
      );
    }

    if (!data) {
      return failure(
        404,
        campaignErrorCodes.campaignNotFound,
        '체험단을 찾을 수 없습니다'
      );
    }

    const response = mapCampaignRowToResponse(data);
    const validated = CampaignResponseSchema.safeParse(response);

    if (!validated.success) {
      return failure(
        500,
        campaignErrorCodes.validationError,
        '응답 데이터 검증에 실패했습니다',
        validated.error.format()
      );
    }

    return success(validated.data);
  } catch (error) {
    return failure(
      500,
      campaignErrorCodes.campaignFetchError,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
};

export const updateCampaign = async (
  client: SupabaseClient,
  userId: string,
  campaignId: string,
  data: CampaignUpdateRequest
): Promise<HandlerResult<CampaignResponse, CampaignServiceError, unknown>> => {
  try {
    const { data: profile } = await client
      .from('advertiser_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile) {
      return failure(
        404,
        campaignErrorCodes.profileNotFound,
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
        campaignErrorCodes.campaignNotFound,
        '체험단을 찾을 수 없습니다'
      );
    }

    if (campaign.advertiser_profile_id !== profile.id) {
      return failure(
        403,
        campaignErrorCodes.notOwner,
        '체험단을 수정할 권한이 없습니다'
      );
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.benefits !== undefined) updateData.benefits = data.benefits;
    if (data.mission !== undefined) updateData.mission = data.mission;
    if (data.recruitCount !== undefined) updateData.recruit_count = data.recruitCount;
    if (data.recruitStartDate !== undefined) updateData.recruit_start_date = data.recruitStartDate;
    if (data.recruitEndDate !== undefined) updateData.recruit_end_date = data.recruitEndDate;
    if (data.experienceStartDate !== undefined) updateData.experience_start_date = data.experienceStartDate;
    if (data.experienceEndDate !== undefined) updateData.experience_end_date = data.experienceEndDate;

    const { data: updatedData, error: updateError } = await client
      .from('campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .select()
      .single();

    if (updateError || !updatedData) {
      return failure(
        500,
        campaignErrorCodes.campaignUpdateFailed,
        updateError?.message || '체험단 수정에 실패했습니다'
      );
    }

    const response = mapCampaignRowToResponse(updatedData);
    const validated = CampaignResponseSchema.safeParse(response);

    if (!validated.success) {
      return failure(
        500,
        campaignErrorCodes.validationError,
        '응답 데이터 검증에 실패했습니다',
        validated.error.format()
      );
    }

    return success(validated.data);
  } catch (error) {
    return failure(
      500,
      campaignErrorCodes.campaignUpdateFailed,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
};

export const updateCampaignStatus = async (
  client: SupabaseClient,
  userId: string,
  campaignId: string,
  newStatus: 'recruiting' | 'recruit_ended' | 'selection_completed' | 'cancelled'
): Promise<HandlerResult<CampaignResponse, CampaignServiceError, unknown>> => {
  try {
    const { data: profile } = await client
      .from('advertiser_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile) {
      return failure(
        404,
        campaignErrorCodes.profileNotFound,
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
        campaignErrorCodes.campaignNotFound,
        '체험단을 찾을 수 없습니다'
      );
    }

    if (campaign.advertiser_profile_id !== profile.id) {
      return failure(
        403,
        campaignErrorCodes.notOwner,
        '체험단을 수정할 권한이 없습니다'
      );
    }

    const { data: updatedData, error: updateError } = await client
      .from('campaigns')
      .update({ status: newStatus })
      .eq('id', campaignId)
      .select()
      .single();

    if (updateError || !updatedData) {
      return failure(
        500,
        campaignErrorCodes.campaignUpdateFailed,
        updateError?.message || '상태 변경에 실패했습니다'
      );
    }

    const response = mapCampaignRowToResponse(updatedData);
    const validated = CampaignResponseSchema.safeParse(response);

    if (!validated.success) {
      return failure(
        500,
        campaignErrorCodes.validationError,
        '응답 데이터 검증에 실패했습니다',
        validated.error.format()
      );
    }

    return success(validated.data);
  } catch (error) {
    return failure(
      500,
      campaignErrorCodes.campaignUpdateFailed,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
};

export const getMyCampaigns = async (
  client: SupabaseClient,
  userId: string
): Promise<HandlerResult<CampaignListItem[], CampaignServiceError, unknown>> => {
  try {
    const { data: profile } = await client
      .from('advertiser_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile) {
      return failure(
        404,
        campaignErrorCodes.profileNotFound,
        '광고주 프로필을 찾을 수 없습니다'
      );
    }

    const { data, error } = await client
      .from('campaigns')
      .select('id, title, location, recruit_count, recruit_end_date, status')
      .eq('advertiser_profile_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      return failure(
        500,
        campaignErrorCodes.campaignFetchError,
        error.message
      );
    }

    const campaigns: CampaignListItem[] = (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      location: row.location,
      recruitCount: row.recruit_count,
      recruitEndDate: row.recruit_end_date,
      status: row.status,
    }));

    return success(campaigns);
  } catch (error) {
    return failure(
      500,
      campaignErrorCodes.campaignFetchError,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
};

