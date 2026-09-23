# SPEC.md - Transfer Saldo Kredit Aktivitas Antar Peserta

**Document Status:** Pending Approval  
**Feature:** Peer-to-Peer Transfer Saldo Kredit Aktivitas Antar Peserta  
**Governing Architecture:** [`AGENTS.md`](./AGENTS.md)  
**Parent PRD & Global Spec:** [`docs/PRD.md`](./docs/PRD.md) & [`docs/SPEC.md`](./docs/SPEC.md) (v1.1.0)  

---

## 1. Objective & Target Users

### 1.1 Objective
Memungkinkan peserta event Sepa Island Water Activity untuk saling mentransfer sisa saldo kredit aktivitas secara langsung (peer-to-peer) dari portal peserta mereka. Fitur ini dirancang untuk situasi lapangan di mana anggota keluarga, teman sekamar, atau rekan tim ingin menggabungkan atau membagikan sisa saldo kredit mereka agar dapat menikmati aktivitas air bersama (misal: Jet Ski yang bernilai lebih besar).

Fitur ini menyediakan pemindai QR kamera interaktif (dengan antarmuka konsisten dengan scanner staf) serta opsi input manual kode peserta, formulir input nominal transfer dengan validasi saldo ketat, dan pencatatan audit ganda (double-entry ledger) yang transparan di riwayat transaksi peserta maupun dashboard admin.

### 1.2 Target Users & Antarmuka Utama
1. **Peserta Pengirim (Portal Peserta - `/participant/:qrCode`):**
   - Menemukan tombol **"Transfer Saldo"** yang jelas dan kontras tinggi pada halaman dompet peserta.
   - Membuka modal/tampilan pemindai QR untuk memindai kode QR gelang/portal peserta penerima atau mengetikkan kode token peserta penerima di bawah viewfinder.
   - Melihat identitas peserta penerima yang diverifikasi (Nama dan Kode Peserta).
   - Memasukkan nominal saldo yang ingin ditransfer dengan batasan maksimal sebesar saldo yang tersedia.
   - Mengonfirmasi transfer dan melihat saldo terpotong secara instan.
   - Melihat catatan transaksi bertipe `TRANSFER_OUT` bertanda `-` (merah/amber) dengan rincian penerima di **Riwayat Transaksi**.
2. **Peserta Penerima (Portal Peserta - `/participant/:qrCode`):**
   - Menerima penambahan saldo secara real-time.
   - Melihat catatan transaksi bertipe `TRANSFER_IN` bertanda `+` (hijau) dengan rincian pengirim di **Riwayat Transaksi**.
3. **Supervisor / Admin (Admin Dashboard - `/admin`):**
   - Melihat seluruh mutasi transfer keluar (`TRANSFER_OUT`) dan transfer masuk (`TRANSFER_IN`) di modal **"Detail & Riwayat Peserta"** dengan label pengirim/penerima yang jelas.
   - Audit trail lengkap dan tidak dapat dimanipulasi (immutable ledger).

---

## 2. UI/UX Flow & Desain Komponen

### 2.1 Alur Pengguna (User Journey)
```text
[ Tombol "Transfer Saldo" di BalanceCard / Portal Peserta ]
                          │
                          ▼
[ Modal / Tampilan Scanner Peserta (Mirip Scanner Staf) ]
  ├── Live Camera Viewfinder (Html5Qrcode)
  ├── Tombol Switch Camera & Toggle On/Off
  └── Form Input Manual Kode Peserta (Contoh: SEPA-002)
                          │
                          ▼ (Hasil Scan / Submit Kode)
[ Verifikasi Penerima (GET /api/v1/participants/transfer/recipient/:qrCode) ]
  ├── Validasi: Peserta ditemukan? Status ACTIVE? Bukan diri sendiri?
                          │
                          ▼
[ Formulir Input Nominal Transfer ]
  ├── Info Penerima: Nama & Kode Token Peserta
  ├── Saldo Tersedia Pengirim: RpXXX.XXX
  ├── Input Nominal Transfer (Rp)
  │     └── Quick buttons: Rp50.000, Rp100.000, Rp200.000, "Semua Saldo" (Max)
  │     └── Helper text: "Maksimal transfer: RpXXX.XXX"
  └── Tombol "Konfirmasi & Kirim Saldo" (Disabled jika nominal > saldo atau <= 0)
                          │
                          ▼ (Submit POST /api/v1/participants/transfer)
[ Notifikasi Berhasil & Refresh Otomatis ]
  ├── Toast / Alert Sukses: "Berhasil mentransfer RpXXX ke [Nama Penerima]"
  ├── Saldo pengirim langsung berkurang
  └── Riwayat transaksi otomatis menampilkan transaksi "Transfer Keluar"
```

### 2.2 Desain Visual & Standar High-Contrast Outdoor
- **Konsistensi Tampilan Scanner:** Memanfaatkan komponen scanner yang memiliki desain, viewfinder laser, dan tata letak identik dengan scanner staf (`ScannerView`), termasuk fallback input manual kode token di bagian bawah.
- **Pencegahan Human Error:**
  - Menampilkan nama penerima yang jelas sebelum nominal diinput agar pengirim yakin tidak salah sasaran.
  - Memvalidasi agar peserta tidak bisa mentransfer ke kode QR milik dirinya sendiri.
  - Input nominal dibatasi secara interaktif (tidak bisa minus, tidak bisa melebihi saldo pengirim).
