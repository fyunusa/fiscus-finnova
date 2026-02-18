# 💰 Investment Data Management Strategy

**Date**: February 17, 2026  
**Status**: Planning & Design

---

## 📊 Current State Analysis

### Frontend Investment Cards
**Pages**: `/investment`, `/investment/popular`, `/investment/new`, `/investment/ending-soon`, `/investment/apartment/[id]`

**Current Data Flow**:
```
MOCK_PRODUCTS (hardcoded array)
    ↓
useMemo (filtering/sorting)
    ↓
Grid render (cards displayed)
    ↓
Detail page (static mock data)
```

### Current Card Structure (3 Investment Types)

#### 1. **Apartment (부동산 담보 대출)**
```json
{
  "id": "apt-003",
  "title": "목동 재건축 아파트 대출",
  "type": "apartment",
  "rate": 9.2,
  "period": 24,
  "fundingGoal": 150000000,
  "fundingCurrent": 145000000,
  "minInvestment": 5000000,
  "borrowerType": "법인",
  "status": "ending-soon",
  "ltv": 65,
  "property": {
    "address": "서울시 강남구 테헤란로 123",
    "size": "84㎡",
    "buildYear": 2015,
    "kbValuation": 650000000,
    "currentLien": 300000000
  }
}
```

#### 2. **Credit Card 外상채권 (신용카드 외상)**
```json
{
  "id": "cc-001",
  "title": "골프용품 쇼핑몰 신용카드 외상채권",
  "type": "credit-card",
  "rate": 9.5,
  "period": 6,
  "fundingGoal": 50000000,
  "fundingCurrent": 42000000,
  "minInvestment": 1000000,
  "borrowerType": "개인사업자",
  "status": "funding"
}
```

#### 3. **Business Loan (사업대출)**
```json
{
  "id": "bl-001",
  "title": "IT 스타트업 성장 자금",
  "type": "business-loan",
  "rate": 8.8,
  "period": 36,
  "fundingGoal": 500000000,
  "fundingCurrent": 200000000,
  "minInvestment": 10000000,
  "borrowerType": "스타트업",
  "status": "recruiting"
}
```

---

## 🎯 Three Approaches Comparison

### **OPTION 1: Admin Manual Creation (RECOMMENDED FOR START)**

#### Pros ✅
- Full control over data quality
- No external dependencies
- Easy to test and debug
- Can create realistic test scenarios
- Perfect for MVP phase

#### Cons ❌
- Manual data entry by admins
- Time-consuming at scale
- Can't pull real-time data
- Limited to data entered manually

#### Implementation:
```
Admin Dashboard (Fiscus Admin)
├── Create Investment
├── Edit Investment
├── Delete Investment
├── Manage Funding Status
└── Publish/Schedule Products
    ↓
PostgreSQL Database (investments table)
    ↓
API: GET /api/v1/investments
    ↓
Frontend Cards (fetched from API)
```

---

### **OPTION 2: External API Integration**

#### When to use:
- Real estate valuation data from KB/Naver
- Credit card transaction data from payment gateways
- Business data from government databases
- Real-time market data

#### External Data Sources:
1. **KB Real Estate API** - Property valuations, LTV
2. **NICE/KCREDIT** - Credit rating, risk assessment
3. **ISMS** - Interbank funds transfer system
4. **Government DB** - Business registration, tax info

#### Pros ✅
- Real-time data
- Reduced manual entry
- Accurate valuations
- Government compliance data

#### Cons ❌
- API dependencies
- Rate limits, costs
- Integration complexity
- Data delay/inconsistency

#### Flow:
```
External API (KB, NICE, etc.)
    ↓
Backend Scheduler (auto-fetch)
    ↓
Parse & Validate
    ↓
Store in DB
    ↓
Serve to Frontend
```

---

### **OPTION 3: Hybrid Approach (BEST LONG-TERM)**

#### Template:
```
Manual Admin Input
├── Create base investment
├── Set terms & conditions
└── Configure limits
    ↓
    Enriched by External APIs
    ├── Auto-fetch property valuation
    ├── Auto-fetch credit score
    ├── Auto-calculate LTV/risk
    └── Auto-validate borrower
    ↓
Store in Database
    ↓
Serve to Frontend (real-time)
```

---

## 🗄️ Database Schema Design (OPTION 1 - Recommended for Start)

### Entity: Investment/Product

