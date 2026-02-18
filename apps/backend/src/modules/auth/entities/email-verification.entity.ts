import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EmailVerificationPurpose } from '../../users/enums/user.enum';

@Entity('email_verifications')
@Index(['email', 'purpose', 'verifiedAt'])
export class EmailVerification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  user?: User;

  @Column()
  email!: string; // Email being verified

  @Column()
  code!: string; // 6-digit or token code

  @Column({ type: 'enum', enum: EmailVerificationPurpose })
  purpose!: EmailVerificationPurpose;

  @Column()
  expiresAt!: Date; // When code expires

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date; // When verified successfully

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
