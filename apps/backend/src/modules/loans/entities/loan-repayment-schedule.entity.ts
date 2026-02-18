import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { LoanAccount } from './loan-account.entity';
import { RepaymentStatus } from '../enums/loan.enum';

@Entity('loan_repayment_schedules')
@Index(['loanAccountId'])
@Index(['month'])
@Index(['scheduledPaymentDate'])
export class LoanRepaymentSchedule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => LoanAccount, (account) => account.repaymentSchedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loanAccountId' })
  loanAccount!: LoanAccount;

  @Column({ type: 'uuid' })
  loanAccountId!: string;

  @Column({ type: 'int' })
  month!: number; // 회차 (1, 2, 3, ...)

  @Column({ type: 'timestamp' })
  scheduledPaymentDate!: Date; // 예정된 납입일

  // Amounts in KRW
  @Column({ type: 'bigint' })
  principalPayment!: number; // 원금 상환액

  @Column({ type: 'bigint' })
  interestPayment!: number; // 이자 상환액

  @Column({ type: 'bigint' })
  totalPaymentAmount!: number; // 총 납입액 (원금 + 이자)

  // Payment Status
  @Column({ type: 'enum', enum: RepaymentStatus, default: RepaymentStatus.UNPAID })
  paymentStatus: RepaymentStatus = RepaymentStatus.UNPAID;

  @Column({ type: 'timestamp', nullable: true })
  actualPaymentDate: Date | null = null; // 실제 납입일

  @Column({ type: 'bigint', nullable: true })
  actualPaidAmount: number | null = null; // 실제 납입액

  @Column({ type: 'bigint', default: 0 })
  remainingPrincipal: number = 0; // 상환 후 남은 원금

  // Late payment info
  @Column({ type: 'int', default: 0 })
  dayOverdue: number = 0; // 연체 일수

  @Column({ type: 'bigint', default: 0 })
  lateFee: number = 0; // 연체료

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
