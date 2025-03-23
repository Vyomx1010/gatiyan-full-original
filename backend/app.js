const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const connectToDb = require('./db/db');
const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const mapsRoutes = require('./routes/maps.routes');
const rideRoutes = require('./routes/ride.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');
const contactRoutes = require('./routes/contact.routes');

const app = express();

// Trust proxy for proper IP handling (you can remove this if not needed)
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

// Connect to MongoDB
connectToDb();

// Body Parser (no payload limits, no sanitization)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Route
app.get('/', (req, res) => {
  res.send('Hello World');
});

// API Routes
app.use('/users', userRoutes);
app.use('/captains', captainRoutes);
app.use('/maps', mapsRoutes);
app.use('/rides', rideRoutes);
app.use('/payments', paymentRoutes);
app.use('/admin-hubhaimere-sepanga-matlena', adminRoutes);
app.use('/contact', contactRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;
