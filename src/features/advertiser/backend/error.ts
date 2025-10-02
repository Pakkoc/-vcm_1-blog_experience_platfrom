export const advertiserErrorCodes = {
  invalidRequest: 'INVALID_REQUEST',
  profileAlreadyExists: 'PROFILE_ALREADY_EXISTS',
  profileCreationFailed: 'PROFILE_CREATION_FAILED',
  businessNumberExists: 'BUSINESS_NUMBER_EXISTS',
  invalidBusinessNumber: 'INVALID_BUSINESS_NUMBER',
  validationError: 'VALIDATION_ERROR',
  notFound: 'PROFILE_NOT_FOUND',
  fetchError: 'PROFILE_FETCH_ERROR',
  unauthorized: 'UNAUTHORIZED',
  profileNotEditable: 'PROFILE_NOT_EDITABLE',
} as const;

export type AdvertiserErrorCode =
  (typeof advertiserErrorCodes)[keyof typeof advertiserErrorCodes];

export type AdvertiserServiceError = AdvertiserErrorCode;

