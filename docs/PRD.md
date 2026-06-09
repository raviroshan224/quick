# Salon POS — Product Requirements Document

> **Status:** In Progress — Phase 1
> **Version:** 1.0.0
> **Last Updated:** 2026-06-06

---

## 1. Overview

A tablet-first Point of Sale system for modern salons. Phase 1 delivers a complete end-to-end POS experience: fast billing, customer CRM, staff and service management, inventory tracking, cash drawer, and reports — with Fonepay QR and Cash as the only payment methods.

## 2. Problem Statement

Salons in Nepal rely on manual billing, pen-and-paper records, and cash-only operations. This causes slow checkouts, no customer history, no visibility into staff performance, and frequent inventory stockouts. A dedicated POS eliminates these pain points.

## 3. Goals & Non-Goals

### Goals
- Checkout in under 10 seconds
- Offline-ready tablet experience (Drift local DB)
- Guest checkout — no forced registration
- Fonepay QR + Cash payments (including split)
- Staff commission tracking per service
- Full audit trail on cash movements

### Non-Goals (Phase 2+)
- Online booking
- Card / eSewa / Khalti payments
- Payroll integration
- Multi-branch / multi-salon
- Customer loyalty points

---

## 4. User Roles

| Role  | Access |
|-------|--------|
| **Owner** | Full access: settings, all reports, staff management, refunds, cash drawer close, image library |
| **Staff** | Billing, service self-assignment, payment initiation, own commission view |

---

## 5. Core Features — Phase 1

### 5.1 POS Billing
- Service catalogue with category filter and icon
- Fast item selection → cart → checkout
- Discounts: percentage or fixed amount, by code or manual
- Tips: fixed amount entry
- Payment: Cash, Fonepay (dynamic QR), Split (Cash + Fonepay)
- Guest checkout (name + phone optional) or registered customer lookup
- Receipt display after payment

### 5.2 Customer CRM
- Optional registration (first name, last name, phone, email, notes, photo)
- Guest checkout — no registration required
- Visit count and total spend tracked automatically
- Visit history per customer (transactions linked)

### 5.3 Staff Management
- Staff profiles with photo, specialties, optional commission rate (%)
- Service self-assignment: staff selects themselves on each transaction item
- Staff-initiated payment flow
- Commission calculated per item at time of sale and stored on TransactionItem
- Commission view restricted to own record for Staff role

### 5.4 Service Management
- Service catalogue: name, description, price, duration (minutes), category, icon
- Service categories: Owner can create/edit/deactivate categories
- Active / inactive toggle per service
- Icon assignment from Image Library

### 5.5 Inventory Management
- Product catalogue: name, SKU, price, cost, stock, low-stock threshold, image
- Stock movements: STOCK_IN, STOCK_OUT, ADJUSTMENT — all require a reason
- Audit log of every movement (who, when, before/after stock)
- Low-stock alerts on Dashboard and Inventory screen when `stock <= lowStockThreshold`

### 5.6 Reports & Analytics (Owner only)
- **Daily Sales**: transaction list, totals, by payment method
- **Sales Summary**: revenue, tips, discounts, avg. transaction, by payment method breakdown
- **Staff Performance**: per-staff service count, total sales, commission earned
- **Service Popularity**: booking count and revenue per service, ranked
- **Inventory Report**: all products with stock levels, low-stock list, recent movements

### 5.7 Dashboard
- Today's sales total and tip total
- Number of transactions today
- Customers served today (registered only)
- Top 5 staff by sales today
- Low stock alerts (top 10)
- Cash drawer open/closed status

### 5.8 Cash Drawer
- Open drawer with opening balance
- Close drawer with closing balance (shows expected vs actual)
- Payment In / Payment Out — both require a mandatory reason field
- Full audit log of all movements
- Cash balance summary at any point

### 5.9 Image Library
- In-app media manager for: Service Icons, Staff Photos, Product Images, Customer Photos
- Upload URL-based images (file upload via storage provider in deployment)
- Built-in default icon pack (isDefault flag)
- Filter by type (service_icon / staff_photo / product_image / customer_photo)

### 5.10 Refunds
- Cash-only refunds (regardless of original payment method)
- Mandatory reason field — no silent refunds
- Auto-creates a Cash Drawer OUT movement
- Requires active cash drawer
- Linked to original transaction (1:1)
- Owner and Staff can initiate; audit trail records who processed it

---

## 6. Technical Architecture

### Backend
- **Runtime**: Node.js + NestJS (TypeScript)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: JWT (HS256), role-based guards (OWNER / STAFF)
- **API**: REST, Swagger at `/api`

### Frontend
- **Framework**: Flutter (Dart 3)
- **State**: Riverpod 2 (FutureProvider, AsyncNotifier)
- **Navigation**: go_router
- **Offline**: Drift (SQLite) for local queue
- **HTTP**: Dio with JWT interceptor
- **Target**: Tablet (landscape-first), Android/iOS

### Payment
- **Cash**: handled locally, reflected in Cash Drawer
- **Fonepay**: dynamic QR generated server-side, `fonepayRef` stored on transaction

---

## 7. Data Model Summary

| Model | Key Fields |
|-------|------------|
| User | role (OWNER/STAFF), email, password |
| Staff | commissionRate (optional %), photoUrl, specialties |
| Customer | visitCount, totalSpent, photoUrl |
| ServiceCategory | name, isActive |
| Service | price, duration, categoryId, iconUrl, isActive |
| Product | stock, lowStockThreshold, cost, imageUrl |
| InventoryLog | type (STOCK_IN/OUT/ADJUSTMENT), quantity, reason, stockBefore, stockAfter |
| Transaction | paymentMethod (CASH/FONEPAY/SPLIT), isGuest, fonepayRef, splitCash, splitFonepay, tipAmount |
| TransactionItem | staffId, commissionAmount |
| Refund | reason (mandatory), amount, cashMovementId |
| CashDrawer | openBalance, closeBalance, expectedBalance |
| CashMovement | type (IN/OUT), reason (mandatory) |
| ImageAsset | type (SERVICE_ICON/STAFF_PHOTO/PRODUCT_IMAGE/CUSTOMER_PHOTO), isDefault |

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Checkout time | < 10 seconds from cart to receipt |
| Daily sales report load | < 2 seconds |
| Low-stock alert visibility | Visible on dashboard without navigation |
| Cash drawer discrepancy | Tracked and visible on close |
