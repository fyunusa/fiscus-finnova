import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { InquiryComment } from './inquiry-comment.entity';
import {
  InquiryCategoryEnum,
  InquiryStatusEnum,
  InquiryPriorityEnum,
} from '@common/enums/inquiry.enum';

@Entity('inquiries')
export class Inquiry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  subject!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({
    type: 'enum',
    enum: InquiryCategoryEnum,
    default: InquiryCategoryEnum.OTHER,
  })
  category!: InquiryCategoryEnum;

  @Column({
    type: 'enum',
    enum: InquiryStatusEnum,
    default: InquiryStatusEnum.OPEN,
  })
  status!: InquiryStatusEnum;

  @Column({
    type: 'enum',
    enum: InquiryPriorityEnum,
    default: InquiryPriorityEnum.MEDIUM,
  })
  priority!: InquiryPriorityEnum;

  @Column({ type: 'int', default: 0 })
  repliesCount: number = 0;

  @Column({ type: 'timestamp', nullable: true })
  lastReplyAt?: Date;

  @Column({ nullable: true })
  lastReplyBy?: string; // e.g. '담당자' or '자동'

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @OneToMany(() => InquiryComment, (comment) => comment.inquiry, {
    cascade: true,
  })
  comments!: InquiryComment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
