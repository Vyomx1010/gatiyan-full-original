const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // Security headers
const rateLimit = require('express-rate-limit'); // Rate limiting
const mongoSanitize = require('express-mongo-sanitize'); // MongoDB injection protection
const xss = require('xss-clean'); // XSS protection
const hpp = require('hpp'); // HTTP Parameter Pollution protection
const cookieParser = require('cookie-parser');
const connectToDb = require('./db/db');
const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const mapsRoutes = require('./routes/maps.routes');
const rideRoutes = require('./routes/ride.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');
const contactRoutes = require('./routes/contact.routes');

const app = express();

// Trust proxy for proper IP handling
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);


// Connect to MongoDB
connectToDb();

// 1. Secure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // For cookies/auth tokens
}));

// 2. Helmet for secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://checkout.razorpay.com"], 
      connectSrc: ["'self'", process.env.FRONTEND_URL, "wss://your-vercel-backend.vercel.app"], 
    }
  }
}));

// 3. Rate Limiting to prevent brute force/DDOS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// 4. Body Parser with limits
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Sanitize inputs (MongoDB injection, XSS, HPP)
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// 6. Cookie Parser with secure options
app.use(cookieParser());
app.use((req, res, next) => {
  res.cookie('token', req.cookies.token || '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Secure in production
    sameSite: 'Strict' // Prevent CSRF
  });
  next();
});

// 7. Basic Route
app.get('/', (req, res) => {
  res.send('Hello World');
});

// 8. API Routes
app.use('/api/users', userRoutes);
app.use('/api/captains', captainRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// 9. Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;
