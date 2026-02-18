import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { VirtualAccountTransaction } from './virtual-account-transaction.entity';
import { VirtualAccountStatus } from '../enums/virtual-account.enum';

@Entity('virtual_accounts')
@Index(['userId'], { unique: true })
export class VirtualAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  accountNumber!: string; // Virtual account number

  @Column({ type: 'varchar', length: 100, default: 'Fiscus Investment Account' })
  accountName!: string;

  @Column({
    type: 'enum',
    enum: VirtualAccountStatus,
    default: VirtualAccountStatus.ACTIVE,
  })
  status!: VirtualAccountStatus;

  @Column({ type: 'bigint', default: 0 })
  availableBalance!: number; // in KRW

  @Column({ type: 'bigint', default: 0 })
  totalDeposited!: number; // Total amount deposited

  @Column({ type: 'bigint', default: 0 })
  totalWithdrawn!: number; // Total amount withdrawn

  @Column({ type: 'bigint', default: 0 })
  frozenBalance!: number; // Balance held for ongoing investments

  @Column({ type: 'varchar', length: 255, nullable: true })
  bankCode?: string; // If linked to actual bank

  @Column({ type: 'varchar', length: 100, nullable: true })
  bankName?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastTransactionAt?: Date;

  // Relations
  @OneToMany(() => VirtualAccountTransaction, (transaction) => transaction.virtualAccount, { lazy: true })
  transactions!: VirtualAccountTransaction[];
}
