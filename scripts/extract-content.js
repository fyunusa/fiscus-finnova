#!/usr/bin/env node

/**
 * Page Content Extractor
 * Extracts content from design .md files and maps to auto-generated pages
 */

const fs = require('fs');
const path = require('path');

// Design file mappings
const contentMappings = {
  // Investment pages
  'investment/popular': {
    source: '../01_피스커스_시스템/02_알고리즘_로직/25-10-20 Money_Flow_and_Process_Definition.md',
    section: 'popular_products',
    description: '인기 있는 투자 상품들'
  },
  'investment/new': {
    source: '../02_핀노바_유저UI/01_UI_명세/Finnova_PRD.md',
    section: 'new_products',
    description: '신규 출시 상품'
  },
  'investment/ending-soon': {
    source: '../02_핀노바_유저UI/01_UI_명세/Finnova_PRD.md',
    section: 'ending_soon',
    description: '모집 마감 임박 상품'
  },
  
  // Loan pages
  'loan/my-loans': {
    source: '../02_핀노바_유저UI/02_서비스_흐름/25-10-14 핀노바_대출자_시뮬레이션.md',
    section: 'my_loans',
    description: '내 대출 현황'
  },
  'loan/calculator': {
    source: '../01_피스커스_시스템/02_알고리즘_로직/25-10-20 Money_Flow_and_Process_Definition.md',
    section: 'loan_calculator',
    description: '대출 상품 계산기'
  },
  
  // Account pages
  'account/documents': {
    source: '../02_핀노바_유저UI/01_UI_명세/Finnova_PRD.md',
    section: 'account_documents',
    description: '필수 서류 및 증명서'
  },
  'account/bank-accounts': {
    source: '../02_핀노바_유저UI/01_UI_명세/Finnova_PRD.md',
    section: 'bank_accounts',
    description: '계좌 관리 및 연결'
  },
  
  // Dashboard pages
  'dashboard/reports': {
    source: '../02_핀노바_유저UI/02_서비스_흐름/00_서비스_흐름_통합.md',
    section: 'detailed_reports',
    description: '상세 투자 현황 보고서'
  },
  'dashboard/performance': {
    source: '../02_핀노바_유저UI/02_서비스_흐름/00_서비스_흐름_통합.md',
    section: 'performance_analysis',
    description: '수익률 및 성과 분석'
  },
  
  // Support pages
  'support/chat': {
    source: '../02_핀노바_유저UI/01_UI_명세/Finnova_PRD.md',
    section: 'customer_support',
    description: '실시간 고객 지원'
  },
  'support/community': {
    source: '../02_핀노바_유저UI/01_UI_명세/Finnova_PRD.md',
    section: 'community_forum',
    description: '사용자 커뮤니티'
  },
};

// Helper function to generate content instruction
function generateContentInstruction(mapping) {
  return `
/**
 * ${mapping.description}
 * 
 * This page was auto-generated. To add content:
 * 
 * 1. Reference: ${mapping.source}
 * 2. Section: ${mapping.section}
 * 3. Extract relevant data and UI structure
 * 4. Replace the Alert component below with actual content
 * 
 * Content Structure:
 * - Title and description
 * - Data table or list
 * - Filters or search (if applicable)
 * - Action buttons
 */
`;
}

