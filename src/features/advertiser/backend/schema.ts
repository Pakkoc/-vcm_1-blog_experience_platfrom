import { z } from 'zod';

export const AdvertiserProfileCreateSchema = z.object({
  companyName: z.string().min(1, '업체명을 입력해주세요').max(200),
  location: z.string().min(1, '위치를 입력해주세요').max(500),
  category: z.string().min(1, '카테고리를 입력해주세요').max(100),
  businessNumber: z
    .string()
    .regex(/^\d{3}-\d{2}-\d{5}$/, '올바른 사업자등록번호 형식이 아닙니다 (000-00-00000)'),
});

export type AdvertiserProfileCreateRequest = z.infer<typeof AdvertiserProfileCreateSchema>;

export const AdvertiserProfileResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  companyName: z.string(),
  location: z.string(),
  category: z.string(),
  businessNumber: z.string(),
  verificationStatus: z.enum(['pending', 'verified', 'failed']),
});

export type AdvertiserProfileResponse = z.infer<typeof AdvertiserProfileResponseSchema>;

export const AdvertiserProfileRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  company_name: z.string(),
  location: z.string(),
  category: z.string(),
  business_number: z.string(),
  verification_status: z.enum(['pending', 'verified', 'failed']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AdvertiserProfileRow = z.infer<typeof AdvertiserProfileRowSchema>;