- **Badge Riwayat Transaksi:**
  - `TRANSFER_OUT`: Badge `Transfer Keluar` (warna amber/merah dengan icon arrow down/send), nominal `-RpXXX.XXX`, keterangan: `Transfer ke [Nama Penerima] ([Kode QR])`.
  - `TRANSFER_IN`: Badge `Transfer Masuk` (warna emerald/hijau dengan icon arrow up/receive), nominal `+RpXXX.XXX`, keterangan: `Transfer dari [Nama Pengirim] ([Kode QR])`.

---

## 3. Public Contracts & API Specifications

### 3.1 Endpoint 1: Verifikasi Penerima Transfer
- **Route:** `GET /api/v1/participants/transfer/recipient/:qrCode`
- **Auth:** Public / Token
- **Tujuan:** Memvalidasi keberadaan dan kesiapan akun penerima sebelum membuka form nominal.
- **Validasi Params:** `qrCode` required string (alphanumeric & dashes).
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "recipient": {
        "id": "e8a93b45-...",
        "name": "Budi Santoso",
        "qr_code": "SEPA-002",
        "status": "ACTIVE"
      }
    }
  }
  ```
- **Error Codes:**
  - `404 PARTICIPANT_NOT_FOUND`: "Peserta penerima dengan kode tersebut tidak ditemukan."
  - `403 PARTICIPANT_BLOCKED`: "Akun penerima sedang diblokir dan tidak dapat menerima transfer."

### 3.2 Endpoint 2: Eksekusi Transfer Saldo Kredit
- **Route:** `POST /api/v1/participants/transfer`
- **Auth:** Public / Token (identitas pengirim diidentifikasi via `sender_qr_code`)
- **Request Body (JSON):**
  ```json
  {
    "sender_qr_code": "SEPA-001",
    "recipient_qr_code": "SEPA-002",
    "amount": 200000,
    "notes": "Patungan Jet Ski"
  }
  ```
- **Validation Rules (Joi Schema):**
  - `sender_qr_code`: string, required, uppercase trim.
  - `recipient_qr_code`: string, required, uppercase trim, tidak boleh sama dengan `sender_qr_code`.
  - `amount`: integer, min 1, required.
  - `notes`: string, max 255 chars, optional.
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "transfer": {
        "amount": 200000,
        "sender_balance": 800000,
        "recipient_name": "Budi Santoso",
        "recipient_qr_code": "SEPA-002",
        "transfer_out_id": "7fa12...",
        "transfer_in_id": "8bc34..."
      }
    }
  }
  ```
- **Error Codes:**
  - `400 SELF_TRANSFER_NOT_ALLOWED`: "Tidak dapat melakukan transfer ke akun sendiri."
  - `404 SENDER_NOT_FOUND`: "Akun pengirim tidak ditemukan."
  - `404 RECIPIENT_NOT_FOUND`: "Akun penerima tidak ditemukan."
  - `403 SENDER_BLOCKED`: "Akun Anda sedang diblokir oleh administrator."
  - `403 RECIPIENT_BLOCKED`: "Akun penerima sedang diblokir oleh administrator."
  - `422 INSUFFICIENT_BALANCE`: "Saldo tidak mencukupi untuk melakukan transfer ini."

---

## 4. Architecture, Database & Ledger Mutation

### 4.1 Perubahan Database Schema
1. **Model `Transaction` (`src/models/Transaction.js`):**
   - Kolom `staff_id`: diubah menjadi `allowNull: true` (karena transfer saldo diinisiasi mandiri oleh peserta tanpa token login staf).
   - Kolom `type`: ditambahkan nilai ENUM `TRANSFER_OUT` dan `TRANSFER_IN`.
   - Kolom `activity_id`: tetap `null` untuk transaksi transfer.
   - Kolom `reference_id`: pada transaksi `TRANSFER_IN`, diisi foreign key menuju ID transaksi `TRANSFER_OUT` milik pengirim (menghubungkan audit trail secara erat).
2. **Konstanta `enums.js`:**
   ```javascript
   const TransactionType = Object.freeze({
     DEDUCTION: 'DEDUCTION',
     REFUND: 'REFUND',
     ADJUSTMENT: 'ADJUSTMENT',
     TRANSFER_OUT: 'TRANSFER_OUT',
     TRANSFER_IN: 'TRANSFER_IN'
   });
   ```

### 4.2 Alur Transaksi Atomik & Pencegahan Deadlock
Untuk mencegah *race condition* dan *deadlock* saat terjadi transfer bersamaan:
1. Jalankan `sequelize.transaction(async (t) => { ... })`.
2. Lakukan row locking (`t.LOCK.UPDATE`) terhadap data pengirim dan penerima dalam **urutan id deterministik** (misal: `ORDER BY id ASC`):
   ```javascript
   const firstId = sender.id < recipient.id ? sender.id : recipient.id;
   const secondId = sender.id < recipient.id ? recipient.id : sender.id;
   // Lock first, then lock second
   ```
