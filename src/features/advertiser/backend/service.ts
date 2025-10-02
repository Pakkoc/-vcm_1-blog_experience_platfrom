import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  type AdvertiserProfileCreateRequest,
  type AdvertiserProfileResponse,
  AdvertiserProfileResponseSchema,
  AdvertiserProfileRowSchema,
} from './schema';
import {
  advertiserErrorCodes,
  type AdvertiserServiceError,
} from './error';
import { validateBusinessNumber } from '@/lib/validation/business';

export const createAdvertiserProfile = async (
  client: SupabaseClient,
  userId: string,
  data: AdvertiserProfileCreateRequest
): Promise<HandlerResult<AdvertiserProfileResponse, AdvertiserServiceError, unknown>> => {
  try {
    const { data: existingProfile } = await client
      .from('advertiser_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingProfile) {
      return failure(
        409,
        advertiserErrorCodes.profileAlreadyExists,
        '이미 프로필이 존재합니다'
      );
    }

    // 사업자등록번호 검증
    const businessNumberValidation = validateBusinessNumber(data.businessNumber);
    if (!businessNumberValidation.valid) {
      return failure(
        400,
        advertiserErrorCodes.invalidBusinessNumber,
        businessNumberValidation.message || '올바르지 않은 사업자등록번호입니다'
      );
    }

    const { data: profileData, error: profileError } = await client
      .from('advertiser_profiles')
      .insert({
        user_id: userId,
        company_name: data.companyName,
        location: data.location,
        category: data.category,
        business_number: data.businessNumber,
        verification_status: 'pending',
      })
      .select()
      .single();

    if (profileError) {
      if (profileError.code === '23505' && profileError.message.includes('business_number')) {
        return failure(
          409,
          advertiserErrorCodes.businessNumberExists,
          '이미 등록된 사업자등록번호입니다'
        );
      }

      return failure(
        500,
        advertiserErrorCodes.profileCreationFailed,
        profileError.message || '프로필 생성에 실패했습니다'
      );
    }

    if (!profileData) {
      return failure(
        500,
        advertiserErrorCodes.profileCreationFailed,
        '프로필 생성에 실패했습니다'
      );
    }

    const profileParse = AdvertiserProfileRowSchema.safeParse(profileData);
    if (!profileParse.success) {
      return failure(
        500,
        advertiserErrorCodes.validationError,
        '프로필 데이터 검증에 실패했습니다',
        profileParse.error.format()
      );
    }

    const response: AdvertiserProfileResponse = {
      id: profileParse.data.id,
      userId: profileParse.data.user_id,
      companyName: profileParse.data.company_name,
      location: profileParse.data.location,
      category: profileParse.data.category,
      businessNumber: profileParse.data.business_number,
      verificationStatus: profileParse.data.verification_status,
    };

    const validated = AdvertiserProfileResponseSchema.safeParse(response);
    if (!validated.success) {
      return failure(
        500,
        advertiserErrorCodes.validationError,
        '응답 데이터 검증에 실패했습니다',
        validated.error.format()
      );
    }

    return success(validated.data, 201);
  } catch (error) {
    return failure(
      500,
      advertiserErrorCodes.profileCreationFailed,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
};

export const getAdvertiserProfileByUserId = async (
  client: SupabaseClient,
  userId: string
): Promise<HandlerResult<AdvertiserProfileResponse, AdvertiserServiceError, unknown>> => {
  try {
    const { data: profileData, error: profileError } = await client
      .from('advertiser_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      return failure(
        500,
        advertiserErrorCodes.fetchError,
        profileError.message
      );
    }

    if (!profileData) {
      return failure(
        404,
        advertiserErrorCodes.notFound,
        '프로필을 찾을 수 없습니다'
      );
    }

    const profileParse = AdvertiserProfileRowSchema.safeParse(profileData);
    if (!profileParse.success) {
      return failure(
        500,
        advertiserErrorCodes.validationError,
        '프로필 데이터 검증에 실패했습니다',
        profileParse.error.format()
      );
    }

    const response: AdvertiserProfileResponse = {
      id: profileParse.data.id,
      userId: profileParse.data.user_id,
      companyName: profileParse.data.company_name,
      location: profileParse.data.location,
      category: profileParse.data.category,
      businessNumber: profileParse.data.business_number,
      verificationStatus: profileParse.data.verification_status,
    };

    const validated = AdvertiserProfileResponseSchema.safeParse(response);
    if (!validated.success) {
      return failure(
        500,
        advertiserErrorCodes.validationError,
        '응답 데이터 검증에 실패했습니다',
        validated.error.format()
      );
    }

    return success(validated.data);
  } catch (error) {
    return failure(
      500,
      advertiserErrorCodes.fetchError,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
};

