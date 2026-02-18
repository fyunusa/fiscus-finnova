# Loan System - API Requirements & Implementation Plan

## Overview
The Finnova loan system allows borrowers to apply for asset-backed loans (primarily apartment mortgages). The system tracks loan applications, approvals, and repayment schedules.

---

## Section 1: Core Entities & Database Schema

### 1.1 Loan Product
Represents available loan products (apartment mortgages, etc.)

```typescript
interface LoanProduct {
  id: string;
  name: string;                    // "아파트 담보 대출", etc.
  description: string;
  productType: 'apartment' | 'credit' | 'business-loan' | 'other';
  maxLTV: number;                  // Maximum LTV (70% for apartments)
  minInterestRate: number;         // Minimum annual rate (%)
  maxInterestRate: number;         // Maximum annual rate (%)
  minLoanAmount: number;           // Minimum loan amount (KRW)
  maxLoanAmount: number;           // Maximum loan amount (KRW)
  minLoanPeriod: number;           // Minimum period (months)
  maxLoanPeriod: number;           // Maximum period (months)
  repaymentMethod: 'equal-principal-interest' | 'equal-principal' | 'bullet';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.2 Loan Application
Represents a borrower's loan application

```typescript
interface LoanApplication {
  id: string;
  userId: string;                  // FK: User (borrower)
  loanProductId: string;           // FK: LoanProduct
  applicationNo: string;           // Unique reference (e.g., APP-2024-001)
  
  // Loan Details
  requestedLoanAmount: number;     // Requested amount (KRW)
  approvedLoanAmount?: number;     // Approved amount after review
  interestRate: number;            // Approved interest rate (%)
  loanPeriod: number;              // Loan period (months)
  
  // Collateral Information
  collateralType: 'apartment' | 'building' | 'land' | 'other';
  collateralValue: number;         // Evaluated collateral value (KRW)
  collateralAddress: string;
  collateralDetails?: string;
  
  // Application Status
  status: 'pending' | 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'active' | 'completed';
  statusHistory: {
    status: string;
    date: Date;
    note?: string;
  }[];
  rejectionReason?: string;
  
  // Dates
  appliedAt: Date;
  approvedAt?: Date;
  loanStartDate?: Date;            // When loan is disbursed
  loanEndDate?: Date;
  
