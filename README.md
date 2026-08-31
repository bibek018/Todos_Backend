# 📝 Todos API

> A modern, production-style REST API for managing personal todos with secure authentication, OAuth, role-based access control, avatar uploads, pagination, filtering, sorting, and centralized error handling.

![Node.js](https://img.shields.io/badge/Node.js-runtime-green)
![Express](https://img.shields.io/badge/Express.js-framework-black)
![MongoDB](https://img.shields.io/badge/MongoDB-database-green)
![JWT](https://img.shields.io/badge/JWT-authentication-blue)
![REST API](https://img.shields.io/badge/API-REST-orange)

---

## ✨ Features

- 🔐 Local authentication with JWT access + refresh tokens
- 🔑 Google & GitHub OAuth authentication
- 🍪 Secure `httpOnly` refresh-token cookies
- 📝 Full CRUD operations for todos
- 📄 Pagination, filtering, and sorting
- 👤 User profile management
- 🔒 Password change functionality
- 🛡️ Role-based access control with admin routes
- 🖼️ Avatar uploads using Multer + Cloudinary
- ✅ Request validation with Zod
- 🛡️ Security middleware with Helmet, CORS, and rate limiting
- 📋 Centralized error responses
- 🪵 Winston-based logging

---

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| 🟢 Node.js | JavaScript runtime |
| ⚡ Express | REST API framework |
| 🍃 MongoDB | Database |
| 📦 Mongoose | MongoDB ODM |
| 🔐 JWT | Access & refresh-token authentication |
| 🔑 Passport | Google & GitHub OAuth |
| ✅ Zod | Request validation |
| ☁️ Cloudinary | Avatar storage |
| 📤 Multer | File uploads |
| 🛡️ Helmet | HTTP security headers |
| 🌐 CORS | Cross-origin access control |
| 🚦 express-rate-limit | Rate limiting |
| 🪵 Winston | Application logging |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/bibek018/todos-api.git
cd todos-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=
CLIENT_ORIGIN=

MONGO_URI=

ACCESS_SECRET=
REFRESH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

NODE_ENV=
```

### 4. Start the development server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000/api
```

---

# 📚 API Documentation

## 🌐 Base URL

```text
http://localhost:3000/api
```

## 🔐 Authentication

Protected endpoints require a JWT access token:

```http
Authorization: Bearer <accessToken>
```

The access token is returned in the login response.

The refresh token is stored in an `httpOnly` cookie named:

```text
refreshtoken
```

The refresh token should **not** be stored in `localStorage`. It is used by:

```http
POST /api/auth/refresh
```

---

# 🔑 Authentication Endpoints

Base route:

```text
/api/auth
```

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Create an account |
| `POST` | `/login` | ❌ | Login and receive access token |
| `GET` | `/google` | ❌ | Start Google OAuth |
| `GET` | `/google/callback` | OAuth | Google OAuth callback |
| `GET` | `/github` | ❌ | Start GitHub OAuth |
| `GET` | `/github/callback` | OAuth | GitHub OAuth callback |
| `POST` | `/refresh` | 🍪 | Issue a new access token |
| `POST` | `/logout` | 🍪 | Logout and invalidate refresh token |

## Register

### `POST /api/auth/register`

Create a new user account.

**Request body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

### Validation

| Field | Rules |
|---|---|
| `name` | Required, minimum 3 characters |
| `email` | Required, valid email |
| `password` | Required, minimum 8 characters |

### Response — `201 Created`

```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}
```

### Errors

- `400` — Validation failed
- `409` — Email already registered

---

## Login

### `POST /api/auth/login`

Authenticate an existing user.

**Request body:**

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

### Response — `200 OK`

The server sets the `refreshtoken` `httpOnly` cookie.

```json
{
  "message": "Logged in Successfully",
  "success": true,
  "user": {
    "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "avatarUrl": null
  },
  "accesstoken": "<jwt>"
}
```

### Errors

- `400` — Validation failed
- `401` — Invalid credentials

---

## Refresh Access Token

### `POST /api/auth/refresh`

Uses the `refreshtoken` `httpOnly` cookie to issue a new access token.

**Request body:** None

### Response — `200 OK`

```json
{
  "success": true,
  "user": {
    "...": "sanitized user object"
  },
  "accessToken": "<new jwt>"
}
```

The refresh cookie is rotated.

### Errors

- `401` — Missing, invalid, or unmatched refresh token

---

## Logout

### `POST /api/auth/logout`

Invalidates the refresh token and clears the refresh cookie.

**Request body:** None

### Response — `200 OK`

```json
{
  "success": true
}
```

### Errors

- `401` — Refresh token missing or session invalid

---

## OAuth

Start Google authentication:

```http
GET /api/auth/google
```

Start GitHub authentication:

```http
GET /api/auth/github
```

Callbacks:

```http
GET /api/auth/google/callback
GET /api/auth/github/callback
```

Passport handles the OAuth flow. On successful authentication, the application logs the user in and creates an account if one does not already exist.

---

# 📝 Todo Endpoints

Base route:

```text
/api/todos
```

> 🔒 All todo endpoints require `Authorization: Bearer <accessToken>`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List current user's todos |
| `POST` | `/` | Create a todo |
| `GET` | `/:id` | Get one todo |
| `PATCH` | `/:id` | Update a todo |
| `DELETE` | `/:id` | Delete a todo |

---

## List Todos

### `GET /api/todos`

Supports pagination, filtering, and sorting.

### Query Parameters

| Parameter | Type | Default | Allowed / Notes |
|---|---|---|---|
| `page` | number | `1` | Minimum `1` |
| `limit` | number | `10` | `1–100` |
| `status` | string | — | `not started`, `in progress`, `completed` |
| `priority` | string | — | `low`, `medium`, `high` |
| `sort` | string | `createdAt` | `createdAt`, `updatedAt`, `title` |
| `order` | string | `asc` | `asc`, `desc` |

### Example

```http
GET /api/todos?page=1&limit=10&status=in%20progress&priority=high&sort=createdAt&order=desc
```

### Response — `200 OK`

```json
{
  "success": true,
  "todos": [
    {
      "_id": "66f1a2b3c4d5e6f7a8b9c0d2",
      "title": "Buy groceries",
      "status": "not started",
      "priority": "medium",
      "user": "66f1a2b3c4d5e6f7a8b9c0d1",
      "createdAt": "2026-08-31T10:15:00.000Z",
      "updatedAt": "2026-08-31T10:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Errors

- `400` — Invalid query parameters
- `401` — Missing or invalid access token

---

## Create Todo

### `POST /api/todos`

Create a new todo.

**Request body:**

```json
{
  "title": "Buy groceries",
  "status": "not started",
  "priority": "medium"
}
```

### Validation

| Field | Rules |
|---|---|
| `title` | Required, minimum 8 characters |
| `status` | Required: `not started`, `in progress`, `completed` |
| `priority` | Required: `low`, `medium`, `high` |

The request body is strict; unknown fields are rejected.

### Response — `201 Created`

```json
{
  "success": true,
  "todo": {
    "_id": "66f1a2b3c4d5e6f7a8b9c0d2",
    "title": "Buy groceries",
    "status": "not started",
    "priority": "medium",
    "user": "66f1a2b3c4d5e6f7a8b9c0d1",
    "createdAt": "2026-08-31T10:15:00.000Z",
    "updatedAt": "2026-08-31T10:15:00.000Z"
  }
}
```

### Errors

- `400` — Validation failed
- `401` — Missing or invalid access token

---

## Get Todo

### `GET /api/todos/:id`

Returns a single todo belonging to the authenticated user.

### Response — `200 OK`

```json
{
  "success": true,
  "todo": {
    "...": "todo object"
  }
}
```

### Errors

- `404` — Todo not found or does not belong to current user
- `401` — Missing or invalid access token

---

## Update Todo

### `PATCH /api/todos/:id`

Update any subset of the todo fields.

**Example:**

```json
{
  "status": "completed"
}
```

### Response — `200 OK`

```json
{
  "success": true,
  "todo": {
    "...": "updated todo object"
  }
}
```

### Errors

- `400` — Validation failed
- `401` — Missing or invalid access token
- `404` — Todo not found or does not belong to current user

---

## Delete Todo

### `DELETE /api/todos/:id`

Deletes a todo belonging to the authenticated user.

### Response — `204 No Content`

No response body.

### Errors

- `401` — Missing or invalid access token
- `404` — Todo not found or does not belong to current user

---

# 👤 User Endpoints

Base route:

```text
/api/users
```

> 🔒 All user endpoints require an access token unless otherwise stated.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/me` | 🔒 | Get current profile |
| `PUT` | `/me` | 🔒 | Update name/avatar |
| `PUT` | `/me/changepassword` | 🔒 | Change password |
| `DELETE` | `/:id` | 👑 Admin | Delete a user |

---

## Get Current User

### `GET /api/users/me`

### Response — `200 OK`

```json
{
  "success": true,
  "user": {
    "id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "avatarUrl": null
  }
}
```

### Errors

- `401` — Missing or invalid access token
- `404` — User not found

---

## Update Profile

### `PUT /api/users/me`

Uses:

```text
multipart/form-data
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | text | ❌ | Updated display name |
| `avatar` | file | ❌ | Avatar uploaded to Cloudinary |

At least one field must be provided.

### Response — `200 OK`

```json
{
  "success": true,
  "user": {
    "id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg"
  }
}
```

### Errors

- `400` — No changes provided or name is empty
- `401` — Missing or invalid access token
- `404` — User not found

---

## Change Password

### `PUT /api/users/me/changepassword`

**Request body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "confirmNewPassword": "newpassword123"
}
```

`newPassword` and `confirmNewPassword` must match.

### Response — `200 OK`

```json
{
  "success": true,
  "message": "Password changed successfully!"
}
```

### Errors

- `400` — Validation failed
- `401` — Invalid current password or authentication failure
- `404` — User not found

---

## Delete User

### `DELETE /api/users/:id`

👑 **Admin only**

### Response — `204 No Content`

No response body.

### Errors

- `400` — User ID not provided
- `401` — Missing or invalid access token
- `403` — Authenticated user is not an admin
- `404` — User not found

---

# 👑 Admin Endpoints

Base route:

```text
/api/admin
```

> 👑 Requires authentication **and** the `admin` role.

## List All Users

### `GET /api/admin/users`

### Response — `200 OK`

```json
{
  "success": true,
  "users": [
    {
      "...": "full user document"
    }
  ]
}
```

### Errors

- `401` — Missing or invalid access token
- `403` — User is not an admin

---

# 🚨 Error Handling

The API uses a consistent error response format.

```json
{
  "status": 400,
  "message": "Human-readable message",
  "success": false,
  "details": [
    {
      "field": "title",
      "message": "..."
    }
  ]
}
```

`details` is included for validation errors and identifies the fields that failed validation.

## HTTP Status Codes

| Status | Meaning |
|---:|---|
| `400` | Bad request / validation failed |
| `401` | Missing, invalid, or expired token / wrong credentials |
| `403` | Authenticated but not authorized |
| `404` | Resource not found |
| `409` | Conflict |
| `500` | Unexpected server error |

---

# 🔒 Security

This API implements several security mechanisms:

- 🔐 JWT-based authentication
- 🍪 `httpOnly` refresh-token cookies
- 🛡️ Helmet security headers
- 🌐 CORS configuration
- 🚦 Rate limiting
- ✅ Strict Zod validation
- 👑 Role-based authorization
- 🔑 OAuth authentication through Passport
- 🔒 Server-side refresh-token validation

---

# 📮 Postman

A ready-to-use Postman collection is available at:

```text
docs/postman_collection.json
```

Import it into Postman to test the API endpoints.

---

# 📁 High-Level API Structure

```text
/api
├── 🔑 auth
│   ├── POST /register
│   ├── POST /login
│   ├── GET  /google
│   ├── GET  /google/callback
│   ├── GET  /github
│   ├── GET  /github/callback
│   ├── POST /refresh
│   └── POST /logout
│
├── 📝 todos
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PATCH  /:id
│   └── DELETE /:id
│
├── 👤 users
│   ├── GET    /me
│   ├── PUT    /me
│   ├── PUT    /me/changepassword
│   └── DELETE /:id
│
└── 👑 admin
    └── GET /users
```

---

# 📊 Endpoint Summary

| Resource | Endpoints | Auth |
|---|---:|---|
| 🔑 Authentication | 8 | Mixed |
| 📝 Todos | 5 | 🔒 User |
| 👤 Users | 4 | 🔒 User / 👑 Admin |
| 👑 Admin | 1 | 👑 Admin |
| **Total** | **18** | |

---

# 👨‍💻 Author

**Bibek Ojha**

GitHub: [@bibek018](https://github.com/bibek018)

---

# 📄 License

This project is developed for **educational and academic purposes**.

---

⭐ If you find this project useful, consider giving it a star!
