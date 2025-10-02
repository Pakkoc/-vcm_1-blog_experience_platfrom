export const USER_ROLE = {
  INFLUENCER: 'influencer',
  ADVERTISER: 'advertiser',
} as const;

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];

export const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLE.INFLUENCER]: '인플루언서',
  [USER_ROLE.ADVERTISER]: '광고주',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [USER_ROLE.INFLUENCER]: 'SNS 채널을 운영하고 체험단에 참여합니다',
  [USER_ROLE.ADVERTISER]: '체험단을 등록하고 관리합니다',
};
