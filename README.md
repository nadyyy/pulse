# Pulse Commerce Starter

High-level Nike/Adidas-style e-commerce starter built on the existing stack:

- Next.js App Router + TypeScript
- Prisma + Postgres
- Docker Compose
- Server Components-first architecture

## Core Features

- DB-driven taxonomy and mega-menu (`Men`, `Women`, `Kids`, `Sport`, `Sale`)
- Product listing with filters, sort, and pagination
- Product detail with variants and add-to-cart
- Guest cart + guest checkout creating orders
- Auth with roles and staff permissions
- Admin dashboard for products, categories, users, and orders
- Bulk placeholder product image generation script

## Setup

1. Copy env file:

```bash
cp .env.example .env
```

Optional admin bootstrap (in `.env`):

```env
AUTH_PEPPER="replace-with-long-random-secret"
BOOTSTRAP_ADMIN_EMAILS=""
ALLOW_BOOTSTRAP_ADMIN="false"
```

2. Start Postgres:

```bash
docker compose up -d
```

3. Generate placeholder product images:

```bash
npm run assets:generate
# rerun with overwrite:
# npm run assets:generate -- --force
```

4. Prisma migrate + seed:

```bash
npx prisma migrate dev
npx prisma db seed
```

5. Run app:

```bash
npm run dev
```

## Demo Credentials

- Owner: `owner@demo.com` / `DemoPass#2026` (or your `SEED_DEMO_PASSWORD`)
- Admin: `admin@demo.com` / `DemoPass#2026`
- Staff: `staff@demo.com` / `DemoPass#2026` (permission: `PRODUCTS_READ`)

## Security Notes

- Passwords are bcrypt-hashed (`PASSWORD_HASH_COST`, default `12`).
- Login/register are rate-limited by hashed email + hashed IP.
- Session tokens are random opaque tokens, stored hashed in DB.
- Cart cookies are signed to detect tampering.
- Admin/action mutations enforce same-origin checks.
- Proxy adds baseline security headers and HTTPS redirect in production.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run format`
- `npm run test`
- `npm run assets:generate`
- `npm run prisma:migrate`
- `npm run prisma:seed`
# pulse
# pulse
# pulse
# test
# test
