// 🔥 Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// 🔥 Connect to MongoDB
connectDB();

const app = express();

// ─── ✅ FINAL CORS FIX ───────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "https://ecollect-go.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(null, false); // ❗ don't throw error (important)
    }
  },
  credentials: true,
};

// Apply CORS
app.use(cors(corsOptions));

// 🔥 VERY IMPORTANT: Handle preflight requests
app.options('*', cors(corsOptions));

// ─── Middleware ───────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health check ────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'e-Collect Go API is running 🟢',
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ──────────────────────────────────
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/users',   require('./routes/users'));
app.use('/api/waste',   require('./routes/waste'));
app.use('/api/pickups', require('./routes/pickups'));
app.use('/api/centers', require('./routes/centers'));

// ─── 404 handler ─────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`
  });
});

// ─── Global error handler ────────────────────
app.use(errorHandler);

// ─── Start server ────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄  MongoDB: ${process.env.MONGO_URI}\n`);
});

module.exports = app;