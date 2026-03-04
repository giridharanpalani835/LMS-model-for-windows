require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const adminRoutes = require('./routes/adminRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const app = express();

// Support comma-separated origins: CLIENT_URL=http://localhost:3000,https://app.com
// NOTE: create‑react‑app runs on port 3000 by default; using 3000 here would block dev requests
const rawOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl, Postman, mobile
    if (rawOrigins.includes('*') || rawOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS: origin not allowed'));
  },
  credentials: true,
}));
app.use(express.json());

// Guard: exit early with helpful message when MONGO_URI is missing
// Guard: exit early with helpful message when required env vars are missing
const missing = [];
if (!process.env.MONGO_URI) missing.push('MONGO_URI');
if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
if (missing.length) {
  console.error('[ERROR] Missing required env variables:', missing.join(', '));
  console.error('  -> Copy server/.env.example to server/.env and fill in the required values.');
  process.exit(1);
}

// FIX: Mongoose 8 removed useNewUrlParser & useUnifiedTopology — passing them throws errors
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => { console.error('MongoDB error:', err.message); process.exit(1); });

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date() }));

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT));

module.exports = app;
