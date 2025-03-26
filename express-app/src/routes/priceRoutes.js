// routes/priceRoutes.js
import express from 'express';
import {
  addPrice,
  getPrices,
  getPriceById,
  updatePrice,
  deletePrice,
  getPriceTrends,
  predictPrice,
  bulkImportPrices,
  getHistoricalPrices,
  getTopMarketsForProduct,
  setUserPriceAlerts,
  checkPriceAlerts,
  deletePriceAlert,
  detectPriceAnomalies,
  getAveragePricePerMarket,
  compareMarketPrices,
  getPriceVolatility,
} from '../controllers/priceController.js';

const router = express.Router();

// Price Entry Routes
router.post('/prices', addPrice);
router.get('/prices', getPrices);
router.get('/prices/:id', getPriceById);
router.put('/prices/:id', updatePrice);
router.delete('/prices/:id', deletePrice);

// Price Trends & Predictions
router.get('/prices/trends', getPriceTrends);
router.post('/prices/predict', predictPrice); // Predict future prices
router.post('/prices/bulk-import', bulkImportPrices); // Bulk import prices
router.get('/prices/historical', getHistoricalPrices); // Get historical prices
router.get('/prices/top-markets', getTopMarketsForProduct); // Get top markets for a product

// Price Alerts
router.post('/alerts', setUserPriceAlerts); // Set user price alerts
router.get('/alerts/check', checkPriceAlerts); // Check price alerts
router.delete('/alerts/:id', deletePriceAlert); // Delete a price alert

// Additional Functionalities
router.get('/prices/anomalies', detectPriceAnomalies); // Detect price anomalies
router.get('/prices/average', getAveragePricePerMarket); // Get average price per market
router.get('/prices/compare', compareMarketPrices); // Compare market prices
router.get('/prices/volatility', getPriceVolatility); // Get price volatility

export default router;