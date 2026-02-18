import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { LoanApplication } from './loan-application.entity';
import { DocumentType } from '../enums/loan.enum';

@Entity('loan_application_documents')
@Index(['loanApplicationId'])
export class LoanApplicationDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => LoanApplication, (application) => application.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loanApplicationId' })
  application!: LoanApplication;

  @Column({ type: 'uuid' })
  loanApplicationId!: string;

  @Column({ type: 'enum', enum: DocumentType })
  documentType!: DocumentType;

  @Column({ type: 'varchar', length: 255 })
  fileName!: string;

  @Column({ type: 'varchar', length: 500 })
  fileUrl!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fileSize: string | null = null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mimeType: string | null = null;

  @Column({ type: 'text', nullable: true })
  notes: string | null = null;

  @CreateDateColumn()
  uploadedAt!: Date;
}
