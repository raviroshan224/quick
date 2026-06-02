# Salon POS System

A production-ready, Square-like Point of Sale system for salons. Built with NestJS + Flutter.

## Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Flutter (Riverpod, GoRouter, Dio, Drift) |
| Backend    | NestJS + Prisma ORM               |
| Database   | PostgreSQL                        |
| Auth       | JWT + Role-based guards           |
| API Docs   | Swagger at `/api`                 |

## Monorepo Structure

```
salon-pos/
├── frontend/        # Flutter POS app (mobile/tablet)
├── backend/         # NestJS REST API
├── docs/            # PRD, API docs
├── docker/          # Docker configs
└── docker-compose.yml
```

## Quick Start

### Prerequisites
- Node.js ≥ 18
- PostgreSQL 14+
- Flutter SDK ≥ 3.x
- Docker (optional)

### With Docker

```bash
cp backend/.env.example backend/.env
docker-compose up -d
```

### Backend

```bash
cd backend
npm install
cp .env.example .env          # fill in your DATABASE_URL
npx prisma migrate dev        # run migrations
npm run start:dev             # starts on :3000
```

Swagger UI: http://localhost:3000/api

### Frontend

```bash
cd frontend
flutter pub get
flutter run
```

## Role Hierarchy

| Role          | Permissions                                  |
|---------------|----------------------------------------------|
| OWNER         | Full access                                  |
| MANAGER       | All ops except system settings               |
| RECEPTIONIST  | Checkout, customers, appointments            |
| STAFF         | Own schedule, assigned services              |

## Modules

`auth` · `users` · `staff` · `customers` · `services` · `products` · `discounts` · `transactions` · `cash-drawer` · `reports` · `notifications` · `settings`

## Docs

- [Product Requirements](docs/PRD.md)
- [API Reference](docs/API.md)
# quick
