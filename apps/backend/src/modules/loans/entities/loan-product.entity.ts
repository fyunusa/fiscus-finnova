import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { LoanProductType, RepaymentMethod } from '../enums/loan.enum';

@Entity('loan_products')
export class LoanProduct {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: LoanProductType })
  productType!: LoanProductType;

  // LTV (Loan-to-Value) - 담보인정가율
  @Column({ type: 'float', default: 70 })
  maxLTV: number = 70;

  // Interest rates
  @Column({ type: 'float' })
  minInterestRate!: number;

  @Column({ type: 'float' })
  maxInterestRate!: number;

  // Loan amounts (in KRW)
  @Column({ type: 'bigint' })
  minLoanAmount!: number;

  @Column({ type: 'bigint' })
  maxLoanAmount!: number;

  // Loan periods (in months)
  @Column({ type: 'int' })
  minLoanPeriod!: number;

  @Column({ type: 'int' })
  maxLoanPeriod!: number;

  // Repayment method
  @Column({ type: 'enum', enum: RepaymentMethod, default: RepaymentMethod.EQUAL_PRINCIPAL_INTEREST })
  repaymentMethod: RepaymentMethod = RepaymentMethod.EQUAL_PRINCIPAL_INTEREST;

  // Status
  @Column({ type: 'boolean', default: true })
  isActive: boolean = true;

  // Documentation
  @Column({ type: 'json', nullable: true })
  requiredDocuments: string[] | null = null;

  @Column({ type: 'text', nullable: true })
  terms: string | null = null;

  @Column({ type: 'text', nullable: true })
  conditions: string | null = null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
