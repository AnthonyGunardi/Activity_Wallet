# Specification: Sepa Island Activity Wallet

**Document Status:** Pending Approval  
**Version:** 1.1.0  
**Source Document:** [`PRD.md`](./PRD.md)  
**Governing Architecture:** [`AGENTS.md`](../AGENTS.md)  
**Target Event:** Sepa Island Water Activity (~80 participants)

---

## 1. Objective & Target Users

### 1.1 Objective
Sepa Island Activity Wallet is a digital activity credit management system designed for events. It replaces cash payments with a controlled, digital prepaid activity wallet (Rp1.000.000 starting credit per participant) for outdoor water sports (Jet Ski, Banana Boat, Donut Boat, Snorkeling, etc.). The system delivers instant booth transactions, immutable auditability, non-negative balance guarantees, peer-to-peer credit transfer between participants, and operational resilience in outdoor island conditions.

### 1.2 Target Users & Interfaces
1. **Participant (Participant PWA):**
   - View current balance and total spent credit.
   - Browse activity catalog with real-time affordability indicators.
   - Display personal QR identification code.
   - View chronological personal transaction history (including activity deductions, refunds, and transfer history).
   - Transfer activity credit to other active participants by scanning their QR code or entering their participant token.
   - *Constraint:* Activity deductions remain staff-only; participants cannot deduct their own balance for activities, cannot transfer to themselves, and cannot transfer more than their available balance.
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
- **QR Utilities & Excel:** `html5-qrcode` (or `@zxing/library`) for scanning; `qrcode.react` for rendering; `xlsx` (SheetJS) for client-side spreadsheet import & template generation
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
├── docs/
│   ├── PRD.md                  # Product Requirements Document
│   ├── SPEC.md                 # Technical Specification (Source of Truth)
│   ├── EVENT_SETUP_GUIDE.md    # Pre-event setup & wristband printing
│   └── OPERATIONAL_RUNBOOK.md  # Day-of-event operations & emergency guides
└── AGENTS.md                   # Agent guidelines & project invariants
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
| `activity_id` | UUID / INTEGER | FK -> Activity.id, Nullable | Associated activity (null for adjustments and transfers) |
| `staff_id` | UUID / INTEGER | FK -> User.id, Nullable | Staff/Admin who executed action (null for peer-to-peer transfers) |
| `type` | ENUM('DEDUCTION', 'REFUND', 'ADJUSTMENT', 'TRANSFER_OUT', 'TRANSFER_IN') | Not Null | Ledger operation type |
| `amount` | INTEGER | Not Null, Min: 1 | Transaction amount in IDR |
| `balance_before` | INTEGER | Not Null | Snapshot balance prior to tx |
| `balance_after` | INTEGER | Not Null | Snapshot balance post tx |
| `reference_id` | UUID / INTEGER | FK -> Transaction.id, Nullable | Linked transaction ID (original tx for refunds; counter-transfer tx for transfers) |
| `notes` | STRING | Nullable | Reason / details (e.g. transfer counterparty) |
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
- `GET /api/v1/participants/transfer/recipient/:qrCode`
  - Validates recipient QR code token for transfer and returns public recipient summary (name, QR code, status).
  - Rejects if recipient does not exist (404) or is BLOCKED (403).
  - Response: `{ recipient: { id, name, qr_code, status } }`
- `POST /api/v1/participants/transfer`
  - Transfers activity credit between participants atomically.
  - Body: `{ sender_qr_code: string, recipient_qr_code: string, amount: number, notes?: string }`
  - Behavior:
    - Validates sender and recipient are not identical (`SELF_TRANSFER_NOT_ALLOWED`, 400).
    - Locks both participant rows in deterministic order (by ID) to avoid deadlocks.
    - Validates sender `current_balance >= amount` (`INSUFFICIENT_BALANCE`, 422).
    - Validates both participants are `ACTIVE` (`SENDER_BLOCKED` / `RECIPIENT_BLOCKED`, 403).
    - Deducts sender balance and increments recipient balance atomically.
    - Creates linked immutable ledger records: `TRANSFER_OUT` for sender and `TRANSFER_IN` for recipient.
  - Response: `{ transfer: { sender_balance: number, amount: number, recipient_name: string, transfer_out_id: string, transfer_in_id: string } }`

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
- `GET /api/v1/admin/participants/:id`
  - Retrieve participant profile, wallet status, and full transaction history.
- `POST /api/v1/admin/participants`
  - Body: `{ name, initial_credit?, qr_code? }`
