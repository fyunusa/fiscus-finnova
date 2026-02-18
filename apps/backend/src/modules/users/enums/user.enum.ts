export enum UserType {
  INDIVIDUAL = 'individual',
  CORPORATE = 'corporate',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum SignupStep {
  CREATED = 'created',
  INFO_VERIFIED = 'info_verified',
  CREDENTIALS_SET = 'credentials_set',
  KYC_DONE = 'kyc_done',
  IDENTITY_VERIFIED = 'identity_verified',
  BANK_ADDED = 'bank_added',
  DOCUMENTS_UPLOADED = 'documents_uploaded',
  TERMS_ACCEPTED = 'terms_accepted',
  COMPLETED = 'completed',
}
export enum EmailVerificationPurpose {
  SIGNUP = 'signup',
  PASSWORD_RESET = 'password_reset',
  EMAIL_CHANGE = 'email_change',
}

export enum PhoneVerificationPurpose {
  SIGNUP = 'signup',
  PASSWORD_RESET = 'password_reset',
  PHONE_CHANGE = 'phone_change',
}