import { Controller, Get, Query, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DepositsService } from '../services/deposits.service';

/**
 * Public Deposits Callback Controller
 * Handles payment callbacks from Toss Payments
 * NOT protected - called by Toss, not authenticated users
 */
@ApiTags('Deposits - Public')
@Controller('deposits')
export class DepositsPublicController {
  constructor(private readonly depositsService: DepositsService) {}

  /**
   * Payment callback from Toss Payments
   * Called by Toss after user completes or cancels payment
   * Processes the payment, updates account balance, then redirects to frontend
   */
  @Get('toss-callback')
  @HttpCode(HttpStatus.FOUND) // 302 redirect
  @ApiOperation({ summary: 'Payment callback from Toss' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend success/fail page' })
  async tossPaymentCallback(
    @Query('paymentKey') paymentKey: string,
    @Query('orderId') orderId: string,
    @Query('amount') amount: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      console.log('📥 Toss payment callback received:', { paymentKey, orderId, amount });

      if (!paymentKey || !orderId || !amount) {
        console.error('❌ Missing required callback parameters');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/deposits?payment=failed&reason=missing_params`);
      }

      // Handle the payment callback
      await this.depositsService.handlePaymentCallback({
        paymentKey,
        orderId,
        amount: parseInt(amount),
      });

      console.log('✅ Payment processed successfully:', orderId);

      // Redirect to frontend success page with details
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/deposits?payment=success&paymentKey=${paymentKey}&orderId=${orderId}&amount=${amount}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Payment callback error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/deposits?payment=failed&reason=${encodeURIComponent(errorMessage)}`,
      );
    }
  }
}
