/**
 * Loan Module DTOs
 */

import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, Min, Max, IsArray, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoanProductType, RepaymentMethod, LoanApplicationStatus, CollateralType, DocumentType } from '../enums/loan.enum';

// ============ REQUEST DTOs ============

export class CreateLoanApplicationDto {
  @ApiProperty({ description: 'Loan product ID', format: 'uuid' })
  @IsUUID()
  loanProductId!: string;

  @ApiProperty({ description: 'Requested loan amount in KRW', example: 100000000 })
  @IsNumber()
  @Min(10000000)
  requestedLoanAmount!: number;

  @ApiProperty({ description: 'Requested loan period in months', example: 12, minimum: 1, maximum: 36 })
  @IsNumber()
  @Min(1)
  @Max(36)
  requestedLoanPeriod!: number;

  @ApiPropertyOptional({ description: 'Interest rate shown to user at time of application (%)', example: 5.5 })
  @IsOptional()
  @IsNumber()
  requestedInterestRate?: number;

  @ApiProperty({ description: 'Type of collateral', enum: CollateralType })
  @IsEnum(CollateralType)
  collateralType!: CollateralType;

  @ApiProperty({ description: 'Collateral value in KRW', example: 500000000 })
  @IsNumber()
  @Min(0)
  collateralValue!: number;

  @ApiProperty({ description: 'Collateral address' })
  @IsString()
  collateralAddress!: string;

  @ApiPropertyOptional({ description: 'Additional collateral details' })
  @IsOptional()
  @IsString()
  collateralDetails?: string;

  @ApiPropertyOptional({ description: 'Applicant notes' })
  @IsOptional()
  @IsString()
  applicantNotes?: string;
}

export class UpdateLoanApplicationDto {
  @ApiPropertyOptional({ description: 'Requested loan amount in KRW' })
  @IsOptional()
  @IsNumber()
  requestedLoanAmount?: number;

  @ApiPropertyOptional({ description: 'Requested loan period in months' })
  @IsOptional()
  @IsNumber()
  requestedLoanPeriod?: number;

  @ApiPropertyOptional({ description: 'Interest rate shown to user (%)' })
  @IsOptional()
  @IsNumber()
  requestedInterestRate?: number;

  @ApiPropertyOptional({ description: 'Type of collateral', enum: CollateralType })
  @IsOptional()
  @IsEnum(CollateralType)
  collateralType?: CollateralType;

  @ApiPropertyOptional({ description: 'Collateral value in KRW' })
  @IsOptional()
  @IsNumber()
  collateralValue?: number;

  @ApiPropertyOptional({ description: 'Collateral address' })
  @IsOptional()
  @IsString()
  collateralAddress?: string;

  @ApiPropertyOptional({ description: 'Additional collateral details' })
  @IsOptional()
  @IsString()
  collateralDetails?: string;

  @ApiPropertyOptional({ description: 'Applicant notes' })
  @IsOptional()
  @IsString()
  applicantNotes?: string;
}

export class ApproveLoanApplicationDto {
  @ApiProperty({ description: 'Approved loan amount in KRW', example: 80000000 })
  @IsNumber()
  approvedLoanAmount!: number;

