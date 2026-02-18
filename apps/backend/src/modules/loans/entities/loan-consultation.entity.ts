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
import { User } from '@modules/users/entities/user.entity';
import { ConsultationStatus } from '../enums/loan.enum';

@Entity('loan_consultations')
@Index(['email'])
@Index(['status'])
@Index(['createdAt'])
export class LoanConsultation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null = null; // For authenticated users

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User | null = null;

  // Personal Information
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'varchar', length: 100 })
  email!: string;

  // Consultation Details
  @Column({ type: 'varchar', length: 100, nullable: true })
  loanType: string | null = null; // 'apartment', 'business', etc.

  @Column({ type: 'bigint', nullable: true })
  requestedAmount: number | null = null; // Requested loan amount (원)

  @Column({ type: 'varchar', length: 100, nullable: true })
  propertyType: string | null = null; // 'apartment', 'building', etc.

  @Column({ type: 'varchar', length: 255, nullable: true })
  purpose: string | null = null; // Purpose of loan

  @Column({ type: 'text', nullable: true })
  message: string | null = null; // Consultation message

  // Status Management
  @Column({ type: 'enum', enum: ConsultationStatus, default: ConsultationStatus.NEW })
  status: ConsultationStatus = ConsultationStatus.NEW;

  @Column({ type: 'uuid', nullable: true })
  assignedOffer: string | null = null; // Assigned staff member (Admin User ID)

  @Column({ type: 'timestamp', nullable: true })
  contactedAt: Date | null = null; // When staff first contacted

  @Column({ type: 'text', nullable: true })
  responseNote: string | null = null; // Response/feedback from staff

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
