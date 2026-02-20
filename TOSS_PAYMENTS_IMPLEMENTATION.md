# Toss Payments Integration - Implementation Complete ✅

## Overview
Complete Toss Payments integration for loan disbursement and repayment processing using Toss Payments Paygate API (Korean PG provider).

---

## Components Implemented

### 1. Enhanced PaymentGatewayService
**File:** `/apps/backend/src/modules/external-api/services/payment-gateway.service.ts`

**New Methods:**
- `createVirtualAccountForDisbursement()` - Creates virtual account for loan funds distribution
- `createVirtualAccountForRepayment()` - Creates virtual account for collecting loan payments
- `getVirtualAccountBalance()` - Retrieves account balance and transaction history
- `confirmVirtualAccountDeposit()` - Confirms deposits into virtual account
- `confirmRepaymentPayment()` - Confirms payment for loan repayment
- `processRefund()` - Handles refunds for overpayments

**Key Features:**
- Proper HTTP request handling with retry logic (rate limiting support)
- Type-safe response handling with casting
- Idempotency keys for payment requests
- Complete error handling and logging
- Bank name mapping for Korean bank codes

---

### 2. Virtual Account Creation Endpoint
**Files:** 
- `/apps/backend/src/modules/loans/services/loans.service.ts` (disburseLoan method)
- `/apps/backend/src/modules/loans/controllers/loans.controller.ts` (endpoint)

**Endpoint:** `POST /api/loans/applications/:id/disburse`

**Functionality:**
1. Verifies loan is approved with complete approval details
2. Creates virtual account via Toss API
3. Saves account to VirtualAccount entity
4. Creates LoanAccount record with:
   - Principal and interest tracking
   - Repayment schedule generation
   - Account status management
   - Next payment calculation
5. Generates repayment schedule based on repayment method:
   - Equal Principal & Interest (원리금 균등분할)
   - Equal Principal (원금 균등분할)
   - Bullet/Lump-sum (만기일시상환)
6. Updates LoanApplication status to ACTIVE
7. Logs disbursement with full audit trail

**Response:**
```json
{
  "success": true,
  "data": {
    "loanAccountId": "uuid",
    "virtualAccountNumber": "12345678901234",
    "message": "Loan disbursed successfully..."
  }
}
```

---

### 3. Repayment Processing Endpoint
**Files:**
- `/apps/backend/src/modules/loans/services/loans.service.ts` (processRepayment method)
- `/apps/backend/src/modules/loans/controllers/loans.controller.ts` (endpoint)

**Endpoint:** `POST /api/loans/accounts/:accountId/repay`

**Request:**
```json
{
  "amount": 5000000,
  "paymentKey": "payment_xxx",
  "paymentMethod": "virtual_account"
}
```

**Functionality:**
1. Confirms payment with Toss API
2. Allocates payment between principal and interest:
   - Interest calculated: (remainingPrincipal × annualRate) / 12 / 100
   - Principal = Payment - Interest
3. Updates LoanAccount:
   - Decreases principalBalance
   - Updates totalPaid and totalInterestAccrued
   - Recalculates remaining period and next payment
   - Updates nextPaymentDate (+30 days)
4. Creates LoanRepaymentTransaction record with:
   - Transaction number
   - Payment amounts and allocations
   - Bank reference ID
   - Status tracking
5. Updates LoanRepaymentSchedule:
   - Marks scheduled payments as PAID
   - Records actual payment date and amount
6. Auto-closes loan if fully paid
7. Updates LoanApplication status to COMPLETED if loan closed

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "TXN-xxx",
    "newBalance": 45000000,
    "nextPaymentAmount": 1234567,
    "loanStatus": "active",
    "message": "Payment of 5,000,000 won processed successfully"
  }
}
```

---

## Technical Architecture

### Data Flow - Disbursement

```
API: POST /loans/applications/:id/disburse
  ↓
