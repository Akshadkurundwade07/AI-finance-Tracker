const express = require('express');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const aiRoutes = require('./routes/ai');
const loanRoutes = require('./routes/loans');
const { startSalaryCron } = require('./utils/salaryCron');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Verify environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('ERROR: MONGO_URI is not defined in .env file');
  process.exit(1);
}

console.log('Environment loaded successfully');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Configured ✓' : 'Missing ✗');
console.log('GROK_API_KEY:', process.env.GROK_API_KEY ? 'Configured ✓' : 'Missing ✗');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Configured ✓' : 'Missing ✗');

// Connect to MongoDB
connectDB();

// Enable compression for all responses
app.use(compression());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
  // Add your Vercel domain here
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/loans', loanRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Backend URL: http://localhost:${PORT}`);
  
  // Start salary auto-credit cron job
  startSalaryCron();
});
