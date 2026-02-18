import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';
import { InvestmentsService } from '../services/investments.service';
import { ResponseDto } from '@common/dtos/response.dto';
import { generateSuccessResponse } from '@common/helpers/response.helper';
import { handleStandardException } from '@common/helpers/exception.helper';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { GetUser } from '@common/decorators/get-user.decorator';
import { User } from '@modules/users/entities/user.entity';
import {
  InvestmentSummaryDto,
  RepaymentStatusDto,
  InvestmentHistoryDto,
} from '../dtos/dashboard.dto';
import { InvestmentResponseDto } from '../dtos/investment-response.dto';
import { UserInvestmentStatusEnum } from '@common/enums/investment.enum';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly investmentsService: InvestmentsService,
  ) {}

  /**
   * Get investment summary (total investments, earnings, in progress, monthly profits)
   */
  @Get('investments/summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get investment summary for dashboard' })
  @ApiResponse({ status: 200, description: 'Investment summary retrieved' })
  async getInvestmentSummary(@GetUser() user: User): Promise<ResponseDto<InvestmentSummaryDto>> {
    try {
      const summary = await this.dashboardService.getInvestmentSummary(user.id);
      return generateSuccessResponse('Investment summary retrieved successfully', summary);
    } catch (error) {
      handleStandardException(error, 'Failed to fetch investment summary');
    }
  }

  /**
   * Get repayment status (scheduled payments & repayment history)
   */
  @Get('investments/repayment-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get repayment status' })
  @ApiResponse({ status: 200, description: 'Repayment status retrieved' })
  async getRepaymentStatus(@GetUser() user: User): Promise<ResponseDto<RepaymentStatusDto>> {
    try {
      const status = await this.dashboardService.getRepaymentStatus(user.id);
      return generateSuccessResponse('Repayment status retrieved successfully', status);
    } catch (error) {
      handleStandardException(error, 'Failed to fetch repayment status');
    }
  }

  /**
   * Get investment history with filters
   */
  @Get('investments/history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get investment history with filters' })
  @ApiResponse({ status: 200, description: 'Investment history retrieved' })
  async getInvestmentHistory(
    @GetUser() user: User,
    @Query('status') status?: UserInvestmentStatusEnum,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<ResponseDto<InvestmentHistoryDto>> {
    try {
      const filters = {
        status: status as UserInvestmentStatusEnum,
        type,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      };

      const history = await this.dashboardService.getInvestmentHistory(
        user.id,
        filters,
        parseInt(page, 10),
        parseInt(limit, 10),
      );

      return generateSuccessResponse('Investment history retrieved successfully', history);
    } catch (error) {
      handleStandardException(error, 'Failed to fetch investment history');
    }
  }

  /**
   * Get user's favorite investments (for Favorites tab on dashboard)
   */
  @Get('investments/favorites')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user favorite investments' })
  @ApiResponse({ status: 200, description: 'Favorite investments retrieved' })
  async getFavoriteInvestments(
    @GetUser() user: User,
  ): Promise<ResponseDto<InvestmentResponseDto[]>> {
    try {
      const favorites = await this.investmentsService.getUserFavorites(user.id);
      return generateSuccessResponse('Favorite investments retrieved successfully', favorites);
    } catch (error) {
      handleStandardException(error, 'Failed to fetch favorite investments');
    }
  }
}
