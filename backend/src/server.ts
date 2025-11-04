import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import 'express-async-errors';

import { initializeSocket } from './socket';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import eventsRoutes from './routes/events';
import swapRoutes from './routes/swap';
import { testDatabaseConnection } from './config/database';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initializeSocket(httpServer);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api', swapRoutes);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

// Start server with database connection check
async function startServer() {
  try {
    console.log('🚀 Starting SlotSwapper Backend...\n');
    
    // Test database connection before starting server
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      console.error('⚠️  Server will continue without database connection.');
      console.error('Please fix the database connection and restart the server.\n');
    }
    
    httpServer.listen(PORT, () => {
      console.log(`\n✅ Server running on port ${PORT}`);
      console.log(`📡 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
      console.log(`🔐 JWT expiration: ${process.env.JWT_EXPIRES_IN || '7d'}`);
      console.log(`\n👉 API available at: http://localhost:${PORT}`);
      console.log(`👉 Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
