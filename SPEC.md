# SPEC.md - Rekapitulasi Transaksi per Activity (Wahana)

**Document Status:** Approved  
**Feature:** Rekapitulasi Transaksi per Activity (Wahana) pada Portal Admin  
**Governing Architecture:** [`AGENTS.md`](./AGENTS.md)  
**Parent PRD:** [`docs/PRD.md`](./docs/PRD.md) (Section 11: Admin Dashboard & Section 12: Reporting)  

---

## 1. Objective & Target Users

### 1.1 Objective
Memberikan visibilitas performa operasional dan finansial per wahana (water sport activity) kepada Event Supervisor/Admin secara real-time. Fitur ini menyajikan rekapitulasi transaksi pemotongan kredit (Deduction), pengembalian (Refund), total nominal rupiah (Gross & Net), jumlah peserta unik yang bermain di tiap wahana, serta persentase kontribusi penggunaan kredit event, dilengkapi kemampuan ekspor laporan (CSV & Excel) dan integrasi filter langsung ke riwayat transaksi.

### 1.2 Target Users & Interface
- **Target User:** Event Supervisor / Admin (Role: `ADMIN`).
- **Antarmuka Utama:**
  1. **Admin Dashboard (`/admin`):** Widget visual *"Rekapitulasi per Wahana"* di antara KPI Cards dan Audit Ledger untuk monitoring instan dan interaktif.
  2. **Dedicated Navigation Tab (`/admin/activity-summary`):** Tab *"Rekap Wahana"* pada `AdminNavTabs` untuk audit komprehensif, filtering rentang tanggal, pencarian, dan perbandingan performa.
  3. **Export Toolbar (`ExportToolbar`):** Tombol ekspor terintegrasi untuk mengunduh rekapitulasi wahana dalam format CSV dan Excel (.xls).

---

## 2. UI/UX Placement & Design Decisions (Best Practices)

### 2.1 Evaluasi & Justifikasi Penempatan
Berdasarkan prinsip UI/UX untuk dashboard operasional event:
1. **At-a-Glance Executive Summary di Dashboard Utama (`/admin`):**
   - Penempatan: Diletakkan tepat di bawah 4 kartu KPI utama dan di atas tabel Riwayat Transaksi.
   - Mengapa: Admin tidak perlu berpindah halaman saat memantau event; performa wahana terpopuler dan serapan kredit langsung terlihat.
   - Interaksi: Mengklik tombol *"Filter Ledger"* pada salah satu wahana akan memfilter tabel riwayat transaksi di bawahnya khusus untuk wahana tersebut secara seamless.
2. **Dedicated Deep-Dive View (`/admin/activity-summary`):**
   - Penempatan: Ditambahkan ke tab navigasi utama admin (`AdminNavTabs`):  
     `Ringkasan` | `Rekap Wahana` | `Peserta & QR` | `Daftar Aktivitas`.
   - Mengapa: Saat admin/supervisor ingin melakukan audit mendalam bersama vendor/operator perahu, mereka membutuhkan layar penuh dengan filter tanggal, pencarian wahana, metrik statistik lengkap, dan tombol ekspor langsung.
3. **Penyempurnaan `ExportToolbar`:**
   - Menambahkan opsi unduh *"Rekap Wahana (CSV)"* dan *"Rekap Wahana (Excel)"* untuk laporan formal pasca-event.

### 2.2 Desain Visual & Hierarki UI
- **Stat Cards & Progress Share:** Setiap wahana menampilkan visual progress bar yang mengindikasikan pangsa nominal dari total belanja event.
- **High-Contrast Island Theme:** Konsisten dengan palet warna outdoor sistem (Cyan/Blue, Emerald Green, Sport Orange, Violet).
- **Zero Jargon & Clarity:** Label metrik jelas: *Tarif Satuan*, *Frekuensi Main*, *Refund*, *Pendapatan Bersih (Net)*, dan *Peserta Unik*.

---

## 3. Public Contracts & API Specifications

### 3.1 Endpoint 1: Agregasi Rekap Wahana
- **Route:** `GET /api/v1/admin/reports/activities/summary`
- **Auth:** `requireAuth`, `requireRole('ADMIN')`
- **Query Parameters:**
  - `start_date` (ISO Date string, optional)
  - `end_date` (ISO Date string, optional)
  - `status` (`ACTIVE` | `INACTIVE`, optional)
