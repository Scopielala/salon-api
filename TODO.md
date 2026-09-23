# Salon Service-Tracking API — TODO

Minimal CRUD API (Express + PostgreSQL via Prisma ORM) to record: the service rendered, the barber who rendered it, and the amount paid.

**Architecture (Layered):** Controller (presentation) → Service (business logic) → Repository (persistence) → Prisma Client → PostgreSQL
Rule: calls only ever flow downward — a Controller never touches a Repository directly, a Repository never calls back up.

## Data Model (final, simplified scope)
- `barbers` — id, name
- `services` — id, name, defaultPrice
- `serviceRecords` — id, barberId (FK), serviceId (FK), amountPaid, createdAt
  - Each service rendered is its own independent record (no visit/receipt grouping for now — revisit later if the shop needs it)

## Phase 0 — Project Setup
- [ ] Initialize Node project (`npm init -y`)
- [ ] Install dependencies: `express`, `@prisma/client`, `dotenv`
- [ ] Install dev dependencies: `prisma`, `nodemon`
- [ ] Run `npx prisma init` (creates `prisma/schema.prisma` and `.env`)
- [ ] Create folder structure: `src/config`, `src/routes`, `src/controllers`, `src/services`, `src/repositories`
- [ ] Confirm `.env` has `DATABASE_URL` pointing to local Postgres, and `.gitignore` excludes it

## Phase 1 — Prisma Schema
- [ ] Define `Barber` model (id, name)
- [ ] Define `Service` model (id, name, defaultPrice)
- [ ] Define `ServiceRecord` model (id, barberId relation, serviceId relation, amountPaid, createdAt)
- [ ] Run `npx prisma migrate dev --name init` to generate SQL migration + apply to DB
- [ ] Run `npx prisma studio` to visually confirm tables/relations look right

## Phase 2 — Prisma Client Setup
- [ ] Create a single shared Prisma Client instance in `src/config/prisma.js`
- [ ] Confirm connection works (simple test query, e.g. `prisma.barber.findMany()`)

## Phase 3 — Barbers (Controller → Service → Repository)
- [ ] Repository: `findAll`, `findById`, `create`, `update`, `remove` (wraps `prisma.barber.*`)
- [ ] Service: business logic/validation, calls repository
- [ ] Controller: HTTP layer, calls service
- [ ] Routes: POST, GET, GET/:id, PUT/:id, DELETE/:id `/barbers`

## Phase 4 — Services (same layered pattern)
- [ ] Repository, Service, Controller, Routes for `/services`

## Phase 5 — Service Records (core feature)
- [ ] Repository: `findAll`, `findById`, `create`, `update`, `remove` (wraps `prisma.serviceRecord.*`, using `include` to fetch related barber/service names)
- [ ] Service: validate barberId + serviceId exist before creating a record; default `amountPaid` from `Service.defaultPrice` if not provided, but allow override
- [ ] Controller + Routes: POST, GET, GET/:id, PUT/:id, DELETE/:id `/service-records`

## Phase 6 — Manual Testing
- [ ] Test all endpoints in Postman/Thunder Client
- [ ] Confirm two records with the same amount but different services remain distinguishable
- [ ] Confirm barber attribution is correct per record
- [ ] Confirm a client getting 2 services (e.g. Haircut + Dye) from the same barber correctly creates 2 independent records

## Phase 7 — Basic Error Handling
- [ ] Handle missing/invalid fields on create/update (400 responses)
- [ ] Handle "not found" cases (404 responses) — including Prisma's `P2025` (record not found) error code
- [ ] Centralize error responses (basic error-handling middleware)

---
**Not in scope for now:** authentication, pagination, visit/receipt grouping across multiple services, customer tracking, product/inventory tracking, appointment scheduling, Prisma ORM 8 (contract-based workflow).
