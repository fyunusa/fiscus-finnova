import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from '../entities/investment.entity';
import { UserInvestment } from '../entities/user-investment.entity';
import { UserFavoriteInvestment } from '../entities/user-favorite-investment.entity';
import { CreateInvestmentDto } from '../dtos/create-investment.dto';
import { UpdateInvestmentDto } from '../dtos/update-investment.dto';
import { InvestmentResponseDto, UserInvestmentResponseDto } from '../dtos/investment-response.dto';
import {
  InvestmentStatusEnum,
  UserInvestmentStatusEnum,
} from '@common/enums/investment.enum';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(Investment)
    private investmentsRepository: Repository<Investment>,
    @InjectRepository(UserInvestment)
    private userInvestmentsRepository: Repository<UserInvestment>,
    @InjectRepository(UserFavoriteInvestment)
    private userFavoriteInvestmentsRepository: Repository<UserFavoriteInvestment>,
  ) {}

  /**
   * Create a new investment
   */
  async create(createInvestmentDto: CreateInvestmentDto): Promise<InvestmentResponseDto> {
    const investment = this.investmentsRepository.create(createInvestmentDto);
    const saved = await this.investmentsRepository.save(investment);
    return this.toResponseDto(saved);
  }

  /**
   * Get all investments with filtering and sorting
   */
  async findAll(filters: {
    type?: string;
    status?: string;
    sort?: 'popular' | 'new' | 'ending' | 'high';
    page?: number;
    limit?: number;
  }): Promise<{
    data: InvestmentResponseDto[];
    pagination: { page: number; limit: number; total: number };
  }> {
    let query = this.investmentsRepository.createQueryBuilder('investment');

    // Apply filters
    if (filters.type) {
      query = query.where('investment.type = :type', { type: filters.type });
    }

    if (filters.status) {
      query = query.andWhere('investment.status = :status', { status: filters.status });
    }

    // Only active investments
    query = query.andWhere('investment.isActive = :isActive', { isActive: true });

    // Count total
    const total = await query.getCount();

    // Apply sorting
    const sort = filters.sort || 'popular';
    switch (sort) {
      case 'new':
        query = query.orderBy('investment.createdAt', 'DESC');
        break;
      case 'ending':
        query = query.orderBy('investment.fundingCurrent / investment.fundingGoal', 'DESC');
        break;
      case 'high':
        query = query.orderBy('investment.rate', 'DESC');
        break;
      case 'popular':
      default:
        query = query.orderBy('investment.investorCount', 'DESC')
          .addOrderBy('investment.fundingCurrent', 'DESC');
        break;
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    query = query.skip(skip).take(limit);

    const investments = await query.getMany();
    const data = investments.map(inv => this.toResponseDto(inv));

    return {
      data,
      pagination: { page, limit, total },
    };
  }

  /**
   * Get single investment by ID
   */
  async findOne(id: string): Promise<InvestmentResponseDto> {
    const investment = await this.investmentsRepository.findOne({
      where: { id, isActive: true },
      relations: ['userInvestments'],
    });

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    return this.toResponseDto(investment);
  }

  /**
   * Update investment
   */
  async update(id: string, updateInvestmentDto: UpdateInvestmentDto): Promise<InvestmentResponseDto> {
    const investment = await this.investmentsRepository.findOne({ where: { id } });

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    Object.assign(investment, updateInvestmentDto);
    const saved = await this.investmentsRepository.save(investment);

    return this.toResponseDto(saved);
  }

  /**
   * Delete (soft delete via isActive flag)
   */
  async delete(id: string): Promise<void> {
    const investment = await this.investmentsRepository.findOne({ where: { id } });

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    investment.isActive = false;
    await this.investmentsRepository.save(investment);
  }

  /**
   * Add investment for a user
   */
  async addUserInvestment(userId: string, investmentId: string, amount: number): Promise<UserInvestmentResponseDto> {
    const investment = await this.investmentsRepository.findOne({ where: { id: investmentId } });

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    if (amount < investment.minInvestment) {
      throw new BadRequestException(
        `Investment amount must be at least ${investment.minInvestment} KRW`,
      );
    }

    // Check if user already invested in this investment
    const existing = await this.userInvestmentsRepository.findOne({
      where: { userId, investmentId },
    });

    if (existing) {
      throw new BadRequestException('User has already invested in this investment');
    }

    // Create user investment record
    const calculateCount = Math.floor(amount / 1000000); // Count by 1M units
    const userInvestment = this.userInvestmentsRepository.create({
      userId,
      investmentId,
      investmentAmount: amount,
      investmentCount: calculateCount,
      status: UserInvestmentStatusEnum.PENDING,
      expectedRate: investment.rate,
      investmentPeriodMonths: investment.period,
      expectedMaturityDate: new Date(Date.now() + investment.period * 30 * 24 * 60 * 60 * 1000),
    });

    await this.userInvestmentsRepository.save(userInvestment);

    // Update investment funding
    investment.fundingCurrent += amount;
    investment.investorCount += 1;

    // Auto-close if fully funded
    if (investment.fundingCurrent >= investment.fundingGoal) {
      investment.status = InvestmentStatusEnum.CLOSED;
    } else if (investment.status === InvestmentStatusEnum.RECRUITING) {
      investment.status = InvestmentStatusEnum.FUNDING;
    }

    await this.investmentsRepository.save(investment);

    return this.toUserInvestmentResponseDto(userInvestment);
  }

  /**
   * Get user's investments
   */
  async getUserInvestments(userId: string): Promise<UserInvestmentResponseDto[]> {
    const userInvestments = await this.userInvestmentsRepository.find({
      where: { userId },
      relations: ['investment'],
      order: { createdAt: 'DESC' },
    });

    return userInvestments.map(ui => this.toUserInvestmentResponseDto(ui));
  }

  /**
   * Get investment detail with user investments
   */
  async getInvestmentWithInvestors(id: string): Promise<{
    investment: InvestmentResponseDto;
    investors: UserInvestmentResponseDto[];
  }> {
    const investment = await this.investmentsRepository.findOne({
      where: { id },
      relations: ['userInvestments', 'userInvestments.user'],
    });

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    const investors = investment.userInvestments
      .filter(ui => ui.status !== 'failed' && ui.status !== 'cancelled')
      .map(ui => this.toUserInvestmentResponseDto(ui));

    return {
      investment: this.toResponseDto(investment),
      investors,
    };
  }

  /**
   * Update user investment status
   */
  async updateUserInvestmentStatus(
    userInvestmentId: string,
    status: UserInvestmentStatusEnum,
  ): Promise<UserInvestmentResponseDto> {
    const userInvestment = await this.userInvestmentsRepository.findOne({
      where: { id: userInvestmentId },
      relations: ['investment'],
    });

    if (!userInvestment) {
      throw new NotFoundException('User investment not found');
    }

    userInvestment.status = status;

    if (status === UserInvestmentStatusEnum.CONFIRMED) {
      userInvestment.confirmedAt = new Date();
    } else if (status === UserInvestmentStatusEnum.COMPLETED) {
      userInvestment.completedAt = new Date();
    }

    // If cancelled or failed, revert funding
    if (status === 'cancelled' || status === 'failed') {
      if (userInvestment.investment) {
        userInvestment.investment.fundingCurrent -= userInvestment.investmentAmount;
        userInvestment.investment.investorCount = Math.max(0, userInvestment.investment.investorCount - 1);
        await this.investmentsRepository.save(userInvestment.investment);
      }
    }

    await this.userInvestmentsRepository.save(userInvestment);
    return this.toUserInvestmentResponseDto(userInvestment);
  }

  /**
   * Convert Investment entity to response DTO
   */
  private toResponseDto(investment: Investment): InvestmentResponseDto {
    const fundingPercent = investment.fundingGoal > 0
      ? Math.round((investment.fundingCurrent / investment.fundingGoal) * 100)
      : 0;

    return {
      id: investment.id,
      title: investment.title,
      type: investment.type,
      rate: Number(investment.rate),
      period: investment.period,
      fundingGoal: investment.fundingGoal,
      fundingCurrent: investment.fundingCurrent,
      fundingPercent,
      minInvestment: investment.minInvestment,
      borrowerType: investment.borrowerType,
      status: investment.status,
      badge: investment.badge,
      description: investment.description,
      investorCount: investment.investorCount,
      propertyAddress: investment.propertyAddress,
      propertySize: investment.propertySize,
      buildYear: investment.buildYear,
      kbValuation: investment.kbValuation,
      currentLien: investment.currentLien,
      ltv: investment.ltv ? Number(investment.ltv) : undefined,
      merchantName: investment.merchantName,
      merchantCategory: investment.merchantCategory,
      outstandingAmount: investment.outstandingAmount,
      businessName: investment.businessName,
      businessCategory: investment.businessCategory,
      annualRevenue: investment.annualRevenue,
      fundingStartDate: investment.fundingStartDate,
      fundingEndDate: investment.fundingEndDate,
      createdAt: investment.createdAt,
      updatedAt: investment.updatedAt,
      isActive: investment.isActive,
      riskLevel: investment.riskLevel,
    };
  }

  /**
   * Convert UserInvestment entity to response DTO
   */
  private toUserInvestmentResponseDto(userInvestment: UserInvestment): UserInvestmentResponseDto {
    return {
      id: userInvestment.id,
      userId: userInvestment.userId,
      investmentId: userInvestment.investmentId,
      investmentAmount: userInvestment.investmentAmount,
      investmentCount: userInvestment.investmentCount,
      status: userInvestment.status,
      expectedRate: Number(userInvestment.expectedRate),
      investmentPeriodMonths: userInvestment.investmentPeriodMonths,
      expectedMaturityDate: userInvestment.expectedMaturityDate,
      notes: userInvestment.notes,
      createdAt: userInvestment.createdAt,
      confirmedAt: userInvestment.confirmedAt,
      completedAt: userInvestment.completedAt,
      investment: userInvestment.investment
        ? this.toResponseDto(userInvestment.investment)
        : undefined,
    };
  }

  /**
   * Add investment to user favorites
   */
  async addToFavorites(userId: string, investmentId: string): Promise<{ success: boolean }> {
    // Check if investment exists
    const investment = await this.investmentsRepository.findOne({
      where: { id: investmentId },
    });
    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    // Check if already favorited
    const existing = await this.userFavoriteInvestmentsRepository.findOne({
      where: { userId, investmentId },
    });
    if (existing) {
      throw new BadRequestException('Investment already favorited');
    }

    // Add to favorites
    const favorite = this.userFavoriteInvestmentsRepository.create({
      userId,
      investmentId,
    });
    await this.userFavoriteInvestmentsRepository.save(favorite);

    return { success: true };
  }

  /**
   * Remove investment from user favorites
   */
  async removeFromFavorites(userId: string, investmentId: string): Promise<{ success: boolean }> {
    const result = await this.userFavoriteInvestmentsRepository.delete({
      userId,
      investmentId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Favorite not found');
    }

    return { success: true };
  }

  /**
   * Get user's favorite investments
   */
  async getUserFavorites(userId: string): Promise<InvestmentResponseDto[]> {
    const favorites = await this.userFavoriteInvestmentsRepository.find({
      where: { userId },
      relations: ['investment'],
      order: { createdAt: 'DESC' },
    });

    return favorites
      .map((fav) => fav.investment)
      .filter((investment) => !!investment)
      .map((investment) => this.toResponseDto(investment));
  }

  /**
   * Check if investment is favorited by user
   */
  async isFavorited(userId: string, investmentId: string): Promise<boolean> {
    const favorite = await this.userFavoriteInvestmentsRepository.findOne({
      where: { userId, investmentId },
    });
    return !!favorite;
  }
}
