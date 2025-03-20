import express from 'express';
import {
  addPrice,
  getPrices,
  getPriceById,
  updatePrice,
  deletePrice,
  getPriceTrends
} from '../controllers/priceController.js';

const router = express.Router();

// =========================
// 📌 Routes for Price Management
// =========================

// 1️⃣ Add a New Price Entry (Manual Entry)
router.post('/', addPrice);

// 2️⃣ Get Prices (Filter by Product & Market)
router.get('/', getPrices);

// 3️⃣ Get a Specific Price by ID
router.get('/:id', getPriceById);

// 4️⃣ Update a Price Entry
router.put('/:id', updatePrice);

// 5️⃣ Delete a Price Entry
router.delete('/:id', deletePrice);

// 6️⃣ Get Price Trends & Analytics
router.get('/trends/:product/:market', getPriceTrends);

export default router;
