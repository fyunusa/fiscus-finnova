export interface ConfirmDepositPaymentDto {
  paymentKey: string; // Toss Payments payment key
  orderId: string; // Order ID (deposit request ID)
  amount: number; // Amount in won
}
