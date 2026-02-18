export enum AuthTokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export enum AuthRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
}

export enum KYCDocumentType {
  ID_COPY = 'ID_COPY',
  SELFIE_WITH_ID = 'SELFIE_WITH_ID',
}

export enum KYCDocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUPPLEMENT_REQUIRED = 'supplement_required',
}
