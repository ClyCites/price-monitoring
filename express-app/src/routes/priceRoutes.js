import express from 'express';
import {
  addPrice,
  getPrices,
  getPriceById,
  updatePrice,
  deletePrice,
  getPriceTrends,
  predictPrice,
  checkPriceAlerts,
  compareMarketPrices
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

// 6️⃣ Get Price Trends & Moving Averages
router.get('/trends/:product/:market', getPriceTrends);

// 7️⃣ Predict Future Prices (AI Integration)
router.post('/predict', predictPrice);

// 8️⃣ Check Price Alerts (Threshold Monitoring)
router.get('/alerts/check', checkPriceAlerts);

// 9️⃣ Compare Prices Across Different Markets
router.get('/compare', compareMarketPrices);

export default router;
