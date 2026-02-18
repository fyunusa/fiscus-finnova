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
import { KYCDocumentType, KYCDocumentStatus } from '../enums/kyc-document.enum';

@Entity('kyc_documents')
@Index(['userId'])
@Index(['userId', 'documentType'])
export class KYCDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 50 })
  documentType!: string;

  @Column({ type: 'text' })
  documentUrl!: string; // Path or URL to uploaded document

  @Column({
    type: 'enum',
    enum: KYCDocumentStatus,
    default: KYCDocumentStatus.PENDING,
  })
  status!: KYCDocumentStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string; // Reason if admin rejects

  @Column({ type: 'varchar', length: 255, nullable: true })
  adminReviewedBy?: string; // Admin user ID who reviewed

  @Column({ type: 'timestamp', nullable: true })
  adminReviewedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
