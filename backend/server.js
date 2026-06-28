const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const categoryRoutes = require('./routes/categories');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');

const { errorHandler, notFound } = require('./middleware/error');

dotenv.config();

const app = express();

// Ensure uploads directory exists and serve it
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.get('/', (req, res) =>
  res.json({
    success: true,
    message: 'TaskFlow X Backend API is running',
    status: 'OK',
  })
);

app.get('/health', (req, res) =>
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

async function connectDatabase() {
  if (!MONGODB_URI) {
    // eslint-disable-next-line no-console
    console.error('MONGODB_URI is required. Backend is running, but database features will fail.');
    return;
  }

  await mongoose.connect(MONGODB_URI, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
  });

  // eslint-disable-next-line no-console
  console.log('MongoDB connected');
}

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`TaskFlow X backend running on port ${PORT}`);
});

connectDatabase().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to connect to MongoDB:', err);
});

