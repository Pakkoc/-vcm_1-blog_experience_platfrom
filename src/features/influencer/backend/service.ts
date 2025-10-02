import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  type InfluencerProfileCreateRequest,
  type InfluencerProfileResponse,
  InfluencerProfileResponseSchema,
  InfluencerProfileRowSchema,
  InfluencerChannelRowSchema,
} from './schema';
import {
  influencerErrorCodes,
  type InfluencerServiceError,
} from './error';
import { validateAge } from '@/lib/validation/age';
import { validateChannelUrl } from '@/lib/validation/channel';

export const createInfluencerProfile = async (
  client: SupabaseClient,
  userId: string,
  data: InfluencerProfileCreateRequest
): Promise<HandlerResult<InfluencerProfileResponse, InfluencerServiceError, unknown>> => {
  try {
    const { data: existingProfile } = await client
      .from('influencer_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingProfile) {
      return failure(
        409,
        influencerErrorCodes.profileAlreadyExists,
        '이미 프로필이 존재합니다'
      );
    }

    // 나이 검증
    const ageValidation = validateAge(data.birthDate);
    if (!ageValidation.valid) {
      return failure(
        400,
        influencerErrorCodes.ageBelowMinimum,
        ageValidation.message || '만 14세 이상만 가입 가능합니다'
      );
    }

    // 채널 URL 검증
    for (const channel of data.channels) {
      const urlValidation = validateChannelUrl(channel.channelType, channel.channelUrl);
      if (!urlValidation.valid) {
        return failure(
          400,
          influencerErrorCodes.invalidChannelUrl,
          urlValidation.message || '채널 URL이 올바르지 않습니다'
        );
      }
    }

    const { data: profileData, error: profileError } = await client
      .from('influencer_profiles')
      .insert({
        user_id: userId,
        birth_date: data.birthDate,
        profile_status: 'pending',
      })
      .select()
      .single();

    if (profileError || !profileData) {
      return failure(
        500,
        influencerErrorCodes.profileCreationFailed,
        profileError?.message || '프로필 생성에 실패했습니다'
      );
    }

    const profileParse = InfluencerProfileRowSchema.safeParse(profileData);
    if (!profileParse.success) {
      return failure(
        500,
        influencerErrorCodes.validationError,
        '프로필 데이터 검증에 실패했습니다',
        profileParse.error.format()
      );
    }

    const channelsToInsert = data.channels.map((channel) => ({
      influencer_profile_id: profileData.id,
      channel_type: channel.channelType,
      channel_name: channel.channelName,
      channel_url: channel.channelUrl,
      verification_status: 'pending' as const,
    }));

    const { data: channelsData, error: channelsError } = await client
      .from('influencer_channels')
      .insert(channelsToInsert)
      .select();

    if (channelsError || !channelsData) {
      await client.from('influencer_profiles').delete().eq('id', profileData.id);

      return failure(
        500,
        influencerErrorCodes.channelCreationFailed,
        channelsError?.message || '채널 생성에 실패했습니다'
      );
    }

    const channelsParsed = channelsData.map((channel) => {
      const parsed = InfluencerChannelRowSchema.safeParse(channel);
      if (!parsed.success) {
        throw new Error('Channel validation failed');
      }
      return {
        id: parsed.data.id,
        channelType: parsed.data.channel_type,
        channelName: parsed.data.channel_name,
        channelUrl: parsed.data.channel_url,
        verificationStatus: parsed.data.verification_status,
      };
    });

    const response: InfluencerProfileResponse = {
      id: profileParse.data.id,
      userId: profileParse.data.user_id,
      birthDate: profileParse.data.birth_date,
      profileStatus: profileParse.data.profile_status,
      channels: channelsParsed,
    };

    const validated = InfluencerProfileResponseSchema.safeParse(response);
    if (!validated.success) {
      return failure(
        500,
        influencerErrorCodes.validationError,
        '응답 데이터 검증에 실패했습니다',
        validated.error.format()
      );
    }

    return success(validated.data, 201);
  } catch (error) {
    return failure(
      500,
      influencerErrorCodes.profileCreationFailed,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
};

export const getInfluencerProfileByUserId = async (
  client: SupabaseClient,
  userId: string
): Promise<HandlerResult<InfluencerProfileResponse, InfluencerServiceError, unknown>> => {
  try {
    const { data: profileData, error: profileError } = await client
      .from('influencer_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      return failure(
        500,
        influencerErrorCodes.fetchError,
        profileError.message
      );
    }

    if (!profileData) {
      return failure(
        404,
        influencerErrorCodes.notFound,
        '프로필을 찾을 수 없습니다'
      );
    }

    const profileParse = InfluencerProfileRowSchema.safeParse(profileData);
    if (!profileParse.success) {
      return failure(
        500,
        influencerErrorCodes.validationError,
        '프로필 데이터 검증에 실패했습니다',
        profileParse.error.format()
      );
    }

    const { data: channelsData, error: channelsError } = await client
      .from('influencer_channels')
      .select('*')
      .eq('influencer_profile_id', profileData.id);

    if (channelsError) {
      return failure(
        500,
        influencerErrorCodes.fetchError,
        channelsError.message
      );
    }

    const channelsParsed = (channelsData || []).map((channel) => {
      const parsed = InfluencerChannelRowSchema.safeParse(channel);
      if (!parsed.success) {
        throw new Error('Channel validation failed');
      }
      return {
        id: parsed.data.id,
        channelType: parsed.data.channel_type,
        channelName: parsed.data.channel_name,
        channelUrl: parsed.data.channel_url,
        verificationStatus: parsed.data.verification_status,
      };
    });

    const response: InfluencerProfileResponse = {
      id: profileParse.data.id,
      userId: profileParse.data.user_id,
      birthDate: profileParse.data.birth_date,
      profileStatus: profileParse.data.profile_status,
      channels: channelsParsed,
    };

    const validated = InfluencerProfileResponseSchema.safeParse(response);
    if (!validated.success) {
      return failure(
        500,
        influencerErrorCodes.validationError,
        '응답 데이터 검증에 실패했습니다',
        validated.error.format()
      );
    }

    return success(validated.data);
  } catch (error) {
    return failure(
      500,
      influencerErrorCodes.fetchError,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
};

