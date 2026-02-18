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

@Entity('user_favorite_investments')
@Index(['userId', 'investmentId'], { unique: true })
export class UserFavoriteInvestment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  investmentId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Investment, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'investmentId' })
  investment!: Investment;
}
