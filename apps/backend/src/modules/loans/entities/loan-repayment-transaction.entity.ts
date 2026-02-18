import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { LoanAccount } from './loan-account.entity';
import { LoanRepaymentSchedule } from './loan-repayment-schedule.entity';
import { PaymentMethod } from '../enums/loan.enum';

export enum TransactionStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

@Entity('loan_repayment_transactions')
@Index(['loanAccountId'])
@Index(['scheduleId'])
@Index(['transactionNo'], { unique: true })
@Index(['paymentDate'])
export class LoanRepaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  transactionNo!: string; // 거래 번호

  @ManyToOne(() => LoanAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loanAccountId' })
  loanAccount!: LoanAccount;

  @Column({ type: 'uuid' })
  loanAccountId!: string;

  @ManyToOne(() => LoanRepaymentSchedule, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'scheduleId' })
  schedule: LoanRepaymentSchedule | null = null;

  @Column({ type: 'uuid', nullable: true })
  scheduleId: string | null = null;

  // Payment Details
  @Column({ type: 'bigint' })
  paymentAmount!: number; // 납입액 (원)

  @Column({ type: 'timestamp' })
  paymentDate!: Date; // 납입일

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod!: PaymentMethod; // 납입 방법

  // Allocation
  @Column({ type: 'bigint', default: 0 })
  principalApplied: number = 0; // 원금 적용액

  @Column({ type: 'bigint', default: 0 })
  interestApplied: number = 0; // 이자 적용액

  @Column({ type: 'bigint', default: 0 })
  penaltyApplied: number = 0; // 연체료 적용액

  @Column({ type: 'bigint', default: 0 })
  feesApplied: number = 0; // 수수료 적용액

  // Status
  @Column({ type: 'enum', enum: TransactionStatus })
  status!: TransactionStatus;

  // Reference Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  bankReference: string | null = null; // 은행 참조 번호

  @Column({ type: 'text', nullable: true })
  note: string | null = null; // 비고

  @CreateDateColumn()
  createdAt!: Date;
}
