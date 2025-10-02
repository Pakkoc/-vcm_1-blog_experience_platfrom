import { z } from 'zod';

export const ApplicationCreateSchema = z.object({
  campaignId: z.string().uuid('올바른 캠페인 ID가 아닙니다'),
  message: z.string().min(10, '각오 한마디는 최소 10자 이상이어야 합니다').max(500),
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)'),
});

export type ApplicationCreateRequest = z.infer<typeof ApplicationCreateSchema>;

export const ApplicationResponseSchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  influencerProfileId: z.string().uuid(),
  message: z.string(),
  visitDate: z.string(),
  status: z.enum(['submitted', 'selected', 'rejected']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>;

export const ApplicationRowSchema = z.object({
  id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  influencer_profile_id: z.string().uuid(),
  message: z.string(),
  visit_date: z.string(),
  status: z.enum(['submitted', 'selected', 'rejected']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ApplicationRow = z.infer<typeof ApplicationRowSchema>;

export const ApplicationWithCampaignSchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  campaignTitle: z.string(),
  message: z.string(),
  visitDate: z.string(),
  status: z.enum(['submitted', 'selected', 'rejected']),
  createdAt: z.string(),
});

export type ApplicationWithCampaign = z.infer<typeof ApplicationWithCampaignSchema>;

