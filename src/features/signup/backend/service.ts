import type { SupabaseClient } from '@supabase/supabase-js';
import { USER_ROLE } from '@/constants/roles';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  type SignupRequest,
  type SignupResponse,
  SignupResponseSchema,
} from '@/features/signup/backend/schema';
import {
  signupErrorCodes,
  type SignupServiceError,
} from '@/features/signup/backend/error';
import { TERMS_VERSION } from '@/features/signup/constants/terms';
import { normalizePhoneNumber } from '@/lib/validation/phone';

type SignupOptions = {
  origin?: string;
};

export const signupUser = async (
  client: SupabaseClient,
  data: SignupRequest,
  options: SignupOptions = {}
): Promise<HandlerResult<SignupResponse, SignupServiceError, unknown>> => {
  try {
    const normalizedPhone = normalizePhoneNumber(data.phone);

    const emailRedirectTo = (() => {
      if (!options.origin) {
        return undefined;
      }

      const targetPath = data.role === USER_ROLE.INFLUENCER
        ? '/onboarding/influencer'
        : data.role === USER_ROLE.ADVERTISER
          ? '/onboarding/advertiser'
          : '/';

      return new URL(targetPath, options.origin).toString();
    })();

    const { data: authData, error: authError } = await client.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: data.role,
        },
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return failure(
          409,
          signupErrorCodes.emailAlreadyExists,
          '이미 사용 중인 이메일입니다'
        );
      }

      return failure(
        500,
        signupErrorCodes.authCreationFailed,
        authError.message || '계정 생성에 실패했습니다'
      );
    }

    if (!authData.user) {
      return failure(
        500,
        signupErrorCodes.authCreationFailed,
        '사용자 정보를 가져올 수 없습니다'
      );
    }

    const { error: userError } = await client.from('users').insert({
      id: authData.user.id,
      name: data.name,
      phone: normalizedPhone,
      email: data.email,
      role: data.role,
    });

    if (userError) {
      if (userError.code === '23505') {
        if (userError.message.includes('email')) {
          return failure(
            409,
            signupErrorCodes.emailAlreadyExists,
            '이미 사용 중인 이메일입니다'
          );
        }
        return failure(
          409,
          signupErrorCodes.phoneAlreadyExists,
          '이미 사용 중인 휴대폰 번호입니다'
        );
      }

      await client.auth.admin.deleteUser(authData.user.id);

      return failure(
        500,
        signupErrorCodes.profileCreationFailed,
        '프로필 생성에 실패했습니다'
      );
    }

    const { error: termsError } = await client.from('terms_agreements').insert({
      user_id: authData.user.id,
      terms_version: TERMS_VERSION,
      agreed_at: new Date().toISOString(),
    });

    if (termsError) {
      await client.from('users').delete().eq('id', authData.user.id);
      await client.auth.admin.deleteUser(authData.user.id);

      return failure(
        500,
        signupErrorCodes.termsAgreementFailed,
        '약관 동의 저장에 실패했습니다'
      );
    }

    const response: SignupResponse = {
      userId: authData.user.id,
      email: data.email,
      role: data.role,
      emailVerificationSent: authData.user.confirmation_sent_at !== null,
    };

    const parsed = SignupResponseSchema.safeParse(response);

    if (!parsed.success) {
      return failure(
        500,
        signupErrorCodes.validationError,
        '응답 데이터 검증에 실패했습니다',
        parsed.error.format()
      );
    }

    return success(parsed.data, 201);
  } catch (error) {
    return failure(
      500,
      signupErrorCodes.authCreationFailed,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
};
