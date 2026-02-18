import { IsString, IsNumber, IsArray, IsOptional, IsDate, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { UserInvestmentStatusEnum } from '@common/enums/investment.enum';

// ============ INVESTMENT SUMMARY ============
export class InvestmentSummaryDto {
  @IsNumber()
  totalInvestments!: number;

  @IsNumber()
  numberOfInvestments!: number;

  @IsNumber()
  totalEarnings!: number;

  @IsNumber()
  investmentsInProgress!: number;

  @IsNumber()
  estimatedMonthlyProfit!: number;
}

// ============ REPAYMENT STATUS ============
export class ScheduledPaymentDto {
  @IsString()
  id!: string;

  @IsString()
  investmentTitle!: string;

  @IsDate()
  @Type(() => Date)
  dueDate!: Date;

  @IsNumber()
  expectedAmount!: number;

  @IsNumber()
  investmentAmount!: number;

  @IsNumber()
  rate!: number;

  @IsEnum(['pending', 'completed', 'overdue'])
  status!: 'pending' | 'completed' | 'overdue';
}

export class RepaymentHistoryDto {
  @IsString()
  id!: string;

  @IsString()
  investmentTitle!: string;

  @IsDate()
  @Type(() => Date)
  repaymentDate!: Date;

  @IsNumber()
  amount!: number;

  @IsNumber()
  investmentAmount!: number;

  @IsNumber()
  rate!: number;

  @IsEnum(['completed', 'failed'])
  status!: 'completed' | 'failed';
}

export class RepaymentStatusDto {
  @IsArray()
  scheduledPayments!: ScheduledPaymentDto[];

  @IsArray()
  repaymentHistory!: RepaymentHistoryDto[];

  @IsNumber()
  upcomingPaymentAmount!: number;
}

// ============ INVESTMENT HISTORY ============
export class InvestmentHistoryItemDto {
  @IsString()
  id!: string;

  @IsString()
  investmentId!: string;

  @IsString()
  investmentTitle!: string;

  @IsString()
  type!: string;

  @IsNumber()
  amount!: number;

  @IsNumber()
  rate!: number;

  @IsNumber()
  period!: number;

  @IsDate()
  @Type(() => Date)
  investedDate!: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  maturityDate?: Date;

  @IsEnum(UserInvestmentStatusEnum)
  status!: UserInvestmentStatusEnum;

  @IsNumber()
  expectedEarnings!: number;

  @IsOptional()
  @IsNumber()
  actualEarnings?: number;
}

export class InvestmentHistoryDto {
  @IsNumber()
  total!: number;

  @IsNumber()
  page!: number;

  @IsNumber()
  limit!: number;

  @IsArray()
  items!: InvestmentHistoryItemDto[];

  @IsOptional()
  filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    type?: string;
  };
}

// ============ BALANCE/ACCOUNT MANAGEMENT ============
export class VirtualAccountDto {
  @IsString()
  accountNumber!: string;

  @IsString()
  bankName!: string;

  @IsString()
  accountHolder!: string;

  @IsNumber()
  deposits!: number;

  @IsNumber()
  withdrawals!: number;

  @IsNumber()
  currentBalance!: number;
}

export class TransactionHistoryDto {
  @IsString()
  id!: string;

  @IsEnum(['deposit', 'withdrawal', 'investment', 'earning'])
  type!: 'deposit' | 'withdrawal' | 'investment' | 'earning';

  @IsNumber()
  amount!: number;

  @IsString()
  description!: string;

  @IsDate()
  @Type(() => Date)
  transactionDate!: Date;

  @IsEnum(['pending', 'completed', 'failed'])
  status!: 'pending' | 'completed' | 'failed';

  @IsOptional()
  @IsString()
  reference?: string;
}

export class BalanceManagementDto {
  virtualAccount!: VirtualAccountDto;
  transactionHistory!: TransactionHistoryDto[];
  pagination!: {
    page: number;
    limit: number;
    total: number;
  };
}
