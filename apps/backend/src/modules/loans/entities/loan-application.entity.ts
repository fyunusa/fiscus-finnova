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
import { LoanProduct } from './loan-product.entity';
import { LoanApplicationDocument } from './loan-application-document.entity';
import { LoanApplicationStatus, CollateralType } from '../enums/loan.enum';

@Entity('loan_applications')
@Index(['userId'])
@Index(['loanProductId'])
@Index(['status'])
@Index(['applicationNo'], { unique: true })
export class LoanApplication {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  applicationNo!: string;

  // Relationships
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => LoanProduct)
  @JoinColumn({ name: 'loanProductId' })
  loanProduct!: LoanProduct;

  @Column({ type: 'uuid' })
  loanProductId!: string;

  // Loan Request Details
  @Column({ type: 'bigint' })
  requestedLoanAmount!: number; // 신청 대출액 (원)

  @Column({ type: 'bigint', nullable: true })
  approvedLoanAmount: number | null = null; // 승인 대출액 (원)

  @Column({ type: 'float', nullable: true })
  approvedInterestRate: number | null = null; // 승인 금리 (연 %)

  @Column({ type: 'int', nullable: true })
  approvedLoanPeriod: number | null = null; // 승인 대출 기간 (개월)

  // Collateral Information
  @Column({ type: 'enum', enum: CollateralType })
  collateralType!: CollateralType;

  @Column({ type: 'bigint' })
  collateralValue!: number; // 담보 평가액 (원)

  @Column({ type: 'varchar', length: 500 })
  collateralAddress!: string; // 담보 소재지

  @Column({ type: 'text', nullable: true })
  collateralDetails: string | null = null; // 담보 상세정보

  // Application Status
  @Column({ type: 'enum', enum: LoanApplicationStatus, default: LoanApplicationStatus.PENDING })
  status: LoanApplicationStatus = LoanApplicationStatus.PENDING;

  @Column({ type: 'json', nullable: true })
  statusHistory: Array<{
    status: string;
    date: Date;
    note?: string;
  }> | null = null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null = null; // 거절 사유

  // Documents
  @OneToMany(() => LoanApplicationDocument, (doc) => doc.application, { eager: true, cascade: true })
  documents!: LoanApplicationDocument[];

  // Notes & Comments
  @Column({ type: 'text', nullable: true })
  applicantNotes: string | null = null; // 신청자 메모

  @Column({ type: 'text', nullable: true })
  reviewerNotes: string | null = null; // 심사자 메모

  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string | null = null; // 심사자 (Admin User ID)

  // Dates
  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date | null = null; // 제출 시간

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null = null; // 승인 시간

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date | null = null; // 거절 시간

  @Column({ type: 'timestamp', nullable: true })
  disbursedAt: Date | null = null; // 지급 시간

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
