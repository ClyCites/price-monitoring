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
router.post('/', addPrice);
router.get('/', getPrices);;
router.put('/:id', updatePrice);
router.delete('/:id', deletePrice);

// Price Trends & Predictions
router.get('/trends', getPriceTrends);
router.post('/predict', predictPrice); // Predict future prices
router.post('/bulk-import', bulkImportPrices); // Bulk import prices
router.get('/historical', getHistoricalPrices); // Get historical prices
router.get('/top-markets', getTopMarketsForProduct); // Get top markets for a product

// Price Alerts
router.post('/alerts', setUserPriceAlerts); // Set user price alerts
router.get('/alerts/check', checkPriceAlerts); // Check price alerts
router.delete('/alerts/:id', deletePriceAlert); // Delete a price alert

// Additional Functionalities
router.get('/anomalies', detectPriceAnomalies); // Detect price anomalies
router.get('/average', getAveragePricePerMarket); // Get average price per market
router.get('/compare', compareMarketPrices); // Compare market prices
router.get('/volatility', getPriceVolatility); // Get price volatility

router.get('/:id', getPriceById)

export default router;