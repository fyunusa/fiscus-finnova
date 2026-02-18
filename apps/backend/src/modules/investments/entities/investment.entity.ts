import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserInvestment } from './user-investment.entity';
import {
  InvestmentTypeEnum,
  InvestmentStatusEnum,
  RiskLevelEnum,
} from '../../../common/enums/investment.enum';

@Entity('investments')
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({
    type: 'enum',
    enum: InvestmentTypeEnum,
  })
  type!: InvestmentTypeEnum;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  rate!: number; // Annual interest rate (%)

  @Column()
  period!: number; // Investment period in months

  @Column({ type: 'bigint' })
  fundingGoal!: number; // Target funding amount (KRW)

  @Column({ type: 'bigint', default: 0 })
  fundingCurrent: number = 0; // Current funded amount (KRW)

  @Column({ type: 'bigint' })
  minInvestment!: number; // Minimum investment amount (KRW)

  @Column()
  borrowerType!: string; // '개인', '개인사업자', '법인', '스타트업'

  @Column({
    type: 'enum',
    enum: InvestmentStatusEnum,
  })
  status!: InvestmentStatusEnum;

  @Column({
    type: 'enum',
    enum: RiskLevelEnum,
    default: RiskLevelEnum.MEDIUM,
  })
  riskLevel!: RiskLevelEnum; // Risk level of the investment

  @Column({ nullable: true })
  badge?: string; // '인기', '신규', '고수익', '마감임박'

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Apartment-specific fields
  @Column({ nullable: true })
  propertyAddress?: string;

  @Column({ nullable: true })
  propertySize?: string; // "84㎡"

  @Column({ nullable: true })
  buildYear?: number;

  @Column({ type: 'bigint', nullable: true })
  kbValuation?: number; // KB property valuation

  @Column({ type: 'bigint', nullable: true })
  currentLien?: number; // Existing lien on property

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ltv?: number; // Loan-to-Value ratio (%)

  // Credit Card fields
  @Column({ nullable: true })
  merchantName?: string;

  @Column({ nullable: true })
  merchantCategory?: string;

  @Column({ type: 'bigint', nullable: true })
  outstandingAmount?: number;

  // Business Loan fields
  @Column({ nullable: true })
  businessName?: string;

  @Column({ nullable: true })
  businessCategory?: string;

  @Column({ type: 'bigint', nullable: true })
  annualRevenue?: number;

  // Tracking fields
  @Column({ type: 'int', default: 0 })
  investorCount: number = 0; // Number of investors

  @Column({ type: 'timestamp', nullable: true })
  fundingStartDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  fundingEndDate?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ default: true })
  isActive: boolean = true;

  // Relations
  @OneToMany(() => UserInvestment, (userInv) => userInv.investment, {
    cascade: true,
  })
  userInvestments!: UserInvestment[];
}
