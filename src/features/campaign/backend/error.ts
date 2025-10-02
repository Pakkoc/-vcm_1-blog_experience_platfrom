export const campaignErrorCodes = {
  invalidRequest: 'INVALID_REQUEST',
  unauthorized: 'UNAUTHORIZED',
  notAdvertiser: 'NOT_ADVERTISER',
  profileNotFound: 'PROFILE_NOT_FOUND',
  campaignCreationFailed: 'CAMPAIGN_CREATION_FAILED',
  campaignNotFound: 'CAMPAIGN_NOT_FOUND',
  campaignUpdateFailed: 'CAMPAIGN_UPDATE_FAILED',
  campaignFetchError: 'CAMPAIGN_FETCH_ERROR',
  validationError: 'VALIDATION_ERROR',
  notOwner: 'NOT_OWNER',
  invalidStatus: 'INVALID_STATUS',
} as const;

export type CampaignErrorCode =
  (typeof campaignErrorCodes)[keyof typeof campaignErrorCodes];

export type CampaignServiceError = CampaignErrorCode;

