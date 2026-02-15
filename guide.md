# Handover Document & 1-Week API Integration / Test Environment Plan

**Date:** February 13, 2026
**Purpose:** Project handover summary and **1-week goal** — real API key integration, service run, and test environment setup (with comment report).

---

## Part 1. Project Overview for Handover

### 1.1. Project Summary

| Item | Description |
|------|-------------|
| **Project name** | Fiscus-Plan / Fiscus-Finnova |
| **Type** | P2P online investment-linked finance platform (planning/docs repo + implementation monorepo) |
| **Regulation** | Compliant with the Act on Online Investment-Linked Finance and User Protection (Korea), etc. |

**Three core areas:**

1. **Fiscus** — System, algorithms, back office
   - Loan intake and review, funding product management, investment/bond/repayment distribution, member/tax/system management
   - Docs: `01_피스커스_시스템/`
   - Code: `fiscus-finnova/apps/fiscus-api` (NestJS), `fiscus-finnova/apps/fiscus-admin` (Next.js)

2. **Finnova** — User web platform
   - Sign-up/login, investment product browse and invest, loan application, my page, disclosure, support
   - Docs: `02_핀노바_유저UI/`
   - Code: `fiscus-finnova/apps/finnova-web` (Next.js)

3. **Back office** — Admin, tracking, monitoring
   - Docs: `03_백오피스/`
   - Code: same app as `fiscus-admin`

---

### 1.2. Repository and Document Structure

```
fiscus-plan-main/                    # Docs and planning root (this repo)
├── 01_피스커스_시스템/             # System architecture, algorithms, business rules, policy/law
├── 02_핀노바_유저UI/               # UI specs, service flows, screen design
├── 03_백오피스/                    # Admin system, admin processes, monitoring
├── 기준문서/                       # Integrated planning, review reports, task management, handover
├── 작업관리폴더/                   # Master index, API doc list, e2e, task management
├── 99_기타_프로젝트/               # FIN2U, meeting notes, references, Figma, etc.
├── README.md                       # Project overview + Current Project Status (English)
└── fiscus-finnova/                 # Git submodule — implementation monorepo
    ├── apps/
    │   ├── finnova-web/            # User portal (Next.js, 31 pages)
    │   ├── fiscus-admin/          # Back office (Next.js, 24 pages)
    │   ├── fiscus-api/             # Backend API (NestJS + Prisma)
    │   └── mock-servers/           # NICE, PayGate, KB price, etc. mocks
    ├── packages/
    │   ├── shared-types/           # Shared types
    │   ├── shared-utils/           # Formatters, masking, calculators
    │   └── ui-components/         # Shared UI components
    ├── docs/                       # Run manual, external API list and acquisition guide
    ├── .env.example                # Environment variable template
    └── docker-compose*.yml         # DB, Redis, apps, Nginx
```

**Essential reading for handover:**

- **README.md** — Overall overview and current status (English)
- **기준문서/00_종합_점검_보고서.md** — Planning quality and technical follow-ups
- **기준문서/00_모노레포_점검_보고서.md** — Implementation vs. planning verification
- **기준문서/작업관리.md** — Doc quality summary, constraints, phase checklists
- **01_피스커스_시스템/01_시스템_아키텍처/00_외부_API_연동_가이드.md** — External API list and integration
- **fiscus-finnova/docs/외부_API_리스트_및_취득_가이드.md** — Per-API acquisition and env vars
- **fiscus-finnova/docs/실행_및_점검_매뉴얼.md** — Local run and verification steps

---

### 1.3. Tech Stack and Run Summary

| Layer | Stack |
|-------|--------|
| Backend | NestJS 10, Prisma 5, PostgreSQL, Redis |
| User/Admin | Next.js (App Router), shared packages (shared-types, shared-utils, ui-components) |
| Infra | Docker Compose (PostgreSQL, Redis, API, Web, Admin, Nginx) |
| External | NICE identity verification, PG (virtual account, transfers), KB price, public data, Kakao Map, SMS (SendGrid/Aligo, etc.) |

