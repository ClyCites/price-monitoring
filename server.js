import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import priceRoutes from './src/routes/priceRoutes.js';
import marketRoutes from './src/routes/marketRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());

// Routes
app.use('/api/prices', priceRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/users', userRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));