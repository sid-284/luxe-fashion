import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes.js'
import multer from 'multer'
dotenv.config()
import cors from "cors"
import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import { generalLimiter } from './middleware/rateLimiter.js'

let port = process.env.PORT || 8000

let app = express()

app.use(cookieParser())
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'https://luxefashion-blond.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4173'
    ];

    console.log('CORS request from origin:', origin);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Additional middleware to ensure proper CORS headers on all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://luxefashion-blond.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173'
  ];

  // Only set origin header if it's in allowed list
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie');
  res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  next();
});

// Handle preflight requests for all routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://luxefashion-blond.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4173'
    ];

    // Only set origin header if it's in allowed list
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
    return res.sendStatus(200);
  }
  next();
});

// Apply rate limiting to all routes
app.use(generalLimiter)

// Error handling middleware for multer errors
app.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        message: 'File too large. Maximum file size is 10MB.' 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({ 
        message: 'Too many files. Maximum 10 files allowed.' 
      });
    }
    return res.status(400).json({ 
      message: 'File upload error: ' + error.message 
    });
  }
  next(error);
});

// Health check endpoint
app.get('/api/health', async (_req, res) => {
  try {
    // Check database connection
    const mongoose = await import('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({ 
      status: 'OK', 
      message: 'Server is running',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Server health check failed',
      error: error.message 
    });
  }
});

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/product", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/order", orderRoutes)




app.listen(port,()=>{
    console.log("Hello From Server")
    connectDb()
})
