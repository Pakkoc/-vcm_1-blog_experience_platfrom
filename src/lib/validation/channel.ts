/**
 * SNS 채널 URL 검증 유틸리티
 */

export type ChannelType = 'instagram' | 'youtube' | 'blog' | 'tiktok';

const CHANNEL_PATTERNS: Record<ChannelType, RegExp> = {
  instagram: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/,
  youtube: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/,
  blog: /^https?:\/\/.+\.(blog\.me|tistory\.com|com\/blog).*/,
  tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9._]+\/?$/,
};

export const validateChannelUrl = (
  channelType: ChannelType,
  url: string
): { valid: boolean; message?: string } => {
  const pattern = CHANNEL_PATTERNS[channelType];
  
  if (!pattern.test(url)) {
    return {
      valid: false,
      message: `선택한 채널 유형(${channelType})과 URL이 일치하지 않습니다`,
    };
  }
  
  return { valid: true };
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

