import mongoose from "mongoose"
import Price from "../models/Price.js"
import Product from "../models/Product.js"
import Market from "../models/Market.js"
import PriceAlert from "../models/PriceAlert.js"
import {
  calculateMovingAverage,
  detectPriceTrend,
  detectSeasonality,
  calculateVolatility,
  identifyAnomalies,
} from "../utils/priceAnalytics.js"
import {
  predictWithMovingAverage,
  predictWithLinearRegression,
  predictWithWeightedMovingAverage,
  predictWithExponentialSmoothing,
  predictWithEnsemble,
  predictWithSeasonalAdjustment,
} from "../utils/pricePrediction.js"
import {
  compareMarketPrices as analyzeMarketPrices,
  analyzeProductCorrelations,
  generateMarketReport as generateMarketReportUtil,
} from "../utils/marketAnalysis.js"

// =========================
// 1️⃣ Add a New Price Entry (Manual Entry)
// =========================
export const addPrice = async (req, res) => {
  try {
    const { product, market, price, currency, date, productType, quantity, unit } = req.body

    // Validate required fields
    if (!product || !market || !price || !date || !productType || !quantity || !unit) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // Check if user is agent or admin
    if (req.user.role !== "agent" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only agents and admins can add price data" })
    }

    // Validate product and market existence
    const existingProduct = await Product.findById(product)
    if (!existingProduct) return res.status(404).json({ message: "Product not found" })

    const existingMarket = await Market.findById(market)
    if (!existingMarket) return res.status(404).json({ message: "Market not found" })

    // Create new price entry
    const newPrice = new Price({
      product,
      market,
      price,
      currency: currency || "UGX",
      date,
      productType,
      quantity,
      unit,
      lastUpdated: new Date(),
      addedBy: req.user._id, // Track who added the price
    })

    await newPrice.save()
    res.status(201).json({ message: "Price added successfully", price: newPrice })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 2️⃣ Get Prices (Filter by Product & Market)
// =========================
export const getPrices = async (req, res) => {
  try {
    const { product, market, startDate, endDate, limit = 100 } = req.query
    const query = {}

    if (product) query.product = product
    if (market && market !== "all") query.market = market

    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }

    const prices = await Price.find(query)
      .sort({ date: -1 })
      .limit(Number(limit))
      .populate("product", "name category")
      .populate("market", "name location region")

    res.status(200).json(prices)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 3️⃣ Get Price by ID
// =========================
export const getPriceById = async (req, res) => {
  try {
    const price = await Price.findById(req.params.id)
      .populate("product", "name category")
      .populate("market", "name location region")

    if (!price) return res.status(404).json({ message: "Price not found" })

    res.status(200).json(price)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 4️⃣ Update Price Entry
// =========================
export const updatePrice = async (req, res) => {
  try {
    // Find the existing price entry
    const existingPrice = await Price.findById(req.params.id)
    if (!existingPrice) return res.status(404).json({ message: "Price not found" })

    const { product, market, price, date, productType, quantity, unit, currency } = req.body

    // Validate product and market existence if updated
    if (product) {
      const existingProduct = await Product.findById(product)
      if (!existingProduct) return res.status(404).json({ message: "Product not found" })
    }
    if (market) {
      const existingMarket = await Market.findById(market)
      if (!existingMarket) return res.status(404).json({ message: "Market not found" })
    }

    // Instead of updating the existing price entry, create a new one
    // This preserves the historical record
    const newPrice = new Price({
      product: product || existingPrice.product,
      market: market || existingPrice.market,
      price: price || existingPrice.price,
      currency: currency || existingPrice.currency,
      date: date || existingPrice.date,
      productType: productType || existingPrice.productType,
      quantity: quantity || existingPrice.quantity,
      unit: unit || existingPrice.unit,
      lastUpdated: new Date(),
      addedBy: req.user ? req.user._id : existingPrice.addedBy,
    })

    await newPrice.save()

    res.status(200).json({
      message: "Price updated successfully",
      price: newPrice,
      previousPrice: {
        id: existingPrice._id,
        price: existingPrice.price,
        date: existingPrice.date,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 5️⃣ Delete a Price Entry
// =========================
export const deletePrice = async (req, res) => {
  try {
    const price = await Price.findById(req.params.id)
    if (!price) return res.status(404).json({ message: "Price not found" })

    await price.deleteOne()
    res.status(200).json({ message: "Price deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 6️⃣ Get Price Trends & Moving Averages
// =========================
export const getPriceTrends = async (req, res) => {
  try {
    const { product, market, days } = req.query;
    const pastDays = days ? parseInt(days) : 30;

    if (!product || !market) {
      return res.status(400).json({ message: 'Product and market are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(product) || !mongoose.Types.ObjectId.isValid(market)) {
      return res.status(400).json({ message: 'Invalid product or market ID' });
    }

    const historicalPrices = await Price.find({
      product,
      market,
      date: { $gte: new Date(Date.now() - pastDays * 24 * 60 * 60 * 1000) }
    }).sort({ date: 1 });

    if (historicalPrices.length < 2) {
      return res.status(200).json({ message: 'Not enough data for trend analysis', historicalPrices });
    }

    const firstPrice = historicalPrices[0].price;
    const latestPrice = historicalPrices[historicalPrices.length - 1].price;
    const trendPercentage = ((latestPrice - firstPrice) / firstPrice) * 100;

    const trendDirection = trendPercentage > 0 ? 'increasing' : trendPercentage < 0 ? 'decreasing' : 'stable';

    res.status(200).json({
      product,
      market,
      trendPercentage: trendPercentage.toFixed(2),
      trendDirection,
      historicalPrices
    });
  } catch (error) {
    console.error('Error fetching price trends:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// =========================
// 7️⃣ Predict Future Prices
// =========================
export const predictPrice = async (req, res) => {
  try {
    const { product, market, days = 7, method = "ensemble" } = req.body

    if (!product || !market) {
      return res.status(400).json({ message: "Product and market are required" })
    }

    // Get historical prices for the product in the specified market
    // Use the Price collection directly instead of historicalPrices field
    const historicalPrices = await Price.find({ product, market }).sort({ date: 1 }).limit(90) // Use up to 90 days of historical data

    if (historicalPrices.length < 14) {
      return res.status(400).json({
        message: "Insufficient historical data for prediction",
        required: 14,
        available: historicalPrices.length,
      })
    }

    // Generate predictions based on the specified method
    let predictions

    switch (method) {
      case "moving_average":
        predictions = predictWithMovingAverage(historicalPrices, Number(days))
        break
      case "linear_regression":
        predictions = predictWithLinearRegression(historicalPrices, Number(days))
        break
      case "weighted_moving_average":
        predictions = predictWithWeightedMovingAverage(historicalPrices, Number(days))
        break
      case "exponential_smoothing":
        predictions = predictWithExponentialSmoothing(historicalPrices, Number(days))
        break
      case "seasonal":
        predictions = predictWithSeasonalAdjustment(historicalPrices, Number(days))
        break
      case "ensemble":
      default:
        predictions = predictWithEnsemble(historicalPrices, Number(days))
    }

    // Get product and market details
    const productDetails = await Product.findById(product)
    const marketDetails = await Market.findById(market)

    res.status(200).json({
      product: {
        id: product,
        name: productDetails ? productDetails.name : "Unknown Product",
      },
      market: {
        id: market,
        name: marketDetails ? marketDetails.name : "Unknown Market",
      },
      method,
      predictions,
      generatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error predicting prices:", error)
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 8️⃣ Bulk Import Prices
// =========================
export const bulkImportPrices = async (req, res) => {
  try {
    const { prices } = req.body
    if (!Array.isArray(prices) || prices.length === 0) {
      return res.status(400).json({ message: "Invalid price data" })
    }

    // Validate each price entry
    for (const priceData of prices) {
      const { product, market, price, date, productType, quantity, unit } = priceData

      if (!product || !market || !price || !date || !productType || !quantity || !unit) {
        return res.status(400).json({ message: "All fields are required for each price entry" })
      }

      const existingProduct = await Product.findById(product)
      if (!existingProduct) return res.status(404).json({ message: `Product not found for ID: ${product}` })

      const existingMarket = await Market.findById(market)
      if (!existingMarket) return res.status(404).json({ message: `Market not found for ID: ${market}` })
    }

    // Add addedBy field to each price entry if user is available
    const pricesToInsert = prices.map((price) => ({
      ...price,
      addedBy: req.user ? req.user._id : undefined,
      lastUpdated: new Date(),
    }))

    await Price.insertMany(pricesToInsert)
    res.status(201).json({ message: "Prices imported successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 9️⃣ Get Historical Prices
// =========================
export const getHistoricalPrices = async (req, res) => {
  try {
    const { product, market, limit = 30 } = req.query
    const query = {}

    if (product) query.product = product
    if (market && market !== "all") query.market = market

    // Get historical prices directly from the Price collection
    const historicalPrices = await Price.find(query)
      .sort({ date: -1 })
      .limit(Number(limit))
      .populate("product", "name category")
      .populate("market", "name location region")

    res.status(200).json(historicalPrices)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 🔟 Get Top Markets for a Product
// =========================
export const getTopMarketsForProduct = async (req, res) => {
  try {
    const { product } = req.query
    if (!product) return res.status(400).json({ message: "Product is required" })

    const markets = await Price.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(product) } },
      {
        $group: {
          _id: "$market",
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          priceCount: { $sum: 1 },
          latestDate: { $max: "$date" },
        },
      },
      { $sort: { avgPrice: 1 } }, // Sort by lowest price first
      { $limit: 10 },
      {
        $lookup: {
          from: "markets",
          localField: "_id",
          foreignField: "_id",
          as: "marketDetails",
        },
      },
      { $unwind: "$marketDetails" },
      {
        $project: {
          _id: 0,
          marketId: "$_id",
          marketName: "$marketDetails.name",
          location: "$marketDetails.location",
          region: "$marketDetails.region",
          avgPrice: 1,
          minPrice: 1,
          maxPrice: 1,
          priceRange: { $subtract: ["$maxPrice", "$minPrice"] },
          priceCount: 1,
          latestDate: 1,
        },
      },
    ])

    res.status(200).json(markets)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 11️⃣ Set User Price Alerts
// =========================
export const setUserPriceAlerts = async (req, res) => {
  try {
    const { userId, product, market, priceThreshold } = req.body

    if (!userId || !product || !market || priceThreshold === undefined) {
      return res.status(400).json({ message: "User ID, product, market, and price threshold are required" })
    }

    const existingAlert = await PriceAlert.findOne({ userId, product, market })
    if (existingAlert) {
      return res.status(400).json({ message: "Price alert already exists for this product and market" })
    }

    const newAlert = new PriceAlert({
      userId,
      product,
      market,
      priceThreshold,
    })

    await newAlert.save()
    res.status(201).json({ message: "Price alert set successfully", alert: newAlert })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 12️⃣ Check Price Alerts
// =========================
export const checkPriceAlerts = async (req, res) => {
  try {
    const { userId } = req.query

    // Step 1: Validate input
    if (!userId) {
      return res.status(400).json({ message: "UserId is required" })
    }

    // Step 2: Fetch all untriggered price alerts for the given user
    const alerts = await PriceAlert.find({ userId, alertTriggered: false })
    if (!alerts.length) {
      return res.status(200).json({ message: "No active price alerts for this user" })
    }

    // Step 3: For each alert, check if the current price has reached the threshold
    const triggeredAlerts = []
    for (const alert of alerts) {
      const { product, market, priceThreshold } = alert

      // Fetch the most recent price for the product and market
      const currentPrice = await Price.findOne({ product, market }).sort({ date: -1 })
      if (!currentPrice) {
        continue // Skip if no price data found for this product and market
      }

      // Check if the current price is below or equal to the price threshold
      if (currentPrice.price <= priceThreshold) {
        alert.alertTriggered = true
        await alert.save() // Mark the alert as triggered
        triggeredAlerts.push({
          alert,
          currentPrice: currentPrice.price,
          date: currentPrice.date,
        })
      }
    }

    // Step 4: Send the response
    if (triggeredAlerts.length > 0) {
      return res.status(200).json({
        message: "Price alerts checked and triggered",
        triggeredAlerts,
      })
    } else {
      return res.status(200).json({ message: "No alerts triggered, prices are still above the threshold" })
    }
  } catch (error) {
    console.error("Error checking price alerts:", error)
    return res.status(500).json({ message: error.message })
  }
}

// =========================
// 13️⃣ Delete a Price Alert
// =========================
export const deletePriceAlert = async (req, res) => {
  try {
    const alert = await PriceAlert.findById(req.params.id)
    if (!alert) return res.status(404).json({ message: "Price alert not found" })

    await alert.deleteOne()
    res.status(200).json({ message: "Price alert deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 14️⃣ Detect Price Anomalies (Fraud Detection)
// =========================
export const detectPriceAnomalies = async (req, res) => {
  try {
    const { product, market, days = 90, threshold = 2.5 } = req.query

    if (!product || !market) {
      return res.status(400).json({ message: "Product and market are required" })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number(days))

    // Get historical prices directly from the Price collection
    const prices = await Price.find({
      product,
      market,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 })

    if (prices.length < 5) {
      return res.status(400).json({ message: "Insufficient data for anomaly detection" })
    }

    // Identify anomalies
    const anomalies = identifyAnomalies(prices, Number(threshold))

    // Get product and market details
    const productDetails = await Product.findById(product)
    const marketDetails = await Market.findById(market)

    res.status(200).json({
      product: {
        id: product,
        name: productDetails ? productDetails.name : "Unknown Product",
      },
      market: {
        id: market,
        name: marketDetails ? marketDetails.name : "Unknown Market",
      },
      anomalyCount: anomalies.length,
      anomalies,
      threshold,
      analyzedPeriod: {
        startDate,
        endDate,
        days,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 15️⃣ Get Average Price Per Market
// =========================
export const getAveragePricePerMarket = async (req, res) => {
  try {
    const { product, market, days = 30 } = req.query

    if (!product) {
      return res.status(400).json({ message: "Product is required" })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number(days))

    // Build the match stage for aggregation
    const matchStage = {
      product: new mongoose.Types.ObjectId(product),
      date: { $gte: startDate, $lte: endDate },
    }

    // Only add market to match stage if it's not "all"
    if (market && market !== "all") {
      matchStage.market = new mongoose.Types.ObjectId(market)
    }

    const averagePrices = await Price.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: "$market",
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          priceCount: { $sum: 1 },
        },
      },
      { $sort: { avgPrice: 1 } },
      {
        $lookup: {
          from: "markets",
          localField: "_id",
          foreignField: "_id",
          as: "marketDetails",
        },
      },
      { $unwind: "$marketDetails" },
      {
        $project: {
          _id: 0,
          marketId: "$_id",
          marketName: "$marketDetails.name",
          location: "$marketDetails.location",
          region: "$marketDetails.region",
          avgPrice: 1,
          minPrice: 1,
          maxPrice: 1,
          priceRange: { $subtract: ["$maxPrice", "$minPrice"] },
          priceCount: 1,
        },
      },
    ])

    // Get product details
    const productDetails = await Product.findById(product)

    res.status(200).json({
      product: {
        id: product,
        name: productDetails ? productDetails.name : "Unknown Product",
      },
      analyzedPeriod: {
        startDate,
        endDate,
        days,
      },
      marketPrices: averagePrices,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 16️⃣ Compare Market Prices
// =========================
export const compareMarketPrices = async (req, res) => {
  try {
    const { product } = req.query;

    if (!product) {
      return res.status(400).json({ message: 'Product is required' });
    }

    // Ensure product ID is properly cast to ObjectId
    const productId = mongoose.Types.ObjectId.isValid(product) ? new mongoose.Types.ObjectId(product) : null;

    if (!productId) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Fetch prices for the product across different markets
    const marketPrices = await Price.find({ product: productId }).populate('market', 'name location');

    if (!marketPrices.length) {
      return res.status(404).json({ message: 'No price data found for this product' });
    }

    res.status(200).json(marketPrices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 17️⃣ Get Price Volatility
// =========================
export const getPriceVolatility = async (req, res) => {
  try {
    const { product, market, days = 30 } = req.query

    if (!product || !market) {
      return res.status(400).json({ message: "Product and market are required" })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number(days))

    // Get historical prices directly from the Price collection
    const prices = await Price.find({
      product,
      market,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 })

    if (prices.length < 2) {
      return res.status(400).json({ message: "Insufficient data for volatility calculation" })
    }

    // Calculate volatility
    const volatility = calculateVolatility(prices)

    // Get product and market details
    const productDetails = await Product.findById(product)
    const marketDetails = await Market.findById(market)

    res.status(200).json({
      product: {
        id: product,
        name: productDetails ? productDetails.name : "Unknown Product",
      },
      market: {
        id: market,
        name: marketDetails ? marketDetails.name : "Unknown Market",
      },
      volatility,
      analyzedPeriod: {
        startDate,
        endDate,
        days,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 18️⃣ Get Trending Products
// =========================
export const getTrendingProducts = async (req, res) => {
  try {
    const { days = 30, limit = 10 } = req.query

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number(days))

    // Find products with the most significant price changes
    // This now uses the Price collection directly instead of historicalPrices
    const trendingProducts = await Price.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      {
        $sort: { date: 1 }, // Sort by date ascending to get first and last prices correctly
      },
      {
        $group: {
          _id: "$product",
          prices: { $push: "$price" },
          dates: { $push: "$date" },
          priceCount: { $sum: 1 },
        },
      },
      {
        $project: {
          productId: "$_id",
          firstPrice: { $arrayElemAt: ["$prices", 0] },
          lastPrice: { $arrayElemAt: ["$prices", -1] },
          firstDate: { $arrayElemAt: ["$dates", 0] },
          lastDate: { $arrayElemAt: ["$dates", -1] },
          priceCount: 1,
        },
      },
      {
        $project: {
          productId: 1,
          firstPrice: 1,
          lastPrice: 1,
          firstDate: 1,
          lastDate: 1,
          priceChange: { $subtract: ["$lastPrice", "$firstPrice"] },
          percentChange: {
            $multiply: [{ $divide: [{ $subtract: ["$lastPrice", "$firstPrice"] }, "$firstPrice"] }, 100],
          },
          priceCount: 1,
        },
      },
      { $match: { priceCount: { $gte: 2 } } }, // Ensure we have at least 2 price points
      { $sort: { percentChange: -1 } }, // Sort by highest percentage change
      { $limit: Number(limit) },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 0,
          productId: 1,
          productName: "$productDetails.name",
          category: "$productDetails.category",
          priceChange: 1,
          percentChange: 1,
          trend: {
            $cond: {
              if: { $gt: ["$percentChange", 0] },
              then: "increasing",
              else: {
                $cond: {
                  if: { $lt: ["$percentChange", 0] },
                  then: "decreasing",
                  else: "stable",
                },
              },
            },
          },
        },
      },
    ])

    res.status(200).json({
      analyzedPeriod: {
        startDate,
        endDate,
        days,
      },
      trendingProducts,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 19️⃣ Get Product Trend
// =========================
export const getProductTrend = async (req, res) => {
  try {
    const { product, market, days = 30 } = req.query

    if (!product) {
      return res.status(400).json({ message: "Product is required" })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number(days))

    // Build the query object
    const query = {
      product,
      date: { $gte: startDate, $lte: endDate },
    }

    // Only add market to query if it's not "all"
    if (market && market !== "all") {
      query.market = market
    }

    // Get historical prices across all markets or specific market
    const prices = await Price.find(query).sort({ date: 1 }).populate("market", "name location region")

    if (prices.length < 2) {
      return res.status(400).json({ message: "Insufficient data for trend analysis" })
    }

    // Detect trend
    const trend = detectPriceTrend(prices, Number(days))

    // Get product details
    const productDetails = await Product.findById(product)

    res.status(200).json({
      product: {
        id: product,
        name: productDetails ? productDetails.name : "Unknown Product",
        category: productDetails ? productDetails.category : "Unknown Category",
      },
      market: market === "all" ? "All Markets" : market,
      trend,
      analyzedPeriod: {
        startDate,
        endDate,
        days,
      },
      prices: prices.map((p) => ({
        date: p.date,
        price: p.price,
        market: p.market
          ? {
              id: p.market._id,
              name: p.market.name,
              region: p.market.region || "Unknown",
            }
          : "Unknown Market",
      })),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 2️⃣0️⃣ Get Price Summary
// =========================
export const getPriceSummary = async (req, res) => {
  try {
    const { productId } = req.params

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" })
    }

    // Get product details
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Get latest price across all markets
    const latestPrice = await Price.findOne({ product: productId }).sort({ date: -1 }).populate("market", "name")

    // Get price statistics
    const priceStats = await Price.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          priceCount: { $sum: 1 },
        },
      },
    ])

    // Get price trend for the last 30 days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const recentPrices = await Price.find({
      product: productId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 })

    const trend = recentPrices.length >= 2 ? detectPriceTrend(recentPrices, 30) : null

    res.status(200).json({
      product: {
        id: product._id,
        name: product.name,
        category: product.category,
      },
      currentPrice: latestPrice
        ? {
            price: latestPrice.price,
            date: latestPrice.date,
            market: latestPrice.market
              ? {
                  id: latestPrice.market._id,
                  name: latestPrice.market.name,
                }
              : null,
          }
        : null,
      statistics:
        priceStats.length > 0
          ? {
              averagePrice: priceStats[0].avgPrice,
              minPrice: priceStats[0].minPrice,
              maxPrice: priceStats[0].maxPrice,
              priceRange: priceStats[0].maxPrice - priceStats[0].minPrice,
              dataPoints: priceStats[0].priceCount,
            }
          : null,
      trend: trend,
      lastUpdated: new Date(),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 2️⃣1️⃣ Analyze Seasonal Prices
// =========================
export const analyzeSeasonalPrices = async (req, res) => {
  try {
    const { product, market, days = 365 } = req.query

    if (!product) {
      return res.status(400).json({ message: "Product is required" })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number(days))

    // Build the query object
    const query = {
      product,
      date: { $gte: startDate, $lte: endDate },
    }

    // Only add market to query if it's not "all"
    if (market && market !== "all") {
      query.market = market
    }

    // Get historical prices
    const prices = await Price.find(query).sort({ date: 1 })

    if (prices.length < 30) {
      return res.status(400).json({
        message: "Insufficient data for seasonality analysis",
        required: 30,
        available: prices.length,
      })
    }

    // Detect seasonality
    const seasonality = detectSeasonality(prices)

    // Get product and market details
    const productDetails = await Product.findById(product)
    let marketDetails = null

    if (market && market !== "all") {
      marketDetails = await Market.findById(market)
    }

    res.status(200).json({
      product: {
        id: product,
        name: productDetails ? productDetails.name : "Unknown Product",
      },
      market:
        market === "all"
          ? { id: "all", name: "All Markets" }
          : {
              id: market,
              name: marketDetails ? marketDetails.name : "Unknown Market",
            },
      seasonality,
      analyzedPeriod: {
        startDate,
        endDate,
        days,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 2️⃣2️⃣ Analyze Product Correlations
// =========================
export const analyzeCorrelations = async (req, res) => {
  try {
    const { market, products, days = 90 } = req.query

    if (!market) {
      return res.status(400).json({ message: "Market is required" })
    }

    // If specific products are provided, use them;
    let productIds = []
    if (products) {
      productIds = products.split(",")
    } else {
      // Get all products with prices in this market
      const marketPrices = await Price.find({ market }).distinct("product")
      productIds = marketPrices.map((id) => id.toString())
    }

    if (productIds.length < 2) {
      return res.status(400).json({ message: "At least 2 products are required for correlation analysis" })
    }

    // Get product correlations
    const correlations = await analyzeProductCorrelations(market, Number(days))

    res.status(200).json(correlations)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 2️⃣3️⃣ Analyze Regional Price Disparities
// =========================
export const analyzeRegionalPrices = async (req, res) => {
  try {
    const { product, regions: regionParam, days = 30 } = req.query

    if (!product) {
      return res.status(400).json({ message: "Product is required" })
    }

    // If specific regions are provided, use them; otherwise analyze all regions
    let regionList = []
    if (regionParam) {
      regionList = regionParam.split(",")
    } else {
      // Get all regions with prices for this product
      const markets = await Market.find().distinct("region")
      regionList = markets
    }

    if (regionList.length < 2) {
      return res.status(400).json({ message: "At least 2 regions are required for regional analysis" })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number(days))

    // Get all markets in the specified regions
    const markets = await Market.find({ region: { $in: regionList } })
    const marketIds = markets.map((m) => m._id)

    // Get prices for the product in these markets
    const prices = await Price.find({
      product,
      market: { $in: marketIds },
      date: { $gte: startDate, $lte: endDate },
    })
      .populate("market", "name location region")
      .sort({ date: -1 })

    if (prices.length === 0) {
      return res.status(400).json({ message: "No price data found for the specified product and regions" })
    }

    // Group prices by region
    const regionPrices = {}

    prices.forEach((price) => {
      const region = price.market.region

      if (!regionPrices[region]) {
        regionPrices[region] = []
      }

      regionPrices[region].push({
        price: price.price,
        date: price.date,
        market: {
          id: price.market._id,
          name: price.market.name,
          location: price.market.location,
        },
      })
    })

    // Calculate statistics for each region
    const regionStats = {}

    for (const region in regionPrices) {
      const regionData = regionPrices[region]
      const priceValues = regionData.map((p) => p.price)

      regionStats[region] = {
        avgPrice: priceValues.reduce((a, b) => a + b, 0) / priceValues.length,
        minPrice: Math.min(...priceValues),
        maxPrice: Math.max(...priceValues),
        priceRange: Math.max(...priceValues) - Math.min(...priceValues),
        dataPoints: priceValues.length,
        markets: [...new Set(regionData.map((p) => p.market.name))],
      }
    }

    // Calculate overall average price
    const allPrices = prices.map((p) => p.price)
    const overallAvg = allPrices.reduce((a, b) => a + b, 0) / allPrices.length

    // Calculate price index for each region (relative to overall average)
    for (const region in regionStats) {
      regionStats[region].priceIndex = (regionStats[region].avgPrice / overallAvg) * 100
    }

    // Find significant price differences between regions
    const regionDifferences = []
    const regionNames = Object.keys(regionStats)

    for (let i = 0; i < regionNames.length; i++) {
      for (let j = i + 1; j < regionNames.length; j++) {
        const region1 = regionNames[i]
        const region2 = regionNames[j]

        const priceDiff = Math.abs(regionStats[region1].avgPrice - regionStats[region2].avgPrice)
        const percentDiff = (priceDiff / Math.min(regionStats[region1].avgPrice, regionStats[region2].avgPrice)) * 100

        if (percentDiff > 5) {
          // 5% difference threshold
          regionDifferences.push({
            region1,
            region2,
            priceDifference: priceDiff,
            percentageDifference: percentDiff,
            cheaperRegion: regionStats[region1].avgPrice < regionStats[region2].avgPrice ? region1 : region2,
          })
        }
      }
    }

    // Sort differences by percentage difference
    regionDifferences.sort((a, b) => b.percentageDifference - a.percentageDifference)

    // Get product details
    const productDetails = await Product.findById(product)

    res.status(200).json({
      product: {
        id: product,
        name: productDetails ? productDetails.name : "Unknown Product",
        category: productDetails ? productDetails.category : "Unknown Category",
      },
      analyzedPeriod: {
        startDate,
        endDate,
        days,
      },
      overallAverage: overallAvg,
      regionStats,
      regionDifferences,
      lastUpdated: new Date(),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 2️⃣4️⃣ Generate Market Report
// =========================
export const generateMarketReport = async (req, res) => {
  try {
    const { market, days = 30 } = req.query

    if (!market) {
      return res.status(400).json({ message: "Market is required" })
    }

    // Generate comprehensive market report
    const report = await generateMarketReportUtil(market, Number(days))

    res.status(200).json(report)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// =========================
// 2️⃣5️⃣ Schedule Regular Price Reports
// =========================
export const scheduleReport = async (req, res) => {
  try {
    const { userId, marketId, frequency, email } = req.body

    if (!userId || !marketId || !frequency || !email) {
      return res.status(400).json({ message: "User ID, market ID, frequency, and email are required" })
    }

    // Validate frequency
    const validFrequencies = ["daily", "weekly", "monthly"]
    if (!validFrequencies.includes(frequency)) {
      return res.status(400).json({ message: `Invalid frequency. Must be one of: ${validFrequencies.join(", ")}` })
    }

    // This would typically create a scheduled report in a database
    // For now, we'll just return a success message
    res.status(200).json({
      message: "Report scheduled successfully",
      schedule: {
        userId,
        marketId,
        frequency,
        email,
        nextReportDate: calculateNextReportDate(frequency),
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Helper function to calculate next report date
const calculateNextReportDate = (frequency) => {
  const now = new Date()

  switch (frequency) {
    case "daily":
      now.setDate(now.getDate() + 1)
      break
    case "weekly":
      now.setDate(now.getDate() + 7)
      break
    case "monthly":
      now.setMonth(now.getMonth() + 1)
      break
  }

  return now
}
