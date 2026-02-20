import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
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
   * Create or get user's virtual account
   */
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create virtual account for user' })
  @ApiResponse({ status: 201, description: 'Virtual account created or retrieved' })
  async createVirtualAccount(@GetUser() user: User): Promise<ResponseDto> {
    try {
      const result = await this.virtualAccountService.createOrGetVirtualAccount(user.id);
      return generateSuccessResponse('Virtual account created or retrieved', result);
    } catch (error) {
      handleStandardException(error, 'Failed to create virtual account');
    }
  }

  /**
   * Complete virtual account creation after user finishes checkout
   * Called with the request ID to confirm account creation
   */
  @Post('complete/:requestId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete virtual account creation after checkout' })
  @ApiResponse({ status: 200, description: 'Virtual account completion status' })
  async completeVirtualAccount(
    @GetUser() user: User,
    @Param('requestId') requestId: string,
  ): Promise<ResponseDto> {
    try {
      const result = await this.virtualAccountService.completeVirtualAccountRequest(
        user.id,
        requestId,
      );
      return generateSuccessResponse('Virtual account completion status', result);
    } catch (error) {
      handleStandardException(error, 'Failed to complete virtual account');
    }
  }

  /**
   * Check status of a virtual account request
   * Returns whether account has been issued by Toss
   * If approved, updates database and returns account details
   */
  @Get('status/:requestId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Check status of virtual account request' })
  @ApiResponse({ status: 200, description: 'Virtual account request status' })
  async checkVirtualAccountStatus(
    @GetUser() user: User,
    @Param('requestId') requestId: string,
  ): Promise<ResponseDto> {
    try {
      const result = await this.virtualAccountService.checkVirtualAccountRequestStatus(
        user.id,
        requestId,
      );
      return generateSuccessResponse('Virtual account status retrieved', result);
    } catch (error) {
      handleStandardException(error, 'Failed to check virtual account status');
    }
  }

  /**
   * Get any pending virtual account request for current user
   * Returns pending request details if one exists
   */
  @Get('pending-request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get pending virtual account request' })
  @ApiResponse({ status: 200, description: 'Pending request details or null' })
  async getPendingRequest(
    @GetUser() user: User,
  ): Promise<ResponseDto> {
    try {
      const result = await this.virtualAccountService.getPendingVirtualAccountRequest(user.id);
      return generateSuccessResponse('Pending request retrieved', result);
    } catch (error) {
      handleStandardException(error, 'Failed to retrieve pending request');
    }
  }

  /**
   * Confirm virtual account payment after user completes Toss checkout
   * Attempts to confirm the payment and issue the virtual account
   */
  @Post('confirm/:requestId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm virtual account payment after checkout' })
  @ApiResponse({ status: 200, description: 'Payment confirmation status' })
  async confirmVirtualAccountPayment(
    @GetUser() user: User,
    @Param('requestId') requestId: string,
  ): Promise<ResponseDto> {
    try {
      const result = await this.virtualAccountService.confirmVirtualAccountPayment(
        user.id,
        requestId,
      );
      return generateSuccessResponse('Payment confirmation status retrieved', result);
    } catch (error) {
      handleStandardException(error, 'Failed to confirm virtual account payment');
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
