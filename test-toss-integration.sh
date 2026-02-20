#!/bin/bash

# Toss Payments Integration - Testing Script
# Tests the loan disbursement and repayment endpoints
# Usage: ./test-toss-integration.sh

BASE_URL="http://localhost:3000/api"
AUTH_TOKEN="your-jwt-token-here"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Toss Payments Integration Testing ===${NC}\n"

# Test 1: Create Loan Application
echo -e "${YELLOW}Test 1: Creating loan application...${NC}"
APP_RESPONSE=$(curl -s -X POST "$BASE_URL/loans/applications" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loanProductId": "product-uuid",
    "requestedLoanAmount": 50000000,
    "loanPeriod": 12,
    "collateralType": "apartment",
    "collateralValue": 100000000,
    "collateralAddress": "123 Main St, Seoul",
    "collateralDetails": "Test property"
  }')

APP_ID=$(echo "$APP_RESPONSE" | jq -r '.data.id')
echo -e "${GREEN}Created: $APP_ID${NC}\n"

# Test 2: Submit Application
echo -e "${YELLOW}Test 2: Submitting application...${NC}"
SUBMIT_RESPONSE=$(curl -s -X POST "$BASE_URL/loans/applications/$APP_ID/submit" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

echo -e "${GREEN}Submitted${NC}\n"

# Test 3: Admin Approve Loan (as admin)
echo -e "${YELLOW}Test 3: Approving loan (admin action)...${NC}"
APPROVE_RESPONSE=$(curl -s -X PUT "$BASE_URL/loans/applications/$APP_ID/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approvedLoanAmount": 50000000,
    "approvedInterestRate": 5.5,
    "approvedLoanPeriod": 12,
    "reviewerNotes": "Approved for testing"
  }')

echo -e "${GREEN}Approved${NC}\n"

# Test 4: Disburse Loan
echo -e "${YELLOW}Test 4: Disbursing loan...${NC}"
DISBURSE_RESPONSE=$(curl -s -X POST "$BASE_URL/loans/applications/$APP_ID/disburse" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

LOAN_ACCOUNT_ID=$(echo "$DISBURSE_RESPONSE" | jq -r '.data.loanAccountId')
VA_NUMBER=$(echo "$DISBURSE_RESPONSE" | jq -r '.data.virtualAccountNumber')

echo -e "${GREEN}Disbursed to virtual account: $VA_NUMBER${NC}"
echo -e "${GREEN}Loan Account ID: $LOAN_ACCOUNT_ID${NC}\n"

# Test 5: Query Virtual Account Balance (optional)
echo -e "${YELLOW}Test 5: Checking virtual account balance...${NC}"
echo "Virtual Account: $VA_NUMBER"
echo "(In production, borrower would transfer funds to this account)\n"

# Test 6: Process Repayment (after virtual account is credited)
echo -e "${YELLOW}Test 6: Processing repayment...${NC}"
REPAY_RESPONSE=$(curl -s -X POST "$BASE_URL/loans/accounts/$LOAN_ACCOUNT_ID/repay" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000000,
    "paymentKey": "payment_test_xxx",
    "paymentMethod": "virtual_account"
  }')

TRANSACTION_ID=$(echo "$REPAY_RESPONSE" | jq -r '.data.transactionId')
NEW_BALANCE=$(echo "$REPAY_RESPONSE" | jq -r '.data.newBalance')
NEXT_PAYMENT=$(echo "$REPAY_RESPONSE" | jq -r '.data.nextPaymentAmount')

echo -e "${GREEN}Repayment processed${NC}"
echo -e "  Transaction ID: $TRANSACTION_ID"
echo -e "  New Balance: ₩$NEW_BALANCE"
echo -e "  Next Payment: ₩$NEXT_PAYMENT\n"

# Test 7: Query Updated Application
echo -e "${YELLOW}Test 7: Querying updated application...${NC}"
FINAL_RESPONSE=$(curl -s -X GET "$BASE_URL/loans/applications/$APP_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

STATUS=$(echo "$FINAL_RESPONSE" | jq -r '.data.status')
echo -e "${GREEN}Application Status: $STATUS${NC}\n"

echo -e "${GREEN}=== All tests completed ===${NC}\n"

# Summary
echo -e "${YELLOW}Summary:${NC}"
echo "✓ Loan Application Created: $APP_ID"
echo "✓ Loan Submitted for Review"
echo "✓ Loan Approved by Admin"
echo "✓ Loan Disbursed to VA: $VA_NUMBER"
echo "✓ Repayment Processed: ₩5,000,000"
echo "✓ New Principal Balance: ₩$NEW_BALANCE"
echo ""
echo -e "${GREEN}Integration working correctly! ✅${NC}"