```typescript
// apps/backend/src/modules/investments/entities/investment.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('investments')
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: ['apartment', 'credit-card', 'business-loan'] })
  type: 'apartment' | 'credit-card' | 'business-loan';

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  rate: number; // Annual interest rate (%)

  @Column()
  period: number; // Investment period in months

  @Column({ type: 'bigint' })
  fundingGoal: number; // Target funding amount (KRW)

  @Column({ type: 'bigint', default: 0 })
  fundingCurrent: number; // Current funded amount (KRW)

  @Column({ type: 'bigint' })
  minInvestment: number; // Minimum investment amount (KRW)

  @Column()
  borrowerType: string; // '개인', '개인사업자', '법인', '스타트업'

  @Column({ type: 'enum', enum: ['recruiting', 'funding', 'ending-soon', 'closed'] })
  status: 'recruiting' | 'funding' | 'ending-soon' | 'closed';

  @Column({ nullable: true })
  badge?: string; // '인기', '신규', '고수익', '마감임박'

  @Column({ nullable: true })
  description?: string;

  // Apartment-specific fields
  @Column({ nullable: true })
  propertyAddress?: string;

  @Column({ nullable: true })
  propertySize?: string; // "84㎡"

  @Column({ nullable: true })
  buildYear?: number;

  @Column({ type: 'bigint', nullable: true })
  kbValuation?: number; // KB property valuation

  @Column({ type: 'bigint', nullable: true })
  currentLien?: number; // Existing lien on property

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ltv?: number; // Loan-to-Value ratio (%)

  // Credit Card fields
  @Column({ nullable: true })
  merchantName?: string;

  @Column({ nullable: true })
  merchantCategory?: string;

  @Column({ type: 'bigint', nullable: true })
  outstandingAmount?: number;

  // Business Loan fields
  @Column({ nullable: true })
  businessName?: string;

  @Column({ nullable: true })
  businessCategory?: string;

  @Column({ type: 'bigint', nullable: true })
  annualRevenue?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}
```

---

## 📡 Backend API Design (OPTION 1)