- **Response Envelope:**
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "total_activities": 10,
        "total_deductions": 45,
        "total_refunds": 2,
        "total_gross_amount": 12500000,
        "total_refund_amount": 500000,
        "total_net_amount": 12000000,
        "total_unique_participants": 38
      },
      "activities": [
        {
          "id": "c1f7a0b2-...",
          "name": "Jetski",
          "price": 650000,
          "status": "ACTIVE",
          "deduction_count": 12,
          "refund_count": 1,
          "gross_amount": 7800000,
          "refund_amount": 650000,
          "net_amount": 7150000,
          "unique_participants_count": 11,
          "share_percentage": 59.58
        }
      ]
    },
    "meta": {
      "generated_at": "2026-09-22T04:30:00.000Z"
    }
  }
  ```

### 3.2 Endpoint 2: Ekspor Rekap Wahana (CSV / Excel)
- **Route:** `GET /api/v1/admin/reports/activities/export`
- **Auth:** `requireAuth`, `requireRole('ADMIN')`
- **Query Parameters:**
  - `format` (`csv` | `excel`, required)
  - `start_date` (optional)
  - `end_date` (optional)
  - `status` (optional)
- **Response:**
  - `Content-Type`: `text/csv; charset=utf-8` atau `application/vnd.ms-excel`
  - `Content-Disposition`: `attachment; filename="activities-recap-report.[csv|xls]"`
  - Data tabel: No, Nama Aktivitas, Status, Tarif Satuan, Total Main, Total Refund, Total Kotor (Rp), Total Refund (Rp), Total Bersih (Rp), Peserta Unik, Pangsa (%).

---

## 4. Architecture & Data Flow

```text
[ Admin UI (Dashboard / Rekap Wahana Tab) ]
                   │
                   ▼  GET /api/v1/admin/reports/activities/summary
       [ adminRoutes.js ]
                   │
                   ▼  (requireAuth, requireRole('ADMIN'))
    [ adminTransactionController.js ]
                   │
                   ▼
       [ adminReportService.js ]
                   │  Aggregates Activity LEFT JOIN Transaction
                   │  (Group by activity.id, calculate DEDUCTION & REFUND)
                   ▼
     [ Sequelize: SQLite / MySQL ]
                   │
                   ▼
       [ Response Envelope JSON ]
```

---

## 5. Security & Invariant Boundaries

1. **Role Enforcement:** Hanya pengguna dengan peran `ADMIN` yang memiliki izin mengakses endpoint summary dan export.
2. **Immutable Ledger Consistency:** Perhitungan pemakaian dan pengembalian bersumber langsung dari tabel `transactions` tanpa mengubah data sedikit pun.
3. **Zero Balance Mutation:** Endpoint ini 100% read-only (idempotent), tidak mengubah state wallet atau aktivitas.
4. **Resilience & Sanitization:** Parameter tanggal dan format divalidasi dengan schema Joi sebelum dieksekusi.

---

## 6. Acceptance & Success Criteria

- [ ] **Dashboard Integration:** Pada halaman `/admin`, terdapat widget/section *Rekapitulasi per Wahana* yang menampilkan rekap ringkas seluruh wahana (nama, tarif, total main, pendapatan bersih, visual progress bar).
- [ ] **Quick-Filter Interaction:** Mengklik tombol filter pada kartu wahana di dashboard langsung memfilter tabel Riwayat Transaksi untuk wahana tersebut.
- [ ] **Dedicated Rekap Tab:** Tab *Rekap Wahana* aktif pada `AdminNavTabs` dan dapat diakses melalui rute `/admin/activity-summary`, menampilkan tabel analitik lengkap dengan sorting dan filter.
- [ ] **Export Functionality:** Pengguna admin dapat mengekspor rekap wahana ke CSV dan Excel baik dari ExportToolbar maupun dari halaman Rekap Wahana.
- [ ] **API Reliability & Test Coverage:** Unit test dan integration test untuk service, controller, route, dan React component lulus dengan cakupan minimum 90% lines.

---

## 7. Out of Scope

- Pembagian komisi otomatis kepada pihak ketiga/vendor perahu di luar pencatatan rekap nominal.
- Modifikasi manual terhadap angka transaksi rekap (angka selalu dihitung otomatis dari transaksi immutable).
