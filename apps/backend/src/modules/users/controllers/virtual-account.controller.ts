import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VirtualAccountService } from '../services/virtual-account.service';
import {
  CreateDepositDto,
  CreateWithdrawalDto,
  VirtualAccountResponseDto,
  VirtualAccountInfoDto,
  DepositHistoryResponseDto,
} from '../dtos/virtual-account.dto';
import { ResponseDto } from '@common/dtos/response.dto';
import { generateSuccessResponse } from '@common/helpers/response.helper';
import { handleStandardException } from '@common/helpers/exception.helper';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { GetUser } from '@common/decorators/get-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('Virtual Accounts')
@Controller('virtual-accounts')
export class VirtualAccountController {
  constructor(private readonly virtualAccountService: VirtualAccountService) {}

  /**
   * Get user's virtual account
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user virtual account' })
  @ApiResponse({ status: 200, description: 'Virtual account retrieved' })
  async getVirtualAccount(@GetUser() user: User): Promise<ResponseDto> {
    try {
      const result = await this.virtualAccountService.getVirtualAccount(user.id);
      return generateSuccessResponse('Virtual account retrieved', result);
    } catch (error) {
      handleStandardException(error, 'Failed to retrieve virtual account');
    }
  }

  /**
   * Get virtual account info (for dashboard)
   */
  @Get('info')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get virtual account info for dashboard' })
  @ApiResponse({ status: 200, description: 'Virtual account info retrieved' })
  async getVirtualAccountInfo(@GetUser() user: User): Promise<ResponseDto> {
    try {
      const result = await this.virtualAccountService.getVirtualAccountInfo(user.id);
      return generateSuccessResponse('Virtual account info retrieved', result);
    } catch (error) {
      handleStandardException(error, 'Failed to retrieve virtual account info');
    }
  }

  /**
   * Get transaction history
   */
  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get deposit/withdrawal history' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved' })
  async getTransactionHistory(
    @GetUser() user: User,
  ): Promise<ResponseDto> {
    try {
      const result = await this.virtualAccountService.getTransactionHistory(user.id);
      return generateSuccessResponse('Transactions retrieved', result);
    } catch (error) {
      handleStandardException(error, 'Failed to retrieve transactions');
    }
  }

  /**
   * Record a deposit
   */
  @Post('deposit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a deposit' })
  @ApiResponse({ status: 201, description: 'Deposit recorded' })
  async recordDeposit(
    @GetUser() user: User,
    @Body() depositDto: CreateDepositDto,
  ): Promise<ResponseDto> {
    try {
      const result = await this.virtualAccountService.recordDeposit(user.id, depositDto);
      return generateSuccessResponse('Deposit recorded', result);
    } catch (error) {
      handleStandardException(error, 'Failed to record deposit');
    }
  }

  /**
   * Record a withdrawal
   */
  @Post('withdraw')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a withdrawal' })
  @ApiResponse({ status: 201, description: 'Withdrawal recorded' })
  async recordWithdrawal(
    @GetUser() user: User,
    @Body() withdrawalDto: CreateWithdrawalDto,
  ): Promise<ResponseDto> {
    try {
      const result = await this.virtualAccountService.recordWithdrawal(user.id, withdrawalDto);
      return generateSuccessResponse('Withdrawal recorded', result);
    } catch (error) {
      handleStandardException(error, 'Failed to record withdrawal');
    }
  }
}
