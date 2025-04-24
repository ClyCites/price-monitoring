/**
 * Analyzes market trends across multiple products
 * @param {String} marketId - Market ID to analyze
 * @param {Number} days - Number of days to analyze
 * @returns {Object} Market trend analysis
 */
export const analyzeMarketTrends = async (marketId, days = 30) => {
    const Price = await import("../models/Price.js").then((module) => module.default)
    const Product = await import("../models/Product.js").then((module) => module.default)
  
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
  
    // Get all prices for the market within the date range
    const prices = await Price.find({
      market: marketId,
      date: { $gte: startDate, $lte: endDate },
    }).populate("product", "name category")
  
    if (prices.length === 0) {
      return {
        success: false,
        message: "No price data found for the specified market and time period",
      }
    }
  
    // Group prices by product
    const productPrices = {}
  
    prices.forEach((price) => {
      const productId = price.product._id.toString()
  
      if (!productPrices[productId]) {
        productPrices[productId] = {
          productId,
          productName: price.product.name,
          category: price.product.category,
          prices: [],
        }
      }
  
      productPrices[productId].prices.push({
        date: price.date,
        price: price.price,
      })
    })
  
    // Analyze trend for each product
    const productTrends = []
  
    for (const productId in productPrices) {
      const product = productPrices[productId]
  
      // Sort prices by date
      const sortedPrices = [...product.prices].sort((a, b) => new Date(a.date) - new Date(b.date))
  
      if (sortedPrices.length < 2) {
        continue // Skip products with insufficient data
      }
  
      // Calculate price change
      const firstPrice = sortedPrices[0].price
      const lastPrice = sortedPrices[sortedPrices.length - 1].price
      const priceChange = lastPrice - firstPrice
      const percentChange = (priceChange / firstPrice) * 100
  
      // Calculate volatility
      const priceValues = sortedPrices.map((p) => p.price)
      const mean = priceValues.reduce((a, b) => a + b, 0) / priceValues.length
      const variance = priceValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / priceValues.length
      const volatility = Math.sqrt(variance) / mean
  
      productTrends.push({
        productId,
        productName: product.productName,
        category: product.category,
        firstPrice,
        lastPrice,
        priceChange,
        percentChange,
        volatility,
        trend:
          percentChange > 5
            ? "strongly_increasing"
            : percentChange > 0
              ? "increasing"
              : percentChange > -5
                ? "decreasing"
                : "strongly_decreasing",
      })
    }
  
    // Sort products by percent change
    productTrends.sort((a, b) => b.percentChange - a.percentChange)
  
    // Calculate overall market trend
    const overallTrend = calculateOverallMarketTrend(productTrends)
  
    // Group trends by category
    const categoryTrends = {}
  
    productTrends.forEach((product) => {
      if (!categoryTrends[product.category]) {
        categoryTrends[product.category] = {
          category: product.category,
          products: [],
          averageChange: 0,
        }
      }
  
      categoryTrends[product.category].products.push(product)
    })
  
    // Calculate average change for each category
    for (const category in categoryTrends) {
      const products = categoryTrends[category].products
      const totalChange = products.reduce((sum, product) => sum + product.percentChange, 0)
      categoryTrends[category].averageChange = totalChange / products.length
      categoryTrends[category].trend =
        categoryTrends[category].averageChange > 5
          ? "strongly_increasing"
          : categoryTrends[category].averageChange > 0
            ? "increasing"
            : categoryTrends[category].averageChange > -5
              ? "decreasing"
              : "strongly_decreasing"
    }
  
    // Generate market insights
    const insights = generateMarketInsights(productTrends, categoryTrends, overallTrend)
  
    return {
      success: true,
      marketId,
      analyzedPeriod: {
        startDate,
        endDate,
        days,
      },
      overallTrend,
      productTrends,
      categoryTrends,
      insights,
      analysisDate: new Date(),
    }
  }
  
  /**
   * Calculates overall market trend
   * @param {Array} productTrends - Array of product trend objects
   * @returns {Object} Overall market trend
   */
  const calculateOverallMarketTrend = (productTrends) => {
    if (productTrends.length === 0) {
      return {
        direction: "unknown",
        percentChange: 0,
        confidence: 0,
      }
    }
  
    // Calculate weighted average of percent changes (weighted by price)
    let weightedSum = 0
    let totalWeight = 0
  
    productTrends.forEach((product) => {
      const weight = product.lastPrice // Use last price as weight
      weightedSum += product.percentChange * weight
      totalWeight += weight
    })
  
    const averageChange = totalWeight > 0 ? weightedSum / totalWeight : 0
  
    // Calculate consistency of trend direction
    const increasingCount = productTrends.filter((p) => p.percentChange > 0).length
    const decreasingCount = productTrends.filter((p) => p.percentChange < 0).length
    const consistency = Math.max(increasingCount, decreasingCount) / productTrends.length
  
    // Determine trend direction
    let direction
    if (Math.abs(averageChange) < 1) {
      direction = "stable"
    } else if (averageChange > 5) {
      direction = "strongly_increasing"
    } else if (averageChange > 0) {
      direction = "increasing"
    } else if (averageChange > -5) {
      direction = "decreasing"
    } else {
      direction = "strongly_decreasing"
    }
  
    return {
      direction,
      percentChange: averageChange,
      consistency,
      confidence: consistency * 0.7 + 0.3, // Base confidence on consistency with a minimum of 0.3
    }
  }
  
  /**
   * Generates market insights
   * @param {Array} productTrends - Array of product trend objects
   * @param {Object} categoryTrends - Object with category trends
   * @param {Object} overallTrend - Overall market trend
   * @returns {Array} Market insights
   */
  const generateMarketInsights = (productTrends, categoryTrends, overallTrend) => {
    const insights = []
  
    // Overall market trend insight
    if (overallTrend.direction === "strongly_increasing") {
      insights.push({
        type: "market_trend",
        importance: "high",
        insight: `The market is showing a strong upward trend with an average price increase of ${overallTrend.percentChange.toFixed(2)}%.`,
      })
    } else if (overallTrend.direction === "strongly_decreasing") {
      insights.push({
        type: "market_trend",
        importance: "high",
        insight: `The market is showing a strong downward trend with an average price decrease of ${Math.abs(overallTrend.percentChange).toFixed(2)}%.`,
      })
    } else if (overallTrend.direction === "stable") {
      insights.push({
        type: "market_trend",
        importance: "medium",
        insight: `The market is relatively stable with an average price change of ${overallTrend.percentChange.toFixed(2)}%.`,
      })
    }
  
    // Category insights
    const categories = Object.values(categoryTrends).sort((a, b) => Math.abs(b.averageChange) - Math.abs(a.averageChange))
  
    if (categories.length > 0) {
      const topCategory = categories[0]
  
      if (Math.abs(topCategory.averageChange) > 10) {
        insights.push({
          type: "category_trend",
          importance: "high",
          insight: `The ${topCategory.category} category is ${topCategory.averageChange > 0 ? "increasing" : "decreasing"} significantly with an average change of ${Math.abs(topCategory.averageChange).toFixed(2)}%.`,
        })
      }
  
      // Check for diverging categories
      if (categories.length > 1) {
        const secondCategory = categories[1]
  
        if (
          Math.sign(topCategory.averageChange) !== Math.sign(secondCategory.averageChange) &&
          Math.abs(topCategory.averageChange) > 5 &&
          Math.abs(secondCategory.averageChange) > 5
        ) {
          insights.push({
            type: "category_divergence",
            importance: "medium",
            insight: `There's a significant divergence between ${topCategory.category} (${topCategory.averageChange > 0 ? "+" : ""}${topCategory.averageChange.toFixed(2)}%) and ${secondCategory.category} (${secondCategory.averageChange > 0 ? "+" : ""}${secondCategory.averageChange.toFixed(2)}%).`,
          })
        }
      }
    }
  
    // Product insights
    if (productTrends.length > 0) {
      // Most increasing product
      const topIncreasing = productTrends
        .filter((p) => p.percentChange > 0)
        .sort((a, b) => b.percentChange - a.percentChange)[0]
  
      if (topIncreasing && topIncreasing.percentChange > 10) {
        insights.push({
          type: "product_increase",
          importance: "medium",
          insight: `${topIncreasing.productName} has shown the highest price increase at ${topIncreasing.percentChange.toFixed(2)}%.`,
        })
      }
  
      // Most decreasing product
      const topDecreasing = productTrends
        .filter((p) => p.percentChange < 0)
        .sort((a, b) => a.percentChange - b.percentChange)[0]
  
      if (topDecreasing && topDecreasing.percentChange < -10) {
        insights.push({
          type: "product_decrease",
          importance: "medium",
          insight: `${topDecreasing.productName} has shown the highest price decrease at ${topDecreasing.percentChange.toFixed(2)}%.`,
        })
      }
  
      // Most volatile product
      const mostVolatile = [...productTrends].sort((a, b) => b.volatility - a.volatility)[0]
  
      if (mostVolatile && mostVolatile.volatility > 0.2) {
        insights.push({
          type: "product_volatility",
          importance: "low",
          insight: `${mostVolatile.productName} shows high price volatility, which may indicate supply or demand instability.`,
        })
      }
    }
  
    return insights
  }
  
  /**
   * Compares prices across different markets
   * @param {String} productId - Product ID to compare
   * @param {Array} marketIds - Array of market IDs to compare
   * @param {Number} days - Number of days to analyze
   * @returns {Object} Market comparison
   */
  export const compareMarketPrices = async (productId, marketIds, days = 30) => {
    const Price = await import("../models/Price.js").then((module) => module.default)
    const Market = await import("../models/Market.js").then((module) => module.default)
    const Product = await import("../models/Product.js").then((module) => module.default)
  
    // Validate product
    const product = await Product.findById(productId)
    if (!product) {
      return {
        success: false,
        message: "Product not found",
      }
    }
  
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
  
    // Get markets
    const markets = await Market.find({ _id: { $in: marketIds } })
    const marketMap = {}
    markets.forEach((market) => {
      marketMap[market._id.toString()] = market
    })
  
    // Get prices for the product in each market
    const prices = await Price.find({
      product: productId,
      market: { $in: marketIds },
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 })
  
    if (prices.length === 0) {
      return {
        success: false,
        message: "No price data found for the specified product and markets",
      }
    }
  
    // Group prices by market
    const marketPrices = {}
  
    prices.forEach((price) => {
      const marketId = price.market.toString()
  
      if (!marketPrices[marketId]) {
        const market = marketMap[marketId]
  
        marketPrices[marketId] = {
          marketId,
          marketName: market ? market.name : "Unknown Market",
          location: market ? market.location : "Unknown",
          region: market ? market.region : "Unknown",
          prices: [],
        }
      }
  
      marketPrices[marketId].prices.push({
        date: price.date,
        price: price.price,
      })
    })
  
    // Calculate statistics for each market
    const marketStats = []
  
    for (const marketId in marketPrices) {
      const market = marketPrices[marketId]
      const prices = market.prices.map((p) => p.price)
  
      if (prices.length === 0) continue
  
      // Calculate basic statistics
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
  
      // Calculate trend
      const sortedPrices = [...market.prices].sort((a, b) => new Date(a.date) - new Date(b.date))
      let trend = "stable"
      let percentChange = 0
  
      if (sortedPrices.length > 1) {
        const firstPrice = sortedPrices[0].price
        const lastPrice = sortedPrices[sortedPrices.length - 1].price
        const priceChange = lastPrice - firstPrice
        percentChange = (priceChange / firstPrice) * 100
  
        if (percentChange > 5) {
          trend = "increasing"
        } else if (percentChange < -5) {
          trend = "decreasing"
        }
      }
  
      marketStats.push({
        marketId,
        marketName: market.marketName,
        location: market.location,
        region: market.region,
        minPrice,
        maxPrice,
        avgPrice,
        priceRange: maxPrice - minPrice,
        dataPoints: prices.length,
        trend,
        percentChange,
      })
    }
  
    // Sort markets by average price
    marketStats.sort((a, b) => a.avgPrice - b.avgPrice)
  
    // Calculate price differences between markets
    const priceDifferences = []
  
    for (let i = 0; i < marketStats.length; i++) {
      for (let j = i + 1; j < marketStats.length; j++) {
        const market1 = marketStats[i]
        const market2 = marketStats[j]
  
        const priceDiff = market2.avgPrice - market1.avgPrice
        const percentDiff = (priceDiff / market1.avgPrice) * 100
  
        priceDifferences.push({
          market1: {
            id: market1.marketId,
            name: market1.marketName,
          },
          market2: {
            id: market2.marketId,
            name: market2.marketName,
          },
          priceDifference: priceDiff,
          percentageDifference: percentDiff,
        })
      }
    }
  
    // Sort differences by percentage difference
    priceDifferences.sort((a, b) => b.percentageDifference - a.percentageDifference)
  
    // Generate insights
    const insights = []
  
    if (marketStats.length > 1) {
      const cheapestMarket = marketStats[0]
      const expensiveMarket = marketStats[marketStats.length - 1]
  
      insights.push({
        type: "price_comparison",
        importance: "high",
        insight: `${product.name} is cheapest in ${cheapestMarket.marketName} (${cheapestMarket.avgPrice.toFixed(2)}) and most expensive in ${expensiveMarket.marketName} (${expensiveMarket.avgPrice.toFixed(2)}).`,
      })
  
      if (priceDifferences.length > 0 && priceDifferences[0].percentageDifference > 10) {
        const topDiff = priceDifferences[0]
  
        insights.push({
          type: "arbitrage_opportunity",
          importance: "high",
          insight: `There's a significant price difference of ${topDiff.percentageDifference.toFixed(2)}% for ${product.name} between ${topDiff.market1.name} and ${topDiff.market2.name}, which may present arbitrage opportunities.`,
        })
      }
    }
  
    // Check for regional patterns
    const regionStats = {}
  
    marketStats.forEach((market) => {
      if (!regionStats[market.region]) {
        regionStats[market.region] = {
          region: market.region,
          markets: [],
          prices: [],
        }
      }
  
      regionStats[market.region].markets.push(market)
      regionStats[market.region].prices.push(market.avgPrice)
    })
  
    for (const region in regionStats) {
      const stats = regionStats[region]
  
      if (stats.prices.length > 0) {
        const avgPrice = stats.prices.reduce((a, b) => a + b, 0) / stats.prices.length
        stats.avgPrice = avgPrice
      }
    }
  
    const sortedRegions = Object.values(regionStats).sort((a, b) => a.avgPrice - b.avgPrice)
  
    if (sortedRegions.length > 1) {
      const cheapestRegion = sortedRegions[0]
      const expensiveRegion = sortedRegions[sortedRegions.length - 1]
  
      if (expensiveRegion.avgPrice > cheapestRegion.avgPrice * 1.1) {
        insights.push({
          type: "regional_pattern",
          importance: "medium",
          insight: `${product.name} is generally cheaper in the ${cheapestRegion.region} region compared to the ${expensiveRegion.region} region.`,
        })
      }
    }
  
    return {
      success: true,
      product: {
        id: product._id,
        name: product.name,
        category: product.category,
      },
      analyzedPeriod: {
        startDate,
        endDate,
        days,
      },
      marketStats,
      priceDifferences,
      regionComparison: sortedRegions,
      insights,
      analysisDate: new Date(),
    }
  }
  
  /**
   * Analyzes product correlations in a market
   * @param {String} marketId - Market ID to analyze
   * @param {Number} days - Number of days to analyze
   * @returns {Object} Product correlation analysis
   */
  export const analyzeProductCorrelations = async (marketId, days = 90) => {
    const Price = await import("../models/Price.js").then((module) => module.default)
    const Product = await import("../models/Product.js").then((module) => module.default)
  
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
  
    // Get all prices for the market within the date range
    const prices = await Price.find({
      market: marketId,
      date: { $gte: startDate, $lte: endDate },
    }).populate("product", "name category")
  
    if (prices.length === 0) {
      return {
        success: false,
        message: "No price data found for the specified market and time period",
      }
    }
  
    // Group prices by product
    const productPrices = {}
  
    prices.forEach((price) => {
      const productId = price.product._id.toString()
  
      if (!productPrices[productId]) {
        productPrices[productId] = {
          productId,
          productName: price.product.name,
          category: price.product.category,
          prices: [],
        }
      }
  
      productPrices[productId].prices.push({
        date: price.date,
        price: price.price,
      })
    })
  
    // Filter products with sufficient data
    const productIds = Object.keys(productPrices).filter((id) => productPrices[id].prices.length >= 10)
  
    if (productIds.length < 2) {
      return {
        success: false,
        message: "Insufficient data for correlation analysis. Need at least 2 products with 10+ price points each.",
      }
    }
  
    // Align dates across products
    const alignedPrices = alignProductPrices(productIds.map((id) => productPrices[id]))
  
    // Calculate correlation matrix
    const correlationMatrix = {}
  
    for (let i = 0; i < productIds.length; i++) {
      const id1 = productIds[i]
      correlationMatrix[id1] = {}
  
      for (let j = 0; j < productIds.length; j++) {
        const id2 = productIds[j]
  
        if (i === j) {
          correlationMatrix[id1][id2] = 1 // Self-correlation is always 1
        } else if (j > i) {
          // Calculate correlation
          const correlation = calculateCorrelation(
            alignedPrices[id1].map((p) => p.price),
            alignedPrices[id2].map((p) => p.price),
          )
  
          correlationMatrix[id1][id2] = correlation
          correlationMatrix[id2][id1] = correlation // Matrix is symmetric
        }
      }
    }
  
    // Find highly correlated and inversely correlated product pairs
    const correlatedPairs = []
    const inversePairs = []
  
    for (let i = 0; i < productIds.length; i++) {
      for (let j = i + 1; j < productIds.length; j++) {
        const id1 = productIds[i]
        const id2 = productIds[j]
        const correlation = correlationMatrix[id1][id2]
  
        if (correlation > 0.7) {
          correlatedPairs.push({
            product1: {
              id: id1,
              name: productPrices[id1].productName,
            },
            product2: {
              id: id2,
              name: productPrices[id2].productName,
            },
            correlation,
            relationship: "complementary",
          })
        } else if (correlation < -0.7) {
          inversePairs.push({
            product1: {
              id: id1,
              name: productPrices[id1].productName,
            },
            product2: {
              id: id2,
              name: productPrices[id2].productName,
            },
            correlation,
            relationship: "substitute",
          })
        }
      }
    }
  
    // Generate insights
    const insights = []
  
    if (correlatedPairs.length > 0) {
      correlatedPairs.sort((a, b) => b.correlation - a.correlation)
  
      insights.push({
        type: "complementary_products",
        importance: "high",
        insight: `${correlatedPairs[0].product1.name} and ${correlatedPairs[0].product2.name} show a strong positive correlation (${correlatedPairs[0].correlation.toFixed(2)}), suggesting they may be complementary products.`,
      })
    }
  
    if (inversePairs.length > 0) {
      inversePairs.sort((a, b) => a.correlation - b.correlation)
  
      insights.push({
        type: "substitute_products",
        importance: "high",
        insight: `${inversePairs[0].product1.name} and ${inversePairs[0].product2.name} show a strong negative correlation (${inversePairs[0].correlation.toFixed(2)}), suggesting they may be substitute products.`,
      })
    }
  
    // Check for category correlations
    const categoryCorrelations = analyzeCategoryCorrelations(productPrices, correlationMatrix)
  
    if (categoryCorrelations.strongPairs.length > 0) {
      const topPair = categoryCorrelations.strongPairs[0]
  
      insights.push({
        type: "category_correlation",
        importance: "medium",
        insight: `Products in the ${topPair.category1} category tend to correlate with products in the ${topPair.category2} category.`,
      })
    }
  
    return {
      success: true,
      marketId,
      analyzedPeriod: {
        startDate,
        endDate,
        days,
      },
      productCorrelations: {
        matrix: correlationMatrix,
        positivelyCorrelated: correlatedPairs,
        negativelyCorrelated: inversePairs,
      },
      categoryCorrelations,
      insights,
      analysisDate: new Date(),
    }
  }
  
  /**
   * Aligns product prices by date
   * @param {Array} products - Array of product objects with prices
   * @returns {Object} Aligned prices by product ID
   */
  const alignProductPrices = (products) => {
    // Get all unique dates
    const allDates = new Set()
  
    products.forEach((product) => {
      product.prices.forEach((price) => {
        allDates.add(price.date.toISOString().split("T")[0])
      })
    })
  
    const sortedDates = Array.from(allDates).sort()
  
    // Create date-indexed price maps for each product
    const productPriceMaps = {}
  
    products.forEach((product) => {
      productPriceMaps[product.productId] = {}
  
      product.prices.forEach((price) => {
        const dateStr = price.date.toISOString().split("T")[0]
        productPriceMaps[product.productId][dateStr] = price
      })
    })
  
    // Find common dates where all products have prices
    const commonDates = sortedDates.filter((date) => {
      return products.every((product) => productPriceMaps[product.productId][date])
    })
  
    // Create aligned price arrays
    const alignedPrices = {}
  
    products.forEach((product) => {
      alignedPrices[product.productId] = commonDates.map((date) => productPriceMaps[product.productId][date])
    })
  
    return alignedPrices
  }
  
  /**
   * Analyzes correlations between product categories
   * @param {Object} productPrices - Object with product prices
   * @param {Object} correlationMatrix - Product correlation matrix
   * @returns {Object} Category correlation analysis
   */
  const analyzeCategoryCorrelations = (productPrices, correlationMatrix) => {
    // Group products by category
    const categories = {}
  
    Object.keys(productPrices).forEach((productId) => {
      const category = productPrices[productId].category
  
      if (!categories[category]) {
        categories[category] = []
      }
  
      categories[category].push(productId)
    })
  
    // Calculate average correlation between categories
    const categoryPairs = []
    const categoryNames = Object.keys(categories)
  
    for (let i = 0; i < categoryNames.length; i++) {
      for (let j = i + 1; j < categoryNames.length; j++) {
        const category1 = categoryNames[i]
        const category2 = categoryNames[j]
  
        let totalCorrelation = 0
        let count = 0
  
        // Calculate average correlation between products in these categories
        categories[category1].forEach((productId1) => {
          categories[category2].forEach((productId2) => {
            const correlation = correlationMatrix[productId1][productId2]
            totalCorrelation += correlation
            count++
          })
        })
  
        const avgCorrelation = count > 0 ? totalCorrelation / count : 0
  
        categoryPairs.push({
          category1,
          category2,
          correlation: avgCorrelation,
          productPairs: count,
        })
      }
    }
  
    // Sort by absolute correlation
    categoryPairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
  
    // Find strongly correlated category pairs
    const strongPairs = categoryPairs.filter((pair) => Math.abs(pair.correlation) > 0.6)
  
    return {
      categoryPairs,
      strongPairs,
    }
  }
  
  /**
   * Calculates correlation between two arrays
   * @param {Array} x - First array
   * @param {Array} y - Second array
   * @returns {Number} Correlation coefficient
   */
  const calculateCorrelation = (x, y) => {
    if (x.length !== y.length || x.length === 0) {
      return 0
    }
  
    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0)
    const sumYY = y.reduce((acc, yi) => acc + yi * yi, 0)
  
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))
  
    if (denominator === 0) {
      return 0
    }
  
    return numerator / denominator
  }
  
  /**
   * Generates a comprehensive market report
   * @param {String} marketId - Market ID to analyze
   * @param {Number} days - Number of days to analyze
   * @returns {Object} Comprehensive market report
   */
  export const generateMarketReport = async (marketId, days = 30) => {
    // Get market trends
    const trends = await analyzeMarketTrends(marketId, days)
  
    if (!trends.success) {
      return trends // Return error if trend analysis failed
    }
  
    // Get product correlations
    const correlations = await analyzeProductCorrelations(marketId, days)
  
    // Combine insights
    const insights = [...(trends.insights || []), ...(correlations.success ? correlations.insights : [])]
  
    // Sort insights by importance
    insights.sort((a, b) => {
      const importanceOrder = { high: 0, medium: 1, low: 2 }
      return importanceOrder[a.importance] - importanceOrder[b.importance]
    })
  
    // Generate recommendations
    const recommendations = generateMarketRecommendations(trends, correlations)
  
    return {
      success: true,
      marketId,
      reportDate: new Date(),
      analyzedPeriod: {
        startDate: trends.analyzedPeriod.startDate,
        endDate: trends.analyzedPeriod.endDate,
        days,
      },
      summary: {
        overallTrend: trends.overallTrend,
        productCount: trends.productTrends.length,
        categoryCount: Object.keys(trends.categoryTrends).length,
        correlatedProductPairs: correlations.success ? correlations.productCorrelations.positivelyCorrelated.length : 0,
      },
      insights,
      recommendations,
      details: {
        trends,
        correlations: correlations.success ? correlations : { success: false },
      },
    }
  }
  
  /**
   * Generates market recommendations
   * @param {Object} trends - Market trends
   * @param {Object} correlations - Product correlations
   * @returns {Array} Recommendations
   */
  const generateMarketRecommendations = (trends, correlations) => {
    const recommendations = []
  
    // Recommendations based on overall trend
    if (trends.overallTrend.direction === "strongly_increasing") {
      recommendations.push({
        type: "purchasing",
        recommendation: "Consider accelerating purchases as prices are trending upward significantly.",
      })
    } else if (trends.overallTrend.direction === "strongly_decreasing") {
      recommendations.push({
        type: "purchasing",
        recommendation: "Consider delaying non-urgent purchases as prices are trending downward significantly.",
      })
    }
  
    // Recommendations based on category trends
    const categories = Object.values(trends.categoryTrends).sort((a, b) => b.averageChange - a.averageChange)
  
    if (categories.length > 0) {
      const increasingCategories = categories.filter((c) => c.averageChange > 5)
      const decreasingCategories = categories.filter((c) => c.averageChange < -5)
  
      if (increasingCategories.length > 0) {
        recommendations.push({
          type: "category_focus",
          recommendation: `Prioritize purchasing products in the ${increasingCategories.map((c) => c.category).join(", ")} categories before prices increase further.`,
        })
      }
  
      if (decreasingCategories.length > 0) {
        recommendations.push({
          type: "category_focus",
          recommendation: `Consider delaying purchases in the ${decreasingCategories.map((c) => c.category).join(", ")} categories to benefit from continuing price decreases.`,
        })
      }
    }
  
    // Recommendations based on product correlations
    if (correlations.success && correlations.productCorrelations.positivelyCorrelated.length > 0) {
      const topPair = correlations.productCorrelations.positivelyCorrelated[0]
  
      recommendations.push({
        type: "bundling",
        recommendation: `Consider bundling ${topPair.product1.name} and ${topPair.product2.name} in promotions as they show strong price correlation.`,
      })
    }
  
    if (correlations.success && correlations.productCorrelations.negativelyCorrelated.length > 0) {
      const topPair = correlations.productCorrelations.negativelyCorrelated[0]
  
      recommendations.push({
        type: "substitution",
        recommendation: `Monitor ${topPair.product1.name} and ${topPair.product2.name} as potential substitutes for each other based on their price movements.`,
      })
    }
  
    return recommendations
  }
  