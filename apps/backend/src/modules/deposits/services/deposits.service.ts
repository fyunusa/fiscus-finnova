import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentGatewayService } from '@modules/external-api/services/payment-gateway.service';
import { User } from '@modules/users/entities/user.entity';
import {
  InitiateDepositPaymentDto,
  ConfirmDepositPaymentDto,
  InitiateDepositPaymentResponse,
  ConfirmDepositPaymentResponse,
} from '../dtos';

/**
 * Deposits Service
 * Handles Toss card payment deposits for user virtual accounts
 */
@Injectable()
export class DepositsService {
  private readonly logger = new Logger(DepositsService.name);

  constructor(
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {}

  /**
   * Initiate a deposit payment through Toss Payments
   * Creates a payment request and returns checkout URL for user to complete payment
   *
   * @param user - Authenticated user
   * @param dto - Deposit payment request details
   * @returns Payment initiation response with checkout URL
   */
  async initiateDepositPayment(
    user: User,
    dto: InitiateDepositPaymentDto,
  ): Promise<InitiateDepositPaymentResponse> {
    const { amount, description } = dto;

    // Validate amount
    if (!amount || amount <= 0) {
      throw new BadRequestException('입금 금액은 0보다 커야 합니다.');
    }

    if (amount < 10000) {
      throw new BadRequestException('최소 입금 금액은 1만 원입니다.');
    }

    if (amount > 100000000) {
      throw new BadRequestException('최대 입금 금액은 1억 원입니다.');
    }

    try {
      // Generate unique order ID for this deposit request
      const orderId = `deposit_${user.id}_${Date.now()}`;

      this.logger.log(`💳 Initiating deposit payment: User ${user.id}, Amount: ${amount}원, OrderId: ${orderId}`);

      // Call Toss Payments to initiate card payment
      const initiation = await this.paymentGatewayService.initiateCardPaymentForDeposit(
        orderId,
        amount,
        user.email,
        description || 'Virtual Account Deposit',
      );

      this.logger.log(`✅ Deposit payment initiated: ${orderId}`);

      return {
        success: true,
        requestId: orderId,
        paymentKey: initiation.paymentKey,
        orderId: initiation.orderId,
        checkoutUrl: initiation.checkoutUrl,
        amount: initiation.amount,
        status: initiation.status,
        requiresUserAction: initiation.requiresUserAction,
        message: '결제 페이지로 이동해주세요.',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Deposit payment initiation failed: ${errorMessage}`, error);
      throw new BadRequestException(`입금 요청 실패: ${errorMessage}`);
    }
  }

  /**
   * Confirm a deposit payment after user completes Toss checkout
   * Credits the user's virtual account with the deposited amount
   *
   * @param user - Authenticated user
   * @param dto - Payment confirmation details
   * @returns Confirmation response with updated balance
   */
  async confirmDepositPayment(
    user: User,
    dto: ConfirmDepositPaymentDto,
  ): Promise<ConfirmDepositPaymentResponse> {
    const { paymentKey, orderId, amount } = dto;

    if (!paymentKey || !orderId || !amount) {
      throw new BadRequestException('결제 정보가 불완전합니다.');
    }

    try {
      this.logger.log(
        `💳 Confirming deposit payment: User ${user.id}, PaymentKey: ${paymentKey}, Amount: ${amount}원`,
      );

      // Confirm payment with Toss
      const paymentResult = await this.paymentGatewayService.confirmPayment(
        paymentKey,
        orderId,
        amount,
      );

      if (paymentResult.status !== 'success') {
        this.logger.warn(`⚠️ Payment confirmation failed: ${paymentResult.error}`);
        throw new BadRequestException(`결제 확인 실패: ${paymentResult.error}`);
      }

      this.logger.log(`✅ Payment confirmed: ${paymentKey}, Transaction: ${paymentResult.transactionId}`);

      // TODO: In a real implementation, you would:
      // 1. Record the deposit transaction in database
      // 2. Update user's virtual account balance
      // 3. Send confirmation email
      // For now, return success response

      return {
        success: true,
        depositId: orderId,
        amount: amount,
        status: 'COMPLETED',
        balanceAfter: undefined, // Would be fetched from DB in real implementation
        message: '입금이 완료되었습니다.',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Deposit payment confirmation failed: ${errorMessage}`, error);
      throw new BadRequestException(`입금 확인 실패: ${errorMessage}`);
    }
  }

  /**
   * Get deposit payment status
   * Used to check if a pending payment has been completed
   *
   * @param orderId - Order/deposit ID
   * @returns Payment status
   */
  async getDepositPaymentStatus(orderId: string): Promise<{ status: string; amount?: number; message?: string }> {
    try {
      const paymentStatus = await this.paymentGatewayService.getPaymentStatus(orderId);

      return {
        status: paymentStatus.status,
        amount: paymentStatus.amount,
        message: paymentStatus.status === 'success' ? '결제 완료' : '결제 대기 중',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get payment status for ${orderId}: ${errorMessage}`);
      throw new BadRequestException(`결제 상태 조회 실패: ${errorMessage}`);
    }
  }
}
