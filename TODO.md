# Salon Service-Tracking API — TODO

An internal API (staff manage barbers/services/records) plus an external API (clients register and book appointments), both built on Express + PostgreSQL via Prisma ORM.

**Architecture (Layered):** Controller (presentation) → Service (business logic) → Repository (persistence) → Prisma Client → PostgreSQL
Rule: calls only ever flow downward — a Controller never touches a Repository directly, a Repository never calls back up.

**Auth model:** Two separate identity domains — `Staff` (internal, RBAC via `role`) and `Client` (external, phone-based identify/register in one step). Separate JWT secrets per domain; each auth middleware only accepts tokens of its own `type`.

## Data Model (current)
- `barbers` — id, name, isActive, createdAt
- `services` — id, name, defaultPrice, createdAt
- `serviceRecords` — id, barberId (FK), serviceId (FK), amountPaid, createdAt
  - Each service rendered is its own independent record (no visit/receipt grouping across multiple services)
- `staff` — id, name, email, passwordHash, role, createdAt *(new)*
- `clients` — id, name, phone (unique), createdAt *(new)*
- `appointments` — id, clientId (FK), barberId (FK), serviceId (FK), scheduledAt, status, serviceRecordId (FK, nullable), createdAt *(new)*

## Phase 0 — Project Setup ✅
## Phase 1 — Prisma Schema ✅
## Phase 2 — Prisma Client Setup ✅ (Prisma 7, `prisma-client-js` generator, pg driver adapter)
## Phase 3 — Barbers (Controller → Service → Repository) ✅
## Phase 4 — Services (same layered pattern) ✅
## Phase 5 — Service Records (core feature) ✅
## Phase 6 — Manual Testing ✅
## Phase 7 — Basic Error Handling ✅ (`catchAsync`, `AppError`, centralized handler, 404 handler)
## Phase 7.5 — API Versioning + Docs ✅
- [x] Mount all resource routes under `/api/v1` via a versioned router aggregator (`src/routes/v1/index.js`)
- [x] `README.md` — problem, solution, setup instructions
- [x] `API_DOCUMENTATION.md` — full endpoint reference

---

## Phase 8 — Internal API Authentication (Staff + RBAC)
- [ ] Add `Staff` model (id, name, email, passwordHash, role, createdAt) to schema, migrate
- [ ] Install `bcrypt` and `jsonwebtoken`
- [ ] Staff created by an existing admin only — no public self-signup for staff
- [ ] `POST /api/v1/auth/staff/login` — verify email/password, issue JWT (`{ id, role, type: 'staff' }`, signed with `JWT_STAFF_SECRET`)
- [ ] `requireStaffAuth` middleware — verifies token, checks `type === 'staff'`, attaches `req.staff`
- [ ] `requireRole(...roles)` middleware — generic RBAC check against `req.staff.role`
- [ ] Apply `requireStaffAuth` to all existing `/barbers`, `/services`, `/service-records` routes
- [ ] Apply `requireRole('admin')` specifically to barber/service DELETE routes

## Phase 9 — External API: Client Identification
- [ ] Add `Client` model (id, name, phone unique, createdAt) to schema, migrate
- [ ] `POST /api/v1/public/clients/identify` — `prisma.client.upsert()` by phone; creates on first contact, returns existing record on repeat visits
- [ ] No password, no separate signup endpoint — identify and register are the same action

## Phase 10 — External API: Appointments
- [ ] Add `Appointment` model (clientId, barberId, serviceId, scheduledAt, status, serviceRecordId nullable) to schema, migrate
- [ ] `requireClientAuth` middleware (separate `JWT_CLIENT_SECRET`, checks `type === 'client'`)
- [ ] `POST /api/v1/public/appointments` — client books; validate barberId/serviceId exist, status defaults to `pending`
- [ ] `GET /api/v1/public/appointments` — client's own appointments (by their identified clientId)
- [ ] Staff-side: `GET /api/v1/appointments`, `PUT /api/v1/appointments/:id` (confirm/cancel)

## Phase 11 — Appointment Completion → Service Record (middle ground)
- [ ] `POST /api/v1/appointments/:id/complete` (staff-only)
  - Pre-fills a ServiceRecord draft from the appointment's barberId/serviceId/service.defaultPrice
  - Staff confirms (optionally adjusting amountPaid) before it's actually written
  - On confirm: creates the ServiceRecord, links it back via `appointment.serviceRecordId`, sets `appointment.status = 'completed'`
- [ ] Not automatic/silent — always requires a staff confirm step

---
**Not in scope for now:** pagination, product/inventory tracking, SMS OTP verification for client phone numbers, multi-role users (one `role` string per Staff for now).