// Create instruction files
function generateContentGuides() {
  console.log('📖 Generating content extraction guides...\n');

  const guideDir = path.join(__dirname, '../CONTENT_GUIDES');
  if (!fs.existsSync(guideDir)) {
    fs.mkdirSync(guideDir, { recursive: true });
  }

  let count = 0;
  for (const [pagePath, mapping] of Object.entries(contentMappings)) {
    try {
      const guidePath = path.join(guideDir, `${pagePath.replace(/\//g, '_')}_GUIDE.md`);
      const guideContent = `# Content Guide: ${mapping.description}

## Page Location
\`${pagePath}\`

## Design Source
**File**: \`${mapping.source}\`
**Section**: \`${mapping.section}\`

## Expected Content

### Data Structure
\`\`\`typescript
interface Item {
  id: number;
  title: string;
  // Add more fields based on design doc
}
\`\`\`

### UI Components Needed
- Card (main container)
- Table (for data display)
- Button (for actions)
- Badge (for status)

## Implementation Steps

1. Open the design file at \`${mapping.source}\`
2. Find the section labeled \`${mapping.section}\`
3. Extract the data structure and requirements
4. Replace the Alert in the page with actual Table/data
5. Wire up any action handlers
6. Test responsiveness

## Example Template

\`\`\`tsx
// Replace this alert:
<Alert type="info">
  이 페이지는 자동으로 생성되었습니다.
</Alert>

// With actual content:
<Table
  columns={[
    { key: 'id', header: 'ID' },
    { key: 'title', header: 'Title' },
    // ... more columns
  ]}
  data={data}
  striped
/>
\`\`\`

## Related Pages
- See COMPONENT_LIBRARY.md for available components
- See QUICK_START.md for coding patterns
- Check existing completed pages for examples

---
*Auto-generated guide. Last updated: 2025-02-14*
`;

      fs.writeFileSync(guidePath, guideContent, 'utf8');
      console.log(`✓ ${pagePath}`);
      count++;
    } catch (error) {
      console.error(`✗ ${pagePath}: ${error.message}`);
    }
  }

  console.log(`\n✅ Generated ${count} content guides in CONTENT_GUIDES/`);
}

