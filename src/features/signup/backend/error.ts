export const signupErrorCodes = {
  invalidRequest: 'INVALID_SIGNUP_REQUEST',
  emailAlreadyExists: 'EMAIL_ALREADY_EXISTS',
  phoneAlreadyExists: 'PHONE_ALREADY_EXISTS',
  authCreationFailed: 'AUTH_CREATION_FAILED',
  profileCreationFailed: 'PROFILE_CREATION_FAILED',
  termsAgreementFailed: 'TERMS_AGREEMENT_FAILED',
  validationError: 'VALIDATION_ERROR',
  rateLimitExceeded: 'RATE_LIMIT_EXCEEDED',
} as const;

export type SignupServiceError =
  (typeof signupErrorCodes)[keyof typeof signupErrorCodes];
