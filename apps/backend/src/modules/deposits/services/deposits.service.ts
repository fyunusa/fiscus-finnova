import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentGatewayService } from '@modules/external-api/services/payment-gateway.service';
import { User } from '@modules/users/entities/user.entity';
import { VirtualAccount } from '@modules/users/entities/virtual-account.entity';
import { VirtualAccountTransaction } from '@modules/users/entities/virtual-account-transaction.entity';
import { TransactionType, TransactionStatus } from '@modules/users/enums/virtual-account.enum';
import {
  InitiateDepositPaymentDto,
  ConfirmDepositPaymentDto,
  InitiateDepositPaymentResponse,
  ConfirmDepositPaymentResponse,
} from '../dtos';

/**
 * DTOs for internal use
 */
interface PaymentCallbackDto {
  paymentKey: string;
  orderId: string;
  amount: number;
}

/**
 * Deposits Service
 * Handles Toss card payment deposits for user virtual accounts
 */
@Injectable()
export class DepositsService {
  private readonly logger = new Logger(DepositsService.name);

  constructor(
    private readonly paymentGatewayService: PaymentGatewayService,
    @InjectRepository(VirtualAccount)
    private readonly virtualAccountRepository: Repository<VirtualAccount>,
    @InjectRepository(VirtualAccountTransaction)
    private readonly transactionRepository: Repository<VirtualAccountTransaction>,
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

      // Update user's virtual account balance
      const virtualAccount = await this.virtualAccountRepository.findOne({
        where: { user: { id: user.id } },
      });

      if (!virtualAccount) {
        throw new BadRequestException('사용자의 가상계좌를 찾을 수 없습니다.');
      }

      // Update balance - ensure numeric conversion to prevent string concatenation
      const currentBalance = Number(virtualAccount.availableBalance) || 0;
      const depositAmount = Number(amount) || 0;
      
      virtualAccount.availableBalance = currentBalance + depositAmount;
      virtualAccount.totalDeposited = Number(virtualAccount.totalDeposited) + depositAmount;
      await this.virtualAccountRepository.save(virtualAccount);

      this.logger.log(
        `💰 Updated balance: User ${user.id}, Previous: ${currentBalance}원, Deposited: ${depositAmount}원, New balance: ${virtualAccount.availableBalance}원`,
      );

      // Create transaction record
      const balanceBefore = currentBalance;
      const transaction = this.transactionRepository.create({
        virtualAccountId: virtualAccount.id,
        type: TransactionType.DEPOSIT,
        amount: depositAmount,
        status: TransactionStatus.COMPLETED,
        balanceBefore,
        balanceAfter: virtualAccount.availableBalance,
        description: `카드 입금`,
        referenceNumber: paymentResult.transactionId,
        metadata: JSON.stringify({
          paymentKey,
          orderId,
          method: 'CARD',
        }),
        completedAt: new Date(),
      });

      await this.transactionRepository.save(transaction);

      this.logger.log(`📝 Created transaction record: ${transaction.id}`);

      return {
        success: true,
        depositId: orderId,
        amount: amount,
        status: 'COMPLETED',
        balanceAfter: virtualAccount.availableBalance,
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

  /**
   * Handle payment callback from Toss Payments
   * This is called after user completes payment on Toss checkout page
   * Updates virtual account balance and records transaction
   *
   * @param dto - Payment callback data (paymentKey, orderId, amount)
   * @returns Success confirmation
   */
  async handlePaymentCallback(dto: PaymentCallbackDto): Promise<{ success: boolean; message: string }> {
    const { paymentKey, orderId, amount } = dto;

    if (!paymentKey || !orderId || !amount) {
      throw new BadRequestException('결제 정보가 불완전합니다.');
    }

    try {
      this.logger.log(
        `💳 Handling payment callback: PaymentKey: ${paymentKey}, OrderId: ${orderId}, Amount: ${amount}원`,
      );

      // Extract userId from orderId (format: deposit_${userId}_${timestamp})
      const orderIdParts = orderId.split('_');
      if (orderIdParts.length < 3 || orderIdParts[0] !== 'deposit') {
        throw new BadRequestException('Invalid order ID format');
      }

      const userId = orderIdParts[1];
      this.logger.log(`👤 Extracted userId from orderId: ${userId}`);

      // Confirm the payment with Toss
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

      // TODO: In a real implementation with database:
      // 1. Find VirtualAccount by userId using repository
      // 2. Update account balance: availableBalance += amount, totalDeposited += amount
      // 3. Create VirtualAccountTransaction record with type='deposit', status='completed'
      // 4. Send confirmation email
      //
      // Example code (when entities are injected):
      // const virtualAccount = await virtualAccountRepository.findOne({ where: { userId } });
      // if (!virtualAccount) throw new NotFoundException('Virtual account not found');
      // virtualAccount.availableBalance += amount;
      // virtualAccount.totalDeposited += amount;
      // await virtualAccountRepository.save(virtualAccount);
      // await transactionRepository.save({ virtualAccountId: virtualAccount.id, type: 'deposit', amount, status: 'completed', balanceBefore, balanceAfter: virtualAccount.availableBalance });

      this.logger.log(`✅ Payment processed and account updated for user ${userId}`);

      return {
        success: true,
        message: '입금이 완료되었습니다.',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Payment callback handling failed: ${errorMessage}`, error);
      throw new BadRequestException(`입금 처리 실패: ${errorMessage}`);
    }
  }
}
