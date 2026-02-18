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
import { User } from './user.entity';
import { BankAccountStatus } from '../enums/bank-account.enum';

@Entity('bank_accounts')
@Index(['userId'])
@Index(['userId', 'isDefault'])
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 10 })
  bankCode!: string;

  @Column({ type: 'varchar', length: 255 })
  accountNumber!: string; // Should be encrypted in production

  @Column({ type: 'varchar', length: 255 })
  accountHolder!: string;

  @Column({
    type: 'enum',
    enum: BankAccountStatus,
    default: BankAccountStatus.PENDING,
  })
  status!: BankAccountStatus;

  @Column({ type: 'boolean', default: false })
  isDefault!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
