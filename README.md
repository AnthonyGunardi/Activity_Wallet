# 🏝️ Sepa Island Activity Wallet

A digital prepaid credit management and transaction ledger system designed for event water sports and island outdoor activities (e.g. Sepa Island Water Activity, ~80 participants). Replaces physical cash and manual paper vouchers with a fast, auditable, and resilient Progressive Web App (PWA) wallet.

---

## 🌟 Core Highlights

- 💳 **Prepaid Digital Credit:** Each participant receives **Rp 1.000.000** starting credit.
- ⚡ **Atomic Concurrency Debit Engine:** Strict double-spend prevention and non-negative balance invariant (`balance >= price` always) protected by row-level and memory locks.
- 📜 **Immutable Append-Only Audit Ledger:** Write-once transaction logs. Cancellations and adjustments are recorded as new, distinct `REFUND` transactions linked to the original transaction ID.
- 🏷️ **QR Token Decoupling & Reissuance:** QR wristbands store only token identifiers. Lost wristbands can be reissued instantly by Admins without losing wallet balances or transaction history.
- 📱 **Outdoor Sunlight-Optimized PWA:** High-contrast UI (>4.5:1 contrast ratio) with instant camera scanning, offline connectivity alerts, and static asset caching for island network conditions.
- 📊 **Executive Dashboard & Streaming Exports:** Real-time KPI summary metrics, transaction audit filters, and streaming CSV / Microsoft Excel Spreadsheet export.

---

## 🏛️ System Architecture

```
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│     Participant PWA     │       │     Booth Staff PWA     │       │     Admin Dashboard     │
│  - Real-time Balance    │       │  - QR Camera Scanner    │       │  - Real-time KPIs       │
│  - Dynamic QR Display   │       │  - Instant Debit Modal  │       │  - Audit Ledger & Refund│
│  - Activity Catalog     │       │  - Recent Feed          │       │  - Participant Manager  │
│  - Transaction Feed     │       │  - Manual Token Input   │       │  - CSV / Excel Export   │
└────────────┬────────────┘       └────────────┬────────────┘       └────────────┬────────────┘
             │                                 │                                 │
             └────────────────────────┬────────┴─────────────────────────────────┘
                                      │ REST API / JSON Envelope
                                      ▼
                        ┌───────────────────────────┐
                        │   Express.js API Engine   │
                        │  - JWT & Role Middleware  │
                        │  - Concurrency Mutex Lock │
                        │  - Joi Schema Validation  │
                        │  - Winston Daily Rotate   │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   Sequelize ORM Layer     │
                        │  - SQLite (Dev/Test/Local)│
                        │  - MySQL / PostgreSQL     │
                        └───────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js:** v18+
- **npm:** v9+

### 2. Installation
Clone the repository and install root, backend, and frontend dependencies:

```bash
# Install root orchestration tools
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Database Migration & Seeding
Bootstrap the database, run migrations, and populate initial event accounts:

```bash
cd backend
npm run db:setup
```

*Default Seed Credentials:*
- **Admin:** `admin` / `admin123`
- **Jet Ski Booth:** `staff_jetski` / `staff123`
- **Banana Boat Booth:** `staff_banana` / `staff123`
- **Donut Boat Booth:** `staff_donut` / `staff123`
- **Snorkeling Booth:** `staff_snorkeling` / `staff123`

### 4. Running the Development Stack
Start both backend API (`http://localhost:5000`) and frontend Vite server (`http://localhost:5173`) concurrently:

```bash
# From workspace root:
npm run dev
```

---

## 🧪 Testing & Quality Gates

The codebase enforces strict test-driven criteria (≥ 90% lines/functions, ≥ 85% branches):

```bash
# Run Backend Jest Tests with Coverage
cd backend
npm test

# Run Backend Linter
npm run lint

# Run Frontend Vitest Test Suite
cd ../frontend
npm test

# Run Frontend Linter & Production Build
npm run lint
npm run build
```

---

## 📁 Repository Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Database, logger & environment configs
│   │   ├── constants/       # UserRole, ActivityStatus, TransactionType enums
│   │   ├── controllers/     # Route controllers with standard response envelopes
│   │   ├── database/        # Migrations, seeders, and creation scripts
│   │   ├── middleware/      # Auth, role guard, error handler, rate limiter
│   │   ├── models/          # Sequelize models (User, Participant, Activity, Transaction)
│   │   ├── routes/          # Express route definitions
│   │   ├── schemas/         # Joi payload validation schemas
│   │   ├── services/        # Business logic & atomic database transactions
│   │   └── utils/           # Concurrency lock & response helpers
│   └── tests/               # Unit, integration, and concurrency race-condition tests
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API client services
│   │   ├── components/      # Common, participant, booth, and admin UI components
│   │   ├── context/         # AuthContext & ToastContext providers
│   │   ├── hooks/           # Data fetching and mutation hooks
│   │   ├── pages/           # ParticipantView, BoothView, AdminViews
│   │   └── styles/          # Design tokens and theme styling
│   └── tests/               # Vitest component and page integration tests
├── docs/
│   ├── EVENT_SETUP_GUIDE.md # Pre-event setup, database provisioning & wristband printing
│   ├── OPERATIONAL_RUNBOOK.md # Day-of-event operations, schedules, and emergency guides
│   ├── PRD.md               # Product Requirements Document
│   └── SPEC.md              # System Technical Specification
├── tasks/
│   ├── plan.md              # 10-slice implementation plan & acceptance matrix
│   └── todo.md              # Granular task tracking checklist
```

---

## 📚 Operational Documentation

- 📖 **[Event Setup Guide](./docs/EVENT_SETUP_GUIDE.md)**: Pre-event database provisioning, 80-participant bulk onboarding, and wristband label printing.
- 📖 **[Operational Runbook](./docs/OPERATIONAL_RUNBOOK.md)**: Daily event schedule, booth operation workflows, lost wristband reissuance, and emergency refund handling.
- 📖 **[Product Requirements Document (PRD.md)](./docs/PRD.md)**: Product requirements, user roles, business invariants, and event scope.
- 📖 **[System Specification (SPEC.md)](./docs/SPEC.md)**: Technical architecture, data dictionaries, API contracts, and security boundaries.

---
