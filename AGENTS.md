# AGENTS.md - Sepa Island Activity Wallet

Project documentation and instructions for AI agents working in this repository.

---

## 1. Project Overview

**Sepa Island Activity Wallet** is a digital activity credit management system designed for events (e.g., Sepa Island Water Activity, ~80 participants). It replaces cash payments with a controlled, digital prepaid activity wallet.

- **Initial Credit:** Rp1.000.000 per participant.
- **Supported Activities:** Jet Ski, Banana Boat, Donut Boat, Snorkeling, and other outdoor water sports.
- **Target Platforms:** Progressive Web App (PWA) for Participants & Booth Staff + Web Dashboard for Supervisors/Admins.
- **Core Principle:** Simplicity, speed at outdoor booths, operational reliability, and strict financial auditability.
- **Source of Truth:** Refer to [`PRD.md`](./docs/PRD.md) for full functional requirements and out-of-scope boundaries.

---

## 2. User Roles & Capabilities

| Role | Interface | Capabilities | Restrictions / Boundaries |
|---|---|---|---|
| **Participant** | Participant PWA | - View current balance and total spent<br>- View available activities & affordability status<br>- Display unique personal QR code<br>- View personal transaction history | - **Read-only balance**<br>- Cannot initiate payments directly<br>- Cannot transfer to other participants<br>- Cannot view other participants' data |
| **Booth Staff** | Booth PWA / Scanner | - Scan participant QR code<br>- View participant identity & current balance<br>- View activity price & confirm deduction<br>- View recent booth transaction history | - Cannot modify balances manually<br>- Cannot process refunds without admin authorization<br>- No access to admin settings |
| **Admin / Supervisor** | Admin Dashboard | - Manage participants & initial credit<br>- Create & configure activities and pricing<br>- Real-time monitoring of all event transactions<br>- Process authorized refunds / corrections<br>- Reissue / replace lost QR wristbands/codes<br>- Export transaction & usage reports to Excel/CSV | - Full administrative privileges; all actions must be logged |

---

## 3. Core Business Invariants

All agents modifying code, schemas, or APIs MUST enforce these invariants:

1. **Prepaid Credit & Non-Negative Balance:**
   - Every participant receives Rp1.000.000 starting credit.
   - Transactions MUST be rejected if `activity.price > participant.balance`. Balance can never drop below 0.
2. **Immutable Transaction Ledger (Append-Only):**
   - Transactions cannot be updated or deleted.
   - Refunds and adjustments MUST be recorded as distinct, new transaction entries linked to the original transaction.
3. **Staff-Initiated Deductions Only:**
   - Participants cannot deduct their own balance. Only authenticated Booth Staff or Admins can post transaction records.
4. **QR Code is an Identifier, Not a Token/Payment Vehicle:**
   - QR codes only store/reference the participant's unique ID/token for wallet lookup.
   - If a QR code is lost/damaged, Admin rebinds a new QR identifier; the old QR is invalidated while wallet balance and history are preserved.
5. **Outdoor & Island Conditions Reliability:**
   - Instant scanner response and high-contrast UI suitable for bright outdoor environments.
   - Resilient against intermittent island network connectivity with clear error messaging.

---

## 4. Key Entities & Domain Model

- **Participant / Wallet:**
  - `id`: Unique identifier
  - `name`: Participant full name
  - `qr_code`: Unique QR token / wristband identifier (active)
  - `initial_credit`: Default 1,000,000
  - `current_balance`: Computed or persisted with strict concurrency lock
  - `status`: Active, Inactive, Blocked
- **Activity:**
  - `id`: Unique identifier
  - `name`: e.g., "Jet Ski", "Banana Boat"
  - `price`: Integer (Rp)
  - `status`: Active, Inactive
- **Transaction:**
  - `id`: Unique identifier
  - `participant_id`: Foreign key
  - `activity_id`: Foreign key (optional for manual adjustments)
  - `staff_id`: Staff/Admin user who executed the transaction
  - `type`: `DEDUCTION` | `REFUND` | `ADJUSTMENT`
  - `amount`: Transaction value in IDR
  - `balance_before`: Balance before mutation
  - `balance_after`: Balance after mutation
  - `created_at`: Timestamp (immutable)
  - `reference_id`: Original transaction ID (for refunds/adjustments)
- **User (Staff / Admin):**
  - `id`: Unique identifier
  - `username` / `email`: Login credentials
  - `role`: `STAFF` | `ADMIN`
  - `booth_id` / `assigned_activity_id`: Optional booth assignment

---

## 5. Development Standards & Rules Reference

For all coding, testing, styling, and operational standards, refer directly to the designated project rules:

- **Safety & Behavioral Guardrails:** Refer to [01-safety-guardrails.md](.agents/rules/01-safety-guardrails.md) for thinking before coding, volume constraints, surgical changes, and rule invariants.
- **CLI & Command Execution:** Refer to [02-antigravity-rtk-rules.md](.agents/rules/02-antigravity-rtk-rules.md) (prefix shell commands with `rtk`).
- **General Fullstack Standards:** Refer to [10-fullstack-general-standards.md](.agents/rules/10-fullstack-general-standards.md) for formatting (2 spaces, semicolons, 120-char max), output purity, validation, error handling, JSDoc, and debugging protocols.
- **Backend Standards (Node.js / Express / Sequelize):** Refer to [20-backend-node-express-sequelize.md](.agents/rules/20-backend-node-express-sequelize.md) for architectural layer boundaries (controllers, services, models), response envelope (`{ success, data, meta }`), database indexing, transactions, and Winston logging.
- **Frontend Standards (React):** Refer to [30-frontend-react.md](.agents/rules/30-frontend-react.md) for functional components, hook strategy, external data lifecycle, and forbidden JSX business logic.
- **Testing Standards:** Refer to [40-testing-standards.md](.agents/rules/40-testing-standards.md) for test quality requirements (success, failure, edge cases), ignore directive justification, and coverage minimums (90% lines/funcs, 85% branches).
