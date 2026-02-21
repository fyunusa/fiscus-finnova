import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { GetUser } from '@common/decorators/get-user.decorator';
import { User } from '@modules/users/entities/user.entity';
import { ResponseDto } from '@common/dtos/response.dto';
import { generateSuccessResponse } from '@common/helpers/response.helper';
import { handleStandardException } from '@common/helpers/exception.helper';
import { DepositsService } from '../services/deposits.service';
import {
  InitiateDepositPaymentDto,
  ConfirmDepositPaymentDto,
  InitiateDepositPaymentResponse,
  ConfirmDepositPaymentResponse,
} from '../dtos';

@ApiTags('Deposits')
@Controller('deposits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  /**
   * Initiate deposit payment via Toss card payment
   * Returns checkout URL for user to complete payment
   */
  @Post('initiate-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate deposit payment via Toss Payments' })
  @ApiResponse({ status: 200, description: 'Deposit payment initiated' })
  async initiateDepositPayment(
    @GetUser() user: User,
    @Body() dto: InitiateDepositPaymentDto,
  ): Promise<ResponseDto<InitiateDepositPaymentResponse>> {
    try {
      const result = await this.depositsService.initiateDepositPayment(user, dto);
      return generateSuccessResponse('입금 요청 생성 완료', result);
    } catch (error) {
      handleStandardException(error, '입금 요청 생성 실패');
    }
  }

  /**
   * Confirm deposit payment after user completes Toss checkout
   * Credits user's virtual account with deposit amount
   */
  @Post('confirm-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm deposit payment' })
  @ApiResponse({ status: 200, description: 'Deposit payment confirmed' })
  async confirmDepositPayment(
    @GetUser() user: User,
    @Body() dto: ConfirmDepositPaymentDto,
  ): Promise<ResponseDto<ConfirmDepositPaymentResponse>> {
    try {
      const result = await this.depositsService.confirmDepositPayment(user, dto);
      return generateSuccessResponse('입금 완료', result);
    } catch (error) {
      handleStandardException(error, '입금 처리 실패');
    }
  }

  /**
   * Get deposit payment status
   */
  @Get('payment-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get deposit payment status' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved' })
  async getPaymentStatus(
    @Query('orderId') orderId: string,
  ): Promise<ResponseDto<{ status: string; amount?: number; message?: string }>> {
    try {
      const result = await this.depositsService.getDepositPaymentStatus(orderId);
      return generateSuccessResponse('결제 상태 조회 완료', result);
    } catch (error) {
      handleStandardException(error, '결제 상태 조회 실패');
    }
  }
}
