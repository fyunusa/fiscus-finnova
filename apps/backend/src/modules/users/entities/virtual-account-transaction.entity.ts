import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { VirtualAccount } from './virtual-account.entity';
import { TransactionType, TransactionStatus } from '../enums/virtual-account.enum';

@Entity('virtual_account_transactions')
@Index(['virtualAccountId', 'createdAt'])
@Index(['virtualAccountId', 'status'])
export class VirtualAccountTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => VirtualAccount, (account) => account.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'virtualAccountId' })
  virtualAccount!: VirtualAccount;

  @Column({ type: 'uuid' })
  virtualAccountId!: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type!: TransactionType;

  @Column({ type: 'bigint' })
  amount!: number; // in KRW

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({ type: 'bigint' })
  balanceBefore!: number;

  @Column({ type: 'bigint' })
  balanceAfter!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceNumber?: string; // Bank transfer reference, check number, etc.

  @Column({ type: 'varchar', length: 255, nullable: true })
  relatedParty?: string; // Bank account number, merchant name, etc.

  @Column({ type: 'varchar', length: 50, nullable: true })
  bankCode?: string;

  @Column({ type: 'text', nullable: true })
  metadata?: string; // JSON string for extra data

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt?: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  failureReason?: string;
}
