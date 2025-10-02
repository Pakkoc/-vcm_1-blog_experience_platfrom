import { z } from 'zod';

export const CampaignCreateSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200),
  description: z.string().min(1, '설명을 입력해주세요'),
  location: z.string().min(1, '위치를 입력해주세요').max(500),
  benefits: z.string().min(1, '제공 내역을 입력해주세요'),
  mission: z.string().min(1, '미션을 입력해주세요'),
  recruitCount: z.number().int().positive('모집 인원은 1명 이상이어야 합니다'),
  recruitStartDate: z.string().refine((val) => !isNaN(Date.parse(val)), '올바른 날짜 형식이 아닙니다'),
  recruitEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), '올바른 날짜 형식이 아닙니다'),
  experienceStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)'),
  experienceEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)'),
}).refine((data) => new Date(data.recruitEndDate) >= new Date(data.recruitStartDate), {
  message: '모집 종료일은 모집 시작일 이후여야 합니다',
  path: ['recruitEndDate'],
}).refine((data) => data.experienceEndDate >= data.experienceStartDate, {
  message: '체험 종료일은 체험 시작일 이후여야 합니다',
  path: ['experienceEndDate'],
});

export type CampaignCreateRequest = z.infer<typeof CampaignCreateSchema>;

export const CampaignUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  location: z.string().min(1).max(500).optional(),
  benefits: z.string().min(1).optional(),
  mission: z.string().min(1).optional(),
  recruitCount: z.number().int().positive().optional(),
  recruitStartDate: z.string().datetime().optional(),
  recruitEndDate: z.string().datetime().optional(),
  experienceStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  experienceEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type CampaignUpdateRequest = z.infer<typeof CampaignUpdateSchema>;

export const CampaignResponseSchema = z.object({
  id: z.string().uuid(),
  advertiserProfileId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  benefits: z.string(),
  mission: z.string(),
  recruitCount: z.number(),
  recruitStartDate: z.string(),
  recruitEndDate: z.string(),
  experienceStartDate: z.string(),
  experienceEndDate: z.string(),
  status: z.enum(['recruiting', 'recruit_ended', 'selection_completed', 'cancelled']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CampaignResponse = z.infer<typeof CampaignResponseSchema>;

export const CampaignRowSchema = z.object({
  id: z.string().uuid(),
  advertiser_profile_id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  benefits: z.string(),
  mission: z.string(),
  recruit_count: z.number(),
  recruit_start_date: z.string(),
  recruit_end_date: z.string(),
  experience_start_date: z.string(),
  experience_end_date: z.string(),
  status: z.enum(['recruiting', 'recruit_ended', 'selection_completed', 'cancelled']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CampaignRow = z.infer<typeof CampaignRowSchema>;

export const CampaignQuerySchema = z.object({
  status: z.enum(['all', 'recruiting', 'recruit_ended', 'selection_completed', 'cancelled']).optional().default('all'),
  sort: z.enum(['latest', 'ending_soon', 'popular']).optional().default('latest'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type CampaignQuery = z.infer<typeof CampaignQuerySchema>;

export const CampaignListItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  location: z.string(),
  recruitCount: z.number(),
  recruitEndDate: z.string(),
  status: z.enum(['recruiting', 'recruit_ended', 'selection_completed', 'cancelled']),
});

export type CampaignListItem = z.infer<typeof CampaignListItemSchema>;

export const CampaignListResponseSchema = z.object({
  campaigns: z.array(CampaignListItemSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  hasMore: z.boolean(),
});

export type CampaignListResponse = z.infer<typeof CampaignListResponseSchema>;

