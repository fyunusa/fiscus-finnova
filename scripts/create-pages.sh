#!/bin/bash

# This script creates all the page scaffolds for Finnova

APPS_DIR="apps/finnova-web/src/app"

# Define all pages with their structure
# Format: "path|component_name|description"
PAGES=(
  # Auth Pages
  "login|Login|로그인 페이지"
  "login/forgot-email|ForgotEmail|이메일 찾기"
  "login/reset-password|ResetPassword|비밀번호 재설정"
  "signup|Signup|회원가입"
  "signup/individual|IndividualSignup|개인 회원가입"
  "signup/corporate|CorporateSignup|법인 회원가입"
  
  # Investment Pages
  "investment|Investment|투자 상품 목록"
  "investment/[id]|InvestmentDetail|투자 상품 상세"
  "investment/[id]/apply|InvestmentApply|투자 신청"
  
  # Loan Pages
  "loan|Loan|대출 신청"
  "loan/apartment|ApartmentLoan|아파트 담보대출"
  "loan/sales|SalesLoan|소상공인 서비스"
  "loan/consultation|LoanConsultation|대출 상담"
  
  # Dashboard Pages
  "dashboard|Dashboard|대시보드"
  "dashboard/investments|InvestmentDashboard|투자 현황"
  "dashboard/loans|LoanDashboard|대출 현황"
  "dashboard/deposits|DepositDashboard|예치금 관리"
  "dashboard/wishlist|Wishlist|찜한 상품"
  
  # Account Pages
  "account|Account|마이페이지"
  "account/profile|Profile|프로필 설정"
  "account/security|Security|보안 설정"
  "account/notifications|Notifications|알림 설정"
  "account/withdrawal|Withdrawal|회원탈퇴"
  
  # Support Pages
  "support|Support|이용안내"
  "support/faq|FAQ|자주 묻는 질문"
  "support/notice|Notice|공지사항"
  "support/contact|Contact|1:1 문의"
  
  # Policy Pages
  "terms|Terms|이용약관"
  "privacy|Privacy|개인정보처리방침"
  "disclosure|Disclosure|사업공시"
  
  # Error Pages
  "not-found|NotFound|404 에러"
  "error|Error|500 에러"
)

# Create pages
for page in "${PAGES[@]}"; do
  IFS='|' read -r path component description <<< "$page"
  
  PAGE_DIR="$APPS_DIR/$path"
  mkdir -p "$PAGE_DIR"
  
  cat > "$PAGE_DIR/page.tsx" <<EOF
'use client';

import Layout from '@/components/Layout';

export default function $component() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            $description
          </h1>
          <p className="text-gray-600">
            이 페이지는 아직 구현되지 않았습니다.
          </p>
        </div>
      </div>
    </Layout>
  );
}
EOF
  
  echo "Created: $PAGE_DIR/page.tsx"
done

echo "✅ All page scaffolds created successfully!"
