# Salon API

A simple backend API for a barbing salon to record which service was rendered, who rendered it, and how much was paid.

## The Problem

A barbing salon needs a reliable way to answer three questions every day:

1. **What service was done?** (Haircut, Dye, Beard Trim, etc.)
2. **Who did it?** (Which barber)
3. **How much was paid?**

This sounds simple, but a naive approach — just writing down an amount — breaks down quickly. Imagine two entries of **₦1,500** on the same day. Was one a haircut and the other a dye? Who did each one? Without a proper record tied to a specific barber and a specific service, there's no way to tell them apart, and no reliable way to answer questions like "how much did each barber bring in this week?"

## The Solution

This API solves that by giving every service rendered its own record — permanently linked to exactly one barber and exactly one service, with the amount actually paid for it. Three simple resources work together:

- **Barbers** — the people who work at the salon
- **Services** — what the salon offers (haircut, dye, etc.), each with a standard price
- **Service Records** — the actual log: "this barber did this service for this amount, at this time"

Because every record points to a real barber and a real service — not just a typed-in name — two ₦1,500 entries are never ambiguous. One will always clearly say "Haircut" and the other "Dye," and both are traceable to exactly who did the work.

## How It's Built

This is a learning project as much as a working tool, so the code is organized in **layers**, each with one clear job:

```
Request → Controller → Service → Repository → Database
         (handles HTTP)  (business rules)  (talks to the DB)
```

- **Controllers** handle the web request/response — they don't know or care about business rules.
- **Services** hold the actual logic — validation, what counts as an error, what the "default price" should be if none is given.
- **Repositories** are the only layer that talks to the database, via [Prisma](https://www.prisma.io/) (an ORM that turns database tables into simple, type-safe JavaScript calls).

This separation means each part can be understood, tested, and changed on its own, without the whole system needing to be understood at once.

## Tech Stack

| Tool | What it's for |
|---|---|
| [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) | The web server and routing |
| [PostgreSQL](https://www.postgresql.org/) | The database |
| [Prisma ORM](https://www.prisma.io/) | Talks to the database in a type-safe way, manages schema migrations |
| ES Modules | Modern JavaScript `import`/`export` syntax |

## Getting Started

**1. Clone the repository**
```bash
git clone https://github.com/YOUR-USERNAME/salon-api.git
cd salon-api
```
(Replace the URL with wherever you've pushed this project — e.g. your own GitHub repo.)

**2. Install dependencies**
```bash
npm install
```

**3. Set up your environment**

Copy `.env.example` to `.env` and fill in your local PostgreSQL connection string:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/salon_db?schema=public"
PORT=3000
```

**4. Create the database tables**
```bash
npx prisma migrate dev
```

**5. Run the server**
```bash
npm run dev
```

The API will be running at `http://localhost:3000`, with all endpoints available under `/api/v1`.

**6. Confirm it's working**

Visit `http://localhost:3000/health` — you should see a response confirming the server and database connection are both up.

## API Documentation

For the full list of endpoints, request/response formats, and error codes, see [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md).

## What's Not in Scope (Yet)

This project intentionally stays minimal for now. Not included:

- Authentication / user accounts
- Grouping multiple services into a single client "visit" or receipt
- Pagination on list endpoints
- Product/inventory tracking or appointment scheduling

These may be added later as the salon's actual needs become clearer.
