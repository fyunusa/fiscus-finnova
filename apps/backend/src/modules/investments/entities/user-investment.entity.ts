import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Investment } from './investment.entity';
import { UserInvestmentStatusEnum } from '../../../common/enums/investment.enum';

@Entity('user_investments')
@Index(['userId', 'investmentId'], { unique: true })
@Index(['userId', 'createdAt'])
export class UserInvestment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  investmentId!: string;

  @Column({ type: 'bigint' })
  investmentAmount!: number; // Amount invested in KRW

  @Column({ type: 'int' })
  investmentCount!: number; // Number of investment units

  @Column({
    type: 'enum',
    enum: UserInvestmentStatusEnum,
    default: UserInvestmentStatusEnum.PENDING,
  })
  status: UserInvestmentStatusEnum = UserInvestmentStatusEnum.PENDING;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  expectedRate!: number; // Expected annual rate at time of investment

  @Column({ type: 'int' })
  investmentPeriodMonths!: number; // Period in months at time of investment

  @Column({ type: 'timestamp', nullable: true })
  expectedMaturityDate?: Date; // When this investment is expected to mature

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Investment, (investment) => investment.userInvestments, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'investmentId' })
  investment!: Investment;
}
