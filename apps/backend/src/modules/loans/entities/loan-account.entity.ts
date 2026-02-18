import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { LoanApplication } from './loan-application.entity';
import { LoanRepaymentSchedule } from './loan-repayment-schedule.entity';
import { LoanAccountStatus, RepaymentMethod } from '../enums/loan.enum';

@Entity('loan_accounts')
@Index(['userId'])
@Index(['loanApplicationId'])
@Index(['accountNumber'], { unique: true })
export class LoanAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  accountNumber!: string;

  // Relationships
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => LoanApplication, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'loanApplicationId' })
  loanApplication: LoanApplication | null = null;

  @Column({ type: 'uuid', nullable: true })
  loanApplicationId: string | null = null;

  @OneToMany(() => LoanRepaymentSchedule, (schedule) => schedule.loanAccount, { cascade: true })
  repaymentSchedules!: LoanRepaymentSchedule[];

  // Loan Details
  @Column({ type: 'bigint' })
  principalAmount!: number; // 대출 원금 (원)

  @Column({ type: 'float' })
  interestRate!: number; // 연이율 (%)

  @Column({ type: 'int' })
  loanPeriod!: number; // 대출 기간 (개월)

  @Column({ type: 'enum', enum: RepaymentMethod })
  repaymentMethod!: RepaymentMethod; // 상환 방식

  // Current Balance
  @Column({ type: 'bigint' })
  principalBalance!: number; // 남은 원금 (원)

  @Column({ type: 'bigint', default: 0 })
  totalInterestAccrued: number = 0; // 누적 이자액 (원)

  @Column({ type: 'bigint', default: 0 })
  totalPaid: number = 0; // 누적 상환액 (원)

  @Column({ type: 'int' })
  remainingPeriod!: number; // 남은 기간 (개월)

  @Column({ type: 'bigint' })
  nextPaymentAmount!: number; // 다음 납입액 (원)

  @Column({ type: 'timestamp' })
  nextPaymentDate!: Date; // 다음 납입일

  // Status
  @Column({ type: 'enum', enum: LoanAccountStatus, default: LoanAccountStatus.ACTIVE })
  status: LoanAccountStatus = LoanAccountStatus.ACTIVE;

  @Column({ type: 'int', default: 0 })
  overdueMonths: number = 0; // 연체 개월 수

  @Column({ type: 'bigint', default: 0 })
  overdueAmount: number = 0; // 연체 금액 (원)

  // Dates
  @Column({ type: 'timestamp' })
  startDate!: Date; // 대출 실행일

  @Column({ type: 'timestamp' })
  targetEndDate!: Date; // 대출 만기일

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date | null = null; // 폐종일

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