- `POST /api/v1/admin/participants/bulk`
  - Body: `{ participants: [ { name, initial_credit?, qr_code? } ] }` (parsed from Excel .xlsx or direct JSON)
- `PUT /api/v1/admin/participants/:id`
  - Body: `{ name?: string, status?: 'ACTIVE' | 'BLOCKED' }` (minimum 1 field required)
- `DELETE /api/v1/admin/participants/:id`
  - Deletes participant if no transactions exist in the ledger. Rejects with HTTP 422 `CANNOT_DELETE_PARTICIPANT_WITH_TRANSACTIONS` if transaction history exists.
  - Response: `{ success: true, data: { deleted: true, id } }`
- `PUT /api/v1/admin/participants/:id/reissue-qr`
  - Generates new QR token, invalidates old token, retains balance & history.
- `PUT /api/v1/admin/participants/:id/status`
  - Body: `{ status: 'ACTIVE' | 'BLOCKED' }`
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
   - Refunds, adjustments, and peer-to-peer transfers produce distinct new `Transaction` records.
3. **Staff-Initiated Activity Deductions Only:**
   - Participant UI cannot initiate direct deductions for water sports activities (only authenticated Booth Staff or Admins can post activity `DEDUCTION` records).
   - Participants may only initiate peer-to-peer balance transfers to another participant via the secure transfer endpoint.
4. **Concurrency Safety & Race Condition Prevention:**
   - Balance mutation operations MUST use database transactions (`sequelize.transaction`) with row locking (`LOCK.UPDATE`) to prevent double-spending when multiple booths or transfer requests access the same wallet simultaneously.
   - When locking multiple participant rows (such as during a transfer), rows MUST be locked in a deterministic order (sorted by primary key / UUID) to eliminate deadlock risks.
5. **QR Code as Lookup Identifier:**
   - The QR code contains an opaque, secure token identifier (e.g. `SEPA-ABC123XYZ`), not balance amounts or signed state.
   - If a wristband/QR code is lost or corrupted, Admin triggers `reissue-qr`, updating `qr_code` on the participant record while preserving ID, balance, and transaction history.
6. **Outdoor & High-Contrast Visual Standards:**
   - Participant and Booth UI must feature high contrast (sunlight readable), large touch targets (minimum 48x48px), and instant feedback sounds/visual cues upon successful scan/deduction/transfer.
7. **Peer-to-Peer Transfer Integrity:**
   - Participants can transfer credit to another registered, active participant.
   - Self-transfers (`sender_qr_code === recipient_qr_code`) are strictly forbidden (`SELF_TRANSFER_NOT_ALLOWED`).
   - Transfer amount cannot exceed the sender's available balance (`INSUFFICIENT_BALANCE`). Minimum transfer amount is Rp1.
   - Both sender and recipient must have `ACTIVE` status; blocked accounts cannot send or receive credit.
   - Transfers create two immutable ledger records in a single atomic database transaction:
     - `TRANSFER_OUT` for sender with negative net effect, capturing balance before/after and recipient info in notes.
     - `TRANSFER_IN` for recipient with positive net effect, capturing balance before/after, sender info in notes, and linked via `reference_id`.
   - Both participant wallet history and Admin "Detail & Riwayat Peserta" must render transfer records with distinct indicators and counterparty details.

---

## 7. Testing Strategy & Quality Gates

### 7.1 Minimum Coverage Thresholds
- **Statements / Lines:** ≥ 90%
- **Functions:** ≥ 90%
- **Branches:** ≥ 85%

### 7.2 Required Test Suites
1. **Unit Tests:**
   - Validation schema checks (valid, invalid payloads, boundary values, self-transfer rejection).
   - Domain service logic: balance calculations, refund eligibility, transfer eligibility, status validation.
2. **Integration Tests (API Level):**
   - Full HTTP lifecycle: login, wallet lookup, booth scan, deduction, transfer execution, transaction listing, refunds, admin reports.
   - Error responses asserting envelope structure and HTTP status codes (400, 401, 403, 404, 409, 422).
3. **Concurrency & Race Condition Tests:**
   - Simultaneous deduction and transfer attempts on a single participant wallet with insufficient balance for both.
   - Deadlock-free concurrent reciprocal transfers between two participants (A transfers to B while B transfers to A simultaneously).
4. **Frontend Unit & Component Tests:**
   - Participant wallet view rendering, transfer button, transfer scanner modal (camera & manual token fallback), recipient preview, amount input limits, and transfer ledger display in participant and admin views.