**Local run (mock mode):**

```bash
cd fiscus-finnova
cp .env.example .env   # Adjust DB/Redis etc. if needed
pnpm install
pnpm docker:dev        # PostgreSQL, Redis
pnpm db:generate && pnpm db:push && pnpm db:seed
pnpm dev:mocks         # Mock servers (NICE, PayGate, KB price, etc.)
pnpm dev               # API + Finnova + Fiscus Admin together
```

- API: `http://localhost:4000`
- Finnova: `http://localhost:3000`
- Fiscus Admin: `http://localhost:3001`
- Details: see `fiscus-finnova/docs/실행_및_점검_매뉴얼.md`

---

### 1.4. Current Implementation Status (Summary)

- **Planning docs:** At v2.1 level; concurrency, transactions, real-time, API, caching, security reflected; assessed ready for development.
- **Code:** Finnova 31 pages, Fiscus Admin 24 pages, fiscus-api modules, Prisma schema, and mock servers in place.
- **External APIs:** Currently **mock-based**. For real service run and testing, **real API keys and `.env` integration** are required.

---

## Part 2. Remaining Work — API Key Integration Is Top Priority

### 2.1. Why API Key Integration Matters

- **With mocks only**, real deposits, identity verification, virtual accounts, property prices, and business verification are not exercised.
- **With real keys** you can test end-to-end:
  - Sign-up and identity verification → investment limits and duplicate-account checks
  - Deposit top-up, loan disbursement, repayment distribution → PG integration
  - Loan limit calculation → KB price API
  - Corporate sign-up → public data business verification
- So the 1-week target is to complete the loop: **API key issuance → `.env` update → service run → E2E/integration tests**.

### 2.2. API Priority (Recommended Within 1 Week)

| Priority | API | Purpose | 1-week target | Notes |
|----------|-----|---------|----------------|--------|
| **P0** | PG (PayGate) | Virtual account, deposit callback, loan disbursement, repayment distribution | Obtain test/sandbox keys and integrate | Contract/approval may take time — start immediately |
| **P0** | NICE identity | Sign-up identity verification, CI/DI | Obtain test keys and integrate | Apply via NICE (Korea) |
| **P0** | KB price | Property price (loan limit) | Obtain test keys and integrate | KB real estate API |
| **P0** | Public data | Business verification | Obtain auth key and integrate | Public data portal — can apply on the web immediately |
| **P1** | Kakao Map | Address search and input | Obtain JavaScript key and integrate | Kakao developer console — immediate |
| **P1** | SMS (e.g. Aligo) | OTP, notifications | Obtain API key and integrate | Can use log-only in dev; watch cost |
| **P1** | SendGrid | Email sending | Obtain API key and integrate | Free tier usable for testing |
| **P2** | KCB credit | Borrower credit and delinquency | Keep mock for 1 week if needed | Contract/approval period |

- For “same-as-production flow testing” within 1 week, at least **public data** and **Kakao Map** should be issued and wired; **PG, NICE, KB** should have contract/application and test/sandbox key request started in the same week.

---

## Part 3. 1-Week Goal — API Key Issuance, Integration, Test Environment

### 3.1. Goal Definition

- **Goal:** Issue and integrate real API keys so that **the service runs on the same code paths as production** and can be **tested in that state** within one week.
- **Deliverables:**
  1. Required API keys issued (or in progress with test keys in hand)
  2. Values in `fiscus-finnova/.env` and ability to set `USE_MOCK_APIS=false`
  3. At least one run of an **integration test scenario** (DB, Redis, API, Web, Admin, and optionally only some mocks)

### 3.2. Common API Key Issuance and Configuration

1. **Issuance**
   - Register and apply for **test/development** keys on each provider’s official site.
   - See: `01_피스커스_시스템/01_시스템_아키텍처/00_API_웹_신청_실행_가이드.md`, `00_API_근거_및_공식_신청_가이드.md`, `fiscus-finnova/docs/외부_API_리스트_및_취득_가이드.md`