3. Cek kembali saldo pengirim: `sender.current_balance >= amount`.
4. Mutasi saldo:
   - `sender.current_balance = sender.current_balance - amount;`
   - `recipient.current_balance = recipient.current_balance + amount;`
   - Simpan kedua participant record (`await sender.save({ transaction: t })`, `await recipient.save({ transaction: t })`).
   - Catatan: `total_spent` peserta **TIDAK** diubah karena transfer saldo bukan pemakaian aktivitas air.
5. Buat 2 record transaksi immutable:
   - **Record 1 (`TRANSFER_OUT`):**
     - `participant_id`: `sender.id`
     - `type`: `TransactionType.TRANSFER_OUT`
     - `amount`: `amount`
     - `balance_before`: `balance_before_sender`
     - `balance_after`: `balance_after_sender`
     - `staff_id`: `null`
     - `notes`: `Transfer ke ${recipient.name} (${recipient.qr_code})` + (notes ? ` - ${notes}` : '')
   - **Record 2 (`TRANSFER_IN`):**
     - `participant_id`: `recipient.id`
     - `type`: `TransactionType.TRANSFER_IN`
     - `amount`: `amount`
     - `balance_before`: `balance_before_recipient`
     - `balance_after`: `balance_after_recipient`
     - `staff_id`: `null`
     - `reference_id`: `txOut.id`
     - `notes`: `Transfer dari ${sender.name} (${sender.qr_code})` + (notes ? ` - ${notes}` : '')

---

## 5. Security & Invariant Boundaries

1. **Non-Negative Balance Invariant:** Saldo tidak pernah boleh menjadi negatif. Kondisi `amount > sender.current_balance` selalu ditolak di database level dengan transaction lock.
2. **Self-Transfer Prohibition:** Pengirim tidak boleh mentransfer ke diri sendiri (`sender_qr_code !== recipient_qr_code`).
3. **No Phantom Transfers:** Akun diblokir (`BLOCKED`) tidak dapat mengirim ataupun menerima saldo.
4. **Append-Only Immutable Ledger:** Mutasi saldo saldo tidak boleh dilakukan tanpa pencatatan berpasangan `TRANSFER_OUT` dan `TRANSFER_IN`.
5. **Staff-Only Activity Deductions Preserved:** Izin memotong saldo untuk bermain aktivitas (Jet Ski, Banana Boat, dll) tetap eksklusif milik Booth Staff / Admin. Portal peserta hanya memiliki kewenangan transfer antar-rekan peserta.

---

## 6. Acceptance & Success Criteria

- [ ] **Tombol Transfer di Portal Peserta:** Tersedia tombol *"Transfer Saldo"* yang jelas pada antarmuka dompet peserta (`ParticipantView` / `BalanceCard`).
- [ ] **Scanner Peserta Berfungsi Penuh:** Menampilkan antarmuka pemindai kamera (HTML5 camera viewfinder) yang mirip scanner staf, lengkap dengan pemilih kamera dan form input manual kode peserta di bawahnya.
- [ ] **Validasi Identitas Penerima:** Sistem memeriksa validitas kode peserta penerima sebelum memasukkan nominal. Menampilkan pesan error jika kode tidak ada, terblokir, atau kode milik sendiri.
- [ ] **Validasi Batas Nominal:** Input nominal memvalidasi agar nilai transfer > 0 dan tidak boleh melebihi saldo pengirim saat ini. Tombol submit dinonaktifkan jika input melebihi saldo.
- [ ] **Eksekusi Atomik & Update UI Instan:** Setelah konfirmasi, saldo pengirim berkurang dan riwayat transaksi pengirim langsung menampilkan catatan `TRANSFER_OUT`.
- [ ] **Riwayat Transaksi Peserta:**
  - Pengirim melihat `TRANSFER_OUT` dengan badge *"Transfer Keluar"*, tanda `-Rp...`, dan nama/kode penerima.
  - Penerima melihat `TRANSFER_IN` dengan badge *"Transfer Masuk"*, tanda `+Rp...`, dan nama/kode pengirim.
- [ ] **Riwayat Transaksi Admin:** Modal *"Detail & Riwayat Peserta"* di dashboard admin menampilkan kedua transaksi (`TRANSFER_OUT` dan `TRANSFER_IN`) dengan nominal, status saldo, dan rincian yang benar.
- [ ] **Test Coverage Minimum:** Seluruh kode baru diuji dengan unit test dan integration test (schema validation, transfer service, race condition prevention, controller, and frontend components) dengan coverage ≥ 90% lines.

---

## 7. Out of Scope

- Pembatalan (reversal) sepihak transfer oleh peserta (jika ada salah transfer, harus diselesaikan melalui administrator / refund flow).
- Transfer saldo secara offline tanpa sambungan internet.
- Biaya administrasi transfer (transfer saldo 100% nominal murni tanpa potongan).
