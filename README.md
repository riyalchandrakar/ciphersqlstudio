# CipherSQLStudio 🔐

> A browser-based SQL learning platform where students practice SQL queries against pre-configured assignments with real-time execution and AI-powered hints.

![CipherSQLStudio Preview](https://placehold.co/1200x600/0d0e14/00d4ff?text=CipherSQLStudio)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture & Data Flow](#architecture--data-flow)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [API Reference](#api-reference)
- [Security](#security)

---

## Overview

CipherSQLStudio is a full-stack SQL learning application. Students:

1. Browse curated SQL assignments (Easy / Medium / Hard)
2. Write SQL queries in a Monaco Editor (VS Code-grade editor in the browser)
3. Execute queries against a live PostgreSQL sandbox and see instant results
4. Request AI-powered hints that guide thinking — not reveal solutions
5. Save query progress and track attempts across sessions (login required)

**Important**: This is NOT a database creation tool. All assignment data is pre-seeded by administrators.

---

## Features

### Core (90%)

- ✅ Assignment listing with difficulty filters, category filters, and search
- ✅ Monaco Editor with SQL syntax highlighting + Ctrl+Enter shortcut
- ✅ Real-time query execution against PostgreSQL
- ✅ Results table with column names, row count, and execution time
- ✅ Schema viewer showing table structures
- ✅ Sample data preview (first 10 rows per table)
- ✅ AI-powered hints (3 levels: Subtle → Medium → Direct)
- ✅ Query validation & sanitization (blocks DROP, DELETE, etc.)

### Optional (10%)

- ✅ User authentication (Register / Login / JWT sessions)
- ✅ Save SQL queries per assignment
- ✅ Track query history and hints used
- ✅ "My Progress" page showing all attempted assignments

---

## Tech Stack

| Layer       | Technology                             | Why                                                                       |
| ----------- | -------------------------------------- | ------------------------------------------------------------------------- |
| Frontend    | React.js 18                            | Required by assignment spec                                               |
| Styling     | Vanilla SCSS (BEM)                     | Required by assignment spec                                               |
| Code Editor | Monaco Editor                          | VS Code-grade SQL editing in browser                                      |
| Backend     | Node.js + Express.js                   | Fast, minimal, well-suited for REST APIs                                  |
| Sandbox DB  | **Neon PostgreSQL** (Serverless)       | Free tier, no local setup needed, instant connection string               |
| App DB      | MongoDB (Atlas)                        | Flexible document model for assignments/users                             |
| Auth        | JWT (jsonwebtoken)                     | Stateless, scalable authentication                                        |
| LLM         | **OpenRouter** (unified model gateway) | Access 100+ models (Llama, GPT, Claude) via one API key — has free models |
| Validation  | express-validator                      | Input sanitization on every route                                         |

---

## Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (React)                          │
│                                                                 │
│  ┌──────────┐   ┌────────────────┐   ┌──────────────────────┐  │
│  │Assignment│   │  Attempt Page  │   │   Auth Pages         │  │
│  │List Page │   │                │   │   (Login/Register)   │  │
│  └──────────┘   │ ┌────────────┐ │   └──────────────────────┘  │
│                 │ │Left Panel  │ │                              │
│                 │ │ - Question │ │                              │
│                 │ │ - Schema   │ │                              │
│                 │ │ - Data     │ │                              │
│                 │ │ - Hints    │ │                              │
│                 │ └────────────┘ │                              │
│                 │ ┌────────────┐ │                              │
│                 │ │Monaco Edit │ │                              │
│                 │ └────────────┘ │                              │
│                 │ ┌────────────┐ │                              │
│                 │ │Results Tab │ │                              │
│                 │ └────────────┘ │                              │
│                 └────────────────┘                              │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST (axios)
                         │ Authorization: Bearer <JWT>
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│               NODE.JS / EXPRESS BACKEND (Port 5000)             │
│                                                                 │
│  Routes:                                                        │
│  POST /api/auth/register   → Create user (MongoDB)             │
│  POST /api/auth/login      → Validate + return JWT             │
│  GET  /api/auth/me         → Decode JWT → return user          │
│                                                                 │
│  GET  /api/assignments     → Fetch all (MongoDB)               │
│  GET  /api/assignments/:id → Fetch one (MongoDB)               │
│                                                                 │
│  POST /api/query/execute   → Sanitize → PostgreSQL → results   │
│  GET  /api/query/sample-data/:table → SELECT * LIMIT 10        │
│                                                                 │
│  POST /api/hints/get       → OpenRouter → hint text            │
│                                                                 │
│  GET  /api/attempts/my     → User's attempts (MongoDB)         │
│  PATCH /api/attempts/:id/save → Save query (MongoDB)           │
│                                                                 │
│  Middleware:                                                    │
│  - CORS                   - Rate limiting (express-rate-limit) │
│  - JWT verify             - express-validator (body validation) │
│  - SQL sanitizer          - Global error handler               │
└───────────┬────────────────────────────┬────────────────────────┘
            │                            │
            ▼                            ▼
┌───────────────────────┐   ┌────────────────────────────────────┐
│  MONGODB (Atlas)      │   │  POSTGRESQL (Sandbox)              │
│                       │   │                                    │
│  Collections:         │   │  Tables (pre-seeded by admin):     │
│  - users              │   │  - employees                       │
│  - assignments        │   │  - departments                     │
│  - attempts           │   │  - customers                       │
│                       │   │  - products                        │
│  Stores:              │   │  - orders                          │
│  - User accounts      │   │  - order_items                     │
│  - Assignment         │   │  - students                        │
│    metadata           │   │  - courses                         │
│  - Query history      │   │  - enrollments                     │
│  - Table schemas      │   │                                    │
│    (descriptions)     │   │  Accepts: SELECT / WITH only       │
│                       │   │  Blocks: DROP, DELETE, INSERT...   │
└───────────────────────┘   └────────────────────────────────────┘
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │   OpenRouter          │
                             │                       │
                             │  Model: Llama 3.1 8B  │
                             │  Input:               │
                             │  - Assignment question│
                             │  - Table schemas      │
                             │  - User's query       │
                             │  - Hint level (1-3)   │
                             │                       │
                             │  Output: Hint text    │
                             │  (never the solution) │
                             └───────────────────────┘
```

### Query Execution Flow (Step by Step)

```
User types SQL → clicks "Run Query"
    │
    ▼
[Frontend] axios.post('/api/query/execute', { sql, assignmentId })
    │
    ▼
[Backend Middleware]
    ├── Rate limit check (200 req/15min per IP)
    ├── JWT decode (optional — logs attempt if logged in)
    │
    ▼
[sqlSanitizer.validateQuery()]
    ├── Check for forbidden keywords (DROP, DELETE, etc.)
    ├── Check for dangerous patterns (; DROP, --, /* */)
    ├── Verify query starts with SELECT or WITH
    └── Check length limit (5000 chars)
    │
    ├── [INVALID] → return 400 { isValidationError: true, message }
    │
    ▼
[PostgreSQL Pool]
    ├── SET statement_timeout = 8000 (8 second kill switch)
    └── Execute sanitized query
    │
    ├── [ERROR] → Save failed attempt to MongoDB (if logged in)
    │             Return 400 { message: pg error }
    │
    ▼
[SUCCESS]
    ├── Save successful attempt to MongoDB (if logged in)
    └── Return { rows, fields, rowCount, executionTime }
    │
    ▼
[Frontend] Display results in table
```

### Hint Flow

```
User clicks "Get Hint" (with level 1/2/3)
    │
    ▼
[Backend] hintsAPI.getHint(assignmentId, userQuery, hintLevel)
    │
    ▼
[Rate limiter] 20 hints/hour per IP
    │
    ▼
[MongoDB] Fetch assignment.question + assignment.tables (schemas)
    │
    ▼
[OpenRouter] Send carefully engineered prompt:
    - System: "You are a SQL teaching assistant. NEVER give full solutions."
    - Include hint level rules (1=subtle, 2=medium, 3=direct)
    - Include question + schema + user's current query
    │
    ▼
[Frontend] Display hint in the Hints tab panel
    + Increment hintsUsed counter in MongoDB (if logged in)
```

---

## Project Structure

```
ciphersqlstudio/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── mongodb.js          # Mongoose connection
│   │   │   └── postgres.js         # pg Pool connection
│   │   ├── controllers/            # (Logic is in routes for simplicity)
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT protect, optionalAuth, adminOnly
│   │   ├── models/
│   │   │   ├── User.js             # MongoDB user schema
│   │   │   ├── Assignment.js       # MongoDB assignment schema
│   │   │   └── Attempt.js          # MongoDB attempt/history schema
│   │   ├── routes/
│   │   │   ├── auth.js             # POST /register, /login, GET /me
│   │   │   ├── assignments.js      # GET /assignments, /:id
│   │   │   ├── query.js            # POST /execute, GET /sample-data/:table
│   │   │   ├── hints.js            # POST /hints/get
│   │   │   └── attempts.js         # GET /my, /:id, PATCH /:id/save
│   │   ├── utils/
│   │   │   ├── sqlSanitizer.js     # Query validation & security
│   │   │   ├── llmService.js       # OpenAI hint generation
│   │   │   └── seed.js             # DB seeder (npm run seed)
│   │   └── server.js               # Express app entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js           # Top navigation
│   │   │   ├── SchemaViewer.js     # Collapsible table schema display
│   │   │   ├── SampleDataViewer.js # Fetches & displays first 10 rows
│   │   │   ├── HintPanel.js        # Hint level selector + AI hint display
│   │   │   └── ResultsPanel.js     # Query results table + errors
│   │   ├── context/
│   │   │   ├── AuthContext.js      # Global auth state + JWT management
│   │   │   └── ToastContext.js     # Global toast notifications
│   │   ├── pages/
│   │   │   ├── HomePage.js         # Landing page with feature overview
│   │   │   ├── AssignmentsPage.js  # Assignment list with filters
│   │   │   ├── AttemptPage.js      # Main SQL editor + panels
│   │   │   ├── LoginPage.js        # Auth login form
│   │   │   ├── RegisterPage.js     # Auth register form
│   │   │   └── MyAttemptsPage.js   # User's attempt history
│   │   ├── services/
│   │   │   └── api.js              # Axios instance + all API calls
│   │   ├── styles/
│   │   │   ├── global.scss         # CSS reset, global styles, utilities
│   │   │   ├── utils/
│   │   │   │   ├── _variables.scss # Design tokens (colors, fonts, spacing)
│   │   │   │   └── _mixins.scss    # Responsive breakpoints, flex utils
│   │   │   ├── components/
│   │   │   │   └── _navbar.scss
│   │   │   └── pages/
│   │   │       ├── _home.scss
│   │   │       ├── _assignments.scss
│   │   │       ├── _attempt.scss
│   │   │       └── _auth.scss
│   │   ├── App.js                  # React Router setup
│   │   └── index.js                # React entry point
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## Database Design

### MongoDB: `users` collection

```json
{
  "_id": "ObjectId",
  "username": "string (3-30 chars, unique)",
  "email": "string (unique)",
  "password": "bcrypt hash",
  "role": "student | admin",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### MongoDB: `assignments` collection

```json
{
  "_id": "ObjectId",
  "title": "Find High-Earning Employees",
  "description": "Practice basic filtering...",
  "difficulty": "Easy | Medium | Hard",
  "category": "SELECT | JOIN | Aggregation | Subquery | ...",
  "question": "Full problem statement text",
  "tables": [
    {
      "tableName": "employees",
      "description": "Contains employee info...",
      "columns": [{ "name": "id", "type": "INT", "constraints": "PRIMARY KEY" }]
    }
  ],
  "tags": ["WHERE", "ORDER BY"],
  "expectedOutputDescription": "A list of employees...",
  "isActive": true,
  "order": 1
}
```

### MongoDB: `attempts` collection

```json
{
  "_id": "ObjectId",
  "user": "ObjectId → users",
  "assignment": "ObjectId → assignments",
  "queries": [
    {
      "sql": "SELECT * FROM employees",
      "executedAt": "Date",
      "wasSuccessful": true,
      "rowCount": 12
    }
  ],
  "savedQuery": "SELECT first_name...",
  "hintsUsed": 2,
  "status": "in_progress | completed"
}
```

### PostgreSQL: Sandbox Tables

Pre-seeded by `npm run seed` (in backend/):

| Schema     | Tables                                           |
| ---------- | ------------------------------------------------ |
| HR domain  | `employees`, `departments`                       |
| E-commerce | `customers`, `products`, `orders`, `order_items` |
| University | `students`, `courses`, `enrollments`             |

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/ciphersqlstudio

# ─── Neon PostgreSQL ──────────────────────────────────────────
# Get from: https://console.neon.tech → Your Project → Connection String
# Make sure to include ?sslmode=require at the end
DATABASE_URL=postgresql://user:pass@ep-xxxx.ap-southeast-1.aws.neon.tech/ciphersqlstudio?sslmode=require

# JWT (use a long random string)
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# ─── OpenRouter ───────────────────────────────────────────────
# Get key from: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# Free model (no credits needed):
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
YOUR_SITE_URL=http://localhost:3000
YOUR_SITE_NAME=CipherSQLStudio

# CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Installation & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local or cloud)
- MongoDB Atlas account (free tier works)
- OpenRouter key

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/ciphersqlstudio.git
cd ciphersqlstudio
```

### 2. Set up the Backend

```bash
cd backend
npm install

# Copy and fill in your environment variables
cp .env.example .env
# Edit .env with your credentials:
#   MONGODB_URI       → from MongoDB Atlas
#   DATABASE_URL      → from Neon console (neon.tech) — copy the full connection string
#   OPENROUTER_API_KEY → from openrouter.ai/keys
#   JWT_SECRET        → any long random string

# NOTE: No need to create the DB manually — Neon already has a database ready.
# Just run the seeder to create tables and insert sample data:
npm run seed

# Start the backend
npm run dev     # development with nodemon
npm start       # production
```

### 3. Set up the Frontend

```bash
cd frontend
npm install

cp .env.example .env
# Edit .env if your backend is not on localhost:5000

npm start       # starts on http://localhost:3000
```

### 4. Open the app

Visit `http://localhost:3000`

Default admin account (created by seed):

- Email: `admin@ciphersql.com`
- Password: `admin123456`

---

## API Reference

| Method | Endpoint                           | Auth     | Description                     |
| ------ | ---------------------------------- | -------- | ------------------------------- |
| POST   | `/api/auth/register`               | —        | Create user account             |
| POST   | `/api/auth/login`                  | —        | Login, returns JWT              |
| GET    | `/api/auth/me`                     | 🔒       | Get current user                |
| GET    | `/api/assignments`                 | Optional | List assignments (with filters) |
| GET    | `/api/assignments/:id`             | Optional | Get assignment details          |
| POST   | `/api/query/execute`               | Optional | Execute SQL query               |
| GET    | `/api/query/sample-data/:table`    | —        | Preview table data              |
| POST   | `/api/hints/get`                   | Optional | Get AI hint                     |
| GET    | `/api/attempts/my`                 | 🔒       | Get user's attempts             |
| GET    | `/api/attempts/:assignmentId`      | 🔒       | Get attempt for assignment      |
| PATCH  | `/api/attempts/:assignmentId/save` | 🔒       | Save current query              |

---

## Security

- **SQL Injection Prevention**: All queries run through `sqlSanitizer.js` which blocks dangerous keywords and patterns before they ever reach PostgreSQL
- **SELECT-only Sandbox**: Only `SELECT` and `WITH` (CTEs) are allowed — DROP, DELETE, INSERT, UPDATE, CREATE, ALTER are all blocked
- **Statement Timeout**: PostgreSQL is configured with an 8-second statement timeout to prevent DoS via expensive queries
- **Rate Limiting**: 200 requests/15min globally, 20 hints/hour for the LLM endpoint
- **JWT Auth**: Passwords are bcrypt-hashed; tokens expire in 7 days
- **Input Validation**: express-validator validates all request bodies
- **CORS**: Only the frontend URL is allowed to make requests

---

## LLM Prompt Engineering (OpenRouter)

The hint system uses **OpenRouter** — a unified API that routes to 100+ models. You can swap models via `OPENROUTER_MODEL` in `.env` without changing any code.

**Recommended free model:** `meta-llama/llama-3.1-8b-instruct:free`  
**Better quality (paid):** `openai/Meta ka Llama 3.1 8B Instruct` or `anthropic/claude-3-haiku`

The prompt engineering ensures the AI helps students think — not just hands them the answer:

```
RULES:
1. NEVER write the complete SQL answer
2. NEVER complete a partial query directly
3. DO guide thinking with questions and concepts
4. DO point to relevant SQL concepts to look up
5. Keep hints concise (2-4 sentences)

Hint Level 1 (Subtle): "Think about which clause filters rows after grouping"
Hint Level 2 (Medium): "You'll need GROUP BY with an aggregate function"
Hint Level 3 (Direct): "HAVING is like WHERE but works on aggregated results — look up how HAVING differs from WHERE"
```
