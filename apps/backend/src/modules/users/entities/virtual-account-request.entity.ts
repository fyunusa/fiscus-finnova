import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { VirtualAccount } from './virtual-account.entity';

export enum VirtualAccountRequestStatus {
  PENDING = 'PENDING', // Awaiting user to complete checkout
  COMPLETED = 'COMPLETED', // Account created after user completed payment
  EXPIRED = 'EXPIRED', // Request expired without completion
  CANCELLED = 'CANCELLED', // User cancelled the request
}

/**
 * Tracks pending virtual account creation requests with Toss Payments
 * Stores checkout URL and payment key until user completes the payment flow
 */
@Entity('virtual_account_requests')
@Index(['userId'], { unique: false })
@Index(['paymentKey'], { unique: true })
export class VirtualAccountRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 100 })
  paymentKey!: string; // Toss payment key

  @Column({ type: 'varchar', length: 100 })
  orderId!: string; // Unique order ID

  @Column({ type: 'text' })
  checkoutUrl!: string; // URL for user to complete payment

  @Column({
    type: 'enum',
    enum: VirtualAccountRequestStatus,
    default: VirtualAccountRequestStatus.PENDING,
  })
  status!: VirtualAccountRequestStatus;

  @Column({ type: 'bigint' })
  amount!: number; // Amount in KRW

  @Column({ type: 'bigint', default: 365 })
  expireDays!: number; // Account expiration in days

  @OneToOne(() => VirtualAccount, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'virtualAccountId' })
  virtualAccount?: VirtualAccount;

  @Column({ type: 'uuid', nullable: true })
  virtualAccountId?: string; // Once created, link to actual account

  @Column({ type: 'text', nullable: true })
  apiResponse?: string; // Store full Toss API response as JSON

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date; // When user completed the checkout
}
