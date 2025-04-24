import mongoose from 'mongoose';
import Price from '../models/Price.js';
import Product from '../models/Product.js';
import Market from '../models/Market.js';
import PriceAlert from '../models/PriceAlert.js';

export const addPrice = async (req, res) => {
  try {
    const { product, market, price, currency, date, productType, quantity, unit } = req.body;

    if (!product || !market || !price || !date || !productType || !quantity || !unit) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingProduct = await Product.findById(product);
    if (!existingProduct) return res.status(404).json({ message: 'Product not found' });

    const existingMarket = await Market.findById(market);
    if (!existingMarket) return res.status(404).json({ message: 'Market not found' });

    const newPrice = new Price({
      product,
      market,
      price,
      currency: currency || 'UGX',
      date,
      productType,
      quantity,
      unit,
      lastUpdated: new Date(),
      historicalPrices: []
    });

    await newPrice.save();
    res.status(201).json({ message: 'Price added successfully', price: newPrice });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPrices = async (req, res) => {
  try {
    const { product, market } = req.query;
    const query = {};
    if (product) query.product = product;
    if (market) query.market = market;

    const prices = await Price.find(query)
      .sort({ date: -1 })
      .populate('product', 'name category')
      .populate('market', 'name location region');

    res.status(200).json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPriceById = async (req, res) => {
  try {
    const price = await Price.findById(req.params.id)
      .populate('product', 'name category')
      .populate('market', 'name location region');

    if (!price) return res.status(404).json({ message: 'Price not found' });

    res.status(200).json(price);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePrice = async (req, res) => {
  try {
    const { product, market } = req.body;

    const price = await Price.findById(req.params.id);
    if (!price) return res.status(404).json({ message: 'Price not found' });

    if (product) {
      const existingProduct = await Product.findById(product);
      if (!existingProduct) return res.status(404).json({ message: 'Product not found' });
    }
    if (market) {
      const existingMarket = await Market.findById(market);
      if (!existingMarket) return res.status(404).json({ message: 'Market not found' });
    }

    Object.assign(price, req.body, { lastUpdated: new Date() });
    await price.save();
    res.status(200).json({ message: 'Price updated successfully', price });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePrice = async (req, res) => {
  try {
    const price = await Price.findById(req.params.id);
    if (!price) return res.status(404).json({ message: 'Price not found' });

    await price.deleteOne();
    res.status(200).json({ message: 'Price deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

export const getProductTrend = async (req, res) => {
  try {
    const { product } = req.query;
    const days = req.query.days ? parseInt(req.query.days) : 30;

    if (!product) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await Price.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(product),
          date: { $gte: startDate }
        }
      },
      {
        $sort: { date: 1 }
      },
      {
        $group: {
          _id: "$product",
          firstPrice: { $first: "$price" },
          latestPrice: { $last: "$price" },
          highestPrice: { $max: "$price" },
          lowestPrice: { $min: "$price" },
          prices: { $push: "$price" }
        }
      },
      {
        $project: {
          trendPercentage: {
            $multiply: [
              {
                $divide: [{ $subtract: ["$latestPrice", "$firstPrice"] }, "$firstPrice"]
              },
              100
            ]
          },
          trendDirection: {
            $cond: [
              { $gt: ["$trendPercentage", 0] },
              "increasing",
              { $cond: [{ $lt: ["$trendPercentage", 0] }, "decreasing", "stable"] }
            ]
          },
          highestPrice: 1,
          lowestPrice: 1,
          prices: 1
        }
      }
    ]);

    if (result.length === 0) {
      return res.status(200).json({ message: "Not enough data for trend analysis" });
    }

    const trendData = result[0];

    res.status(200).json({
      product,
      trendPercentage: trendData.trendPercentage.toFixed(2),
      trendDirection: trendData.trendDirection,
      highestPrice: trendData.highestPrice,
      lowestPrice: trendData.lowestPrice,
      prices: trendData.prices
    });
  } catch (error) {
    console.error("Error fetching product trend:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};




export const getTrendingProducts = async (req, res) => {
  try {
    // Parse the time range and calculate the date range
    const days = req.query.days ? parseInt(req.query.days) : 30;
    const rangeType = req.query.range || "days"; // 'days', 'weeks', 'months', 'years'
    let dateRange;

    switch (rangeType) {
      case "weeks":
        dateRange = Date.now() - (days * 7 * 24 * 60 * 60 * 1000);
        break;
      case "months":
        dateRange = Date.now() - (days * 30 * 24 * 60 * 60 * 1000);
        break;
      case "years":
        dateRange = Date.now() - (days * 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateRange = Date.now() - (days * 24 * 60 * 60 * 1000);
    }

    // Aggregate price trends for products
    const trendingProducts = await Price.aggregate([
      {
        $match: {
          date: { $gte: new Date(dateRange) }
        }
      },
      {
        $group: {
          _id: "$product",
          firstPrice: { $first: "$price" },
          latestPrice: { $last: "$price" }
        }
      },
      {
        $project: {
          productId: "$_id",
          trendPercentage: {
            $multiply: [
              {
                $divide: [{ $subtract: ["$latestPrice", "$firstPrice"] }, "$firstPrice"]
              },
              100
            ]
          },
          latestPrice: "$latestPrice"
        }
      },
      { $sort: { trendPercentage: -1 } },
      { $limit: 10 }
    ]);

    // Fetch product details and include more info such as category, description, image
    const productIds = trendingProducts.map((p) => p.productId);
    const products = await Product.find({ _id: { $in: productIds } }).select("name category description image");

    // Merge product details
    const response = trendingProducts.map((trend) => {
      const product = products.find((p) => p._id.toString() === trend.productId.toString());
      return {
        id: trend.productId,
        productName: product?.name || "Unknown",
        productCategory: product?.category || "Uncategorized",
        productDescription: product?.description || "No description available",
        currentPrice: trend.latestPrice || 0,
        trendPercentage: trend.trendPercentage.toFixed(2)
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching trending products:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// =========================
// 7️⃣ Predict Future Prices (AI Model Integration)
// =========================
export const predictPrice = async (req, res) => {
  try {
    const { product, market } = req.body;

    if (!product || !market) {
      return res.status(400).json({ message: 'Product and market are required' });
    }

    // Placeholder: Replace with AI model prediction logic
    const predictedPrice = Math.random() * 1000; 
    const predictionDate = new Date();

    res.status(200).json({ product, market, predictedPrice, predictionDate });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 8️⃣ Bulk Import Prices
// =========================
export const bulkImportPrices = async (req, res) => {
  try {
    const { prices } = req.body;
    if (!Array.isArray(prices) || prices.length === 0) {
      return res.status(400).json({ message: 'Invalid price data' });
    }

    // Validate each price entry
    for (const priceData of prices) {
      const { product, market, price, date, productType, quantity, unit } = priceData;

      if (!product || !market || !price || !date || !productType || !quantity || !unit) {
        return res.status(400).json({ message: 'All fields are required for each price entry' });
      }

      const existingProduct = await Product.findById(product);
      if (!existingProduct) return res.status(404).json({ message: `Product not found for ID: ${product}` });

      const existingMarket = await Market.findById(market);
      if (!existingMarket) return res.status(404).json({ message: `Market not found for ID: ${market}` });
    }

    await Price.insertMany(prices);
    res.status(201).json({ message: 'Prices imported successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 9️⃣ Get Historical Prices
// =========================
export const getHistoricalPrices = async (req, res) => {
  try {
    const { product, market, limit = 30 } = req.query;
    const query = { product, market };

    const historicalPrices = await Price.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.status(200).json(historicalPrices);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 🔟 Get Top Markets for a Product
// =========================
export const getTopMarketsForProduct = async (req, res) => {
  try {
    const { product } = req.query;
    if (!product) return res.status(400).json({ message: 'Product is required' });

    const markets = await Price.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(product) } },
      { 
        $group: { 
          _id: '$market', 
          avgPrice: { $avg: '$price' } 
        } 
      },
      { $sort: { avgPrice: -1 } }
    ]);

    res.status(200).json(markets);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 11️⃣ Set User Price Alerts
// =========================
export const setUserPriceAlerts = async (req, res) => {
  try {
    const { userId, product, market, priceThreshold } = req.body;

    if (!userId || !product || !market || priceThreshold === undefined) {
      return res.status(400).json({ message: 'User  ID, product, market, and price threshold are required' });
    }

    const existingAlert = await PriceAlert.findOne({ userId, product, market });
    if (existingAlert) {
      return res.status(400).json({ message: 'Price alert already exists for this product and market' });
    }

    const newAlert = new PriceAlert({
      userId,
      product,
      market,
      priceThreshold,
    });

    await newAlert.save();
    res.status(201).json({ message: 'Price alert set successfully', alert: newAlert });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 12️⃣ Check Price Alerts

export const checkPriceAlerts = async (req, res) => {
  try {
    const { userId } = req.query;

    // Step 1: Validate input
    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    // Step 2: Fetch all untriggered price alerts for the given user
    const alerts = await PriceAlert.find({ userId, alertTriggered: false });
    if (!alerts.length) {
      return res.status(200).json({ message: 'No active price alerts for this user' });
    }

    // Step 3: For each alert, check if the current price has reached the threshold
    const triggeredAlerts = [];
    for (const alert of alerts) {
      const { product, market, priceThreshold } = alert;

      // Fetch the most recent price for the product and market
      const currentPrice = await Price.findOne({ product, market }).sort({ date: -1 }); // Assuming price has a date field
      if (!currentPrice) {
        continue; // Skip if no price data found for this product and market
      }

      // Check if the current price is below or equal to the price threshold
      if (currentPrice.price <= priceThreshold) {
        alert.alertTriggered = true;
        await alert.save(); // Mark the alert as triggered
        triggeredAlerts.push(alert); // Add the triggered alert to the response array
      }
    }

    // Step 4: Send the response
    if (triggeredAlerts.length > 0) {
      return res.status(200).json({
        message: 'Price alerts checked and triggered',
        triggeredAlerts,
      });
    } else {
      return res.status(200).json({ message: 'No alerts triggered, prices are still above the threshold' });
    }
  } catch (error) {
    console.error('Error checking price alerts:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const getPriceSummary = async (req, res) => {
  const { productId } = req.params;  // Assuming productId is passed as a parameter in the URL

  try {
    // Fetch the product details by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Fetch the latest price for the product (latest price is the one with the most recent date)
    const latestPrice = await Price.findOne({ product: product._id })
      .sort({ date: -1 })  // Sort by date descending to get the latest price
      .limit(1);

    if (!latestPrice) {
      return res.status(404).json({ message: 'Price data not found for the product' });
    }

    // Calculate price change and price change percentage
    let priceChange = 0;
    let priceChangePercentage = 0;

    // Check if there are historical prices to calculate change
    if (latestPrice.historicalPrices.length > 1) {
      const previousPrice = latestPrice.historicalPrices[latestPrice.historicalPrices.length - 2].price;

      priceChange = latestPrice.price - previousPrice;
      priceChangePercentage = ((priceChange / previousPrice) * 100).toFixed(2);
    }

    // Prepare the response object (PriceSummary)
    const priceSummary = {
      product: product.name,
      currentPrice: latestPrice.price,
      priceChange: priceChange,
      priceChangePercentage: priceChangePercentage
    };

    // Send the response
    return res.status(200).json(priceSummary);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};



// =========================
// 13️⃣ Delete a Price Alert
// =========================
export const deletePriceAlert = async (req, res) => {
  try {
    const alert = await PriceAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Price alert not found' });

    await alert.deleteOne();
    res.status(200).json({ message: 'Price alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 14️⃣ Detect Price Anomalies (Fraud Detection)
// =========================
export const detectPriceAnomalies = async (req, res) => {
  try {
    // Placeholder logic for AI-based anomaly detection
    res.status(200).json({ message: 'Anomaly detection completed' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 15️⃣ Get Average Price Per Market
// =========================
export const getAveragePricePerMarket = async (req, res) => {
  try {
    const prices = await Price.aggregate([
      { $group: { _id: '$market', avgPrice: { $avg: '$price' } } }
    ]);

    res.status(200).json(prices);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
    const { product, market, days } = req.query;
    const pastDays = days ? parseInt(days) : 30;

    if (!product || !market) {
      return res.status(400).json({ message: 'Product and market are required' });
    }

    // Fetch price data for the past `days` days
    const historicalPrices = await Price.find({
      product,
      market,
      date: { $gte: new Date(Date.now() - pastDays * 24 * 60 * 60 * 1000) }
    }).sort({ date: 1 });

    if (historicalPrices.length < 2) {
      return res.status(200).json({ message: 'Not enough data for volatility analysis' });
    }

    const prices = historicalPrices.map(p => p.price);
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const standardDeviation = Math.sqrt(variance);

    res.status(200).json({
      product,
      market,
      volatility: standardDeviation.toFixed(2),
      historicalPrices
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};