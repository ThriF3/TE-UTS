import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { initDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';

const app = express();

// Middleware
app.use(cors({ origin: config.cors.origin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, express, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

// Import and setup module routes
import contractRoutes from './routes/contracts.js';
import orderRoutes from './routes/orders.js';
import transactionRoutes from './routes/transactions.js';
import returnRoutes from './routes/returns.js';
import stockRoutes from './routes/stock.js';
import courtRoutes from './routes/courts.js';
import gorLocationRoutes from './routes/gorLocations.js';

app.use('/api/contracts', contractRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/gor-locations', gorLocationRoutes);

// TODO: Add remaining routes
// app.use('/api/reports', reportRoutes);
// app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
  });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await initDatabase();

    // Start listening
    app.listen(config.port, () => {
      console.log(`\n🚀 Server running on port ${config.port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API URL: http://localhost:${config.port}/api`);
      console.log(`📊 Health check: http://localhost:${config.port}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
