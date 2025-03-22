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
  compareMarketPrices,
  getHistoricalPrices,
  getPriceVolatility,
  bulkImportPrices,
  getTopMarketsForProduct,
  setUserPriceAlerts,
  detectPriceAnomalies,
  getAveragePricePerMarket
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

// 🔟 Get Historical Prices for a Product Over Time
router.get('/history/:product/:market', getHistoricalPrices);

// 1️⃣1️⃣ Get Price Volatility Analysis (Price Fluctuations)
router.get('/volatility/:product/:market', getPriceVolatility);

// 1️⃣2️⃣ Bulk Import Prices (Batch Entry)
router.post('/bulk-import', bulkImportPrices);

// 1️⃣3️⃣ Get Top Markets for a Product (Best Prices)
router.get('/top-markets/:product', getTopMarketsForProduct);

// 1️⃣4️⃣ Set Custom Price Alerts for Users
router.post('/alerts/set', setUserPriceAlerts);

// 1️⃣5️⃣ Detect Price Anomalies (Sudden Spikes or Drops)
router.get('/anomalies/:product/:market', detectPriceAnomalies);

// 1️⃣6️⃣ Get Average Price Per Market (Market Insights)
router.get('/average/:product', getAveragePricePerMarket);

export default router;
