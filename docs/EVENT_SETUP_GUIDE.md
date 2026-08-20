# Event Setup Guide: Sepa Island Activity Wallet

This guide outlines the step-by-step procedure for technical supervisors and event organizers to set up, configure, and verify the **Sepa Island Activity Wallet** prior to event launch.

---

## 1. Prerequisites & System Requirements

### Hardware Requirements
- **Server / Local Hub:** Any machine running Node.js 18+ and SQLite / MySQL / PostgreSQL.
- **Booth Devices:** Android or iOS smartphones/tablets with a functioning camera and modern browser (Chrome / Safari) for Booth Staff.
- **Participant Devices:** Personal smartphones capable of scanning or displaying QR codes and running Progressive Web Apps.
- **Wristband Printer:** Standard barcode/thermal label printer or A4 sticker sheet printer for participant wristbands.

### Software Stack
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Database:** SQLite (default/offline local), MySQL 8.0+, or PostgreSQL 14+

---

## 2. Environment Configuration

### Backend Setup
1. Navigate to the backend directory and copy the environment template:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Configure `.env` with appropriate production/staging values:
   ```ini
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=super_secure_island_jwt_secret_key_2026
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=*
   
   # Database Configuration
   DB_DIALECT=sqlite
   DB_STORAGE=database.sqlite
   # Alternatively for MySQL/Postgres:
   # DB_HOST=127.0.0.1
   # DB_PORT=3306
   # DB_USER=wallet_user
   # DB_PASSWORD=wallet_password
   # DB_NAME=activity_wallet
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Ensure the Vite build points to the correct backend API endpoint (default uses `/api/v1` via reverse proxy or configured base URL).

---

## 3. Database Initialization & Seeding

Run the database setup script to create tables and populate baseline data:

```bash
cd backend
npm run db:setup
```

This command automatically executes:
1. `npm run db:create` — Creates the database schema if absent.
2. `npm run db:migrate` — Applies all 4 Sequelize migration scripts:
   - `000001-create-users` (Admins and Staff accounts)
   - `000002-create-participants` (Participant wallets and indexed QR tokens)
   - `000003-create-activities` (Activity catalog and pricing)
   - `000004-create-transactions` (Immutable audit ledger with FKs and indexes)
3. `npm run seed` — Populates baseline admin, booth staff accounts, standard water sport activities, and initial sample participants.

---

## 4. Participant Provisioning (~80 Participants)

Every participant must receive a starting credit of **Rp1.000.000**.

### Method A: Bulk Import via Admin Dashboard (Recommended)
1. Log in to the Admin Dashboard at `/login` using the supervisor account (`admin` / `admin123`).
2. Navigate to **Participant Manager** (`/admin/participants`).
3. Click **Impor Massal (Bulk Import)**.
4. Paste the list of ~80 participant names (one name per line or CSV list).
5. Confirm import. The system creates all participants within a single ACID transaction with unique QR codes (format: `SEPA-XXXXXX`) and Rp1.000.000 credit.

### Method B: API / Script Provisioning
Execute a POST request to `/api/v1/admin/participants/bulk`:
```json
{
  "participants": [
    { "name": "Budi Santoso", "initial_credit": 1000000 },
    { "name": "Siti Rahmawati", "initial_credit": 1000000 },
    { "name": "Ahmad Fauzi", "initial_credit": 1000000 }
  ]
}
```

---

## 5. Activity Catalog & Pricing Configuration

Verify and adjust water sport activity prices on the **Activity Manager** (`/admin/activities`):

| Activity Name | Default Price | Standard Duration | Notes |
|---|---|---|---|
| **Jet Ski** | Rp 350.000 | 15 Menit | Instructor guided |
| **Banana Boat** | Rp 150.000 | 15 Menit | Group ride |
| **Donut Boat** | Rp 175.000 | 15 Menit | High thrill |
| **Snorkeling Set** | Rp 200.000 | Full Day | Mask, fin, vest + reef guide |
| **Canoe Single** | Rp 100.000 | 30 Menit | Coastal lagoon |
| **Canoe Double** | Rp 150.000 | 30 Menit | Tandem canoe |

*Note: Inactive activities can be toggled off instantly from the dashboard to hide them from participant and booth views.*

---

## 6. QR Wristband Generation & Printing

1. Navigate to **Participant Manager** on the Admin Dashboard.
2. Filter or select participants.
3. Click **Cetak Kartu / QR (Print/Export QR)** to export participant tokens.
4. Print physical wristbands/stickers ensuring high-contrast black QR on white background (minimum 2.5cm x 2.5cm) for direct sunlight scanning.

---

## 7. Booth Device Setup Checklist

For each activity booth (Jet Ski, Banana Boat, Donut Boat, Snorkeling, Canoe):
- [ ] Open Chrome/Safari on booth tablet/phone.
- [ ] Navigate to the application URL and click **Install App / Add to Home Screen** (PWA).
- [ ] Log in with assigned booth credentials:
  - Jet Ski: `staff_jetski` / `staff123`
  - Banana Boat: `staff_banana` / `staff123`
  - Donut Boat: `staff_donut` / `staff123`
  - Snorkeling: `staff_snorkeling` / `staff123`
- [ ] Test camera permission for QR scanner.
- [ ] Test manual QR token entry fallback.
- [ ] Run a test scan with a demo wristband (`SEPA-001`) and verify balance preview.
