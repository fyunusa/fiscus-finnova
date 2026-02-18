import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from '../entities/investment.entity';
import { UserInvestment } from '../entities/user-investment.entity';
import {
  InvestmentSummaryDto,
  RepaymentStatusDto,
  ScheduledPaymentDto,
  RepaymentHistoryDto,
  InvestmentHistoryDto,
  InvestmentHistoryItemDto,
} from '../dtos/dashboard.dto';
import { UserInvestmentStatusEnum } from '@common/enums/investment.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(UserInvestment)
    private readonly userInvestmentRepository: Repository<UserInvestment>,
    @InjectRepository(Investment)
    private readonly investmentRepository: Repository<Investment>,
  ) {}

  /**
   * Get investment summary for dashboard
   */
  async getInvestmentSummary(userId: string): Promise<InvestmentSummaryDto> {
    const userInvestments = await this.userInvestmentRepository.find({
      where: { userId },
      relations: ['investment'],
    });

    if (!userInvestments.length) {
      return {
        totalInvestments: 0,
        numberOfInvestments: 0,
        totalEarnings: 0,
        investmentsInProgress: 0,
        estimatedMonthlyProfit: 0,
      };
    }

    const totalInvestments = userInvestments.reduce((sum, ui) => sum + ui.investmentAmount, 0);
    const numberOfInvestments = userInvestments.length;

    // Calculate total earnings from completed investments
    const totalEarnings = userInvestments.reduce((sum, ui) => {
      if (ui.status === UserInvestmentStatusEnum.COMPLETED) {
        const earnings = (ui.investmentAmount * ui.expectedRate * ui.investmentPeriodMonths) / (100 * 12);
        return sum + earnings;
      }
      return sum;
    }, 0);

    // Count investments in progress
    const investmentsInProgress = userInvestments.filter(
      (ui) => ui.status === UserInvestmentStatusEnum.CONFIRMED || ui.status === UserInvestmentStatusEnum.PENDING,
    ).length;

    // Calculate estimated monthly profit
    const estimatedMonthlyProfit = userInvestments.reduce((sum, ui) => {
      if (ui.status === UserInvestmentStatusEnum.CONFIRMED) {
        // Calculate total expected earnings
        const totalEarnings = (ui.investmentAmount * ui.expectedRate * ui.investmentPeriodMonths) / (100 * 12);
        // Divide by actual period to get monthly average
        const monthlyEarning = totalEarnings / ui.investmentPeriodMonths;
        return sum + monthlyEarning;
      }
      return sum;
    }, 0);

    return {
      totalInvestments,
      numberOfInvestments,
      totalEarnings: Math.floor(totalEarnings),
      investmentsInProgress,
      estimatedMonthlyProfit: Math.floor(estimatedMonthlyProfit),
    };
  }

  /**
   * Get repayment status
   */
  async getRepaymentStatus(userId: string): Promise<RepaymentStatusDto> {
    const userInvestments = await this.userInvestmentRepository.find({
      where: { userId },
      relations: ['investment'],
    });

    const scheduledPayments: ScheduledPaymentDto[] = [];
    const repaymentHistory: RepaymentHistoryDto[] = [];
    let upcomingPaymentAmount = 0;

    for (const ui of userInvestments) {
      if (ui.status === UserInvestmentStatusEnum.CONFIRMED && ui.expectedMaturityDate) {
        const expectedEarnings = (ui.investmentAmount * ui.expectedRate * ui.investmentPeriodMonths) / (100 * 12);
        const isOverdue = new Date(ui.expectedMaturityDate) < new Date();

        scheduledPayments.push({
          id: ui.id,
          investmentTitle: ui.investment?.title || 'Unknown Investment',
          dueDate: ui.expectedMaturityDate,
          expectedAmount: Math.floor(expectedEarnings),
          investmentAmount: ui.investmentAmount,
          rate: ui.expectedRate,
          status: isOverdue ? 'overdue' : 'pending',
        });

        if (!isOverdue) {
          upcomingPaymentAmount += expectedEarnings;
        }
      }

      if (ui.status === UserInvestmentStatusEnum.COMPLETED && ui.completedAt) {
        const earnings = (ui.investmentAmount * ui.expectedRate * ui.investmentPeriodMonths) / (100 * 12);
        repaymentHistory.push({
          id: ui.id,
          investmentTitle: ui.investment?.title || 'Unknown Investment',
          repaymentDate: ui.completedAt,
          amount: Math.floor(earnings),
          investmentAmount: ui.investmentAmount,
          rate: ui.expectedRate,
          status: 'completed',
        });
      }
    }

    return {
      scheduledPayments,
      repaymentHistory,
      upcomingPaymentAmount: Math.floor(upcomingPaymentAmount),
    };
  }

  /**
   * Get investment history with filters
   */
  async getInvestmentHistory(
    userId: string,
    filters?: {
      status?: UserInvestmentStatusEnum;
      startDate?: Date;
      endDate?: Date;
      type?: string;
    },
    page: number = 1,
    limit: number = 10,
  ): Promise<InvestmentHistoryDto> {
    let query = this.userInvestmentRepository
      .createQueryBuilder('ui')
      .leftJoinAndSelect('ui.investment', 'investment')
      .where('ui.userId = :userId', { userId });

    // Apply filters
    if (filters?.status) {
      query = query.andWhere('ui.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      query = query.andWhere('investment.type = :type', { type: filters.type });
    }

    if (filters?.startDate) {
      query = query.andWhere('ui.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query = query.andWhere('ui.createdAt <= :endDate', { endDate: filters.endDate });
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    const userInvestments = await query
      .orderBy('ui.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const items: InvestmentHistoryItemDto[] = userInvestments.map((ui) => {
      const expectedEarnings = (ui.investmentAmount * ui.expectedRate * ui.investmentPeriodMonths) / (100 * 12);
      const actualEarnings =
        ui.status === UserInvestmentStatusEnum.COMPLETED
          ? expectedEarnings * 0.846 // 15.4% tax deduction
          : undefined;

      return {
        id: ui.id,
        investmentId: ui.investmentId,
        investmentTitle: ui.investment?.title || 'Unknown Investment',
        type: ui.investment?.type || 'unknown',
        amount: ui.investmentAmount,
        rate: ui.expectedRate,
        period: ui.investmentPeriodMonths,
        investedDate: ui.createdAt,
        maturityDate: ui.expectedMaturityDate,
        status: ui.status,
        expectedEarnings: Math.floor(expectedEarnings),
        actualEarnings: actualEarnings ? Math.floor(actualEarnings) : undefined,
      };
    });

    return {
      total,
      page,
      limit,
      items,
      filters,
    };
  }
}
