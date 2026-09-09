# Product Requirements Document (PRD)

## Sepa Island Activity Wallet

**Version:** 1.0
**Product Type:** Event Activity Credit Management System
**Target Event:** Sepa Island Water Activity
**Participants:** ±80 participants
**Initial Activity Credit:** Rp1.000.000 per participant
**Primary Platform:** Progressive Web App (PWA) + Admin Web Dashboard
**Primary Users:** Participant, Booth Staff, Supervisor/Admin

---

# 1. Product Summary

Sepa Island Activity Wallet is a digital system that allows participants to use a prepaid activity credit during water activities at Sepa Island.

Each participant receives **Rp1.000.000 Activity Credit** that can be used for activities such as Jet Ski, Banana Boat, Donut Boat, and others.

The system consists of:

* Participant App (to view balance and QR)
* Booth App (used by staff to process transactions)
* Admin Dashboard (to manage participants, activities, and reports)

All transactions are handled by **Booth Staff**, not by participants directly.

---

# 2. Core Concept

The system replaces cash payments with a **digital activity wallet**.

Flow:

1. Participant receives activity credit
2. Participant shows QR code at activity booth
3. Staff scans QR
4. System shows balance and activity price
5. Staff confirms transaction
6. Balance is reduced automatically
7. Transaction is recorded

---

# 3. Product Goals

The system must:

* Make transactions fast and simple at the booth
* Prevent double spending or incorrect charges
* Allow participants to easily track their remaining credit
* Allow admin to monitor all activity usage in real time
* Provide full transparency of all transactions
* Be reliable even in outdoor island conditions

---

# 4. User Roles

## 4.1 Participant

Participants can:

* View remaining activity credit
* View list of available activities
* View activity prices
* Show personal QR code
* View transaction history

Participants cannot:

* Change balance
* Make payments directly
* Modify activity prices
* Access other participants’ data

---

## 4.2 Booth Staff

Booth staff can:

* Scan participant QR code
* View participant identity and balance
* See activity price
* Confirm transactions
* View recent transactions at their booth

Booth staff cannot:

* Edit balances
* Refund transactions (unless authorized)
* Access admin settings

---

## 4.3 Admin / Supervisor

Admin can:

* Add and manage participants
* Assign initial activity credit
* Create and manage activities
* Set activity prices
* View all transactions
* Process refunds or corrections
* Replace lost QR wristbands
* Export reports to Excel
* Monitor overall event spending

---

# 5. Participant Experience

## 5.1 Home Screen

Participant sees:

* Current balance
* Total used credit
* Available activities
* Personal QR code
* Recent transactions

Example:

* Balance: Rp700.000
* Used: Rp300.000

---

## 5.2 Activities List

Participants can view:

* Activity name
* Price
* Whether they can afford it

If balance is enough → “Available”
If not enough → “Insufficient balance”

---

## 5.3 QR Code

Each participant has a unique QR code used for:

* Identity verification at booth
* Transaction processing

QR is used only for identification, not for payment.

---

# 6. Booth Transaction Flow

At each activity booth:

1. Staff opens Booth App
2. Staff scans participant QR
3. System shows participant details
4. System shows current balance
5. System shows activity price
6. Staff confirms transaction
7. Balance is reduced
8. Transaction is recorded
9. Participant can immediately use the activity

---

# 7. Transaction Rules

* Every transaction reduces participant balance
* Balance cannot go below zero
* Every transaction is recorded permanently
* Transactions cannot be deleted
* Refunds are recorded as new entries (not deletion)
* Each transaction must be traceable

---

# 8. Activity Management

Admin can create activities such as:

* Jet Ski
* Banana Boat
* Donut Boat
* Snorkeling

Each activity has:

* Name
* Price
* Status (active/inactive)

Prices are fixed per event unless changed by admin.

---

# 9. QR System

Each participant has a unique QR code.

QR is used for:

* Identifying participant at booth
* Linking to their wallet

If QR is lost or damaged:

* Admin can replace it
* Old QR becomes invalid
* Balance remains unchanged

---

# 10. Wallet System

Each participant has a digital wallet containing:

* Initial credit (Rp1.000.000)
* Remaining balance
* Total spent
* Transaction history

Wallet must always be accurate and up to date.

---

# 11. Admin Dashboard

Admin can:

* View all participants
* See total spending across event
* Monitor activity popularity
* View transaction history
* Process refunds if needed
* Export data to Excel

Dashboard provides a full overview of event financial activity.

---

# 12. Reporting

System provides reports such as:

* Total credit used
* Most popular activities
* Participant spending summary
* Full transaction history

Reports can be exported for documentation.

---

# 13. Security Principles

The system must ensure:

* Only authorized staff can process transactions
* Participants cannot modify their balance
* QR codes cannot be easily duplicated
* All transactions are recorded and traceable
* Admin actions are logged

---

# 14. Performance Requirements

The system must be:

* Fast at booth (instant scan response)
* Stable under multiple simultaneous users
* Reliable in outdoor island conditions
* Able to handle at least 80 participants smoothly

---

# 15. Error Handling

System should clearly show:

* Insufficient balance
* Invalid QR code
* Network issues
* Transaction failure

All errors must be easy for staff to understand.

---

# 16. Key Business Rules

* Every participant starts with Rp1.000.000 credit
* Only staff can process transactions
* Balance cannot be negative
* Transactions are permanent records
* Refunds are separate transactions
* QR is only for identification
* Admin controls all system configuration

---

# 17. System Flow Summary

1. Participant receives credit
2. Participant shows QR at booth
3. Staff scans QR
4. System checks balance
5. Staff confirms activity
6. System deducts credit
7. Transaction is saved
8. Participant enjoys activity

---

# 18. Success Criteria

The system is successful if:

* All participants can use their credit without issues
* Booth transactions are fast and smooth
* No duplicate or incorrect charges occur
* Admin can monitor all activity clearly
* Reports match actual usage
* Staff can operate system without technical difficulty

---

# 19. Out of Scope

The system does NOT include:

* Cash payments
* Bank transfers
* Cryptocurrency
* Native mobile apps
* Complex financial accounting systems
* Offline peer-to-peer wallet transfers

---

# 20. Final Summary

Sepa Island Activity Wallet is a simple, reliable digital system that replaces cash-based activity payments with a controlled credit system.

It ensures:

* Fast transactions
* Clear balance tracking
* Safe and controlled spending
* Easy management for event organizers
* Smooth experience for participants and staff

The focus is **simplicity, reliability, and operational safety during the event**.
