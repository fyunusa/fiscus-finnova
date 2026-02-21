import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { Inquiry } from './inquiry.entity';

@Entity('inquiry_comments')
export class InquiryComment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ default: false })
  isAdminReply: boolean = false;

  @ManyToOne(() => Inquiry, (inquiry) => inquiry.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inquiryId' })
  inquiry!: Inquiry;

  @Column()
  inquiryId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
