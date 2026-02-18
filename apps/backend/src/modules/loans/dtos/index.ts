/**
 * Loan Module DTOs
 */

import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, Min, Max, IsArray, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { LoanProductType, RepaymentMethod, LoanApplicationStatus, CollateralType, DocumentType } from '../enums/loan.enum';

// ============ REQUEST DTOs ============

export class CreateLoanApplicationDto {
  @IsUUID()
  loanProductId!: string;

  @IsNumber()
  @Min(10000000)
  requestedLoanAmount!: number;

  @IsNumber()
  @Min(1)
  @Max(36)
  loanPeriod!: number;

  @IsEnum(CollateralType)
  collateralType!: CollateralType;

  @IsNumber()
  @Min(0)
  collateralValue!: number;

  @IsString()
  collateralAddress!: string;

  @IsOptional()
  @IsString()
  collateralDetails?: string;

  @IsOptional()
  @IsString()
  applicantNotes?: string;
}

export class UpdateLoanApplicationDto {
  @IsOptional()
  @IsNumber()
  requestedLoanAmount?: number;

  @IsOptional()
  @IsNumber()
  loanPeriod?: number;

  @IsOptional()
  @IsEnum(CollateralType)
  collateralType?: CollateralType;

  @IsOptional()
  @IsNumber()
  collateralValue?: number;

  @IsOptional()
  @IsString()
  collateralAddress?: string;

  @IsOptional()
  @IsString()
  collateralDetails?: string;

  @IsOptional()
  @IsString()
  applicantNotes?: string;
}

export class ApproveLoanApplicationDto {
  @IsNumber()
  approvedLoanAmount!: number;

  @IsNumber()
  @Min(0)
  @Max(20)
  approvedInterestRate!: number;

  @IsNumber()
  @Min(1)
  @Max(36)
  approvedLoanPeriod!: number;

  @IsOptional()
  @IsString()
  reviewerNotes?: string;
}

export class RejectLoanApplicationDto {
  @IsString()
  rejectionReason!: string;

  @IsOptional()
  @IsString()
  reviewerNotes?: string;
}

export class CreateLoanConsultationDto {
  @IsString()
  name!: string;

  @IsString()
  phone!: string;

  @IsString()
  email!: string;

  @IsOptional()
  @IsString()
  loanType?: string;

  @IsOptional()
  @IsNumber()
  requestedAmount?: number;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  message?: string;
}

export class UploadLoanDocumentDto {
  @IsEnum(DocumentType)
  documentType!: DocumentType;

  // File will be handled separately through FormData
}

// ============ RESPONSE DTOs ============

export class LoanProductResponseDto {
  id!: string;
  name!: string;
  description!: string;
  productType!: LoanProductType;
  maxLTV!: number;
  minInterestRate!: number;
  maxInterestRate!: number;
  minLoanAmount!: number;
  maxLoanAmount!: number;
  minLoanPeriod!: number;
  maxLoanPeriod!: number;
  repaymentMethod!: RepaymentMethod;
  isActive!: boolean;
  requiredDocuments!: string[];
  createdAt!: Date;
}

export class LoanApplicationDocumentResponseDto {
  id!: string;
  documentType!: DocumentType;
  fileName!: string;
  fileUrl!: string;
  fileSize: string | null = null;
  uploadedAt!: Date;
}

export class LoanApplicationResponseDto {
  id!: string;
  applicationNo!: string;
  userId!: string;
  loanProductId!: string;
  requestedLoanAmount!: number;
  approvedLoanAmount: number | null = null;
  approvedInterestRate: number | null = null;
  approvedLoanPeriod: number | null = null;
  collateralType!: CollateralType;
  collateralValue!: number;
  collateralAddress!: string;
  collateralDetails: string | null = null;
  status!: LoanApplicationStatus;
  statusHistory!: Array<{
    status: string;
    date: Date;
    note?: string;
  }>;
  rejectionReason: string | null = null;
  documents!: LoanApplicationDocumentResponseDto[];
  submittedAt: Date | null = null;
  approvedAt: Date | null = null;
  rejectedAt: Date | null = null;
  createdAt!: Date;
  updatedAt!: Date;
}

export class LoanAccountResponseDto {
  id!: string;
  accountNumber!: string;
  userId!: string;
  principalAmount!: number;
  principalBalance!: number;
  interestRate!: number;
  loanPeriod!: number;
  remainingPeriod!: number;
  repaymentMethod!: RepaymentMethod;
  totalInterestAccrued!: number;
  totalPaid!: number;
  nextPaymentAmount!: number;
  nextPaymentDate!: Date;
  status!: string;
  overdueMonths!: number;
  overdueAmount!: number;
  startDate!: Date;
  targetEndDate!: Date;
  closedAt: Date | null = null;
  createdAt!: Date;
}

export class LoanRepaymentScheduleItemDto {
  id!: string;
  month!: number;
  scheduledPaymentDate!: Date;
  principalPayment!: number;
  interestPayment!: number;
  totalPaymentAmount!: number;
  paymentStatus!: string;
  actualPaymentDate: Date | null = null;
  actualPaidAmount: number | null = null;
  remainingPrincipal!: number;
  dayOverdue!: number;
  lateFee!: number;
}

export class LoanRepaymentHistoryDto {
  id!: string;
  transactionNo!: string;
  paymentAmount!: number;
  paymentDate!: Date;
  paymentMethod!: string;
  principalApplied!: number;
  interestApplied!: number;
  penaltyApplied!: number;
  status!: string;
  createdAt!: Date;
}

export class LoanConsultationResponseDto {
  id!: string;
  name!: string;
  phone!: string;
  email!: string;
  loanType: string | null = null;
  requestedAmount: number | null = null;
  propertyType: string | null = null;
  purpose: string | null = null;
  status!: string;
  createdAt!: Date;
}

// Pagination DTO
export class PaginationDto {
  page: number = 1;
  limit: number = 10;
  total!: number;
  totalPages!: number;
}

export class PaginatedResponseDto<T> {
  data!: T[];
  pagination!: PaginationDto;
}

// Generic Success Response
export class SuccessResponseDto<T> {
  success: boolean = true;
  data!: T;
  message?: string;
}
