# 💰 FinanceAI — AI-Powered Finance Tracker

A full-stack personal finance tracker with AI-powered suggestions, expense management, visual analytics, and monthly income tracking. Built with React, Node.js, MongoDB, and Groq AI.

---

## Screenshots

| Landing Page | Dashboard | AI Suggestions |
|---|---|---|
| Animated hero with feature cards | Income vs spending with progress bar | Groq AI financial advice |

---

## Features

- 🔐 JWT-based authentication (Signup / Login)
- 💸 Add, edit, and delete expenses with categories
- 📊 Visual analytics — pie chart and bar chart with date range filtering
- 🤖 AI-powered financial suggestions using Groq (Llama / GPT-OSS models)
- 💰 Monthly income tracking with live remaining balance
- 📈 Budget progress bar (green → orange → red)
- 🌙 Dark-themed modern UI with glass-morphism design
- ₹ Indian Rupee (₹) currency throughout
- 📱 Fully responsive design

---

## Tech Stack

**Frontend**
- React 18
- React Router v6
- Axios
- Recharts (pie + bar charts)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcryptjs password hashing
- Groq AI API (`openai/gpt-oss-120b` model)

---

## Project Structure

```
finance-tracker/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Landing.js        # Public landing page
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Navbar.js
│   │   │   ├── Dashboard.js      # Income + spending overview
│   │   │   ├── Expenses.js       # CRUD expense management
│   │   │   ├── Analysis.js       # Charts with date range
│   │   │   └── Suggestions.js    # AI suggestions page
│   │   ├── App.js
│   │   └── index.css
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   └── auth.js               # JWT middleware
│   ├── models/
│   │   ├── User.js               # name, email, password, monthlyIncome
│   │   └── Expense.js            # userId, amount, category, description, date
│   ├── routes/
│   │   ├── auth.js               # signup, login, update income, get profile
│   │   ├── expenses.js           # CRUD + analysis endpoint
│   │   └── ai.js                 # Groq AI suggestions
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Setup & Installation

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Groq API key — get free at [console.groq.com](https://console.groq.com)

---

### 1. Clone the repository

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

> Get your Groq API key at [console.groq.com](https://console.groq.com/keys)

### 3. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Run the app

Open two terminals:

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm start
```

### 5. Open in browser

```
http://localhost:3000
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/income` | Update monthly income |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all user expenses |
| POST | `/api/expenses` | Create new expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/analysis` | Get analysis with date range |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/suggestions` | Get AI financial suggestions |

---

## Database Models

**User**
```js
{
  name: String,
  email: String (unique),
  password: String (hashed),
  monthlyIncome: Number,
  timestamps: true
}
```

**Expense**
```js
{
  userId: ObjectId (ref: User),
  amount: Number,
  category: Enum ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'],
  description: String,
  date: Date,
  timestamps: true
}
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 5000) |
| `JWT_SECRET` | Secret key for JWT token signing |
| `MONGO_URI` | MongoDB connection string |
| `GROK_API_KEY` | Groq API key for AI suggestions |

---

## Security Notes

- Passwords are hashed with bcryptjs (10 salt rounds)
- JWT tokens expire after 7 days
- Never commit your `.env` file — it's in `.gitignore`
- MongoDB credentials should use a dedicated database user with minimal permissions

---

## License

MIT
