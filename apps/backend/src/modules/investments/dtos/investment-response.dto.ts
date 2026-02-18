import {
  InvestmentTypeEnum,
  InvestmentStatusEnum,
  UserInvestmentStatusEnum,
  RiskLevelEnum,
} from '@common/enums/investment.enum';

export class InvestmentResponseDto {
  // Basic fields
  id!: string;
  title!: string;
  type!: InvestmentTypeEnum;
  rate!: number;
  period!: number;
  fundingGoal!: number;
  fundingCurrent!: number;
  fundingPercent!: number;
  minInvestment!: number;
  borrowerType!: string;
  status!: InvestmentStatusEnum;
  riskLevel!: RiskLevelEnum;
  badge?: string;
  description?: string;
  investorCount!: number;

  // Apartment fields (optional)
  propertyAddress?: string;
  propertySize?: string;
  buildYear?: number;
  kbValuation?: number;
  currentLien?: number;
  ltv?: number;

  // Credit Card fields (optional)
  merchantName?: string;
  merchantCategory?: string;
  outstandingAmount?: number;

  // Business Loan fields (optional)
  businessName?: string;
  businessCategory?: string;
  annualRevenue?: number;

  // Tracking fields (optional)
  fundingStartDate?: Date;
  fundingEndDate?: Date;
  createdAt!: Date;
  updatedAt!: Date;
  isActive!: boolean;
}

export class UserInvestmentResponseDto {
  id!: string;
  userId!: string;
  investmentId!: string;
  investment?: InvestmentResponseDto;
  investmentAmount!: number;
  investmentCount!: number;
  status!: UserInvestmentStatusEnum;
  expectedRate!: number;
  investmentPeriodMonths!: number;
  expectedMaturityDate?: Date;
  notes?: string;
  createdAt!: Date;
  confirmedAt?: Date;
  completedAt?: Date;
}