2. **Configuration**
   - Put keys into `fiscus-finnova/.env` (or per-app `.env`) using the variable names in the docs.
   - Add any variables missing from `.env.example` per the guides.
3. **Switch**
   - For real integration set `USE_MOCK_APIS=false`.
   - Replace NICE/PayGate/KB URLs and keys with real ones and restart the API server.

### 3.3. 1-Week Execution Plan (Reference)

| Day | Activities |
|-----|------------|
| **Day 1** | Read handover doc and run manual; confirm full local run with mocks. Register on public data portal and Kakao developers; issue **public data auth key** and **Kakao JavaScript key**; add to `.env`. |
| **Day 2** | Start **PG, NICE, KB** contract/application (request test/sandbox). In parallel, align `.env.example` and document any missing variables. |
| **Day 3** | For PG, NICE, KB: add any keys already issued to `.env`; check `fiscus-api` config and real-call code paths; test mock  real switch. |
| **Day 4** | Issue SMS (e.g. Aligo) and SendGrid keys; add to `.env`; enable `FEATURE_SMS_ENABLED`, `FEATURE_EMAIL_ENABLED` and test send or verify logs. |
| **Day 5** | Run full stack with `USE_MOCK_APIS=false`; run sign-up → identity verification → (if possible) part of investment/loan flow (E2E or manual). Debug logs, env, and network if issues. |
| **Day 6** | Document test scenarios (e.g. sign-up → login → product list → deposit → invest); fix missing APIs and error cases. |
| **Day 7** | Wrap up: list APIs with keys integrated; update `.env.example` and docs (no secret values); draft “real-integration test procedure” and link from this handover doc. |

- If **PG, NICE, or KB** are delayed by contract/approval, keep mocks for Days 3–5; **public data, Kakao, SMS, SendGrid** alone are enough to meet “run and test with some real APIs.”

---

## Part 4. Comment Report (Summary)

### 4.1. Handover

- Use **Part 1** (three areas, repo/docs/code structure) to bring the receiving party up to speed quickly.
- Treat **기준문서, 작업관리, external API guide, run manual** as required reading, and **README Current Project Status** as the short status summary.

### 4.2. Remaining Work and 1-Week Target

- The **main remaining work** is **real external API key issuance and integration**.
- Mocks alone cannot provide “same-as-production run and test”; the key is **issuing keys, putting them in `.env`, and having the service run on real integration so tests can run on that environment**.
- Within 1 week:
  - **Public data** and **Kakao Map** (issuable on the web) should be issued and integrated.
  - **PG, NICE, KB**: start contract and test key request and integrate as keys become available.
  - **SMS** and **SendGrid**: optional; integrate to allow notification-inclusive tests.
- **Deliverables:**
  - List of APIs with keys integrated,
  - Updated `.env.example` and docs (no secrets),
  - Short “real-integration test procedure” in this doc or under `기준문서/` so others can reproduce the environment.

### 4.3. Quick Reference to Documents

| Purpose | Document |
|--------|----------|
| Project overview and status | `README.md` |
| Planning quality and tech follow-ups | `기준문서/00_종합_점검_보고서.md` |
| Implementation vs. planning | `기준문서/00_모노레포_점검_보고서.md` |
| Constraints and checklists | `기준문서/작업관리.md` |
| External API list and integration | `01_피스커스_시스템/01_시스템_아키텍처/00_외부_API_연동_가이드.md` |
| API web application steps | `01_피스커스_시스템/01_시스템_아키텍처/00_API_웹_신청_실행_가이드.md` |
| API acquisition and env vars | `fiscus-finnova/docs/외부_API_리스트_및_취득_가이드.md` |
| Local run and verification | `fiscus-finnova/docs/실행_및_점검_매뉴얼.md` |
| Env template | `fiscus-finnova/.env.example` |

---

**End of document.**
After the 1-week run, add “APIs with real integration completed” and “test procedure” to this doc or a separate section for handover and operations.