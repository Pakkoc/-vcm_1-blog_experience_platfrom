export const influencerErrorCodes = {
  invalidRequest: 'INVALID_REQUEST',
  profileAlreadyExists: 'PROFILE_ALREADY_EXISTS',
  profileCreationFailed: 'PROFILE_CREATION_FAILED',
  channelCreationFailed: 'CHANNEL_CREATION_FAILED',
  validationError: 'VALIDATION_ERROR',
  notFound: 'PROFILE_NOT_FOUND',
  fetchError: 'PROFILE_FETCH_ERROR',
  unauthorized: 'UNAUTHORIZED',
  ageBelowMinimum: 'AGE_BELOW_MINIMUM',
  invalidChannelUrl: 'INVALID_CHANNEL_URL',
  channelPatternMismatch: 'CHANNEL_PATTERN_MISMATCH',
  duplicateChannelUrl: 'DUPLICATE_CHANNEL_URL',
  profileNotEditable: 'PROFILE_NOT_EDITABLE',
} as const;

export type InfluencerErrorCode =
  (typeof influencerErrorCodes)[keyof typeof influencerErrorCodes];

export type InfluencerServiceError = InfluencerErrorCode;

