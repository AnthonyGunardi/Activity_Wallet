# Specification: Sepa Island Activity Wallet

**Document Status:** Approved  
**Version:** 1.0.0  
**Source Document:** [`PRD.md`](file:///c:/Users/Admin/Documents/Repositories/Activity_Wallet/PRD.md)  
**Governing Architecture:** [`AGENTS.md`](file:///c:/Users/Admin/Documents/Repositories/Activity_Wallet/AGENTS.md)  
**Target Event:** Sepa Island Water Activity (~80 participants)

---

## 1. Objective & Target Users

### 1.1 Objective
Sepa Island Activity Wallet is a digital activity credit management system designed for events. It replaces cash payments with a controlled, digital prepaid activity wallet (Rp1.000.000 starting credit per participant) for outdoor water sports (Jet Ski, Banana Boat, Donut Boat, Snorkeling, etc.). The system delivers instant booth transactions, immutable auditability, non-negative balance guarantees, and operational resilience in outdoor island conditions.

### 1.2 Target Users & Interfaces
1. **Participant (Participant PWA):**
   - View current balance and total spent credit.
   - Browse activity catalog with real-time affordability indicators.
   - Display personal QR identification code.
   - View chronological personal transaction history.
   - *Constraint:* Read-only balance; cannot initiate payments, deductions, or peer-to-peer transfers.
2. **Booth Staff (Booth Scanner PWA):**
   - Scan participant QR codes via camera or direct input.
   - View participant identity, status, and current balance.
   - Select activity and process debit transactions.
   - View recent booth transaction feed.
   - *Constraint:* Cannot modify balances manually; cannot process unauthorized refunds.
3. **Supervisor / Admin (Admin Web Dashboard):**
   - Participant lifecycle management (batch import, credit setup, status toggle, QR reissuance).
   - Activity catalog management (names, prices, active status).
   - Real-time event monitoring and comprehensive transaction audit ledger.
   - Authorized refund and adjustment processing (immutable append-only linked entries).
   - Report generation and Excel/CSV export.

---

## 2. Technology Stack & Environment

### 2.1 Backend Stack
- **Runtime:** Node.js (v18+ LTS / v20 LTS)
- **Framework:** Express.js (v4.x)
- **ORM / Persistence:** Sequelize ORM (v6.x) with MySQL (local/dev/production) and support for PostgreSQL
- **Input Validation:** Joi or Zod validation schemas
- **Logging:** Winston (JSON format, daily rotation to `/src/logs/`)
- **Authentication & Security:** JWT for Staff/Admin auth; Helmet, CORS, Rate Limiter
- **Testing:** Jest + Supertest (unit, integration, and concurrency tests)

### 2.2 Frontend Stack
- **Framework:** React 18+ (Vite)
- **Architecture:** Single-Page App / Progressive Web App (PWA with manifest and offline caching shell)
- **Styling:** Vanilla CSS / Modern CSS Variables (High-contrast outdoor theme, glassmorphic accents)
- **QR Utilities:** `html5-qrcode` (or `@zxing/library`) for scanning; `qrcode.react` for rendering
- **State Management & Data Fetching:** Custom Hooks + React Context for global auth/session state
- **Testing:** Vitest + React Testing Library

### 2.3 Commands & Scripts

```bash
# Backend Commands
rtk cd backend && npm install
rtk cd backend && npm run test          # Execute test suite with coverage
rtk cd backend && npm run lint          # Run ESLint validation
rtk cd backend && npm run dev           # Start development server with nodemon
rtk cd backend && npm start             # Start production server

# Frontend Commands
rtk cd frontend && npm install
rtk cd frontend && npm run dev          # Start Vite dev server
rtk cd frontend && npm run build        # Build production PWA bundle
rtk cd frontend && npm run test         # Run frontend component & hook tests
rtk cd frontend && npm run lint         # Run ESLint validation
```

---

## 3. Project Structure & Architecture

```text
Activity_Wallet/
├── backend/
│   ├── src/
│   │   ├── config/             # Database connection, environment config, winston logger
│   │   ├── constants/          # Error codes, transaction types, role enums
│   │   ├── controllers/        # Express request/response handlers (no business logic)
│   │   ├── middleware/         # Auth, validation, error handler, rate limiters
│   │   ├── models/             # Sequelize models & index associations
│   │   ├── routes/             # Express API route declarations
│   │   ├── schemas/            # Request validation schemas (Joi/Zod)
│   │   ├── services/           # Domain business logic, transaction locks, audit rules
│   │   ├── utils/              # Token generators, formatting helpers, crypto helpers
│   │   ├── app.js              # Express app setup, middleware mounting
│   │   └── server.js           # HTTP server initialization, graceful shutdown
│   ├── tests/
│   │   ├── unit/               # Service and utility tests
│   │   ├── integration/        # Route and controller integration tests
│   │   └── concurrency/        # Race condition & balance locking tests
│   ├── package.json
│   └── .eslintrc.json
├── frontend/
│   ├── public/                 # Icons, manifest.json, service-worker.js
│   ├── src/
│   │   ├── api/                # API client and endpoints
│   │   ├── assets/             # Images, static media
│   │   ├── components/         # Pure UI components (PascalCase)
│   │   │   ├── common/         # Buttons, Cards, Modals, Badges, AlertBanners
│   │   │   ├── participant/    # BalanceCard, QRViewer, ActivityCatalog, TxList
│   │   │   ├── booth/          # QRScannerModal, TxConfirmModal, BoothFeed
│   │   │   └── admin/          # ParticipantTable, ActivityManager, StatsSummary
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── hooks/              # useParticipant, useBooth, useAdmin, useScanner
│   │   ├── pages/              # ParticipantView, BoothView, AdminDashboard, LoginView
│   │   ├── styles/             # Global CSS, theme tokens, outdoor high-contrast styles
│   │   ├── utils/              # Currency formatters, date formatters
│   │   ├── App.jsx             # Router and layout shell
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   └── vite.config.js
├── docs/                       # Adoption guides, architecture diagrams
├── AGENTS.md                   # Agent guidelines & project invariants
├── PRD.md                      # Product Requirements Document
└── SPEC.md                     # Technical Specification (Source of Truth)
```

---

## 4. Domain Model & Database Schema

### 4.1 Entities

#### 1. `User` (Staff & Admin)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID / INTEGER | PK, Auto | Unique User ID |
| `username` | STRING | Unique, Not Null | Login username |
| `password_hash` | STRING | Not Null | Bcrypt hashed password |
| `name` | STRING | Not Null | Display name |
| `role` | ENUM('STAFF', 'ADMIN') | Not Null | Access level |
| `assigned_booth_id`| UUID / INTEGER | Nullable | Optional activity/booth assignment |
| `status` | ENUM('ACTIVE', 'INACTIVE') | Default 'ACTIVE' | Account state |
| `created_at` | DATE | Not Null | Timestamp |
| `updated_at` | DATE | Not Null | Timestamp |

#### 2. `Participant` (Wallet Holder)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID / INTEGER | PK, Auto | Unique Participant ID |
| `name` | STRING | Not Null | Full participant name |
| `qr_code` | STRING | Unique, Not Null, Indexed | Unique QR code token string |
| `initial_credit` | INTEGER | Not Null, Default 1000000 | Initial starting credit (Rp1.000.000) |
| `current_balance` | INTEGER | Not Null, Default 1000000 | Current remaining balance |
| `total_spent` | INTEGER | Not Null, Default 0 | Computed/Persisted total debit |
| `status` | ENUM('ACTIVE', 'BLOCKED') | Default 'ACTIVE' | Participant state |
| `created_at` | DATE | Not Null | Registration timestamp |
| `updated_at` | DATE | Not Null | Last update timestamp |

#### 3. `Activity` (Service Catalog)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID / INTEGER | PK, Auto | Unique Activity ID |
| `name` | STRING | Unique, Not Null | Name (e.g., "Jet Ski", "Banana Boat") |
| `price` | INTEGER | Not Null, Min: 0 | Price in IDR |
| `description` | STRING | Nullable | Short description / duration |
| `status` | ENUM('ACTIVE', 'INACTIVE') | Default 'ACTIVE' | Activity availability |
| `created_at` | DATE | Not Null | Timestamp |
| `updated_at` | DATE | Not Null | Timestamp |

#### 4. `Transaction` (Immutable Ledger)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID / INTEGER | PK, Auto | Unique Transaction ID |
| `participant_id` | UUID / INTEGER | FK -> Participant.id, Indexed | Affected participant |
| `activity_id` | UUID / INTEGER | FK -> Activity.id, Nullable | Associated activity (null for adjustments) |
| `staff_id` | UUID / INTEGER | FK -> User.id, Not Null | Staff/Admin who executed action |
| `type` | ENUM('DEDUCTION', 'REFUND', 'ADJUSTMENT') | Not Null | Ledger operation type |
| `amount` | INTEGER | Not Null, Min: 1 | Transaction amount in IDR |
| `balance_before` | INTEGER | Not Null | Snapshot balance prior to tx |
| `balance_after` | INTEGER | Not Null | Snapshot balance post tx |
| `reference_id` | UUID / INTEGER | FK -> Transaction.id, Nullable | Original transaction ID (for refunds) |
| `notes` | STRING | Nullable | Reason for adjustment/refund |
| `created_at` | DATE | Not Null, Immutable | Transaction timestamp |

---

## 5. API Contracts & Envelope Standard

All REST API endpoints adhere to the project envelope format:

### 5.1 Success Response Envelope
```json
{
  "success": true,
  "data": {},
  "meta": {
    "total": 80,
    "page": 1,
    "limit": 20
  }
}
```

### 5.2 Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Saldo peserta tidak mencukupi untuk aktivitas ini."
  }
}
```

### 5.3 Core API Endpoints

#### Authentication & Session
- `POST /api/v1/auth/login`
  - Body: `{ username, password }`
  - Response: `{ token, user: { id, name, role, assigned_booth_id } }`
- `GET /api/v1/auth/me`
  - Response: `{ user }`

#### Participant Public / Token Access
- `GET /api/v1/participants/wallet/:qrCode`
  - Lookup participant balance, available activities, and personal history by QR token string.
  - Response: `{ participant: { id, name, balance, total_spent, qr_code, status }, activities: [...], recent_transactions: [...] }`

#### Staff / Booth Operations
- `POST /api/v1/booth/scan`
  - Body: `{ qr_code }`
  - Response: `{ participant, eligible_activities }`
- `POST /api/v1/booth/transactions`
  - Protected (Staff/Admin)
  - Body: `{ qr_code, activity_id }`
  - Behavior: Executes atomic transaction with pessimistic/optimistic lock on participant row.
  - Invariant Check: Rejects if `balance < activity.price` or `status != 'ACTIVE'`.
  - Response: `{ transaction, updated_balance }`
- `GET /api/v1/booth/transactions/recent`
  - Protected (Staff)
  - Response: `{ transactions: [...] }`

#### Admin Operations
- `GET /api/v1/admin/dashboard/summary`
  - Overview metrics: Total participants, total credit allocated, total credit used, total transactions, active booths.
- `GET /api/v1/admin/participants` (with pagination, search, status filter)
- `GET /api/v1/admin/participants/:id` (Retrieve participant profile, wallet status, and history)
- `POST /api/v1/admin/participants` (Single create)
- `POST /api/v1/admin/participants/bulk` (Bulk batch import via Excel .xlsx upload / JSON array)
- `PUT /api/v1/admin/participants/:id` (Update participant name/details)
- `DELETE /api/v1/admin/participants/:id` (Delete participant without transactions; reject with 422 if transactions exist)
- `PUT /api/v1/admin/participants/:id/reissue-qr`
  - Generates new QR token, invalidates old token, retains balance & history.
- `PUT /api/v1/admin/participants/:id/status`
  - Block or unblock participant.
- `GET /api/v1/admin/activities`
- `POST /api/v1/admin/activities`
- `PUT /api/v1/admin/activities/:id`
- `GET /api/v1/admin/transactions` (Full audit log with filters)
- `POST /api/v1/admin/transactions/:id/refund`
  - Validates original transaction, creates linked `REFUND` entry, credits back balance atomically.
- `GET /api/v1/admin/reports/export`
  - Export CSV / Excel format of participant balances and transaction ledger.

---

## 6. Business Invariants & Integrity Constraints

1. **Prepaid Credit & Non-Negative Balance:**
   - Every participant receives Rp1.000.000 starting credit upon creation.
   - Participant balance cannot fall below zero under any concurrency condition.
   - Any transaction where `activity.price > participant.current_balance` MUST fail with `INSUFFICIENT_BALANCE`.
2. **Immutable Append-Only Transaction Ledger:**
   - Transaction records are write-once. `UPDATE` and `DELETE` queries on `transactions` are strictly prohibited.
   - Refunds and adjustments produce a new `Transaction` record referencing the original `reference_id`.
3. **Staff-Initiated Deductions Only:**
   - Participant UI is read-only.
   - Deductions require authenticated Staff/Admin JWT tokens.
4. **Concurrency Safety & Race Condition Prevention:**
   - Balance mutation operations MUST use database transactions (`sequelize.transaction`) with row locking (`LOCK.UPDATE`) to prevent double-spending when multiple booths scan the same QR simultaneously.
5. **QR Code as Lookup Identifier:**
   - The QR code contains an opaque, secure token identifier (e.g. `SEPA-ABC123XYZ`), not balance amounts or signed state.
   - If a wristband/QR code is lost or corrupted, Admin triggers `reissue-qr`, updating `qr_code` on the participant record while preserving ID, balance, and transaction history.
6. **Outdoor & High-Contrast Visual Standards:**
   - Participant and Booth UI must feature high contrast (sunlight readable), large touch targets (minimum 48x48px), and instant feedback sounds/visual cues upon successful scan/deduction.

---

## 7. Testing Strategy & Quality Gates

### 7.1 Minimum Coverage Thresholds
- **Statements / Lines:** ≥ 90%
- **Functions:** ≥ 90%
- **Branches:** ≥ 85%

### 7.2 Required Test Suites
1. **Unit Tests:**
   - Validation schema checks (valid, invalid payloads, boundary values).
   - Domain service logic: balance calculations, refund eligibility, status validation.
2. **Integration Tests (API Level):**
   - Full HTTP lifecycle: login, wallet lookup, booth scan, deduction, transaction listing, refunds, admin reports.
   - Error responses asserting envelope structure and HTTP status codes (400, 401, 403, 404, 409, 422).
3. **Concurrency & Race Condition Tests:**
   - Simultaneous deduction attempts on a single participant wallet with insufficient balance for both (e.g., Balance = 100k, two concurrent 80k requests -> exactly 1 succeeds, 1 fails).
4. **Frontend Unit & Component Tests:**
   - Participant wallet view rendering, affordability badges ("Available" vs "Insufficient balance"), QR display, booth scanning workflows, error state alerts.

---

## 8. Explicit Boundaries & Rules of Engagement

### 8.1 Always-Do Actions
- Always use the `{ success, data, meta }` envelope for API responses.
- Always wrap database mutations in Sequelize managed transactions.
- Always log significant events and transaction boundaries with Winston JSON logging.
- Always format code with 2 spaces, semicolons, and max line length of 120 characters.
- Always use custom hooks in React to encapsulate API calls and state management.

### 8.2 Ask-First Actions
- Adding external payment gateway integrations or third-party cloud services.
- Altering the Rp1.000.000 default balance invariant.
- Introducing multi-currency or cash top-up workflows.

### 8.3 Never-Do Actions
- Never allow participant balance to become negative.
- Never allow participants to trigger wallet balance deductions directly.
- Never update or delete existing rows in the `transactions` table.
- Never put business logic, direct API calls, or database operations in controllers or React JSX components.
- Never store plaintext passwords or hardcode secret keys.

### 8.4 Out-of-Scope Items
- Cash top-ups, bank transfers, or payment gateway (Midtrans/Xendit) integration.
- Cryptocurrency or peer-to-peer balance transfers between participants.
- Native mobile app store distribution (iOS/Android native binaries).
- Complex general ledger multi-entity enterprise accounting.

---

## 9. Acceptance Criteria & Verification Matrix

| Area | Requirement | Acceptance Criterion | Verification Method |
|---|---|---|---|
| **Participant** | Wallet View | Displays Name, Rp1.000.000 starting credit, real-time balance, and spent amount. | Automated Component Test + E2E |
| **Participant** | QR Display | Renders scannable high-resolution QR matching participant token. | Visual inspection & scanner test |
| **Participant** | Catalog | Shows activities with dynamic "Available" / "Insufficient balance" badge based on remaining credit. | Unit test on calculation hook |
| **Booth** | QR Scanner | Instantly reads participant QR and loads balance/identity in < 500ms. | Integration test & manual camera test |
| **Booth** | Deduction | Deducts exact activity price, updates balance atomically, creates immutable tx record. | Concurrency & Integration test |
| **Booth** | Insufficient Balance | Rejects deduction if price > balance with clear visual alert. | Integration test (HTTP 422) |
| **Admin** | Dashboard | Real-time totals of allocated credit, spent credit, activity counts, and full transaction feed. | Integration & Dashboard test |
| **Admin** | Participant CRUD | Full lifecycle management (Create, Read/Search, Update details, Safe Delete without tx, Reissue QR, Block/Unblock). | Unit, Integration & UI test |
| **Admin** | QR Reissue | Generates new QR token; old QR immediately returns invalid; balance preserved. | Integration test |
| **Admin** | Refund | Admin can refund a specific transaction; creates linked `REFUND` tx; balance restored. | Integration test & ledger check |
| **Admin** | Export | Exports full participant balances and transactions to CSV/Excel matching DB ledger. | Unit & Integration test |
| **Security** | Role Guard | Unauthorized users cannot access booth deduction or admin endpoints. | Auth Integration test (401/403) |
| **Reliability** | Concurrency | Concurrent transactions on single wallet never produce negative balance or lost updates. | Concurrency race condition test |