  @ApiPropertyOptional({ description: 'Approved annual interest rate (%). Defaults to user requested rate if not provided', example: 5.5, minimum: 0, maximum: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  approvedInterestRate?: number;

  @ApiPropertyOptional({ description: 'Approved loan period in months. Defaults to user requested period if not provided', example: 12, minimum: 1, maximum: 36 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(36)
  approvedLoanPeriod?: number;

  @ApiPropertyOptional({ description: 'Reviewer notes' })
  @IsOptional()
  @IsString()
  reviewerNotes?: string;
}

export class RejectLoanApplicationDto {
  @ApiProperty({ description: 'Reason for rejection' })
  @IsString()
  rejectionReason!: string;

  @ApiPropertyOptional({ description: 'Reviewer notes' })
  @IsOptional()
  @IsString()
  reviewerNotes?: string;
}

export class CreateLoanConsultationDto {
  @ApiProperty({ description: 'Consultation requester name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  phone!: string;

  @ApiProperty({ description: 'Email address' })
  @IsString()
  email!: string;

  @ApiPropertyOptional({ description: 'Type of loan' })
  @IsOptional()
  @IsString()
  loanType?: string;

  @ApiPropertyOptional({ description: 'Requested loan amount' })
  @IsOptional()
  @IsNumber()
  requestedAmount?: number;

  @ApiPropertyOptional({ description: 'Property type' })
  @IsOptional()
  @IsString()
  propertyType?: string;

  @ApiPropertyOptional({ description: 'Purpose of loan' })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiPropertyOptional({ description: 'Additional message' })
  @IsOptional()
  @IsString()
  message?: string;
}

export class UploadLoanDocumentDto {
  @ApiProperty({ description: 'Document type', enum: DocumentType })
  @IsEnum(DocumentType)
  documentType!: DocumentType;

  // File will be handled separately through FormData
}

// ============ RESPONSE DTOs ============

export class LoanProductResponseDto {
  @ApiProperty({ description: 'Product ID', format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Product name' })
  name!: string;

  @ApiProperty({ description: 'Product description' })
  description!: string;

  @ApiProperty({ description: 'Product type', enum: LoanProductType })
  productType!: LoanProductType;

  @ApiProperty({ description: 'Maximum LTV ratio' })
  maxLTV!: number;

  @ApiProperty({ description: 'Minimum interest rate (%)' })
  minInterestRate!: number;

  @ApiProperty({ description: 'Maximum interest rate (%)' })
  maxInterestRate!: number;

  @ApiProperty({ description: 'Minimum loan amount (KRW)' })
  minLoanAmount!: number;

  @ApiProperty({ description: 'Maximum loan amount (KRW)' })
  maxLoanAmount!: number;

  @ApiProperty({ description: 'Minimum loan period (months)' })
  minLoanPeriod!: number;

  @ApiProperty({ description: 'Maximum loan period (months)' })
  maxLoanPeriod!: number;

  @ApiProperty({ description: 'Repayment method', enum: RepaymentMethod })
  repaymentMethod!: RepaymentMethod;

  @ApiProperty({ description: 'Is product active' })
  isActive!: boolean;

  @ApiProperty({ description: 'Required documents list', type: [String] })
  requiredDocuments!: string[];

  @ApiProperty({ description: 'Creation date', format: 'date-time' })
  createdAt!: Date;
}

export class LoanApplicationDocumentResponseDto {
  @ApiProperty({ description: 'Document ID', format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Document type', enum: DocumentType })
  documentType!: DocumentType;

  @ApiProperty({ description: 'File name' })
  fileName!: string;

  @ApiProperty({ description: 'File URL' })
  fileUrl!: string;

  @ApiPropertyOptional({ description: 'File size' })
  fileSize: string | null = null;

  @ApiProperty({ description: 'Upload date', format: 'date-time' })
  uploadedAt!: Date;
}

export class LoanApplicationResponseDto {
  @ApiProperty({ description: 'Application ID', format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Application number' })
  applicationNo!: string;

  @ApiProperty({ description: 'User ID', format: 'uuid' })
  userId!: string;

  @ApiProperty({ description: 'Loan product ID', format: 'uuid' })
  loanProductId!: string;

  @ApiProperty({ description: 'Requested loan amount (KRW)' })
  requestedLoanAmount!: number;

  @ApiProperty({ description: 'Requested loan period (months)' })
  requestedLoanPeriod!: number;

  @ApiPropertyOptional({ description: 'Interest rate shown to user at application time (%)' })
  requestedInterestRate: number | null = null;

  @ApiPropertyOptional({ description: 'Approved loan amount (KRW)' })
  approvedLoanAmount: number | null = null;

  @ApiPropertyOptional({ description: 'Approved interest rate (%)' })
  approvedInterestRate: number | null = null;

  @ApiPropertyOptional({ description: 'Approved loan period (months)' })
  approvedLoanPeriod: number | null = null;

  @ApiProperty({ description: 'Collateral type', enum: CollateralType })
  collateralType!: CollateralType;

  @ApiProperty({ description: 'Collateral value (KRW)' })
  collateralValue!: number;

  @ApiProperty({ description: 'Collateral address' })
  collateralAddress!: string;

  @ApiPropertyOptional({ description: 'Collateral details' })
  collateralDetails: string | null = null;

  @ApiProperty({ description: 'Application status', enum: LoanApplicationStatus })
  status!: LoanApplicationStatus;

  @ApiProperty({ description: 'Status history', type: Array })
  statusHistory!: Array<{
    status: string;
    date: Date;
    note?: string;
  }>;

  @ApiPropertyOptional({ description: 'Rejection reason' })
  rejectionReason: string | null = null;

  @ApiProperty({ description: 'Attached documents', type: [LoanApplicationDocumentResponseDto] })
  documents!: LoanApplicationDocumentResponseDto[];

  @ApiPropertyOptional({ description: 'Submission date', format: 'date-time' })
  submittedAt: Date | null = null;

  @ApiPropertyOptional({ description: 'Approval date', format: 'date-time' })
  approvedAt: Date | null = null;

  @ApiPropertyOptional({ description: 'Rejection date', format: 'date-time' })
  rejectedAt: Date | null = null;

  @ApiPropertyOptional({ description: 'Associated loan account ID', format: 'uuid' })
  loanAccountId: string | null = null;

  @ApiProperty({ description: 'Creation date', format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date', format: 'date-time' })
  updatedAt!: Date;
}

export class LoanAccountResponseDto {
  @ApiProperty({ description: 'Account ID', format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Account number' })
  accountNumber!: string;

  @ApiProperty({ description: 'User ID', format: 'uuid' })
  userId!: string;

  @ApiProperty({ description: 'Principal amount (KRW)' })
  principalAmount!: number;

  @ApiProperty({ description: 'Remaining principal balance (KRW)' })
  principalBalance!: number;

  @ApiProperty({ description: 'Interest rate (%)' })
  interestRate!: number;

  @ApiProperty({ description: 'Loan period (months)' })
  loanPeriod!: number;

  @ApiProperty({ description: 'Remaining period (months)' })
  remainingPeriod!: number;

  @ApiProperty({ description: 'Repayment method', enum: RepaymentMethod })
  repaymentMethod!: RepaymentMethod;

  @ApiProperty({ description: 'Total accrued interest (KRW)' })
  totalInterestAccrued!: number;

  @ApiProperty({ description: 'Total paid amount (KRW)' })
  totalPaid!: number;

  @ApiProperty({ description: 'Next payment amount (KRW)' })
  nextPaymentAmount!: number;

  @ApiProperty({ description: 'Next payment date', format: 'date-time' })
  nextPaymentDate!: Date;

  @ApiProperty({ description: 'Account status' })
  status!: string;

  @ApiProperty({ description: 'Overdue months' })
  overdueMonths!: number;

  @ApiProperty({ description: 'Overdue amount (KRW)' })
  overdueAmount!: number;

  @ApiProperty({ description: 'Loan start date', format: 'date-time' })
  startDate!: Date;

  @ApiProperty({ description: 'Target end date', format: 'date-time' })
  targetEndDate!: Date;

  @ApiPropertyOptional({ description: 'Account closure date', format: 'date-time' })
  closedAt: Date | null = null;

  @ApiProperty({ description: 'Creation date', format: 'date-time' })
  createdAt!: Date;
}

export class LoanRepaymentScheduleItemDto {
  @ApiProperty({ description: 'Schedule item ID', format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Month number' })
  month!: number;

  @ApiProperty({ description: 'Scheduled payment date', format: 'date-time' })
  scheduledPaymentDate!: Date;

  @ApiProperty({ description: 'Principal payment amount (KRW)' })
  principalPayment!: number;

  @ApiProperty({ description: 'Interest payment amount (KRW)' })
  interestPayment!: number;

  @ApiProperty({ description: 'Total payment amount (KRW)' })
  totalPaymentAmount!: number;

  @ApiProperty({ description: 'Payment status' })
  paymentStatus!: string;

  @ApiPropertyOptional({ description: 'Actual payment date', format: 'date-time' })
  actualPaymentDate: Date | null = null;

  @ApiPropertyOptional({ description: 'Actual paid amount (KRW)' })
  actualPaidAmount: number | null = null;

  @ApiProperty({ description: 'Remaining principal (KRW)' })
  remainingPrincipal!: number;

  @ApiProperty({ description: 'Days overdue' })
  dayOverdue!: number;

  @ApiProperty({ description: 'Late fee (KRW)' })
  lateFee!: number;
}

export class LoanRepaymentHistoryDto {
  @ApiProperty({ description: 'Transaction ID', format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Transaction number' })
  transactionNo!: string;

  @ApiProperty({ description: 'Payment amount (KRW)' })
  paymentAmount!: number;

  @ApiProperty({ description: 'Payment date', format: 'date-time' })
  paymentDate!: Date;

  @ApiProperty({ description: 'Payment method' })
  paymentMethod!: string;

  @ApiProperty({ description: 'Principal applied (KRW)' })
  principalApplied!: number;

  @ApiProperty({ description: 'Interest applied (KRW)' })
  interestApplied!: number;

  @ApiProperty({ description: 'Penalty applied (KRW)' })
  penaltyApplied!: number;

  @ApiProperty({ description: 'Transaction status' })
  status!: string;

  @ApiProperty({ description: 'Creation date', format: 'date-time' })
  createdAt!: Date;
}

export class LoanConsultationResponseDto {
  @ApiProperty({ description: 'Consultation ID', format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Requestor name' })
  name!: string;

  @ApiProperty({ description: 'Phone number' })
  phone!: string;

  @ApiProperty({ description: 'Email address' })
  email!: string;

  @ApiPropertyOptional({ description: 'Loan type' })
  loanType: string | null = null;

  @ApiPropertyOptional({ description: 'Requested amount (KRW)' })
  requestedAmount: number | null = null;

  @ApiPropertyOptional({ description: 'Property type' })
  propertyType: string | null = null;

  @ApiPropertyOptional({ description: 'Loan purpose' })
  purpose: string | null = null;

  @ApiProperty({ description: 'Consultation status' })
  status!: string;

  @ApiProperty({ description: 'Creation date', format: 'date-time' })
  createdAt!: Date;
}

// Pagination DTO
export class PaginationDto {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number = 1;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number = 10;

  @ApiProperty({ description: 'Total number of items' })
  total!: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages!: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Response data', type: Array })
  data!: T[];

  @ApiProperty({ description: 'Pagination info', type: PaginationDto })
  pagination!: PaginationDto;
}

// Generic Success Response
export class SuccessResponseDto<T> {
  @ApiProperty({ description: 'Success flag', example: true })
  success: boolean = true;

  @ApiProperty({ description: 'Response data' })
  data!: T;

  @ApiPropertyOptional({ description: 'Optional message' })
  message?: string;
}
