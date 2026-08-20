# Operational Runbook: Sepa Island Activity Wallet

This runbook serves as the definitive day-of-event operational manual for **Event Supervisors**, **Booth Staff**, and **Technical Operators** managing the Sepa Island Water Activity digital wallet system.

---

## 1. System Overview & Architecture Invariants

- **Initial Credit:** Rp1.000.000 per participant (starting credit).
- **Non-Negative Balance Invariant:** All deductions strictly reject transactions where `activity.price > participant.balance`. Balance can NEVER be negative.
- **Staff-Initiated Deductions Only:** Participants cannot deduct their own balance; all debits are authenticated by Booth Staff or Admins.
- **Append-Only Immutable Ledger:** Transactions cannot be modified or deleted. All reversals and corrections occur as explicit `REFUND` transaction entries linked to the original transaction ID.
- **QR Token Decoupling:** QR codes represent lookup identifiers, not bearer tokens or payment credentials. Reissuing a QR token retains 100% of balance and historical ledger records.

---

## 2. Daily Event Schedule & Runbook

```
┌──────────────────────────────────────────────────────────┐
│                   07:30 - 08:30                         │
│           Morning Booth Check & Sync                     │
├──────────────────────────────────────────────────────────┤
│                   08:30 - 17:00                         │
│             Active Water Activity Operations             │
│        (Continuous Scanning, Debit & Monitoring)         │
├──────────────────────────────────────────────────────────┤
│                   17:00 - 18:00                         │
│          Evening Reconciliation & Audit Export           │
└──────────────────────────────────────────────────────────┘
```

### Phase 1: Morning Setup (07:30 - 08:30)
1. **Server Health Check:**
   - Verify `GET /api/v1/health` returns status `healthy`.
   - Supervisor opens Admin Dashboard (`/admin`) and verifies total registered participants (~80) and initial allocated credit (e.g. Rp 80.000.000).
2. **Booth Staff Device Check:**
   - Staff open Booth Scanner PWA (`/booth`) on mobile devices.
   - Verify camera scanner responds instantly in ambient outdoor sunlight.
   - Test a dummy deduction / scan to ensure network connectivity.

### Phase 2: Active Event Operations (08:30 - 17:00)
1. **Participant Arrival at Booth:**
   - Participant presents physical QR wristband or opens Participant PWA on mobile (`/participant?token=SEPA-XXXXXX`).
2. **Scanning & Verification:**
   - Staff scans QR code or manually enters the 6-character token code (e.g., `SEPA-001`).
   - Modal displays Participant Name, Remaining Balance, and Activity Selection.
3. **Transaction Execution:**
   - Staff selects the requested activity (e.g. Jet Ski: Rp 350.000).
   - Staff taps **Konfirmasi Potong Saldo (Confirm Deduction)**.
   - System atomically deducts balance under concurrency lock, returns green confirmation screen, and updates recent booth feed.
4. **Insufficient Balance Flow:**
   - If balance is lower than activity price, the system disables the confirm button and highlights "Saldo Tidak Cukup".
   - Staff politely advises participant of their remaining balance.

### Phase 3: Evening Closing & Financial Reconciliation (17:00 - 18:00)
1. **Booth Settlement:**
   - Each booth reviews **Riwayat Booth (Recent Transactions)** to cross-check queue counts.
2. **Admin Ledger Audit:**
   - Supervisor reviews **Admin Dashboard Summary** (`/admin`):
     - Total Credit Allocated (e.g., Rp 80.000.000)
     - Total Credit Spent across all activities
     - Remaining System Credit
     - Total Transaction Volume
3. **Exporting Reports:**
   - Click **Download Laporan Peserta (Participants Report)** (CSV / Excel).
   - Click **Download Audit Ledger (Transactions Report)** (CSV / Excel).
   - Archive exports for event stakeholder reconciliation.

---

## 3. Incident Management & Emergency Procedures

### Scenario A: Lost or Damaged QR Wristband
*Participant lost their wristband or the QR sticker became unreadable.*

1. Participant reports to **Event Information / Admin Desk**.
2. Supervisor opens **Participant Manager** (`/admin/participants`).
3. Search participant by full name.
4. Verify participant identity.
5. Click **Reissue QR (Buat Ulang QR)**.
6. The system immediately invalidates the old QR token, binds a new unique token (e.g., `SEPA-REISSUE-A1B2C3`), and displays the new QR.
7. Print new wristband/sticker or share new token URL with participant.
8. **Wallet balance, spent credit, and all prior transaction histories remain 100% intact.**

### Scenario B: Accidental Deduction / Wrong Activity Selected
*Staff accidentally tapped Jet Ski (Rp 350.000) instead of Banana Boat (Rp 150.000).*

1. Staff notifies Supervisor via radio / intercom with Participant Name and approximate time.
2. Supervisor opens **Transaction Audit Ledger** (`/admin/transactions`).
3. Filter by Participant Name or Booth.
4. Locate the accidental `DEDUCTION` entry and click **Refund (Proses Refund)**.
5. Enter reason (e.g., "Salah pilih wahana oleh booth staff") and confirm.
6. System atomically restores Rp 350.000 to participant balance and writes an immutable `REFUND` record referencing the original transaction ID.
7. Staff at booth refreshes and processes the correct deduction (Banana Boat: Rp 150.000).

### Scenario C: Intermittent Island Connectivity / Offline Banner
*Cellular or Wi-Fi signal drops momentarily on the beach.*

1. The PWA shell displays a persistent high-contrast **Offline Banner** at the top of the screen: *"Koneksi internet terputus. Mode luar jaringan aktif."*
2. Static assets and UI remain loaded via Service Worker.
3. Staff should wait for signal reconnection before confirming new transactions to prevent ambiguous double-submits.
4. Once connection restores, the banner automatically dismisses.

### Scenario D: Double Tap / Rapid Duplicate Submission
*Staff accidentally double-tapped the confirm button quickly.*

- The backend concurrency lock (`withKeyLock` + pessimistic row lock) guarantees that only the first request acquires the transaction lock.
- Subsequent simultaneous requests evaluate against the newly decremented balance or return validation responses, preventing double debits.

---

## 4. Default System Credentials

| Role | Username | Default Password | Primary Interface |
|---|---|---|---|
| **Admin / Supervisor** | `admin` | `admin123` | `/admin` |
| **Booth Jet Ski** | `staff_jetski` | `staff123` | `/booth` |
| **Booth Banana Boat** | `staff_banana` | `staff123` | `/booth` |
| **Booth Donut Boat** | `staff_donut` | `staff123` | `/booth` |
| **Booth Snorkeling** | `staff_snorkeling` | `staff123` | `/booth` |

*> **Security Warning:** Change default passwords in production via the administrative console or database seed configuration.*
