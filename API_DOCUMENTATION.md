# Salon API — API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

All endpoints below are relative to this base URL. For example, "GET /barbers" means `GET http://localhost:3000/api/v1/barbers`.

The one exception is the health check, which is unversioned: `GET http://localhost:3000/health`.

## Authentication

None. This API currently has no authentication or authorization — it's intended for local/internal use only.

## Response Format

All responses are JSON.

- Successful `GET`/`POST`/`PUT` requests return the resource (or array of resources) directly.
- Successful `DELETE` requests return an empty body with status `204 No Content`.
- Errors return an object with a single `error` field:
  ```json
  { "error": "Barber with id 47 not found" }
  ```

## Status Codes Used

| Code | Meaning | When it happens |
|---|---|---|
| `200 OK` | Success | Successful GET, PUT |
| `201 Created` | Resource created | Successful POST |
| `204 No Content` | Success, nothing to return | Successful DELETE |
| `400 Bad Request` | Invalid input | Missing/invalid field, malformed JSON, invalid ID in URL |
| `404 Not Found` | Resource doesn't exist | Bad ID, or route that doesn't exist at all |
| `409 Conflict` | Request conflicts with existing data | Duplicate name, deleting something still referenced elsewhere |
| `500 Internal Server Error` | Unexpected server error | A bug or unhandled failure — the response message will be generic on purpose |

---

## Barbers

### `GET /barbers`
List all barbers.

**Response `200`**
```json
[
  { "id": 1, "name": "Chidi", "isActive": true, "createdAt": "2026-09-15T10:00:00.000Z" }
]
```

### `GET /barbers/:id`
Get a single barber by ID.

**Response `200`** — same shape as above, single object.
**Response `404`** — if no barber with that ID exists.

### `POST /barbers`
Create a new barber.

**Request body**
```json
{ "name": "Chidi" }
```

**Response `201`** — the created barber.
**Response `400`** — if `name` is missing or empty.
**Response `409`** — if a barber with that name already exists.

### `PUT /barbers/:id`
Update a barber. Send only the fields you want to change.

**Request body (either or both)**
```json
{ "name": "Chidi Okafor", "isActive": false }
```

**Response `200`** — the updated barber.
**Response `400`** — if `name` is provided but empty.
**Response `404`** — if no barber with that ID exists.
**Response `409`** — if the new name is already taken by another barber.

### `DELETE /barbers/:id`
Delete a barber.

**Response `204`** — success, no body.
**Response `404`** — if no barber with that ID exists.
**Response `409`** — if the barber has existing service records. (Deactivate with `isActive: false` instead of deleting, if you need to keep their history.)

---

## Services

### `GET /services`
List all services.

**Response `200`**
```json
[
  { "id": 1, "name": "Haircut", "defaultPrice": "1500.00", "createdAt": "2026-09-15T10:00:00.000Z" }
]
```
Note: `defaultPrice` is returned as a **string**, not a number — this preserves exact decimal precision for money values.

### `GET /services/:id`
Get a single service by ID.

**Response `200`** — same shape as above.
**Response `404`** — if no service with that ID exists.

### `POST /services`
Create a new service.

**Request body**
```json
{ "name": "Haircut", "defaultPrice": 1500 }
```

**Response `201`** — the created service.
**Response `400`** — if `name` is missing, or `defaultPrice` is missing, not a number, or not positive.
**Response `409`** — if a service with that name already exists.

### `PUT /services/:id`
Update a service. Send only the fields you want to change.

**Request body (either or both)**
```json
{ "name": "Premium Haircut", "defaultPrice": 2000 }
```

**Response `200`** — the updated service.
**Response `400`** — invalid name or price.
**Response `404`** — if no service with that ID exists.
**Response `409`** — if the new name is already taken by another service.

### `DELETE /services/:id`
Delete a service.

**Response `204`** — success, no body.
**Response `404`** — if no service with that ID exists.
**Response `409`** — if the service has existing service records.

---

## Service Records

The core resource — one record per service actually rendered.

### `GET /service-records`
List all service records, most recent first. Each record includes the full related barber and service.

**Response `200`**
```json
[
  {
    "id": 4,
    "barberId": 1,
    "serviceId": 1,
    "amountPaid": "1500.00",
    "createdAt": "2026-09-15T14:00:00.000Z",
    "barber": { "id": 1, "name": "Chidi", "isActive": true },
    "service": { "id": 1, "name": "Haircut", "defaultPrice": "1500.00" }
  }
]
```

### `GET /service-records/:id`
Get a single service record by ID, with the same nested `barber`/`service` detail as above.

**Response `200`** — same shape as one item above.
**Response `404`** — if no record with that ID exists.

### `POST /service-records`
Create a new service record.

**Request body**
```json
{ "barberId": 1, "serviceId": 1, "amountPaid": 1500 }
```

`amountPaid` is optional — if omitted, it defaults to that service's `defaultPrice`:
```json
{ "barberId": 1, "serviceId": 1 }
```

**Response `201`** — the created record, with nested barber/service.
**Response `400`** — if `barberId`/`serviceId` are missing or not integers, or `amountPaid` is provided but not a positive number.
**Response `404`** — if the given `barberId` or `serviceId` doesn't match an existing barber/service.

### `PUT /service-records/:id`
Update a service record. Send only the fields you want to change.

**Request body (any combination)**
```json
{ "amountPaid": 1800 }
```

**Response `200`** — the updated record.
**Response `400`** — invalid `amountPaid`.
**Response `404`** — if the record, the given `barberId`, or the given `serviceId` doesn't exist.

### `DELETE /service-records/:id`
Delete a service record.

**Response `204`** — success, no body.
**Response `404`** — if no record with that ID exists.

---

## Data Model Reference

```
Barber                Service
------                -------
id                     id
name (unique)          name (unique)
isActive                defaultPrice
createdAt               createdAt

        \                /
         \              /
          ServiceRecord
          -------------
          id
          barberId  → Barber.id
          serviceId → Service.id
          amountPaid
          createdAt
```

Each `ServiceRecord` is an independent entry — even if a client receives multiple services in one visit (e.g. a haircut and a dye from the same barber), each service rendered is logged as its own separate record. There is currently no concept of a "visit" or "receipt" grouping multiple records together.

## Health Check

### `GET /health`
Unversioned. Confirms the server is running and can reach the database.

**Response `200`**
```json
{ "status": "ok", "barbers": 3 }
```