// Create master index of all pages
function generatePageIndex() {
  console.log('\n📋 Generating page index...');

  const indexContent = `# Auto-Generated Pages Index

## Overview
This document lists all 32 auto-generated pages and their status.

## Page Status Legend
- 🟡 **Skeleton**: Page created, awaiting content
- 🟢 **In Progress**: Content partially added
- ✅ **Complete**: Page fully implemented

---

## Finnova Web Pages (25 new)

### Investment Section (5 pages)
| Page | Path | Status | Guide |
|------|------|--------|-------|
| Popular Products | \`/investment/popular\` | 🟡 | [Guide](./CONTENT_GUIDES/investment_popular_GUIDE.md) |
| New Products | \`/investment/new\` | 🟡 | [Guide](./CONTENT_GUIDES/investment_new_GUIDE.md) |
| Ending Soon | \`/investment/ending-soon\` | 🟡 | [Guide](./CONTENT_GUIDES/investment_ending_soon_GUIDE.md) |
| My Investments | \`/investment/my-investments\` | 🟡 | [Guide](./CONTENT_GUIDES/investment_my_investments_GUIDE.md) |
| Reviews | \`/investment/reviews\` | 🟡 | [Guide](./CONTENT_GUIDES/investment_reviews_GUIDE.md) |

### Loan Section (4 pages)
| Page | Path | Status | Guide |
|------|------|--------|-------|
| My Loans | \`/loan/my-loans\` | 🟡 | [Guide](./CONTENT_GUIDES/loan_my_loans_GUIDE.md) |
| Calculator | \`/loan/calculator\` | 🟡 | [Guide](./CONTENT_GUIDES/loan_calculator_GUIDE.md) |
| Documents | \`/loan/documents\` | 🟡 | [Guide](./CONTENT_GUIDES/loan_documents_GUIDE.md) |
| FAQ | \`/loan/faq\` | 🟡 | [Guide](./CONTENT_GUIDES/loan_faq_GUIDE.md) |

### Account Section (5 pages)
| Page | Path | Status | Guide |
|------|------|--------|-------|
| Documents | \`/account/documents\` | 🟡 | [Guide](./CONTENT_GUIDES/account_documents_GUIDE.md) |
| Bank Accounts | \`/account/bank-accounts\` | 🟡 | [Guide](./CONTENT_GUIDES/account_bank_accounts_GUIDE.md) |
| Notifications | \`/account/notifications\` | 🟡 | [Guide](./CONTENT_GUIDES/account_notifications_GUIDE.md) |
| Withdrawal | \`/account/withdrawal\` | 🟡 | [Guide](./CONTENT_GUIDES/account_withdrawal_GUIDE.md) |
| KYC Status | \`/account/kyc-status\` | 🟡 | [Guide](./CONTENT_GUIDES/account_kyc_status_GUIDE.md) |

### Dashboard Section (3 pages)
| Page | Path | Status | Guide |
|------|------|--------|-------|
| Reports | \`/dashboard/reports\` | 🟡 | [Guide](./CONTENT_GUIDES/dashboard_reports_GUIDE.md) |
| Performance | \`/dashboard/performance\` | 🟡 | [Guide](./CONTENT_GUIDES/dashboard_performance_GUIDE.md) |
| Alerts | \`/dashboard/alerts\` | 🟡 | [Guide](./CONTENT_GUIDES/dashboard_alerts_GUIDE.md) |

### Support Section (4 pages)
| Page | Path | Status | Guide |
|------|------|--------|-------|
| Chat | \`/support/chat\` | 🟡 | [Guide](./CONTENT_GUIDES/support_chat_GUIDE.md) |
| Tickets | \`/support/tickets\` | 🟡 | [Guide](./CONTENT_GUIDES/support_tickets_GUIDE.md) |
| Community | \`/support/community\` | 🟡 | [Guide](./CONTENT_GUIDES/support_community_GUIDE.md) |
| Announcements | \`/support/announcements\` | 🟡 | [Guide](./CONTENT_GUIDES/support_announcements_GUIDE.md) |

### Other Pages (3 pages)
| Page | Path | Status | Guide |
|------|------|--------|-------|
| Onboarding | \`/onboarding\` | 🟡 | N/A |
| Help | \`/help\` | 🟡 | N/A |
| Status | \`/status\` | 🟡 | N/A |

---

## Fiscus Admin Pages (8 new)

### User Management (3 pages)
| Page | Path | Status |
|------|------|--------|
| Users | \`/admin/users\` | 🟡 |
| User Profiles | \`/admin/user-profiles\` | 🟡 |
| User Verification | \`/admin/user-verification\` | 🟡 |

### Analytics (3 pages)
| Page | Path | Status |
|------|------|--------|
| Analytics | \`/admin/analytics\` | 🟡 |
| Metrics | \`/admin/metrics\` | 🟡 |
| Reports Export | \`/admin/reports-export\` | 🟡 |

### System (2 pages)
| Page | Path | Status |
|------|------|--------|
| API Keys | \`/admin/api-keys\` | 🟡 |
| Integrations | \`/admin/integrations\` | 🟡 |

---

## How to Complete Pages

### Quick Start
1. Choose a page from above
2. Open its corresponding **Guide** link
3. Follow the implementation steps
4. Reference the design .md files listed

### Resources
- **Component Library**: See [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)
- **Coding Patterns**: See [QUICK_START.md](./QUICK_START.md)
- **Project Status**: See [PROJECT_STATUS.md](./PROJECT_STATUS.md)
- **Design Files**: Check \`/01_피스커스_시스템/\`, \`/02_핀노바_유저UI/\`

### Progress Tracking
To update status, change the emoji:
- 🟡 → 🟢 when content is partially added
- 🟢 → ✅ when page is complete

---

**Total Pages**: 32 auto-generated + 51 pre-built = **83 pages**
**Auto-Generated Pages**: 32 (25 Finnova + 8 Admin)
**Status**: Ready for content population
**Last Updated**: 2025-02-14
`;

  const indexPath = path.join(__dirname, '../AUTO_GENERATED_PAGES.md');
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('✅ Generated AUTO_GENERATED_PAGES.md');
}

// Main execution
if (require.main === module) {
  console.log('🔧 Content Extraction Tool\n');
  console.log('='.repeat(50) + '\n');
  
  generateContentGuides();
  generatePageIndex();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All guides and indices generated!');
  console.log('📂 Check CONTENT_GUIDES/ for page-specific guides');
  console.log('📋 Check AUTO_GENERATED_PAGES.md for master index');
}

module.exports = { contentMappings, generateContentGuides, generatePageIndex };
