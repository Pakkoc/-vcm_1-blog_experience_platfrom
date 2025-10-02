import { z } from 'zod';

export const InfluencerProfileCreateSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)'),
  channels: z.array(
    z.object({
      channelType: z.enum(['instagram', 'youtube', 'blog', 'tiktok'], {
        errorMap: () => ({ message: '올바른 채널 타입을 선택해주세요' }),
      }),
      channelName: z.string().min(1, '채널명을 입력해주세요').max(200),
      channelUrl: z.string().url('올바른 URL 형식이 아닙니다').max(500),
    })
  ).min(1, '최소 1개의 채널을 등록해주세요'),
});

export type InfluencerProfileCreateRequest = z.infer<typeof InfluencerProfileCreateSchema>;

export const InfluencerProfileResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  birthDate: z.string(),
  profileStatus: z.enum(['draft', 'pending', 'approved', 'rejected']),
  channels: z.array(
    z.object({
      id: z.string().uuid(),
      channelType: z.enum(['instagram', 'youtube', 'blog', 'tiktok']),
      channelName: z.string(),
      channelUrl: z.string(),
      verificationStatus: z.enum(['pending', 'verified', 'failed']),
    })
  ),
});

export type InfluencerProfileResponse = z.infer<typeof InfluencerProfileResponseSchema>;

export const InfluencerProfileRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  birth_date: z.string(),
  profile_status: z.enum(['draft', 'pending', 'approved', 'rejected']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type InfluencerProfileRow = z.infer<typeof InfluencerProfileRowSchema>;

export const InfluencerChannelRowSchema = z.object({
  id: z.string().uuid(),
  influencer_profile_id: z.string().uuid(),
  channel_type: z.enum(['instagram', 'youtube', 'blog', 'tiktok']),
  channel_name: z.string(),
  channel_url: z.string(),
  verification_status: z.enum(['pending', 'verified', 'failed']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type InfluencerChannelRow = z.infer<typeof InfluencerChannelRowSchema>;

