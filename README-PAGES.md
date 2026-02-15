# Fiscus-Finnova Platform: Complete Page Documentation

**Version:** 2.0  
**Last Updated:** January 26, 2026  
**Total Pages Required:** 115 screens + modals  
**Currently Implemented:** 90 pages  

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Common Components](#common-components)
4. [Finnova User Web (59 pages)](#finnova-user-web)
   - [Authentication & Onboarding](#authentication--onboarding)
   - [Investment Features](#investment-features)
   - [Loan Features](#loan-features)
   - [User Account Management](#user-account-management)
   - [Support & Help](#support--help)
   - [Legal & Terms](#legal--terms)
5. [Fiscus Admin System (25 pages)](#fiscus-admin-system)
   - [Dashboard & Insights](#dashboard--insights)
   - [Member Management](#member-management)
   - [Loan Operations](#loan-operations)
   - [Investment & Funding Management](#investment--funding-management)
   - [Financial Operations](#financial-operations)
   - [System Administration](#system-administration)
6. [Email Templates](#email-templates)
7. [API Integration Requirements](#api-integration-requirements)
8. [Implementation Status](#implementation-status)

---

## Project Overview

### What is Fiscus-Finnova?

Fiscus-Finnova is a comprehensive **P2P (Peer-to-Peer) Investment and Lending Platform** compliant with South Korean Online Investment-Linked Finance Act (온투법). The platform consists of two main applications:

1. **Finnova** - User-facing web application for investors and borrowers
2. **Fiscus** - Back-office administration system for platform operators

### Key Features

- **Investment Management**: Real estate-backed securities, credit card receivables, business loans
- **Loan Processing**: Apartment collateral loans with on-site inspection and offline contract workflows
- **Compliance**: Full KYC/AML verification, investor qualification testing, investment limits enforcement
- **Payment Integration**: Virtual account system, 1-won verification, bulk distribution processing
- **Real-time Updates**: Investment progress tracking, loan status monitoring, settlement notifications

### Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Architecture**: Turbo monorepo with npm workspaces
- **State Management**: React Server Components + Client Components
- **API**: RESTful APIs with Circuit Breaker pattern for external integrations

---

## System Architecture

### Monorepo Structure

```
fiscus-finnova/
├── apps/
│   ├── finnova-web/          # User-facing web application (Port 3000)
│   └── fiscus-admin/         # Admin back-office system (Port 3001)
├── packages/
│   └── ui-components/        # Shared React component library (22 components)
└── turbo.json               # Turbo build configuration
```

### Core Modules

| Module | Purpose | Technology |
|--------|---------|------------|
| Authentication | Login, signup, KYC, phone verification | NICE/KCB API integration |
| Investment Engine | Product listing, investment calculator, transaction processing | Distributed lock (Redis), Saga pattern |
| Loan Processing | Application intake, on-site inspection, offline contracts | KB property valuation API |
| Payment Gateway | Virtual accounts, 1-won verification, disbursement | Paygate API (Circuit Breaker) |
| Settlement | Bulk distribution to thousands of investors | Batch processing, proportional allocation |
| Admin Operations | Loan approval, funding management, compliance monitoring | Role-based access control (RBAC) |

---

## Common Components

These system-level components are used across multiple pages in Finnova.

### CMM_1P: Bank Selection Modal
**Type:** System Popup  
**Purpose:** Modal for selecting bank from comprehensive list of Korean banks  
**Usage:** Account registration, withdrawal setup  
**Features:**
- Searchable bank list
- Recent bank history
- Bank code validation

### CMM_2P: PIN Number Authentication
**Type:** System Popup  
**Purpose:** 4-digit PIN entry for secure transaction confirmation  
**Usage:** Investment execution, withdrawal, sensitive operations  
**Security:** 
- 5 attempts limit
- Account lockout on failure
- Encrypted PIN storage

### CMM_3P: Deposit Charging
**Type:** System Popup  
**Purpose:** Virtual account deposit instruction modal  
**Features:**
- Display user's unique virtual account number
- Copy to clipboard functionality
- Recent deposit history

### CMM_4P: Investment Calculator
**Type:** System Popup  
**Purpose:** Real-time ROI calculation with fees and taxes  
**Algorithm:**
```
Pre-tax Interest = Investment Amount × (Annual Rate / 100) × (Period / 12)
Platform Fee = Investment Amount × (Fee Rate / 100) × (Period / 12)
Tax = Pre-tax Interest × 0.154 (15.4% total)
Net Return = Pre-tax Interest - Platform Fee - Tax
```

### CMM_5: Investment Execution Flow
**Type:** Multi-step Page  
**Purpose:** Complete investment transaction workflow  
**Steps:**
1. Amount input with quick buttons (10K, 50K, 100K, 1M)
2. Balance verification
3. Investment limit check (individual, product, CI-based)
4. Risk disclosure agreement
5. PIN confirmation
6. Transaction processing with distributed lock
7. Completion screen (CMM_5_1)

### CMN_6: Loading Screen
**Type:** Page  
**Purpose:** Animated loading indicator for async operations  
**Use Cases:** API calls, payment processing, file uploads

### CMN_7: Business Disclosure
**Type:** Page with Tabs  
**Purpose:** Legal compliance disclosure of platform operations  
**Tabs:**
- **CMN_7_1T**: Usage Information - Transaction volumes, user statistics
- **CMN_7_2T**: Handling Status - Loan performance, default rates

### CMN_8: 404 Error Page
**Type:** Error Page  
**Purpose:** User-friendly page not found error  
**Features:**
- Navigation suggestions
- Search functionality
- Return to home button

### CMN_9: 500 Error Page
**Type:** Error Page  
**Purpose:** System error fallback page  
**Features:**
- Error tracking ID
- Support contact information
- Automatic retry option

---

## Finnova User Web

**Total Pages:** 59  
**Primary Users:** Individual/corporate investors, apartment collateral borrowers

---

### Authentication & Onboarding

#### MAI: Homepage
**Screen ID:** MAI  
**Type:** Landing Page  
**Purpose:** Main entry point with product showcase and navigation  
**Key Elements:**
- Hero section with value proposition
- Featured investment products carousel
- Real-time statistics (total investments, average returns)
- Quick access to login/signup
- Responsive header with member dropdown (MAI_1L)
- Notification bell with unread count (MAI_2L)

#### MAI_1L: Member Dropdown Menu
**Screen ID:** MAI_1L  
**Type:** Layer Popup  
**Purpose:** User profile quick access menu  
**Links:** My investments, My page, Logout

#### MAI_2L: Notification Dropdown
**Screen ID:** MAI_2L  
**Type:** Layer Popup  
**Purpose:** Real-time notification center  
**Notification Types:**
- Investment confirmations
- Loan status updates
- Payment distributions
- System announcements

#### MMAI_3: Mobile Hamburger Menu
**Screen ID:** MMAI_3  
**Type:** Mobile-only Page  
**Purpose:** Full-screen navigation menu for mobile devices  
**Responsive:** Visible only on screens < 768px

---

#### LOG: Login Page
**Screen ID:** LOG  
**Type:** Authentication Page  
**Purpose:** Secure user authentication  
**Features:**
- Email (ID) and password inputs
- Remember ID checkbox
- Login attempt tracking (5 failures = lockout)
- Links to email/password recovery

#### LOG_1: Find Email (ID)
**Screen ID:** LOG_1  
**Type:** Page  
**Purpose:** Email recovery via phone verification  
**Flow:**
1. Enter name and phone number
2. SMS verification code sent
3. Display registered email(s)

#### LOG_1_1: Email Found - Single Account
**Screen ID:** LOG_1_1  
**Type:** Result Page  
**Purpose:** Display recovered email  
**Actions:** Proceed to login

#### LOG_1_2: Email Found - Multiple Accounts
**Screen ID:** LOG_1_2  
**Type:** Result Page  
**Purpose:** Display multiple registered emails  
**Note:** Allows user to choose which account to proceed with

#### LOG_2: Find Password
**Screen ID:** LOG_2  
**Type:** Page  
**Purpose:** Password recovery initiation  
**Flow:**
1. Enter email (ID)
2. Verify identity via phone verification
3. Proceed to password reset

#### LOG_2_1: Password Reset
**Screen ID:** LOG_2_1  
**Type:** Page  
**Purpose:** Set new password  
**Validation:**
- Minimum 8 characters
- Combination of letters, numbers, special characters
- Cannot reuse last 3 passwords

#### LOG_2_2: Multiple Accounts Password Reset
**Screen ID:** LOG_2_2  
**Type:** Page  
**Purpose:** Handle password reset when user has multiple accounts

---

### Signup - Individual Investor

#### SIG: Signup Type Selection
**Screen ID:** SIG  
**Type:** Page  
**Purpose:** Choose between individual or corporate registration  
**Options:**
1. Individual Investor (proceed to SIG_3)
2. Corporate Investor (proceed to SIG_4)

#### SIG_2P: Individual Investor Type Guide
**Screen ID:** SIG_2P  
**Type:** System Popup  
**Purpose:** Explain investor qualification types under Online Investment-Linked Finance Act  
**Types:**
- **General Individual**: Up to 5 million KRW per platform annually
- **Income-Qualified**: Up to 10 million KRW (requires proof of income ≥ 50M KRW)
- **Experienced**: Up to 20 million KRW (requires trading history)

#### SIG_3: Terms & Conditions Agreement
**Screen ID:** SIG_3  
**Type:** Page  
**Purpose:** Legal agreement collection  
**Required Terms:**
- Service usage agreement (TAC_1)
- Privacy policy (TAC_2)
- Online investment-linked agreement (TAC_3)
- E-financial transaction agreement (TAC_5)
- Personal information processing consent

#### SIG_3_1: Identity Verification
**Screen ID:** SIG_3_1  
**Type:** Page  
**Purpose:** NICE/KCB phone-based identity verification  
**Process:**
1. Phone number entry
2. External verification popup (NICE platform)
3. Receive CI/DI values for unique identity
4. Auto-fill name, birth date, gender

#### SIG_3_1_1: Existing Account Warning
**Screen ID:** SIG_3_1_1  
**Type:** Page  
**Purpose:** Notify user if CI already registered  
**Action:** Redirect to login or account recovery

#### SIG_3_2: Member Information Input
**Screen ID:** SIG_3_2  
**Type:** Page  
**Purpose:** Collect user profile data  
**Fields:**
- Auto-filled: Name, birth date, gender, phone (from verification)
- Manual: Address (Kakao address API), detailed address

#### SIG_3_3: Login Credentials Setup
**Screen ID:** SIG_3_3  
**Type:** Page  
**Purpose:** Create account credentials  
**Fields:**
- Email (used as login ID) with duplicate check
- Password with strength meter
- Password confirmation

#### SIG_3_4: Bank Account Registration
**Screen ID:** SIG_3_4  
**Type:** Page  
**Purpose:** Link real bank account for deposits/withdrawals  
**Process:**
1. Select bank via CMM_1P modal
2. Enter account number
3. Account holder name verification

#### SIG_3_5: 1-Won Verification
**Screen ID:** SIG_3_5  
**Type:** Page  
**Purpose:** Verify actual account ownership  
**Process:**
1. System sends 1 KRW to entered account via Paygate API
2. Deposit name includes 3-digit code (e.g., "FINNOVA123")
3. User enters 3-digit code
4. Verification success triggers virtual account issuance

#### SIG_3_6: Identity Document Upload (KYC)
**Screen ID:** SIG_3_6  
**Type:** Page  
**Purpose:** Complete Know Your Customer requirements  
**Required Documents:**
- Government-issued ID (resident registration card or driver's license)
- Selfie with ID for liveness check
**File Types:** JPG, PNG, PDF (max 10MB each)

#### SIG_3_7: PIN Setup
**Screen ID:** SIG_3_7  
**Type:** Page  
**Purpose:** Create 4-digit transaction PIN  
**Validation:**
- Must be 4 digits
- Cannot be sequential (1234, 4321)
- Cannot be repetitive (1111, 2222)
- PIN confirmation required

#### SIG_3_8: Signup Complete
**Screen ID:** SIG_3_8  
**Type:** Success Page  
**Purpose:** Registration confirmation  
**Information:**
- Welcome message
- Virtual account number issued
- Next steps guide
**Actions:** 
- Proceed to deposit
- Browse investment products
- Go to dashboard

---

### Signup - Corporate Investor

#### SIG_1P: Corporate Investor Guide
**Screen ID:** SIG_1P  
**Type:** System Popup  
**Purpose:** Explain corporate investment requirements  
**Key Points:**
- Business registration certificate required
- Corporate bank account required
- Authorized representative verification needed
- Investment limits: Up to 100 million KRW per product

#### SIG_4: Corporate Terms Agreement
**Screen ID:** SIG_4  
**Type:** Page  
**Purpose:** Corporate-specific terms agreement  
**Additional Terms:**
- Corporate investment agreement
- Corporate information disclosure consent

#### SIG_4_1: Corporate Representative Verification
**Screen ID:** SIG_4_1  
**Type:** Page  
**Purpose:** Verify legal representative identity  
**Same as:** SIG_3_1 (phone verification flow)

#### SIG_4_1_1: Corporate Account Conflict Warning
**Screen ID:** SIG_4_1_1  
**Type:** Page  
**Purpose:** Handle case where representative CI already used

#### SIG_4_2: Business Number Lookup
**Screen ID:** SIG_4_2  
**Type:** Page  
**Purpose:** Fetch corporate information from National Tax Service API  
**Process:**
1. Enter 10-digit business registration number
2. API fetches: Company name, representative name, address, business type
3. Auto-fill registration form

#### SIG_4_3: Corporate Entity Selection
**Screen ID:** SIG_4_3  
**Type:** Page  
**Purpose:** Choose corporate entity when multiple businesses registered to same representative  
**Display:** List of businesses with selection radio buttons

#### SIG_4_4: Corporate Information Input
**Screen ID:** SIG_4_4  
**Type:** Page  
**Purpose:** Complete corporate profile  
**Fields:**
- Auto-filled: Business name, representative, tax ID
- Manual: Corporate type, industry, establishment date

#### SIG_4_5: Corporate Login Credentials
**Screen ID:** SIG_4_5  
**Type:** Page  
**Purpose:** Create corporate account login  
**Same as:** SIG_3_3 with additional corporate email validation

#### SIG_4_6: Corporate Bank Account
**Screen ID:** SIG_4_6  
**Type:** Page  
**Purpose:** Register corporate bank account  
**Validation:** Account holder name must match business name

#### SIG_4_7: Corporate 1-Won Verification
**Screen ID:** SIG_4_7  
**Type:** Page  
**Purpose:** Verify corporate account ownership  
**Same as:** SIG_3_5

#### SIG_4_8: Corporate Document Submission
**Screen ID:** SIG_4_8  
**Type:** Page  
**Purpose:** Upload required corporate documents  
**Required:**
- Business registration certificate (사업자등록증)
- Corporate seal certificate (법인인감증명서)
- Resolution for investment authority (투자 의결서)
- Representative ID

#### SIG_4_9: Corporate PIN Setup
**Screen ID:** SIG_4_9  
**Type:** Page  
**Purpose:** Set transaction PIN for corporate account  
**Same as:** SIG_3_7

#### SIG_4_10: Corporate Signup Complete
**Screen ID:** SIG_4_10  
**Type:** Success Page  
**Purpose:** Corporate registration completion  
**Note:** Account activation may require 1-2 business days for document review

---

### Investment Features

#### IVT: Investment Product List
**Screen ID:** IVT  
**Type:** Main Page with Tabs  
**Purpose:** Browse available investment opportunities  
**Tabs:**
- Popular products
- Newly listed
- Ending soon
- High returns
**Filters (IVT_1P):**
- Interest rate range
- Investment period
- Loan type (apartment, credit card receivables, business loan)
- LTV ratio
- Funding progress

#### IVT_1P: Investment Filter Modal
**Screen ID:** IVT_1P  
**Type:** System Popup  
**Purpose:** Advanced product filtering  
**Filters:**
- Rate: 5-15% (slider)
- Period: 1-36 months
- Type: Checkbox group
- Minimum investment amount

#### IVT_2: Investment Product Detail - Apartment Collateral
**Screen ID:** IVT_2  
**Type:** Product Detail Page  
**Purpose:** Comprehensive product information for apartment-backed loans  
**Key Information:**
- Property images gallery
- Core metrics: Annual rate, period, funding goal, current progress
- Collateral details: Address, size, KB valuation, LTV ratio
- Expected returns calculator (integrated CMM_4P)
**Tabs:**
- **IVT_2_1T**: Borrower Information (anonymized credit score, income range, loan history)
- **IVT_2_2T**: Investor Notice (legal risk disclosures, default handling process)
**Actions:**
- Favorite (heart icon)
- Share
- Invest button → Opens CMM_5 investment flow

#### IVT_3: Investment Product Detail - Credit Card Receivables
**Screen ID:** IVT_3  
**Type:** Product Detail Page  
**Purpose:** Short-term credit card merchant cash advance products  
**Unique Features:**
- Merchant business profile
- Card sales transaction history (last 6 months)
- Estimated daily sales
**Tabs:**
- **IVT_3_1T**: Borrower Information
- **IVT_3_2T**: Investor Notice

#### IVT_4: Investment Product Detail - Business Loan
**Screen ID:** IVT_4  
**Type:** Product Detail Page  
**Purpose:** SME (Small/Medium Enterprise) working capital loans  
**Unique Features:**
- Business registration info
- Financial statements summary
- Purpose of loan
**Tabs:**
- **IVT_4_1T**: Borrower Information
- **IVT_4_2T**: Investor Notice

#### IVT_5: Corporate Investment
**Screen ID:** IVT_5  
**Type:** Page  
**Purpose:** Special consultation request for large corporate investments  
**Features:**
- Pre-qualification form
- Requested investment amount and terms
- Opens consultation request modal (IVT_5_1P)

#### IVT_5_1P: Consultation Request Modal
**Screen ID:** IVT_5_1P  
**Type:** System Popup  
**Purpose:** Submit consultation request form  
**Fields:**
- Contact person name
- Phone number
- Preferred contact time
- Investment interest range

---

### Loan Features

#### LON: Apartment Collateral Loan
**Screen ID:** LON  
**Type:** Main Loan Landing Page  
**Purpose:** Explain apartment collateral loan product  
**Features:**
- Product overview
- LTV explanation (up to 70%)
- Interest rate information
- Loan amount calculator
- Apply button → LON_1

#### LON_1: Loan Application
**Screen ID:** LON_1  
**Type:** Multi-step Form Page  
**Purpose:** Submit loan application with property information  
**Sections:**
1. **Personal Information**: Auto-filled from profile
2. **Property Information**: 
   - Address search via Kakao API
   - Property type (apartment, officetel)
   - Size (square meters)
   - Ownership duration
3. **Loan Requirements**:
   - Desired loan amount
   - Desired loan period
   - Loan purpose
4. **Senior Liens**: Existing mortgages or liens
**Actions:**
- Save draft
- Submit application

#### LON_1_1: Loan Limit Check & Consultation Request
**Screen ID:** LON_1_1  
**Type:** Page  
**Purpose:** Quick limit estimation using KB property valuation  
**Process:**
1. Enter property address
2. System calls KB API for market valuation
3. Display estimated limit: `Property Value × LTV% - Senior Liens`
4. **Critical Note**: "This is an estimate. Final loan execution requires on-site inspection by our assessor and offline contract signing."
**Actions:**
- Request consultation (with preferred date/time)
- Continue to full application (LON_1)

#### LON_1_2: Manual Consultation Request (No Limit Check)
**Screen ID:** LON_1_2  
**Type:** Page  
**Purpose:** Request consultation without KB limit check  
**Use Case:** Properties not supported by KB API (rural areas, special property types)
**Fields:**
- Name, phone
- Property address (manual entry)
- Estimated value
- Desired amount

#### LON_1_3P: Consultation Request Confirmation
**Screen ID:** LON_1_3P  
**Type:** System Popup  
**Purpose:** Confirm consultation request submission  
**Message:** "Your consultation request has been submitted. Our loan officer will contact you within 1-2 business days to schedule an on-site inspection."

#### LON_2: SME Services Landing
**Screen ID:** LON_2  
**Type:** Info Page with Tabs  
**Purpose:** Information page for small business financing  
**Tabs:**
- **Card Sales Advance**: Quick cash against future card receivables
- **LON_2_1T - Business Loan**: Working capital loans for registered businesses
**Note:** Currently informational; applications coming in Phase 2

---

### User Account Management

#### MPG: My Page Hub
**Screen ID:** MPG  
**Type:** User Dashboard  
**Purpose:** Central hub for user account management  
**Sections:**
- Profile summary
- Quick stats: Total investments, total returns, available balance
- Menu navigation:
  - Investment dashboard (VDS)
  - Loan dashboard (VLN)
  - Account settings
  - Document management
  - Notification preferences

#### MPG_1P: Account Withdrawal Confirmation
**Screen ID:** MPG_1P  
**Type:** System Popup  
**Purpose:** Multi-step account termination process  
**Checks:**
1. No active investments
2. No outstanding loans
3. Zero deposit balance
4. No pending transactions
**Warnings:**
- Account cannot be reactivated
- Requires withdrawal of all funds first
**Final Step:** PIN confirmation + reason selection

#### MPG_2: Change Phone Number
**Screen ID:** MPG_2  
**Type:** Page  
**Purpose:** Update registered mobile phone  
**Process:**
1. Enter current phone number
2. SMS verification code to current phone
3. Enter new phone number
4. SMS verification code to new phone
5. PIN confirmation
6. Update complete

#### MPG_3: Change Password
**Screen ID:** MPG_3  
**Type:** Page  
**Purpose:** Update account password  
**Fields:**
- Current password
- New password (with strength meter)
- Confirm new password
**Validation:**
- Cannot reuse last 3 passwords
- Must meet complexity requirements

#### MPG_4: Change Bank Account
**Screen ID:** MPG_4  
**Type:** Page  
**Purpose:** Update linked withdrawal/deposit account  
**Requirements:**
1. Select new bank (CMM_1P)
2. Enter account number
3. Verification notice: Proceed to 1-won verification

#### MPG_4_1: 1-Won Verification (Account Change)
**Screen ID:** MPG_4_1  
**Type:** Page  
**Purpose:** Verify new bank account ownership  
**Same as:** SIG_3_5 verification flow

#### MPG_5: Change PIN
**Screen ID:** MPG_5  
**Type:** Page  
**Purpose:** Update transaction PIN  
**Process:**
1. Enter current PIN
2. Enter new 4-digit PIN
3. Confirm new PIN
4. Validation: Cannot reuse last 2 PINs

---

### Investment Dashboard

#### VDS: Investment Dashboard
**Screen ID:** VDS  
**Type:** Main Dashboard Page with Tabs  
**Purpose:** Comprehensive investment portfolio management  
**Summary Cards:**
- Total invested amount
- Active investments count
- Total returns (realized + unrealized)
- Expected monthly returns
**Tabs:**
- **VDS_1T**: Investment History
- **VDS_2T**: Payment Status
- **VDS_3T**: Deposit Management
- **VDS_4T**: Favorites

#### VDS_1T: Investment History Tab
**Screen ID:** VDS_1T  
**Type:** Tab View  
**Purpose:** List of all investment transactions  
**Table Columns:**
- Product name
- Investment date
- Amount
- Interest rate
- Period
- Status (Active, Repaying, Completed, Overdue)
- Returns to date
**Actions:**
- Click row → VDS_1T_1 (detail page)
- Filter button → VDS_1T_2P

#### VDS_1T_1: Investment Detail Page
**Screen ID:** VDS_1T_1  
**Type:** Detail Page  
**Purpose:** Single investment transaction details  
**Information:**
- Investment summary
- Product details snapshot
- Repayment schedule with status
- Certificate of investment (downloadable PDF)
- Payment history
- Tax withholding summary

#### VDS_1T_2P: Investment Filter Modal
**Screen ID:** VDS_1T_2P  
**Type:** System Popup  
**Purpose:** Filter investment history  
**Filters:**
- Date range
- Status (multi-select)
- Product type
- Amount range

#### VDS_2T: Payment Status Tab
**Screen ID:** VDS_2T  
**Type:** Tab View  
**Purpose:** Track received payments and scheduled distributions  
**Sections:**
- Upcoming payments (next 30 days)
- Payment history table
**Columns:**
- Payment date
- Product name
- Principal
- Interest
- Tax withheld
- Net amount
- Status

#### VDS_3T: Deposit Management Tab
**Screen ID:** VDS_3T  
**Type:** Tab View  
**Purpose:** Manage investment wallet balance  
**Features:**
- Current balance (large display)
- Deposit instructions (virtual account info + copy button)
- Deposit history table
- Withdrawal button → VDS_3T_1P

#### VDS_3T_1P: Withdrawal Request Modal
**Screen ID:** VDS_3T_1P  
**Type:** Popup  
**Purpose:** Withdraw funds from investment wallet to linked bank account  
**Process:**
1. Display available balance
2. Enter withdrawal amount (with "All" button)
3. Confirm destination account (display registered account)
4. PIN verification
5. Withdrawal processing (1-2 business days)

#### VDS_4T: Favorite Products Tab
**Screen ID:** VDS_4T  
**Type:** Tab View  
**Purpose:** Saved/favorited investment products  
**Features:**
- Product cards with key metrics
- Quick invest button → VDS_4T_1P

#### VDS_4T_1P: Quick Invest Modal
**Screen ID:** VDS_4T_1P  
**Type:** System Popup  
**Purpose:** Simplified investment flow from favorites  
**Process:**
- Pre-populated product info
- Amount input
- Risk acknowledgment
- PIN confirmation
- Direct to CMM_5_1 completion

#### VDS_5: Investor Type Change Application
**Screen ID:** VDS_5  
**Type:** Page  
**Purpose:** Apply for investor qualification upgrade (General → Income-Qualified → Experienced)  
**Requirements by Type:**
- **Income-Qualified**: Upload income proof (tax statement, salary slips showing ≥50M KRW annually)
- **Experienced**: Provide trading history showing ≥12 months of investment activity
**Process:**
1. Select target investor type
2. Upload required documents
3. Submit application
4. Admin review (1-3 business days)

#### VDS_5_1: Type Change Application Submitted
**Screen ID:** VDS_5_1  
**Type:** Success Page  
**Purpose:** Confirmation of application submission  
**Information:**
- Application reference number
- Expected review time
- Status check instructions

---

### Loan Dashboard

#### VLN: Loan Dashboard
**Screen ID:** VLN  
**Type:** Main Dashboard Page  
**Purpose:** Borrower's loan management center  
**Summary:**
- Active loans count
- Total borrowed amount
- Next payment due date and amount
- Outstanding balance

#### VLN_1: Loan Detail Page
**Screen ID:** VLN_1  
**Type:** Detail Page  
**Purpose:** Single loan contract details  
**Information:**
- Loan contract summary
- Collateral information with property images
- Repayment schedule table with status indicators
- Payment history
- Early repayment calculator
- Document downloads (contract, collateral documents)
**Status Timeline:**
- Application submitted
- Under review
- On-site inspection scheduled
- Inspection completed
- Contract signed
- Funding in progress
- Loan disbursed
- Repayment in progress
- Completed

#### VLN_2P: Loan Filter Modal
**Screen ID:** VLN_2P  
**Type:** Popup  
**Purpose:** Filter loan history  
**Filters:**
- Status
- Date range
- Loan amount range

#### VLN_2T: Deposit History Tab
**Screen ID:** VLN_2T  
**Type:** Tab View  
**Purpose:** Track loan-related transactions  
**Transactions:**
- Loan disbursements received
- Repayments made
- Fee charges

---

### Support & Help

#### CUS: FAQ & Help Center
**Screen ID:** CUS  
**Type:** Main Help Page  
**Purpose:** Frequently asked questions organized by category  
**Categories:**
- Getting started
- Investments
- Loans
- Account management
- Payments & withdrawals
- Technical issues
**Features:**
- Search functionality
- Category navigation
- Popular questions

#### CUS_1: Announcements & Events
**Screen ID:** CUS_1  
**Type:** List Page  
**Purpose:** Platform news, updates, events  
**Tabs:**
- Announcements (service updates, maintenance)
- Events (promotions, investment bonuses)
**Table:** Title, category, date, views

#### CUS_1_1: Announcement Detail
**Screen ID:** CUS_1_1  
**Type:** Detail Page  
**Purpose:** Full announcement content  
**Elements:**
- Title, date, author
- Content with rich text support
- Attachments (if any)
- Previous/Next navigation

#### CUS_2: 1:1 Inquiry List
**Screen ID:** CUS_2  
**Type:** List Page  
**Purpose:** User's support ticket history  
**Table Columns:**
- Ticket number
- Category
- Subject
- Status (Pending, Answered, Closed)
- Created date
**Actions:**
- New inquiry button → CUS_2_1
- Click row → View ticket detail

#### CUS_2_1: Submit New Inquiry
**Screen ID:** CUS_2_1  
**Type:** Form Page  
**Purpose:** Create support ticket  
**Fields:**
- Category dropdown (account, investment, loan, technical, etc.)
- Subject (text)
- Message (textarea)
- Attachments (optional, up to 5 files)
**Submission:** Ticket created, user receives ticket number

#### CUS_2_2: Edit Inquiry
**Screen ID:** CUS_2_2  
**Type:** Form Page  
**Purpose:** Modify inquiry before admin response  
**Note:** Can only edit inquiries with status "Pending"

---

### Legal & Terms

#### TAC_1: Service Terms
**Screen ID:** TAC_1  
**Type:** Legal Document Page  
**Purpose:** Platform terms of service  
**Version Control:** Displays version and effective date

#### TAC_2: Privacy Policy
**Screen ID:** TAC_2  
**Type:** Legal Document Page  
**Purpose:** Personal information processing policy

#### TAC_3: Online Investment Agreement
**Screen ID:** TAC_3  
**Type:** Legal Document Page  
**Purpose:** Investment-specific terms (온투법 준수)

#### TAC_4: Online Loan Agreement
**Screen ID:** TAC_4  
**Type:** Legal Document Page  
**Purpose:** Loan-specific terms

#### TAC_5: E-Financial Transaction Agreement
**Screen ID:** TAC_5  
**Type:** Legal Document Page  
**Purpose:** Electronic payment terms

---

## Fiscus Admin System

**Total Pages:** 25 core admin pages  
**Primary Users:** Platform administrators, loan officers, financial operators

---

### Dashboard & Insights

#### BMAI_1: Admin Login
**Screen ID:** BMAI_1  
**Type:** Authentication Page  
**Purpose:** Secure admin system access  
**Security:**
- ID/password authentication
- 5 failed attempts → account lock
- IP whitelist restriction (optional)
- Session timeout: 30 minutes
**Features:**
- Remember ID checkbox
- Password recovery link

#### BMAI_2: Insights Dashboard
**Screen ID:** BMAI_2  
**Type:** Main Admin Dashboard  
**Purpose:** Real-time platform monitoring and KPIs  
**Widgets:**
1. **Member Stats**: Total users, new signups (today/week/month), active users
2. **Loan Pipeline**: Applications received, under review, approved, pending funding
3. **Funding Status**: Active products, total funding goal, funded amount, completion rate
4. **Investment Activity**: Total investments today, top products, average investment amount
5. **Financial Overview**: Total deposits, total withdrawals, platform balance
6. **Overdue Loans**: Count and amount of overdue loans with aging analysis
**Features:**
- Date range selector (today, week, month, quarter, year)
- Export to Excel
- Drill-down links to detailed pages

---

### Member Management

#### BMEM_1: Member Management
**Screen ID:** BMEM_1  
**Type:** Member List & Detail Page  
**Purpose:** Comprehensive member database management  
**Search/Filter:**
- Search by name, email, phone, CI
- Filter by: Member type (individual/corporate), investor type, registration date, status
**Member Table Columns:**
- Member ID
- Name / Business name
- Email
- Phone
- Investor type
- Registration date
- Status (Active, Suspended, Withdrawn)
- Total investments
- Total loans
**Detail View Tabs (when member selected):**
1. **Basic Info**: Profile, KYC status, bank account
2. **Investment History**: All investments with status
3. **Loan History**: All loan applications and active loans
4. **Transactions**: Deposit/withdrawal history
5. **SMS History**: Sent messages
6. **Inquiries**: Support tickets from this user
**Admin Actions:**
- Suspend account
- Add to blacklist (with reason)
- Manual investor type change
- Resend verification email
- Unlock account
- View audit logs

#### BMEM_2: Blacklist Management
**Screen ID:** BMEM_2  
**Type:** List Page  
**Purpose:** Manage blocked users  
**Table:**
- Member ID, name
- Blacklist reason (fraud, multiple defaults, etc.)
- Added by (admin name)
- Added date
**Actions:**
- Remove from blacklist
- View member detail

#### BMEM_3: Withdrawn Members
**Screen ID:** BMEM_3  
**Type:** List Page  
**Purpose:** View terminated accounts  
**Table:**
- Member ID, name
- Withdrawal date
- Withdrawal reason
- Final balance (should be 0)
**Note:** Read-only, for compliance audit purposes

---

### Loan Operations

#### BBUS_1: Loan Application Management
**Screen ID:** BBUS_1  
**Type:** Loan Pipeline Management Page  
**Purpose:** Process loan applications from submission to approval  
**Application States:**
- `RECEIVED`: Just submitted
- `UNDER_REVIEW`: Assigned to loan officer
- `INFO_REQUESTED`: Additional documents requested from borrower
- `INSPECTION_SCHEDULED`: On-site inspection appointment set
- `INSPECTION_COMPLETED`: Field assessment done
- `CONTRACT_PENDING`: Awaiting offline contract signing
- `APPROVED`: Ready for funding product creation
- `REJECTED`: Application declined
**Detail Panel (when application selected):**
1. **Application Overview**: Borrower info, requested amount, property address
2. **Property Information**: 
   - KB valuation (fetched via API)
   - Address, size, property type
   - LTV calculation
   - Photos uploaded by borrower
3. **Borrower Profile**:
   - Credit score (fetched from credit bureau API with Circuit Breaker)
   - Income information
   - Existing debts (DTI calculation)
   - Employment status
4. **Uploaded Documents**:
   - Document viewer (embedded PDF/image viewer)
   - Checklist: Registration certificate, income proof, ID, etc.
5. **Inspection Records**:
   - Inspection date and inspector name
   - On-site photos
   - Assessor notes
   - Recommended loan amount
6. **Contract Documents**:
   - Upload scanned signed contract
   - Mortgage registration documents
7. **Review History**: All status changes with timestamps and admin notes
**Admin Actions:**
- Assign to loan officer
- Request additional information (auto-sends email to borrower)
- Schedule inspection (date picker + assign inspector)
- Upload inspection report
- Upload signed contract documents
- Enter final loan terms: Amount, rate, period
- Approve (moves to BFUN_1 as pending funding product)
- Reject with reason
**Notes Section:** Internal admin notes (not visible to borrower)

---

### Investment & Funding Management

#### BFUN_1: Funding Product Management
**Screen ID:** BFUN_1  
**Type:** Funding Product Lifecycle Management  
**Purpose:** Create and manage investment products from approved loans  
**Product States:**
- `PENDING_PRODUCT_CREATION`: Approved loan, not yet published
- `SCHEDULED_FOR_FUNDING`: Product created, scheduled for future launch
- `FUNDING_OPEN`: Currently accepting investments
- `FUNDING_COMPLETE`: 100% funded, awaiting investment approval
- `INVESTMENT_APPROVED`: Ready for loan disbursement
- `CANCELLED`: Funding cancelled
- `FAILED`: Funding deadline reached without full funding
**Product Creation Form:**
1. **Auto-filled from Loan**:
   - Borrower (anonymized)
   - Loan amount, rate, period
   - Collateral info
2. **Admin Input**:
   - Product title (public-facing)
   - Product description
   - Investment highlights
   - Risk rating (A+, A, B+, B, C)
   - Funding start date
   - Funding deadline
   - Minimum/maximum investment per user
   - Featured product flag
3. **Media**:
   - Upload product images (property photos)
   - Upload related documents (for investor download)
**Product Detail View:**
- Real-time funding progress bar
- List of investors with amounts (anonymized to other users, full detail for admin)
- Timeline of events (published, first investment, 50% funded, 100% funded)
**Admin Actions:**
- Publish product (changes status to FUNDING_OPEN)
- Cancel funding (before 100%)
- Approve investments (after 100% funding) → Triggers BDIS_2 loan disbursement flow
- Modify product details (only if funding hasn't started)
- Close funding early (if needed)

#### BINV_1: Investment Management
**Screen ID:** BINV_1  
**Type:** Investment Transaction List  
**Purpose:** Monitor all investment transactions  
**Table Columns:**
- Investment ID
- Product name
- Investor name/email
- Amount
- Date
- Status (Applied, Confirmed, Cancelled, Repaying, Completed)
**Detail View:**
- Investment certificate (PDF generation)
- Related product details
- Payment schedule
- Cancellation option (only for status = Applied, before investment approval)
**Admin Actions:**
- Manual investment cancellation (refund to deposit)
- Issue investment certificate
- View/download certificate PDF

---

### Bond & Repayment Management

#### BBON_1: Bond Management
**Screen ID:** BBON_1  
**Type:** Loan Contract & Bond List  
**Purpose:** Track active loans (bonds) and repayment status  
**Bond States:**
- `ACTIVE`: Loan disbursed, repayment in progress
- `OVERDUE`: Missed payment
- `DEFAULT`: 60+ days overdue, ECL (기한이익상실) declared
- `EARLY_REPAYMENT_COMPLETE`: Borrower paid off early
- `MATURITY_COMPLETE`: Final payment completed on schedule
**Table Columns:**
- Bond ID
- Product name
- Borrower name
- Principal amount
- Outstanding balance
- Interest rate
- Maturity date
- Next payment due
- Status
**Detail View:**
1. **Contract Info**: Loan terms, start date, maturity date
2. **Repayment Schedule**:
   - Table: Due date, principal, interest, total, status (Paid/Pending/Overdue)
   - Payment status indicators
3. **Transaction Ledger**: All payments received
4. **Investor Breakdown**: List of all investors and their portions
5. **Collateral Documents**: Property docs, mortgage registration
6. **Collection Activities** (if overdue):
   - Overdue notices sent
   - Collection calls log
   - Legal proceedings status
**Admin Actions:**
- Record manual payment (if borrower pays offline)
- Send overdue notice (auto-generated SMS/email)
- Declare ECL (changes status to DEFAULT)
- Schedule auction (for collateral liquidation)
- Record recovery proceeds
- Adjust payment schedule (restructuring)

---

### Financial Operations

#### BDIS_1: Principal & Interest Distribution
**Screen ID:** BDIS_1  
**Type:** Payment Distribution Management  
**Purpose:** Distribute received repayments to investors  
**Distribution States:**
- `PENDING_DISTRIBUTION`: Payment received from borrower, not yet distributed
- `DISTRIBUTION_REQUESTED`: Admin requested distribution
- `DISTRIBUTION_APPROVED`: Approved, ready for batch processing
- `DISTRIBUTION_COMPLETE`: Funds transferred to all investor deposit accounts
**Distribution Process:**
1. **Initiation**:
   - Select bond and repayment installment
   - System shows: Total received amount, number of investors, distribution calculation
2. **Calculation Engine**:
   ```
   For each investor:
     Investor Share = (Investor Investment / Total Funded) × Total Repayment
     Platform Fee = Investor Share × Fee Rate (if configured)
     Tax Withholding = (Investor Share - Principal Portion) × 15.4%
     Net Distribution = Investor Share - Platform Fee - Tax Withholding
   ```
3. **Preview**:
   - Table showing each investor, calculated amounts, fees, taxes, net amount
   - Download preview as Excel
4. **Approval**:
   - Admin reviews and approves
   - System creates batch job
5. **Execution**:
   - Bulk deposit credit to all investor accounts
   - Generate transaction records
   - Send SMS/email notifications to investors
   - Create tax withholding records
**Admin Actions:**
- Request distribution
- Approve distribution
- View distribution history
- Regenerate tax documents

#### BDIS_2: Loan Disbursement Management
**Screen ID:** BDIS_2  
**Type:** Loan Payout Management  
**Purpose:** Disburse funded loan amounts to borrowers  
**Disbursement States:**
- `PENDING_DISBURSEMENT`: Funding complete, awaiting disbursement initiation
- `DISBURSEMENT_REQUESTED`: Admin requested payout
- `DISBURSEMENT_APPROVED`: Approved, ready for bank transfer
- `PARTIAL_DISBURSEMENT`: Some tranches paid (for staged disbursement)
- `COMPLETE_DISBURSEMENT`: Full amount transferred
**Two-Stage Disbursement Process:**
1. **Initial Disbursement** (typically 70-80% of funded amount):
   - Transfer to borrower account
   - Hold remaining amount as reserve for fees/contingencies
2. **Final Disbursement**:
   - After confirmation of mortgage registration
   - Release remaining funds after deducting platform fees
**Detail View:**
- Funding summary
- Borrower account details
- Disbursement schedule (if staged)
- Bank transfer confirmation
**Admin Actions:**
- Initiate disbursement
- Approve disbursement (requires dual approval)
- Upload bank transfer confirmation
- Record transaction
- Mark as complete

#### BTAX_1: Deposit/Withdrawal Transactions
**Screen ID:** BTAX_1  
**Type:** Transaction Log  
**Purpose:** Audit trail of all money movements  
**Table Columns:**
- Transaction ID
- Type (Deposit / Withdrawal / Investment / Distribution / Fee)
- User
- Amount
- Date & time
- Status
- Related entity (product ID, bond ID)
**Filters:**
- Date range
- Transaction type
- User
- Amount range
**Export:** Excel download for accounting

#### BTAX_2: Tax Withholding Records
**Screen ID:** BTAX_2  
**Type:** Tax Reporting  
**Purpose:** Track withheld taxes for annual reporting  
**Table:**
- User name
- Tax ID (RRN anonymized)
- Total investment income
- Total tax withheld
- Year
**Detail View:**
- Monthly breakdown
- Per-investment breakdown
**Actions:**
- Generate annual tax statement (연말정산 자료)
- Export for National Tax Service submission

---

### System Administration

#### BSYS_2: SMS Management
**Screen ID:** BSYS_2  
**Type:** SMS Campaign & History  
**Purpose:** Send notifications and manage SMS templates  
**Tabs:**
1. **Send SMS**:
   - Recipient selection: Single user, user group (investors, borrowers), all users
   - Message template dropdown (saved templates)
   - Message text (auto-fills from template, editable)
   - Character count (90 bytes for SMS, 2000 for LMS)
   - Schedule option (send now / scheduled)
   - Preview before send
2. **SMS History**:
   - Table: Sent date, recipient count, message, status (Sent/Failed), delivery rate
   - Detail: Individual recipient delivery status
3. **Templates**:
   - Create/edit SMS templates with variables (e.g., {name}, {amount}, {product})

#### BSYS_4: Admin Account Management
**Screen ID:** BSYS_4  
**Type:** Internal User Management  
**Purpose:** Create and manage admin accounts  
**Admin Types:**
- Super Admin (full access)
- Loan Officer (BBUS, BFUN, BBON access)
- Finance Team (BDIS, BTAX access)
- Customer Service (BMEM, CUS inquiry responses)
- Viewer (read-only)
**Account Form:**
- Name, email, phone
- Department
- Role
- Permission profile (BSYS_5)
- IP whitelist (optional)
**Admin Actions:**
- Create account
- Reset password
- Suspend account
- Delete account (soft delete, maintain audit log)

#### BSYS_5: Role & Permission Management
**Screen ID:** BSYS_5  
**Type:** RBAC Configuration  
**Purpose:** Define granular permissions for admin roles  
**Permission Structure:**
- Menu access (which sections visible)
- Read permissions (can view data)
- Write permissions (can edit)
- Approve permissions (can approve workflows)
- Delete permissions
**Pre-configured Roles:**
- Super Admin: All permissions
- Loan Officer: BBUS (write), BFUN (write), BBON (read/write), BMEM (read)
- Finance Manager: BDIS (approve), BTAX (write), BFUN (approve)
- Customer Service: BMEM (read/write), CUS (write), SMS (send)

#### BSYS_6: Platform Fee Configuration
**Screen ID:** BSYS_6  
**Type:** Fee Policy Management  
**Purpose:** Configure fee structure  
**Fee Types:**
1. **Investor Fee**:
   - Percentage of investment returns
   - Flat fee per investment
   - Annual management fee
2. **Borrower Fee**:
   - Origination fee (% of loan amount)
   - Late payment fee
   - Early repayment fee
**Configuration:**
- Fee type: Percentage / Fixed amount
- Value
- Applied to: All users / Specific user segments
- Effective date
**Note:** Fees are policy-ready (implemented in system logic) but can be set to 0% if not charging initially

#### BSYS_8: Terms Management
**Screen ID:** BSYS_8  
**Type:** Legal Document Version Control  
**Purpose:** Manage terms and conditions versions  
**Document Types:**
- Service terms (TAC_1)
- Privacy policy (TAC_2)
- Investment agreement (TAC_3)
- Loan agreement (TAC_4)
- E-financial agreement (TAC_5)
**Version Management:**
- Upload new version (HTML editor)
- Effective date
- Mandatory re-agreement flag (if true, users must re-agree on next login)
- View version history
- Download as PDF

#### BSYS_9: Disclosure Management
**Screen ID:** BSYS_9  
**Type:** Regulatory Disclosure  
**Purpose:** Manage public disclosures per Online Investment-Linked Finance Act  
**Disclosure Types:**
1. **Business Disclosure (경영공시)**:
   - Company financial statements
   - Shareholder information
   - Management team
   - Updated quarterly
2. **Product Disclosure (상품공시)**:
   - Per funding product
   - Borrower information (anonymized)
   - Risk factors
   - Expected returns
   - Default rate statistics
**Actions:**
- Upload disclosure documents
- Set publication date
- Archive old disclosures (maintain for 5 years)

#### BLOG_3: API Log Viewer
**Screen ID:** BLOG_3  
**Type:** Technical Log Interface  
**Purpose:** Debug external API integrations  
**Logged APIs:**
- NICE/KCB identity verification
- Paygate payment gateway
- KB property valuation
- Credit bureau (NICE credit scoring)
- SMS gateway
**Table Columns:**
- Timestamp
- API name
- Endpoint
- Request payload (anonymized sensitive data)
- Response status
- Response time (ms)
- Error message (if failed)
**Filters:**
- Date range
- API name
- Status (Success / Failed / Timeout)
- User ID (to trace specific user's API calls)
**Detail View:**
- Full request headers
- Full response body
- Circuit breaker status (Open/Closed/Half-Open)
**Use Cases:**
- Diagnose why a user's KYC failed
- Track payment gateway downtime
- Monitor API performance and latency

---

## Email Templates

The following email templates are referenced in system workflows:

#### MEM_1: Welcome Email
**Trigger:** Successful user registration (SIG_3_8 or SIG_4_10)  
**Content:**
- Welcome message
- Virtual account number
- First steps guide
- Customer support contact

#### MEM_2: Terms Update Notice
**Trigger:** New terms version published with mandatory re-agreement  
**Content:**
- Notice of terms update
- Summary of changes
- Link to view new terms
- Re-agreement deadline

#### MEM_3: Loan Disbursement Notification
**Trigger:** Admin completes loan disbursement (BDIS_2)  
**Content:**
- Loan disbursement confirmation
- Amount transferred
- Repayment schedule
- Next payment due date

#### MEM_4: Investment Confirmation
**Trigger:** Investment transaction completed (CMM_5_1)  
**Content:**
- Investment confirmation
- Product name
- Amount invested
- Expected returns
- Certificate download link

#### MEM_5: Account Withdrawal Confirmation
**Trigger:** Account deletion completed (MPG_1P)  
**Content:**
- Confirmation of account termination
- Final transaction summary
- Data retention notice (per GDPR)

#### MEM_6: Email Change Verification
**Trigger:** User requests email change  
**Content:**
- Verification link (sent to new email)
- Confirmation code
- Security notice

---

## API Integration Requirements

### External APIs Required

| API | Provider | Purpose | Circuit Breaker Config |
|-----|----------|---------|------------------------|
| **Identity Verification** | NICE/KCB | Phone-based KYC (SIG_3_1, SIG_4_1) | Timeout: 10s, Failure threshold: 50%, Cooldown: 30s |
| **Payment Gateway** | Paygate | Virtual accounts, 1-won verification, disbursement | Timeout: 15s, Retry: 2 attempts with exponential backoff |
| **Credit Scoring** | NICE Credit | Borrower creditworthiness check (BBUS_1) | Timeout: 10s, Failure threshold: 50%, Cooldown: 30s |
| **Property Valuation** | KB Kookmin Bank | Real estate appraisal (LON_1_1) | Timeout: 15s, Manual fallback if failed |
| **Address Search** | Kakao API | Address autocomplete (SIG_3_2, LON_1) | Timeout: 5s, Graceful degradation |
| **SMS Gateway** | Multiple (Aligo, NHN) | OTP, notifications (system-wide) | Timeout: 10s, Failover to backup provider |

### Internal APIs (Fiscus ↔ Finnova Communication)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/products` | GET | Fetch active investment products for Finnova display |
| `/api/v1/products/{id}` | GET | Get product details |
| `/api/v1/investments` | POST | Create investment transaction |
| `/api/v1/loans` | POST | Submit loan application (Finnova → Fiscus) |
| `/api/v1/loans/{id}/status` | GET | Check loan application status |
| `/api/v1/users/{id}/limits` | GET | Check user's investment limits (CI-based aggregation) |
| `/api/v1/deposits` | GET | Get user deposit balance |
| `/api/v1/distributions` | GET | Get user's payment distribution history |

---

## Implementation Status

### Phase 1: Completed (90/115 pages) ✅

**Finnova Web: 59 pages**
- ✅ Authentication & Onboarding (23 pages)
- ✅ Investment Features (12 pages)
- ✅ Loan Features (6 pages)
- ✅ User Account Management (6 pages)
- ✅ Investment Dashboard (9 pages)
- ✅ Loan Dashboard (3 pages)
- ✅ Support & Help (5 pages)
- ✅ Legal & Terms (5 pages)
- ✅ Common Components (9 modals/screens)

**Fiscus Admin: 25 pages**
- ✅ Dashboard & Insights (2 pages)
- ✅ Member Management (3 pages)
- ✅ Loan Operations (1 core page)
- ✅ Funding Management (1 core page)
- ✅ Investment Management (1 page)
- ✅ Bond Management (1 page)
- ✅ Financial Operations (4 pages)
- ✅ System Administration (12 pages)

### Phase 2: Remaining (25 pages)

**Finnova - Additional Features:**
1. Advanced investment analytics dashboard (3 pages)
2. Portfolio rebalancing recommendations (2 pages)
3. Secondary market for early exit (5 pages)
4. Borrower-specific dashboard enhancements (3 pages)
5. Mobile app companion screens (if native app planned)

**Fiscus - Advanced Operations:**
1. Automated loan underwriting dashboard (2 pages)
2. Risk management module (3 pages)
3. Advanced reporting & BI dashboards (4 pages)
4. Compliance audit trail viewer (2 pages)
5. Bulk operation tools (data import/export) (3 pages)

### Phase 3: Future Enhancements

- **AI-powered credit scoring** (자체 CSS 모델)
- **Auto-investment** feature (조건부 자동투자)
- **Video KYC** (비대면 실사)
- **Blockchain-based** investment certificates (NFT 기반 투자증서)
- **Crypto payment integration** (암호화폐 입출금)

---

## Technical Implementation Notes

### Critical Business Logic

1. **Investment Transaction (CMM_5)**:
   - Use **Redis distributed lock** (Redlock algorithm) for product-level concurrency control
   - **Saga pattern** for multi-step transaction (debit deposit → create investment → update funding progress)
   - **Optimistic locking** on `funding_products.version` to prevent double-booking
   - Atomic operations with compensating transactions on failure

2. **Bulk Distribution (BDIS_1)**:
   - Process in batches of 100 investors to manage memory
   - Use read-only replica for investor list queries
   - Bulk insert for transaction records
   - Publish async event after completion for notifications

3. **Loan Application Review (BBUS_1)**:
   - Circuit breaker for credit bureau API (NICE credit)
   - Exponential backoff retry strategy
   - Fallback to manual review if API fails
   - Webhooks to notify borrower of status changes

4. **Security**:
   - JWT-based authentication with 30-minute session
   - RBAC for admin system (BSYS_5)
   - Sensitive data encryption at rest (AES-256)
   - TLS 1.2+ for all API communication
   - PIN hashing with bcrypt (cost factor 12)
   - IP whitelisting for admin panel

5. **Compliance**:
   - CI-based investment limit aggregation (prevent multi-account limit evasion)
   - Immutable audit log for all financial transactions
   - Daily snapshot of investor positions for regulatory reporting
   - Automated disclosure uploads to FSS (금융감독원) portal

---

## Getting Started for Developers

### Prerequisites
```bash
Node.js 20+
npm 10+ or yarn 1.22+
Redis (for distributed locks and caching)
PostgreSQL 15+ (database)
```

### Installation
```bash
# Clone repository
git clone <repo-url>
cd fiscus-finnova

# Install dependencies
npm install

# Environment setup
cp .env.example .env.local
# Configure: DATABASE_URL, REDIS_URL, API_KEYS

# Run development servers
npm run dev
```

### Dev Servers
- **Finnova Web**: http://localhost:3000
- **Fiscus Admin**: http://localhost:3001
- **Storybook (UI Components)**: http://localhost:6006 (if configured)

### Database Migrations
```bash
npm run db:migrate
npm run db:seed # Seed initial data (test users, sample products)
```

### Testing
```bash
npm run test # Unit tests
npm run test:e2e # End-to-end tests (Playwright)
npm run test:integration # API integration tests
```

---

## Document References

This README consolidates information from:
- `00_통합_기획_산출물/01_통합_사이트맵_및_IA.md`
- `00_통합_기획_산출물/03_페이지_단위_기능_명세.md`
- `02_핀노바_유저UI/01_UI_명세/finnova_ia.md`
- `02_핀노바_유저UI/01_UI_명세/Finnova_PRD.md`
- `03_백오피스/01_관리자_시스템/Fiscus_PRD.md`
- `01_피스커스_시스템/01_시스템_아키텍처/Fiscus_Finnova_Implementation_Specification.md`

**For detailed API specifications, see:** `04_통신_규격_및_공통_컴포넌트_설계.md`  
**For database schema, see:** `02_ERD_및_데이터베이스_설계.md`  
**For exception handling, see:** `08_예외_및_엣지케이스_상세_정의서.md`

---

## Support & Contact

For questions about this platform specification:
- **Technical Lead**: [Your Name]
- **Product Manager**: [PM Name]
- **Documentation**: See `/docs` folder for detailed specs

**Last Updated:** January 26, 2026
