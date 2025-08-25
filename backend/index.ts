import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { ordersRouter } from './routes/orders';
import { measurementsRouter } from './routes/measurements';
import { contractsRouter } from './routes/contracts';
import { stockRouter } from './routes/stock';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

// Connexion à MongoDB Atlas
connectDB().catch(err => console.log("MongoDB connection failed, continuing without:", err.message));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/orders', ordersRouter);
app.use('/api/measurements', measurementsRouter);
app.use('/api/contracts', contractsRouter);
app.use('/api/stock', stockRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;