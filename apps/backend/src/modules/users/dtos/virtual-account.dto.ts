import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { TransactionType, TransactionStatus } from '../enums/virtual-account.enum';

// Deposit DTO
export class CreateDepositDto {
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  referenceNumber?: string;
}

// Withdrawal DTO
export class CreateWithdrawalDto {
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  pin!: string; // User's PIN for security

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  bankAccountId?: string; // Bank account to withdraw to
}

// Virtual Account Response DTO
export class VirtualAccountResponseDto {
  id!: string;
  userId!: string;
  accountNumber!: string;
  accountName!: string;
  status!: string;
  availableBalance!: number;
  totalDeposited!: number;
  totalWithdrawn!: number;
  frozenBalance!: number;
  bankCode?: string;
  bankName?: string;
  createdAt!: Date;
  updatedAt!: Date;
  lastTransactionAt?: Date;
}

// Virtual Account Initiation Response DTO (when user starts checkout)
export class VirtualAccountInitiationResponseDto {
  requestId!: string; // VirtualAccountRequest ID
  paymentKey!: string; // Toss payment key
  orderId!: string;
  checkoutUrl!: string; // URL for user to complete payment
  amount!: number;
  status!: 'READY' | 'DONE';
  requiresUserAction!: boolean; // true if user needs to complete checkout
  createdAt!: Date;
}

// Virtual Account Completion Response DTO (after user completes checkout)
export class VirtualAccountCompletionResponseDto {
  id!: string;
  userId!: string;
  accountNumber!: string;
  accountName!: string;
  status!: string;
  availableBalance!: number;
  bankCode?: string;
  bankName?: string;
  createdAt!: Date;
  completedAt!: Date;
}

// Transaction Response DTO
export class VirtualAccountTransactionResponseDto {
  id!: string;
  virtualAccountId!: string;
  type!: TransactionType;
  amount!: number;
  status!: TransactionStatus;
  balanceBefore!: number;
  balanceAfter!: number;
  description?: string;
  referenceNumber?: string;
  relatedParty?: string;
  createdAt!: Date;
  completedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
}

// Deposit History DTO (for dashboard)
export class DepositHistoryItemDto {
  id!: string;
  date!: string;
  type!: 'deposit' | 'withdrawal';
  amount!: number;
  status!: 'completed' | 'pending' | 'failed';
}

export class DepositHistoryResponseDto {
  items!: DepositHistoryItemDto[];
  total!: number;
  completed!: number;
  pending!: number;
  failed!: number;
}

// Virtual Account Info DTO (for dashboard)
export class VirtualAccountInfoDto {
  accountNumber!: string;
  accountName!: string;
  availableBalance!: number;
  totalDeposited!: number;
  totalWithdrawn!: number;
  frozenBalance!: number;
  bankName?: string;
  lastTransactionAt?: Date;
}