LoansService.disburseLoan()
  ├─ Validate loan is approved
  ├─ Create virtual account (Toss API)
  ├─ Save VirtualAccount entity
  ├─ Create LoanAccount entity
  ├─ Generate repayment schedules (12-360 months)
  ├─ Update LoanApplication status → ACTIVE
  └─ Return account number & loan ID
  ↓
Response: Virtual account ready for fund transfer
```

### Data Flow - Repayment

```
API: POST /loans/accounts/:accountId/repay
  ↓
LoansService.processRepayment()
  ├─ Confirm payment (Toss API)
  ├─ Allocate payment (principal + interest)
  ├─ Update LoanAccount balance
  ├─ Create LoanRepaymentTransaction
  ├─ Update LoanRepaymentSchedule(s)
  ├─ Check if fully paid
  ├─ Update LoanApplication status if closed
  └─ Return new balance & next payment
  ↓
Response: Payment recorded and loan progressed
```

---

## Database Entities

### LoanAccount
- Core loan record after approval
- Tracks principal balance, interest accrued, total paid
- References LoanApplication
- Has multiple LoanRepaymentSchedule records

### LoanRepaymentSchedule
- Monthly/periodic repayment obligations
- Fields: month, scheduledPaymentDate, principalPayment, interestPayment, totalPaymentAmount
- Status tracking: UNPAID → PAID
- Actual payment amounts recorded

### LoanRepaymentTransaction
- Immutable payment records
- Each actual payment = 1 transaction record
- Fields: transactionNo, paymentAmount, paymentDate, paymentMethod, status
- Allocation: principalApplied, interestApplied, penaltyApplied, feesApplied
- Bank reference for reconciliation

### VirtualAccount
- User's virtual bank account for loans
- accountNumber: Unique virtual account number from Toss
- bankCode & bankName: Virtual or linked bank
- Balance tracking: availableBalance, totalDeposited, totalWithdrawn, frozenBalance
- Used for both disbursement and repayment

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/loans/applications` | Create loan application | ✅ |
| GET | `/loans/applications` | List user's applications | ✅ |
| GET | `/loans/applications/:id` | Get specific application | ✅ |
| PUT | `/loans/applications/:id` | Update application (pending) | ✅ |
| POST | `/loans/applications/:id/submit` | Submit for review | ✅ |
| DELETE | `/loans/applications/:id` | Cancel application | ✅ |
| **POST** | **`/loans/applications/:id/disburse`** | **Disburse approved loan** | **✅** |
| **POST** | **`/loans/accounts/:accountId/repay`** | **Process repayment** | **✅** |
| PUT | `/loans/applications/:id/approve` | Approve (admin) | ✅ |
| PUT | `/loans/applications/:id/reject` | Reject (admin) | ✅ |
| GET | `/loans/products` | List loan products | ❌ |
| GET | `/loans/products/:id` | Get loan product | ❌ |

---

## Toss Payments Configuration

**Environment Variables** (in `.env`):
```
PAYGATE_API_URL=https://api.tosspayments.com
PAYGATE_MERCHANT_ID=test_ck_E92LAa5PVbLe5m5w0YEZ87YmpXyJ
PAYGATE_API_KEY=test_sk_kYG57Eba3G4DWpeao7QzVpWDOxmA
```

**API Base:** `https://api.tosspayments.com/v1`

**Authentication:** Basic Auth (MerchantID:SecretKey in Base64)

**Test Card:** 4111-1111-1111-1111 (any future expiry, any CVC)

---

## Key Features

### 1. Loan Disbursement
✅ Virtual account creation for fund transfer
✅ Automatic repayment schedule generation
✅ Support for multiple repayment methods
✅ Loan amount validation against product limits
✅ LTV (Loan-to-Value) validation
✅ Full audit trail

### 2. Repayment Processing
✅ Virtual account deposit confirmation
✅ Automatic principal/interest allocation
✅ Monthly payment tracking
✅ Overdraft/overdue tracking
✅ Early repayment support
✅ Auto loan closure on full repayment

