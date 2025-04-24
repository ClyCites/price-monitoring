// routes/priceRoutes.js
import express from "express"
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
  getTrendingProducts,
  getProductTrend,
  getPriceSummary,
  analyzeSeasonalPrices,
  analyzeCorrelations,
  analyzeRegionalPrices,
  generateMarketReport,
  scheduleReport,
} from "../controllers/priceController.js"

const router = express.Router()

// Price Entry Routes
router.post("/", addPrice)
router.get("/", getPrices)
router.get("/:id", getPriceById)
router.put("/:id", updatePrice)
router.delete("/:id", deletePrice)

// Price Trends & Predictions
router.get("/trends", getPriceTrends)
router.post("/predict", predictPrice)
router.post("/bulk-import", bulkImportPrices)
router.get("/historical", getHistoricalPrices)
router.get("/top-markets", getTopMarketsForProduct)

// Price Alerts
router.post("/alerts", setUserPriceAlerts)
router.get("/alerts", checkPriceAlerts)
router.delete("/alerts/:id", deletePriceAlert)

// Analysis & Insights
router.get("/anomalies", detectPriceAnomalies)
router.get("/average", getAveragePricePerMarket)
router.get("/compare", compareMarketPrices)
router.get("/volatility", getPriceVolatility)
router.get("/trends/popular", getTrendingProducts)
router.get("/trends/product", getProductTrend)
router.get("/price-summary/:productId", getPriceSummary)

// Enhanced Analysis Routes
router.get("/seasonal", analyzeSeasonalPrices)
router.get("/correlations", analyzeCorrelations)
router.get("/regional", analyzeRegionalPrices)
router.get("/report", generateMarketReport)
router.post("/schedule-report", scheduleReport)

export default router
