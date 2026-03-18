# MongoDB Integration - Setup Guide

## What Changed?

Your finance tracker now uses MongoDB instead of in-memory storage. All user accounts and expenses are permanently saved to the database.

## Files Created/Updated

### New Files:
- `backend/config/db.js` - Database connection handler
- `backend/models/User.js` - User schema and model
- `backend/models/Expense.js` - Expense schema and model

### Updated Files:
- `backend/server.js` - Added MongoDB connection
- `backend/routes/auth.js` - Now uses MongoDB for user authentication
- `backend/routes/expenses.js` - All CRUD operations use MongoDB
- `backend/routes/ai.js` - Fetches expenses from MongoDB
- `backend/package.json` - Added mongoose dependency
- `backend/.env` - Added MONGO_URI variable

## Setup Steps

### 1. Install Mongoose

```bash
cd backend
npm install mongoose
```

### 2. Add MongoDB Connection String

Edit `backend/.env` and add your MongoDB URI:

```env
MONGO_URI=your_mongodb_connection_string_here
```

**For MongoDB Atlas (Cloud):**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/finance-tracker?retryWrites=true&w=majority
```

**For Local MongoDB:**
```
MONGO_URI=mongodb://localhost:27017/finance-tracker
```

### 3. Start the Backend

```bash
cd backend
npm run dev
```

You should see:
```
Environment loaded successfully
JWT_SECRET: Configured ✓
OPENAI_API_KEY: Configured ✓
MONGO_URI: Configured ✓
MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
Database Name: finance-tracker
Server running on port 5000
```

## How It Works

### User Authentication
- **Signup**: Creates a new User document in MongoDB with hashed password
- **Login**: Queries MongoDB to find user and verify password
- **JWT Token**: Contains the MongoDB `_id` as `userId`

### Expense Management
- **Create**: Saves new Expense document linked to user via `userId`
- **Read**: Queries all expenses for the logged-in user
- **Update**: Finds expense by `_id` and `userId`, then updates
- **Delete**: Removes expense by `_id` and `userId`
- **Analysis**: Aggregates expense data with date range filtering

### Data Format
The API responses are formatted to match the frontend expectations:
- MongoDB `_id` is returned as `id`
- All other fields remain the same

## Testing

1. **Sign up** with a new account - check MongoDB to see the user created
2. **Add expenses** - verify they appear in the expenses collection
3. **Restart the server** - your data should persist
4. **Login again** - you should see all your previous expenses

## Troubleshooting

**Error: MONGO_URI is not defined**
- Make sure you added `MONGO_URI` to your `.env` file

**Error: connect ECONNREFUSED**
- If using local MongoDB, make sure MongoDB service is running
- If using Atlas, check your connection string and network access settings

**Error: Authentication failed**
- For Atlas, verify your database username and password in the connection string
- Check that your IP address is whitelisted in Atlas Network Access

**Error: User validation failed**
- Check that all required fields are provided (name, email, password)

## MongoDB Collections

Your database will have two collections:

1. **users**
   - Stores user accounts with hashed passwords
   - Indexed on email for fast lookups

2. **expenses**
   - Stores all expense records
   - Linked to users via `userId` field
   - Indexed on `userId` for efficient queries

## Security Notes

- Passwords are hashed with bcryptjs (10 salt rounds)
- JWT tokens expire after 7 days
- Never commit your `.env` file with real credentials
- Use environment variables for all sensitive data
- For production, enable MongoDB authentication and use strong passwords