---

## 8. Explicit Boundaries & Rules of Engagement

### 8.1 Always-Do Actions
- Always use the `{ success, data, meta }` envelope for API responses.
- Always wrap database mutations in Sequelize managed transactions.
- Always lock multiple rows in deterministic order (e.g. sorted by ID) to prevent database deadlocks.
- Always log significant events and transaction boundaries with Winston JSON logging.
- Always format code with 2 spaces, semicolons, and max line length of 120 characters.
- Always use custom hooks in React to encapsulate API calls and state management.

### 8.2 Ask-First Actions
- Adding external payment gateway integrations or third-party cloud services.
- Altering the Rp1.000.000 default balance invariant.
- Introducing multi-currency or cash top-up workflows.

### 8.3 Never-Do Actions
- Never allow participant balance to become negative.
- Never allow participants to trigger wallet balance deductions for activities directly without staff auth.
- Never update or delete existing rows in the `transactions` table.
- Never put business logic, direct API calls, or database operations in controllers or React JSX components.
- Never store plaintext passwords or hardcode secret keys.

### 8.4 Out-of-Scope Items
- Cash top-ups, bank transfers, or payment gateway (Midtrans/Xendit) integration.
- Offline peer-to-peer transfers without server connection.
- Cryptocurrency integrations.
- Native mobile app store distribution (iOS/Android native binaries).
- Complex general ledger multi-entity enterprise accounting.

---

## 9. Acceptance Criteria & Verification Matrix

| Area | Requirement | Acceptance Criterion | Verification Method |
|---|---|---|---|
| **Participant** | Wallet View | Displays Name, Rp1.000.000 starting credit, real-time balance, spent amount, and "Transfer Saldo" button. | Automated Component Test + E2E |
| **Participant** | QR Display | Renders scannable high-resolution QR matching participant token. | Visual inspection & scanner test |
| **Participant** | Transfer Scanner | Clicking "Transfer Saldo" opens scanner modal with camera viewfinder matching staff scanner UI plus manual token input below scanner. | Component test & manual test |
| **Participant** | Transfer Recipient & Nominal Input | Scanning/entering valid recipient token shows recipient name/QR, displays available balance, enforces `1 <= amount <= current_balance`, and disables submit if exceeding balance or to self. | Component test & integration test |
| **Participant** | Atomic Transfer Execution | Submitting transfer deducts sender, credits recipient, updates UI balance immediately, and creates immutable `TRANSFER_OUT` and `TRANSFER_IN` records. | Integration test & concurrency test |
| **Participant** | Personal Tx History | Shows `TRANSFER_OUT` with recipient name/token & `-Rp...` (Transfer Keluar badge) and `TRANSFER_IN` with sender name/token & `+Rp...` (Transfer Masuk badge). | Component test & API verification |
| **Booth** | QR Scanner | Instantly reads participant QR and loads balance/identity in < 500ms. | Integration test & manual camera test |
| **Booth** | Deduction | Deducts exact activity price, updates balance atomically, creates immutable tx record. | Concurrency & Integration test |
| **Booth** | Insufficient Balance | Rejects deduction if price > balance with clear visual alert. | Integration test (HTTP 422) |
| **Admin** | Dashboard | Real-time totals of allocated credit, spent credit, activity counts, and full transaction feed. | Integration & Dashboard test |
| **Admin** | Participant Detail & Ledger | Admin "Detail & Riwayat Peserta" displays all transfer transactions with correct sender/recipient notes and amount signs. | Integration test & UI test |
| **Admin** | Participant CRUD | Full lifecycle management (Create, Read/Search, Update details, Safe Delete without tx, Reissue QR, Block/Unblock). | Unit, Integration & UI test |
| **Admin** | QR Reissue | Generates new QR token; old QR immediately returns invalid; balance preserved. | Integration test |
| **Admin** | Refund | Admin can refund a specific transaction; creates linked `REFUND` tx; balance restored. | Integration test & ledger check |
| **Admin** | Export | Exports full participant balances and transactions to CSV/Excel matching DB ledger. | Unit & Integration test |
| **Security** | Role Guard | Unauthorized users cannot access booth deduction or admin endpoints. | Auth Integration test (401/403) |
| **Reliability** | Concurrency | Concurrent transactions and reciprocal transfers on wallets never produce negative balance, lost updates, or database deadlocks. | Concurrency race condition test |
