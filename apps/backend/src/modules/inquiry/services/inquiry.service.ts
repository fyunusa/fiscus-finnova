import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry } from '../entities/inquiry.entity';
import { InquiryComment } from '../entities/inquiry-comment.entity';
import { CreateInquiryDto } from '../dtos/create-inquiry.dto';
import { UpdateInquiryDto } from '../dtos/update-inquiry.dto';
import { InquiryStatusEnum } from '@common/enums/inquiry.enum';
import { UserRole } from '@modules/users/enums/user.enum';

@Injectable()
export class InquiryService {
  constructor(
    @InjectRepository(Inquiry)
    private readonly inquiryRepo: Repository<Inquiry>,
    @InjectRepository(InquiryComment)
    private readonly commentRepo: Repository<InquiryComment>,
  ) {}

  async findAll(
    userId?: string,
    category?: string,
    status?: string,
  ): Promise<Inquiry[]> {
    const where: any = {};

    if (userId) where.userId = userId;
    if (category) where.category = category;
    if (status) where.status = status;

    return this.inquiryRepo.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Inquiry> {
    const inquiry = await this.inquiryRepo.findOne({
      where: { id },
      relations: ['comments', 'comments.user', 'user'],
    });

    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }

    return inquiry;
  }

  async create(userId: string, dto: CreateInquiryDto): Promise<Inquiry> {
    const inquiry = this.inquiryRepo.create({
      ...dto,
      userId,
    });
    return this.inquiryRepo.save(inquiry);
  }

  async update(
    id: string,
    userId: string,
    userRole: UserRole,
    dto: UpdateInquiryDto,
  ): Promise<Inquiry> {
    const inquiry = await this.findOne(id);

    // Only owner or admin can update
    if (inquiry.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only edit your own inquiries');
    }

    // Non-admin users cannot change status
    if (dto.status && userRole !== UserRole.ADMIN) {
      delete dto.status;
    }

    Object.assign(inquiry, dto);
    return this.inquiryRepo.save(inquiry);
  }

  async close(id: string): Promise<Inquiry> {
    const inquiry = await this.findOne(id);
    inquiry.status = InquiryStatusEnum.CLOSED;
    return this.inquiryRepo.save(inquiry);
  }

  async addComment(
    inquiryId: string,
    userId: string,
    content: string,
    isAdmin: boolean,
  ): Promise<InquiryComment> {
    const inquiry = await this.findOne(inquiryId);

    const comment = this.commentRepo.create({
      content,
      inquiryId,
      userId,
      isAdminReply: isAdmin,
    });

    const savedComment = await this.commentRepo.save(comment);

    // Update inquiry reply metadata
    inquiry.repliesCount += 1;
    inquiry.lastReplyAt = new Date();
    inquiry.lastReplyBy = isAdmin ? '담당자' : '사용자';

    // If admin replies, set status to pending
    if (isAdmin && inquiry.status === InquiryStatusEnum.OPEN) {
      inquiry.status = InquiryStatusEnum.PENDING;
    }

    await this.inquiryRepo.save(inquiry);

    return savedComment;
  }
}