### 3. Virtual Accounts
✅ Disbursement accounts (90-day expiry)
✅ Repayment accounts (365-day expiry)
✅ Balance queries
✅ Transaction history
✅ Status management

### 4. Financial Calculations
✅ Monthly payment calculation (compound interest)
✅ Principal/interest allocation
✅ Remaining balance tracking
✅ Interest accrual calculation
✅ Late fee calculation support

### 5. Error Handling
✅ Rate limiting with retry (3 attempts)
✅ Toss API error propagation
✅ Validation at multiple levels
✅ Logging at all critical points

---

## Testing the Implementation

### 1. Create Loan Application
```bash
POST /api/loans/applications
{
  "loanProductId": "product-uuid",
  "requestedLoanAmount": 50000000,
  "loanPeriod": 60,
  "collateralType": "apartment",
  "collateralValue": 100000000,
  "collateralAddress": "123 Main St, Seoul"
}
```

### 2. Admin: Approve Loan
```bash
PUT /api/loans/applications/:id/approve
{
  "approvedLoanAmount": 50000000,
  "approvedInterestRate": 5.5,
  "approvedLoanPeriod": 60,
  "reviewerNotes": "Approved"
}
```

### 3. Disburse Loan
```bash
POST /api/loans/applications/:id/disburse
Response:
{
  "loanAccountId": "uuid",
  "virtualAccountNumber": "12345678901234"
}
```

### 4. Process Repayment (after deposit)
```bash
POST /api/loans/accounts/:accountId/repay
{
  "amount": 5000000,
  "paymentKey": "payment_xxx"
}
Response:
{
  "transactionId": "TXN-xxx",
  "newBalance": 45000000,
  "nextPaymentAmount": 1234567,
  "loanStatus": "active"
}
```

---

## Module Dependencies

**Module:** `LoansModule`

**Imports:**
- `TypeOrmModule` (LoanProduct, LoanApplication, LoanAccount, LoanRepaymentSchedule, etc.)
- `ExternalApiModule` (PaymentGatewayService)
- `VirtualAccount` entity
- `User` entity

**Exports:**
- `LoansService`

---

## Error Handling Examples

### Bad Request Errors
- Loan not in APPROVED status when attempting disbursement
- Insufficient approval details (amount, rate, period missing)
- Account not found for repayment endpoint
- Unauthorized user attempting to disburse/repay

### Toss API Errors
- Virtual account creation failure
- Payment confirmation failure
- Rate limiting (automatic retry with exponential backoff)
- Invalid credentials

### Validation Errors
- Loan amount outside product limits
- LTV exceeding maximum
- Invalid collateral type
- Missing required fields

---

## Next Steps / Future Enhancements

1. **Webhook Handling:** Implement webhook endpoint for Toss payment confirmations
2. **Partial Payments:** Support partial payment allocation
3. **Grace Period:** Implement configurable grace period before late fees
4. **Payment Plans:** Allow borrowers to create custom repayment schedules
5. **Prepayment Penalty:** Configurable penalties for early repayment
6. **Phone Number Verification:** Add phone number to virtual account creation
7. **Account Suspension:** Auto-suspend accounts for overdue (3+ months)
8. **Payment Reminders:** Send SMS/email reminders before due dates
9. **Export Reports:** Export repayment history and tax documents
10. **Batch Processing:** Handle bulk repayments for corporate clients

---

## Summary

✅ **Step 1:** Enhanced PaymentGatewayService with all Toss-specific methods
✅ **Step 2:** Created virtual account creation with loan disbursement
✅ **Step 3:** Created repayment processing endpoint with full accounting
✅ **All endpoints:** Properly authenticated with JWT
✅ **Error handling:** Comprehensive with logging
✅ **Database:** LoanAccount, LoanRepaymentSchedule, LoanRepaymentTransaction properly utilized
✅ **Type safety:** Full TypeScript with proper typing

**Status:** Ready for testing and integration with frontend ✅
