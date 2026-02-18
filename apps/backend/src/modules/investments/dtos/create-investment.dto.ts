import { IsString, IsNumber, IsEnum, IsOptional, Min, Max, IsDate } from 'class-validator';
import {
  InvestmentTypeEnum,
  InvestmentStatusEnum,
} from '@common/enums/investment.enum';

export class CreateInvestmentDto {
  @IsString()
  title!: string;

  @IsEnum(InvestmentTypeEnum)
  type!: InvestmentTypeEnum;

  @IsNumber()
  @Min(0)
  @Max(15)
  rate!: number;

  @IsNumber()
  @Min(1)
  @Max(60)
  period!: number;

  @IsNumber()
  @Min(0)
  fundingGoal!: number;

  @IsNumber()
  @Min(0)
  minInvestment!: number;

  @IsString()
  borrowerType!: string;

  @IsEnum(InvestmentStatusEnum)
  status!: InvestmentStatusEnum;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Apartment optional fields
  @IsOptional()
  @IsString()
  propertyAddress?: string;

  @IsOptional()
  @IsString()
  propertySize?: string;

  @IsOptional()
  @IsNumber()
  buildYear?: number;

  @IsOptional()
  @IsNumber()
  kbValuation?: number;

  @IsOptional()
  @IsNumber()
  currentLien?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  ltv?: number;

  // Credit Card optional fields
  @IsOptional()
  @IsString()
  merchantName?: string;

  @IsOptional()
  @IsString()
  merchantCategory?: string;

  @IsOptional()
  @IsNumber()
  outstandingAmount?: number;

  // Business Loan optional fields
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  businessCategory?: string;

  @IsOptional()
  @IsNumber()
  annualRevenue?: number;

  @IsOptional()
  @IsDate()
  fundingStartDate?: Date;

  @IsOptional()
  @IsDate()
  fundingEndDate?: Date;
}
