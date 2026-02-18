/**
 * Loan Module Enums
 */

export enum LoanProductType {
  APARTMENT = 'apartment',
  BUILDING = 'building',
  CREDIT = 'credit',
  BUSINESS_LOAN = 'business-loan',
  UNSECURED = 'unsecured',
}

export enum RepaymentMethod {
  EQUAL_PRINCIPAL_INTEREST = 'equal-principal-interest', // 원리금 균등분할
  EQUAL_PRINCIPAL = 'equal-principal', // 원금 균등분할
  BULLET = 'bullet', // 만기일시상환
}

export enum LoanApplicationStatus {
  PENDING = 'pending', // 초기 상태, 작성 중
  SUBMITTED = 'submitted', // 제출됨
  REVIEWING = 'reviewing', // 심사 중
  APPROVED = 'approved', // 승인됨
  REJECTED = 'rejected', // 거절됨
  ACTIVE = 'active', // 대출 실행됨 (LoanAccount 생성됨)
  COMPLETED = 'completed', // 완납됨
  CANCELLED = 'cancelled', // 취소됨
}

export enum LoanAccountStatus {
  ACTIVE = 'active', // 진행 중
  SUSPENDED = 'suspended', // 중지됨
  CLOSED = 'closed', // 종료됨
  DEFAULTED = 'defaulted', // 연체됨
}

export enum RepaymentStatus {
  UNPAID = 'unpaid', // 미납
  PAID = 'paid', // 납입
  PARTIAL = 'partial', // 부분 납입
  OVERDUE = 'overdue', // 연체
  WAIVED = 'waived', // 감면됨
}

export enum DocumentType {
  ID_COPY = 'id_copy', // 신분증
  PROPERTY_DEED = 'property_deed', // 부동산증명서
  FINANCIAL_STATEMENT = 'financial_statement', // 재무제표
  EMPLOYMENT_LETTER = 'employment_letter', // 재직증명서
  TAX_RETURN = 'tax_return', // 세금 신고서
  MORTGAGE_DOCUMENT = 'mortgage_document', // 담보 설정 서류
  BANK_STATEMENT = 'bank_statement', // 통장 사본
}

export enum ConsultationStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export enum CollateralType {
  APARTMENT = 'apartment',
  BUILDING = 'building',
  LAND = 'land',
  VEHICLE = 'vehicle',
  OTHER = 'other',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  AUTO_DEBIT = 'auto_debit',
  VIRTUAL_ACCOUNT = 'virtual_account',
  MANUAL = 'manual',
}
