import { Controller, Post, Body, BadRequestException, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoansService } from '../services/loans.service';
import { PaymentMethod } from '../enums/loan.enum';

/**
 * Webhook Controller for Toss Payments
 * Receives and processes payment notifications from Toss API
 * These webhooks are triggered when:
 * - Virtual account payment is completed (deposit made)
 * - Payment status changes
 * 
 * Webhook URL: POST /api/v1/webhooks/payments
 * Configure in Toss Payments dashboard at: https://developers.tosspayments.com/
 */
@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly loansService: LoansService) {}

  /**
   * POST /api/v1/webhooks/payments
   * Receive webhook from Toss Payments
   * Called when virtual account deposit is received or payment status changes
   * 
   * Toss will send:
   * - eventType: 'PAYMENT_STATUS_CHANGED' | 'DEPOSIT_CALLBACK'
   * - data: { orderId, paymentKey, status, totalAmount, ... }
   */
  @Post('payments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Receive Toss Payments webhook',
    description: 'Webhook endpoint for receiving payment notifications from Toss API. No authentication required.',
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handlePaymentWebhook(
    @Body() payload: Record<string, unknown>,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Received payment webhook from Toss Payments`);
    this.logger.debug(`Webhook payload:`, JSON.stringify(payload, null, 2));

    try {
      // Verify webhook signature (optional but recommended in production)
      // In production, always verify the webhook signature to ensure it came from Toss
      // const isValid = await this.verifyWebhookSignature(payload, signatureHeader);
      // if (!isValid) throw new BadRequestException('Invalid webhook signature');

      const eventType = payload.eventType as string;
      const data = payload.data as Record<string, unknown>;

      if (!eventType || !data) {
        throw new BadRequestException('Missing eventType or data in webhook payload');
      }

      // Handle payment status changes
      if (eventType === 'PAYMENT_STATUS_CHANGED' || eventType === 'DEPOSIT_CALLBACK') {
        const status = data.status as string;
        const orderId = data.orderId as string;
        const paymentKey = data.paymentKey as string;
        const amount = data.totalAmount as number;

        this.logger.log(
          `Payment webhook: orderId=${orderId}, status=${status}, amount=${amount}`,
        );

        // Only process DONE payments (completed/settled)
        if (status === 'DONE' || status === 'COMPLETED') {
          // Extract loan account ID from orderId
          // Format: repay_${loanAccountId}_${timestamp}
          const match = orderId.match(/repay_([a-f0-9-]+)_/);
          if (!match || !match[1]) {
            this.logger.warn(`Could not extract loanAccountId from orderId: ${orderId}`);
            // Still acknowledge webhook to prevent retries
            return {
              success: true,
              message: `Could not extract loan account ID from orderId: ${orderId}`,
            };
          }

          const loanAccountId = match[1];

          // Process the repayment now that payment is confirmed
          this.logger.log(
            `Processing repayment for loan account ${loanAccountId} with amount ${amount}`,
          );

          try {
            await this.loansService.processRepayment(
              loanAccountId,
              amount,
              paymentKey,
              orderId,
              PaymentMethod.VIRTUAL_ACCOUNT,
              undefined, // No userId for webhook-triggered payments
            );

            this.logger.log(`Repayment successfully processed for loan ${loanAccountId}`);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(
              `Failed to process repayment for loan ${loanAccountId}: ${errorMsg}`,
              error,
            );
            // Still acknowledge webhook so Toss doesn't retry indefinitely
            // The failure will be logged and can be manually investigated
          }
        } else if (status === 'WAITING_FOR_DEPOSIT' || status === 'READY') {
          this.logger.log(`Payment awaiting customer action: orderId=${orderId}`);
          // This is normal - customer hasn't completed deposit yet
        } else if (status === 'CANCELLED' || status === 'FAILED' || status === 'ABORTED') {
          this.logger.warn(
            `Payment failed/cancelled: orderId=${orderId}, status=${status}`,
          );
          // Handle payment failure if needed (e.g., mark as failed in DB, notify user)
        } else {
          this.logger.warn(`Received webhook with unexpected status: ${status}`);
        }
      } else if (eventType === 'PAYMENT_FAILED') {
        const orderId = data.orderId as string;
        const errorMessage = data.message as string;
        this.logger.error(`Payment failed webhook: orderId=${orderId}, error=${errorMessage}`);
        // Handle payment failure (e.g., log, notify user, mark as failed in DB)
      } else {
        this.logger.warn(`Received webhook with unhandled event type: ${eventType}`);
      }

      // Always return 200 OK to acknowledge receipt
      // Toss will retry if we don't return success
      return {
        success: true,
        message: 'Webhook processed',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error processing webhook: ${errorMessage}`);

      // Still return 200 to prevent infinite retries from Toss
      // Log the error for manual investigation
      return {
        success: false,
        message: `Webhook processing error: ${errorMessage}`,
      };
    }
  }
}
