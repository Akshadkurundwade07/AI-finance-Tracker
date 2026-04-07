# 💰 FinanceAI — AI-Powered Finance Tracker

A full-stack personal finance tracker with AI-powered suggestions, expense management, visual analytics, and monthly income tracking. Built with React, Node.js, MongoDB, and Groq AI.

---

## What is this?

FinanceAI helps you take control of your money. You log your daily expenses, set your monthly income, and the app shows you exactly where your money is going — with charts, category breakdowns, and AI-generated advice tailored to your spending habits. Everything is stored in MongoDB so your data persists across sessions.

---

## Features

- JWT-based authentication (Signup / Login)
- Add, edit, and delete expenses with categories
- Monthly income tracking with live remaining balance
- Budget progress bar (green → orange → red based on spend %)
- Visual analytics — donut pie chart, horizontal bar chart, and daily area trend chart
- Date range filtering for expense analysis
- AI-powered financial suggestions via Groq API (openai/gpt-oss-120b)
- Indian Rupee (₹) currency throughout
- Dark-themed UI with glass-morphism design
- Fully responsive — works on desktop, tablet, and mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |
| AI | Groq API — `openai/gpt-oss-120b` model |

---

## Project Structure

```
finance-tracker/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── middleware/
│   │   └── auth.js             # JWT verification middleware
│   ├── models/
│   │   ├── User.js             # User schema
│   │   └── Expense.js          # Expense schema
│   ├── routes/
│   │   ├── auth.js             # signup, login, profile, income update
│   │   ├── expenses.js         # CRUD + analysis endpoint
│   │   └── ai.js               # Groq AI suggestions
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Landing.js      # Public landing page
│       │   ├── Login.js
│       │   ├── Signup.js
│       │   ├── Navbar.js
│       │   ├── Dashboard.js    # Income + spending overview
│       │   ├── Expenses.js     # CRUD expense management
│       │   ├── Analysis.js     # Charts with date range filter
│       │   └── Suggestions.js  # AI suggestions page
│       ├── api.js              # Base API URL config
│       ├── App.js              # Routes + auth state
│       └── index.js
│   └── package.json
│
├── package.json                # Root scripts (install-all, dev)
└── README.md
```

---

## Database Design

### Collection: `users`

Stores registered user accounts.

```
users
├── _id          ObjectId     (auto-generated)
├── name         String       required
├── email        String       required, unique, indexed
├── password     String       required, bcrypt hashed (10 rounds)
├── monthlyIncome Number      default: 0
├── createdAt    Date         auto (timestamps)
└── updatedAt    Date         auto (timestamps)
```

### Collection: `expenses`

Stores all expense records, linked to a user.

```
expenses
├── _id          ObjectId     (auto-generated)
├── userId       ObjectId     ref: User, required (foreign key)
├── amount       Number       required, min: 0
├── category     String       enum: Food | Transport | Entertainment
│                             Shopping | Bills | Healthcare | Other
├── description  String       required, trimmed
├── date         Date         required, default: now
├── createdAt    Date         auto (timestamps)
└── updatedAt    Date         auto (timestamps)
```

### Relationships

```
User (1) ──────────── (many) Expense
         userId field on Expense references User._id
```

Each expense belongs to exactly one user. All queries filter by `userId` to ensure data isolation between users.

---

## System Design

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│                   React 18 (SPA)                        │
│                                                         │
│  Landing → Login/Signup → Dashboard → Expenses          │
│                        → Analysis  → AI Suggestions     │
│                                                         │
│  Auth state: JWT token stored in localStorage           │
│  HTTP calls: Axios with Bearer token header             │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST (port 3000 → 5000)
                       │
