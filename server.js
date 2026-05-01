require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const coleccionRoutes = require('./routes/coleccion');

const app = express();

// Middleware
const allowedOrigins = (origin, callback) => {
  // Allow requests with no origin (like mobile apps or curl requests/postman)
  if (!origin) return callback(null, true);

  if (process.env.NODE_ENV === 'production') {
    // Check if origin is a vercel app
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    // Block others in production
    return callback(new Error('Not allowed by CORS'));
  } else {
    // Development mode
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    // Allow vercel apps in dev mode as well just in case
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
};

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Health Check — lightweight, no DB access
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/coleccion', coleccionRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Error connecting to MongoDB:', err));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