### 1. Get All Investments (with filtering)
```
GET /api/v1/investments?type=apartment&status=funding&sort=popular
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "apt-003",
      "title": "목동 재건축 아파트 대출",
      "type": "apartment",
      "rate": 9.2,
      "period": 24,
      "fundingGoal": 150000000,
      "fundingCurrent": 145000000,
      "status": "ending-soon",
      "fundingPercent": 96.67
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### 2. Create Investment (Admin Only)
```
POST /api/v1/admin/investments
```

**Request**:
```json
{
  "title": "목동 재건축 아파트 대출",
  "type": "apartment",
  "rate": 9.2,
  "period": 24,
  "fundingGoal": 150000000,
  "minInvestment": 5000000,
  "borrowerType": "법인",
  "status": "recruiting",
  "propertyAddress": "서울시 강남구 테헤란로 123",
  "propertySize": "84㎡",
  "buildYear": 2015,
  "kbValuation": 650000000,
  "currentLien": 300000000,
  "ltv": 65
}
```

### 3. Update Investment (Admin Only)
```
PATCH /api/v1/admin/investments/{id}
```

### 4. Get Investment Detail
```
GET /api/v1/investments/{id}
```

---

## 🎛️ Admin Dashboard Pages (OPTION 1)

**Path**: `/admin/investments` (create new module in Fiscus Admin)

### Pages Needed:

#### 1. Investments List
```
├── Table with all investments
├── Columns: Title, Type, Rate, Status, Funding%, Actions
├── Filters: Type, Status, Date Range
├── Bulk Actions: Publish, Archive, Delete
└── Create New Button
```

#### 2. Create/Edit Investment
```
├── Form with 3 tabs (based on type)
│   ├── Tab: Apartment
│   ├── Tab: Credit Card
│   └── Tab: Business Loan
├── Auto-save drafts
├── Preview card
└── Publish/Schedule
```

#### 3. Investment Details
```
├── Overview stats (funding %, investors, time left)
├── Edit linked data
├── View investor list
├── Update status
└── Financial summary
```

---

## 🚀 Implementation Roadmap

### **Phase 1: Admin API (Week 1-2)**
```
1. Create Investment entity in TypeORM
2. Create investments module (service + controller)
3. Implement CRUD endpoints
4. Add JWT auth & role checks (admin-only)
5. Add input validation & DTOs
6. Test all endpoints
```

### **Phase 2: Admin Dashboard (Week 2-3)**
```
1. Build investments list page
2. Build create/edit form
3. Upload images for properties
4. Preview card component
5. Publish/schedule UI
6. Testing
```

### **Phase 3: Frontend Integration (Week 3)**
```
1. Replace mock data with API calls
2. Implement real-time updates
3. Add pagination & infinite scroll
4. Implement filters on frontend
5. Cache strategy
6. Testing
```

### **Phase 4: External APIs (Optional)**
```
1. KB Real Estate API integration
2. NICE credit scoring
3. Auto-enrichment workflow
4. Scheduler for updates
5. Testing & monitoring
```

---

## 📋 Checklist for Phase 1

### Backend Investment Module

- [ ] Create investment entity
- [ ] Create DTO (CreateInvestmentDto, UpdateInvestmentDto)
- [ ] Create service with methods:
  - [ ] `create()`
  - [ ] `findAll(filters)`
  - [ ] `findOne(id)`
  - [ ] `update(id, data)`
  - [ ] `delete(id)`
  - [ ] `updateFunding(id, amount)` - increment funding
- [ ] Create controller with endpoints:
  - [ ] `POST /api/v1/admin/investments` (create)
  - [ ] `GET /api/v1/investments` (public list)
  - [ ] `GET /api/v1/investments/:id` (public detail)
  - [ ] `PATCH /api/v1/admin/investments/:id` (update)
  - [ ] `DELETE /api/v1/admin/investments/:id` (delete)
- [ ] Add @UseGuards(JwtAuthGuard) with admin role checks
- [ ] Add validation (min investment > 0, rate 0-15%, period 1-60)
- [ ] Update entities.ts to include Investment
- [ ] Run migration to create table
- [ ] Seed database with sample data

### Database

- [ ] Create migration file
- [ ] Create 5-10 sample investments for each type
- [ ] Add indexes on: type, status, createdAt

---

## 💻 Code Structure Preview

```
apps/backend/src/modules/investments/
├── entities/
│   └── investment.entity.ts
├── dtos/
│   ├── create-investment.dto.ts
│   ├── update-investment.dto.ts
│   └── investment-response.dto.ts
├── services/
│   └── investments.service.ts
├── controllers/
│   └── investments.controller.ts
└── investments.module.ts
```

---

## 🎨 Frontend Integration

```typescript
// apps/finnova-web/src/services/investments.service.ts

export async function getInvestments(params: {
  type?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams(params as any);
  const response = await fetch(
    `http://localhost:4000/api/v1/investments?${query}`,
    {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    }
  );
  return response.json();
}

export async function getInvestmentDetail(id: string) {
  const response = await fetch(
    `http://localhost:4000/api/v1/investments/${id}`,
    {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    }
  );
  return response.json();
}
```

---

## 📊 Sample Data Structure

### For Seeding Database:

```typescript
const sampleInvestments = [
  // Apartments
  {
    title: '강남구 아파트 담보 대출',
    type: 'apartment',
    rate: 8.5,
    period: 12,
    fundingGoal: 100000000,
    fundingCurrent: 75000000,
    minInvestment: 1000000,
    borrowerType: '개인',
    status: 'funding',
    badge: '인기',
    propertyAddress: '서울시 강남구 테헤란로 123',
    propertySize: '84㎡',
    buildYear: 2015,
    kbValuation: 650000000,
    currentLien: 300000000,
    ltv: 65,
  },
  // ... more investments
];
```

---

## ✅ My Recommendation

**Start with Option 1 (Admin Manual Creation) because:**

1. **Fastest to market** - APIs ready for testing within days
2. **No external dependencies** - Don't wait for 3rd party API keys
3. **Quality control** - Admins can curate realistic test data
4. **MVP friendly** - Can add external APIs later
5. **Lower risk** - Easy to debug and test
6. **User testing** - Real-looking data for investor feedback

**Timeline**: 2-3 weeks → Phase 1 + 2 + 3 complete  
**Then**: Scale to Phase 4 with external APIs

---

## 🔗 References

- Investment cards currently at: `/investment`, `/investment/apartment/[id]`
- Mock data in: `apps/finnova-web/src/app/investment/page.tsx`
- Admin dashboard location: `apps/fiscus-admin/src/app/`

---