┌──────────────────────▼──────────────────────────────────┐
│                      BACKEND                            │
│                 Node.js + Express                       │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  /api/auth  │  │/api/expenses │  │   /api/ai     │  │
│  │             │  │              │  │               │  │
│  │ POST /signup│  │ GET    /     │  │ POST          │  │
│  │ POST /login │  │ POST   /     │  │ /suggestions  │  │
│  │ GET  /me    │  │ PUT    /:id  │  │               │  │
│  │ PUT  /income│  │ DELETE /:id  │  │               │  │
│  └─────────────┘  │ GET /analysis│  └───────┬───────┘  │
│                   └──────────────┘          │          │
│                                             │          │
│  JWT Middleware ──── protects all routes    │          │
│  except /signup and /login                  │          │
└──────────┬──────────────────────────────────┼──────────┘
           │                                  │
           │ Mongoose ODM                     │ fetch()
           │                                  │
┌──────────▼──────────┐          ┌────────────▼──────────┐
│      MongoDB        │          │       Groq API        │
│                     │          │                       │
│  Collections:       │          │  Model:               │
│  - users            │          │  openai/gpt-oss-120b  │
│  - expenses         │          │                       │
│                     │          │  Input: spending data │
│  Hosted on Atlas    │          │  + monthly income     │
│  or local instance  │          │                       │
└─────────────────────┘          │  Output: 3-5 tailored │
                                 │  financial tips       │
                                 └───────────────────────┘
```

### Request Flow

1. User logs in → backend verifies credentials → returns JWT (7-day expiry)
2. Frontend stores JWT in `localStorage`, attaches it as `Authorization: Bearer <token>` on every request
3. `auth.js` middleware decodes the token and attaches `req.userId` before the route handler runs
4. All expense queries filter by `req.userId` — users can only see their own data
5. For AI suggestions, the backend fetches the user's expenses from MongoDB, builds a prompt with income + spending breakdown, and calls the Groq API

### Auth Flow

```
Signup:  POST /api/auth/signup
         → hash password (bcrypt, 10 rounds)
         → save User to MongoDB
         → sign JWT with user._id
         → return { token, user }

Login:   POST /api/auth/login
         → find user by email
         → compare password with bcrypt
         → sign JWT
         → return { token, user }

Protected routes:
         → extract Bearer token from Authorization header
         → jwt.verify() → decode userId
         → attach req.userId → proceed to route handler
```

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Get current user profile |
| PUT | `/api/auth/income` | Yes | Update monthly income |

### Expenses

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/expenses` | Yes | Get all expenses for logged-in user |
| POST | `/api/expenses` | Yes | Create new expense |
| PUT | `/api/expenses/:id` | Yes | Update expense by ID |
| DELETE | `/api/expenses/:id` | Yes | Delete expense by ID |
| GET | `/api/expenses/analysis` | Yes | Aggregated stats with optional `?startDate=&endDate=` |

### AI

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/suggestions` | Yes | Get AI financial suggestions based on user's data |

---

## Setup & Installation

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Groq API key — free at [console.groq.com](https://console.groq.com)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/finance-tracker.git
cd finance-tracker
```

### 2. Configure backend environment

Create `backend/.env`:

```env
PORT=5000
JWT_SECRET=your_random_secret_key_here
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/finance-tracker?retryWrites=true&w=majority
GROK_API_KEY=gsk_your_groq_api_key_here
```

> Get your Groq API key at [console.groq.com/keys](https://console.groq.com/keys)

### 3. Configure frontend environment

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Install dependencies

```bash
# From root
npm run install-all

# Or manually
cd backend && npm install
cd ../frontend && npm install
```

### 5. Run the app

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm start
```

App runs at `http://localhost:3000`, backend at `http://localhost:5000`.

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `PORT` | backend | Server port (default: 5000) |
| `JWT_SECRET` | backend | Secret for signing JWT tokens |
| `MONGO_URI` | backend | MongoDB connection string |
| `GROK_API_KEY` | backend | Groq API key for AI suggestions |
| `REACT_APP_API_URL` | frontend | Backend base URL |

---

## Security Notes

- Passwords hashed with bcryptjs (10 salt rounds) — never stored in plain text
- JWT tokens expire after 7 days
- All expense routes are user-scoped — queries always include `userId` filter
- Never commit `.env` files — both are in `.gitignore`
- Use a dedicated MongoDB user with minimal permissions in production

---

## License

MIT