  // Documents
  requiredDocuments: string[];     // List of doc types needed
  uploadedDocuments: {
    documentType: string;
    fileUrl: string;
    uploadedAt: Date;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.3 Loan Account
Active loan after approval and disbursement

```typescript
interface LoanAccount {
  id: string;
  userId: string;                  // FK: User (borrower)
  loanApplicationId: string;       // FK: LoanApplication
  accountNumber: string;           // Unique loan account number
  
  // Loan Details
  principalAmount: number;         // Original loan amount (KRW)
  interestRate: number;            // Annual interest rate (%)
  loanPeriod: number;              // Total loan period (months)
  remainingPeriod: number;         // Remaining months
  repaymentMethod: 'equal-principal-interest' | 'equal-principal' | 'bullet';
  
  // Balance Tracking
  principalBalance: number;        // Remaining principal (KRW)
  totalInterestAccrued: number;    // Total interest accumulated
  totalPaid: number;               // Total amount paid so far
  nextPaymentAmount: number;       // Next monthly payment
  nextPaymentDate: Date;
  
  // Status
  status: 'active' | 'suspended' | 'closed';
  
  // Dates
  startDate: Date;
  targetEndDate: Date;
  closedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.4 Loan Repayment Schedule
Monthly repayment schedule

```typescript
interface LoanRepaymentSchedule {
  id: string;
  loanAccountId: string;           // FK: LoanAccount
  month: number;                   // Month number (1, 2, 3...)
  scheduledPaymentDate: Date;
  principalPayment: number;        // Principal portion of payment (KRW)
  interestPayment: number;         // Interest portion of payment (KRW)
  totalPaymentAmount: number;      // Total payment (principal + interest)
  
  // Actual Payment Status
  paymentStatus: 'unpaid' | 'paid' | 'overdue' | 'partial';
  actualPaymentDate?: Date;
  actualPaidAmount?: number;
  
  remainingPrincipal: number;      // Remaining principal after this payment
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.5 Loan Repayment Transaction
Individual payment transactions

```typescript
interface LoanRepaymentTransaction {
  id: string;
  loanAccountId: string;
  scheduleId?: string;             // FK: LoanRepaymentSchedule
  
  transactionNo: string;           // Unique reference
  paymentAmount: number;           // Amount paid (KRW)
  paymentDate: Date;
  paymentMethod: 'bank_transfer' | 'auto_debit' | 'virtual_account';
  
  // Allocation
  principalApplied: number;
  interestApplied: number;
  penalty?: number;
  
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.6 Loan Consultation Request
Consultation inquiries from potential borrowers

```typescript
interface LoanConsultation {
  id: string;
  userId?: string;                 // Optional - can be anonymous
  
  // Personal Info
  name: string;
  phone: string;
  email: string;
  
  // Consultation Details
  loanType: string;               // 'apartment', 'business', etc.
  requestedAmount?: number;       // Approximate amount (KRW)
  propertyType?: string;
  purpose?: string;
  message?: string;
  
  // Status
  status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'rejected';
  assignedOfficer?: string;       // Admin user ID
  
  // Follow-up
  contactedAt?: Date;
  responseNote?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Section 2: Required API Endpoints

### 2.1 Loan Products (Public - No Auth Required)

#### GET /api/loan-products
List all active loan products

**Response:**
```json
{
  "data": [
    {
      "id": "prod-001",
      "name": "아파트 담보 대출",
      "productType": "apartment",
      "maxLTV": 70,
      "minInterestRate": 7.5,
      "maxInterestRate": 10.5,
      "minLoanAmount": 10000000,
      "maxLoanAmount": 500000000,
      "minLoanPeriod": 1,
      "maxLoanPeriod": 36,
      "repaymentMethod": "equal-principal-interest"
    }
  ]
}
```

#### GET /api/loan-products/:id
Get specific loan product details

---

### 2.2 Loan Applications (Auth: User/Borrower)

#### POST /api/loan-applications
Submit new loan application

**Request:**
```json
{
  "loanProductId": "prod-001",
  "requestedLoanAmount": 100000000,
  "loanPeriod": 24,
  "collateralType": "apartment",
  "collateralValue": 2000000000,
  "collateralAddress": "서울시 강남구 아파트",
  "collateralDetails": "25평"
}
```

**Response:**
```json
{
  "id": "app-001",
  "applicationNo": "APP-2024-001",
  "status": "pending"
}
```

#### GET /api/loan-applications
List user's loan applications (paginated)

**Query Params:**
- `status`: 'pending' | 'reviewing' | 'approved' | 'rejected'
- `sortBy`: 'date' | 'status'
- `page`: 1
- `limit`: 10

#### GET /api/loan-applications/:id
Get specific application details

**Response:**
```json
{
  "id": "app-001",
  "applicationNo": "APP-2024-001",
  "loanProductId": "prod-001",
  "requestedLoanAmount": 100000000,
  "status": "approved",
  "collateralValue": 2000000000,
  "statusHistory": [
    { "status": "submitted", "date": "2024-02-10" },
    { "status": "reviewing", "date": "2024-02-12" },
    { "status": "approved", "date": "2024-02-15" }
  ],
  "requiredDocuments": ["id_copy", "property_deed", "financial_statement"]
}
```

#### PUT /api/loan-applications/:id
Update application (before submission)

#### DELETE /api/loan-applications/:id
Withdraw application (only if pending)

#### PUT /api/loan-applications/:id/submit
Submit completed application for review

#### POST /api/loan-applications/:id/documents
Upload required documents

**Request:** FormData
```
file: File
documentType: 'id_copy' | 'property_deed' | 'financial_statement'
```

#### GET /api/loan-applications/:id/documents
List uploaded documents

---

### 2.3 Loan Accounts (Auth: User/Borrower)

#### GET /api/loan-accounts
List user's active loan accounts

**Response:**
```json
{
  "data": [
    {
      "id": "loan-001",
      "accountNumber": "LOAN-2024-001",
      "principalAmount": 100000000,
      "principalBalance": 95000000,
      "interestRate": 8.0,
      "remainingPeriod": 20,
      "nextPaymentAmount": 4522729,
      "nextPaymentDate": "2024-03-10",
      "status": "active"
    }
  ]
}
```

#### GET /api/loan-accounts/:id
Get specific loan account details

#### GET /api/loan-accounts/:id/repayment-schedule
Get repayment schedule for loan

**Query Params:**
- `page`: 1
- `limit`: 12

**Response:**
```json
{
  "data": [
    {
      "month": 1,
      "scheduledPaymentDate": "2024-03-10",
      "principalPayment": 3856062,
      "interestPayment": 666667,
      "totalPaymentAmount": 4522729,
      "paymentStatus": "paid",
      "actualPaymentDate": "2024-03-10",
      "remainingPrincipal": 96143938
    }
  ],
  "pagination": { "total": 24, "page": 1, "limit": 12 }
}
```

#### GET /api/loan-accounts/:id/repayment-history
Get actual repayment transactions

**Response:**
```json
{
  "data": [
    {
      "transactionNo": "TXN-2024-001",
      "paymentAmount": 4522729,
      "paymentDate": "2024-03-10",
      "paymentMethod": "auto_debit",
      "principalApplied": 3856062,
      "interestApplied": 666667,
      "status": "success"
    }
  ]
}
```

---

### 2.4 Loan Consultations (Public)

#### POST /api/loan-consultations
Submit consultation request

**Request:**
```json
{
  "name": "김철수",
  "phone": "010-1234-5678",
  "email": "kim@example.com",
  "loanType": "apartment",
  "requestedAmount": 100000000,
  "propertyType": "apartment",
  "purpose": "주택 구매",
  "message": "컨설팅 요청합니다."
}
```

#### GET /api/loan-consultations/my
Get current user's consultations (Auth required)

#### POST /api/loan-consultations/:id/contact
Follow up on consultation status (Auth optional)

---

### 2.5 Admin APIs (Auth: Admin)

#### PUT /api/admin/loan-applications/:id/approve
Approve loan application

**Request:**
```json
{
  "approvedLoanAmount": 100000000,
  "interestRate": 8.0,
  "loanPeriod": 24,
  "note": "Approved after document verification"
}
```

#### PUT /api/admin/loan-applications/:id/reject
Reject loan application

**Request:**
```json
{
  "rejectionReason": "담보 가치 부족"
}
```

#### POST /api/admin/loan-accounts/:id/disburse
Disburse approved loan to borrower

#### GET /api/admin/loan-accounts/:id/repayments/overdue
List overdue repayments

#### POST /api/admin/loan-consultations/:id/contact
Update consultation status

---

## Section 3: Implementation Priority

### Phase 1 (Immediate - Core Functionality)
1. ✅ LoanProduct entity & GET endpoints
2. ✅ LoanApplication entity & CRUD endpoints
3. ✅ LoanApplication submission workflow
4. ✅ LoanAccount entity upon approval
5. ✅ Repayment schedule calculation & display

### Phase 2 (Secondary - Full Features)
1. Document upload management
2. Admin approval/rejection workflow
3. Loan disbursement logic
4. Repayment transaction tracking
5. Consultation management

### Phase 3 (Advanced - Integration)
1. Bank integration (NH API for transfers)
2. CMS auto-debit setup
3. Interest accrual calculations
4. Late payment penalties
5. Reporting & analytics

---

## Section 4: Key Business Logic

### Repayment Calculation (Equal Principal + Interest)
```
Monthly Payment = P × [r(1+r)^n] / [(1+r)^n - 1]
Where:
  P = Principal (대출금)
  r = Monthly interest rate (연이율 / 12 / 100)
  n = Number of months (대출 기간)

Example: 10억원, 8.0% 연이율, 24개월
  P = 1,000,000,000
  r = 0.08 / 12 / 100 = 0.00667
  n = 24
  Monthly Payment = 45,227,286원
```

### Status Transitions
```
Application Flow:
pending → submitted → reviewing → approved → active → completed → closed
    ↓           ↓           ↓          ↓
  withdrawal  withdrawal  rejection  rejection

Loan Flow:
active → suspended ↔ active → closed
```

---

## Section 5: Frontend Integration Points

### Current Pages Needing Backend
- `/loan` - List loan products (GET /api/loan-products)
- `/loan/my-loans` - List user's loan accounts (GET /api/loan-accounts)
- `/loan/application` - List loan applications (GET /api/loan-applications)
- `/loan/status` - Show application status & timeline (GET /api/loan-applications/:id)
- `/loan/consultation` - Submit consultation (POST /api/loan-consultations)

### Features Requiring Services
- `LoanService` - Create, retrieve, manage loan applications
- `LoanAccountService` - Manage active loans and repayment
- `RepaymentService` - Calculate schedules, track payments
- `ConsultationService` - Manage consultation requests
- `AdminService` - Handle approvals and rejections

