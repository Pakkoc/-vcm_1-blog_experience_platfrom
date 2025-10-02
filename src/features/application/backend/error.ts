export const applicationErrorCodes = {
  invalidRequest: 'INVALID_REQUEST',
  unauthorized: 'UNAUTHORIZED',
  notInfluencer: 'NOT_INFLUENCER',
  profileNotFound: 'PROFILE_NOT_FOUND',
  campaignNotFound: 'CAMPAIGN_NOT_FOUND',
  alreadyApplied: 'ALREADY_APPLIED',
  campaignNotRecruiting: 'CAMPAIGN_NOT_RECRUITING',
  applicationCreationFailed: 'APPLICATION_CREATION_FAILED',
  applicationNotFound: 'APPLICATION_NOT_FOUND',
  applicationFetchError: 'APPLICATION_FETCH_ERROR',
  validationError: 'VALIDATION_ERROR',
  notOwner: 'NOT_OWNER',
} as const;

export type ApplicationErrorCode =
  (typeof applicationErrorCodes)[keyof typeof applicationErrorCodes];

export type ApplicationServiceError = ApplicationErrorCode;

