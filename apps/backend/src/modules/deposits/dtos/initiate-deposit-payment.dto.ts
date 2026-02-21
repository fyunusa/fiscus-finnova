export interface InitiateDepositPaymentDto {
  amount: number; // Amount in won (e.g., 100000 for 10만원)
  description?: string; // Optional description for the deposit
}
