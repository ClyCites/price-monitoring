import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import priceRoutes from './src/routes/priceRoutes.js';
import marketRoutes from './src/routes/marketRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import userRoutes from "./src/routes/userRoutes.js"
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';
import cors from 'cors';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/products', productRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
