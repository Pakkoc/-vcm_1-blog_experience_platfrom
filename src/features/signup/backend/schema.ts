import { z } from 'zod';
import { USER_ROLE } from '@/constants/roles';

export const SignupRequestSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(100, '이름은 100자 이하여야 합니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, '올바른 휴대폰 번호 형식이 아닙니다 (010-0000-0000)'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .max(100, '비밀번호는 100자 이하여야 합니다')
    .regex(/[a-zA-Z]/, '영문을 포함해야 합니다')
    .regex(/[0-9]/, '숫자를 포함해야 합니다'),
  role: z.enum([USER_ROLE.INFLUENCER, USER_ROLE.ADVERTISER], {
    errorMap: () => ({ message: '역할을 선택해주세요' }),
  }),
  terms: z.object({
    required: z.literal(true, {
      errorMap: () => ({ message: '필수 약관에 동의해주세요' }),
    }),
    marketing: z.boolean(),
  }),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const SignupResponseSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum([USER_ROLE.INFLUENCER, USER_ROLE.ADVERTISER]),
  emailVerificationSent: z.boolean(),
});

export type SignupResponse = z.infer<typeof SignupResponseSchema>;

export const UserTableRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phone: z.string(),
  email: z.string().email(),
  role: z.enum([USER_ROLE.INFLUENCER, USER_ROLE.ADVERTISER]),
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserRow = z.infer<typeof UserTableRowSchema>;

export const TermsAgreementRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  terms_version: z.string(),
  agreed_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type TermsAgreementRow = z.infer<typeof TermsAgreementRowSchema>;
