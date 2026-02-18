import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  IsNull,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PhoneVerificationPurpose } from '../../users/enums/user.enum';

@Entity('phone_verifications')
@Index(['phoneNumber', 'purpose', 'verifiedAt'])
export class PhoneVerification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  user?: User;

  @Column()
  phoneNumber!: string; // Phone number being verified

  @Column()
  code!: string; // 6-digit verification code

  @Column({ type: 'enum', enum: PhoneVerificationPurpose })
  purpose!: PhoneVerificationPurpose;

  @Column()
  expiresAt!: Date; // When code expires

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date; // When verified successfully

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
