import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('password_reset_otps')
export class PasswordResetOTP {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true })
  user!: User;

  @Column()
  email!: string;

  @Column()
  otp!: string; // 6-digit code

  @Column()
  expiresAt!: Date;

  @Column({ default: false })
  used: boolean = false;

  @CreateDateColumn()
  createdAt!: Date;
}
