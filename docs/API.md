# Salon POS — API Reference

> Live interactive docs: http://localhost:3000/api (Swagger UI)

## Base URL

```
http://localhost:3000
```

## Authentication

All protected endpoints require a Bearer token:

```
Authorization: Bearer <jwt_token>
```

Obtain via `POST /auth/login`.

## Roles

| Role | Description |
|------|-------------|
| `OWNER` | Full access |
| `STAFF` | Billing, self-assignment, own commission view |

---

## Endpoints

### Auth
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | /auth/register | — | Register new user |
| POST | /auth/login | — | Login, returns JWT |
| GET | /auth/me | Any | Current user info |

### Dashboard
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | /dashboard | OWNER, STAFF | Today's KPIs, top staff, low stock |

### Users
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | /users | OWNER | List users |
| POST | /users | OWNER | Create user |
| GET | /users/:id | OWNER | Get user |
| PATCH | /users/:id | OWNER | Update user |
| DELETE | /users/:id | OWNER | Delete user |

### Staff
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | /staff | OWNER, STAFF | List staff |
| POST | /staff | OWNER | Create staff profile |
| GET | /staff/:id | OWNER, STAFF | Get staff |
| PATCH | /staff/:id | OWNER | Update staff |
| DELETE | /staff/:id | OWNER | Delete staff |

### Customers
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | /customers | OWNER, STAFF | List customers |
| POST | /customers | OWNER, STAFF | Register customer |
| GET | /customers/:id | OWNER, STAFF | Get customer + visit history |
| PATCH | /customers/:id | OWNER, STAFF | Update customer |
| DELETE | /customers/:id | OWNER | Delete customer |

### Services
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | /services | OWNER, STAFF | List services (catalogue) |
| POST | /services | OWNER | Create service |
| GET | /services/:id | OWNER, STAFF | Get service |
| PATCH | /services/:id | OWNER | Update service |
| DELETE | /services/:id | OWNER | Delete service |

### Products
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | /products | OWNER, STAFF | List products |
| POST | /products | OWNER | Create product |
| GET | /products/:id | OWNER, STAFF | Get product |
| PATCH | /products/:id | OWNER | Update product |
| DELETE | /products/:id | OWNER | Delete product |

### Inventory
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | /inventory/movement | OWNER, STAFF | Record stock in/out/adjustment (reason required) |
| GET | /inventory/products | OWNER, STAFF | All active products with stock levels |
| GET | /inventory/low-stock | OWNER, STAFF | Products where stock ≤ lowStockThreshold |
| GET | /inventory/logs | OWNER | Full inventory movement audit log |

**POST /inventory/movement body:**
```json
{
  "productId": "string",
  "type": "STOCK_IN | STOCK_OUT | ADJUSTMENT",
  "quantity": 10,
  "reason": "Weekly restock from supplier"
}
```

### Discounts
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | /discounts | OWNER, STAFF | List active discounts |
| POST | /discounts | OWNER | Create discount |
| PATCH | /discounts/:id | OWNER | Update discount |
| DELETE | /discounts/:id | OWNER | Delete discount |

### Transactions
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | /transactions | OWNER, STAFF | Create transaction (checkout) |
| GET | /transactions | OWNER | List all transactions |
| GET | /transactions/:id | OWNER, STAFF | Get transaction |
| PATCH | /transactions/:id/void | OWNER | Void a completed transaction |

**POST /transactions body:**
```json
{
  "customerId": "optional — omit for guest checkout",
  "isGuest": false,
  "guestName": "optional",
  "guestPhone": "optional",
  "staffId": "optional",
  "discountId": "optional",
  "paymentMethod": "CASH | FONEPAY | SPLIT",
  "fonepayRef": "optional — Fonepay gateway reference",
  "qrData": "optional — dynamic QR payload",
  "splitCash": 500,
  "splitFonepay": 300,
  "tipAmount": 50,
  "notes": "optional",
  "items": [
    { "serviceId": "...", "staffId": "...", "quantity": 1, "unitPrice": 800 },
    { "productId": "...", "quantity": 2, "unitPrice": 150 }
  ]
}
```
> Commission is auto-calculated per item from the assigned staff's `commissionRate`.

### Refunds
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | /refunds/:transactionId | OWNER, STAFF | Issue cash refund (reason mandatory) |
| GET | /refunds | OWNER | List all refunds |
| GET | /refunds/:id | OWNER | Get refund detail |

**POST /refunds/:transactionId body:**
```json
{
  "reason": "Customer not satisfied — mandatory field",
  "amount": 500
}
```
> `amount` defaults to full transaction total. Refund is always paid in cash. Requires an open cash drawer.

### Cash Drawer
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | /cash-drawer/open | OWNER, STAFF | Open drawer with opening balance |
| POST | /cash-drawer/close | OWNER | Close drawer with closing balance |
| GET | /cash-drawer/current | OWNER, STAFF | Current open drawer state + movements |
| POST | /cash-drawer/movement | OWNER, STAFF | Payment In / Payment Out (reason mandatory) |

### Reports (OWNER only)
| Method | Path | Description |
|--------|------|-------------|
| GET | /reports/sales | Revenue, tips, discounts, avg. transaction, by payment method |
| GET | /reports/staff-performance | Per-staff: service count, total sales, commission earned |
| GET | /reports/services | Service popularity: booking count + revenue, ranked |
| GET | /reports/inventory | Stock levels, low-stock list, recent movements |
| GET | /reports/daily | Chronological transaction list |

**Query params for date-filtered reports:** `?from=2026-06-01&to=2026-06-30`

### Images (Image Library)
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | /images | OWNER, STAFF | List images (filter: `?type=SERVICE_ICON`) |
| POST | /images | OWNER | Add image asset |
| GET | /images/:id | OWNER, STAFF | Get image |
| DELETE | /images/:id | OWNER | Delete image |

**Image types:** `SERVICE_ICON`, `STAFF_PHOTO`, `PRODUCT_IMAGE`, `CUSTOMER_PHOTO`

---

## Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "timestamp": "2026-06-06T00:00:00.000Z"
}
```

## Error Format

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [ ... ]
}
```
