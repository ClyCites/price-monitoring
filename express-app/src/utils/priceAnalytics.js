/**
 * Calculates moving average for price data
 * @param {Array} prices - Array of price objects with date and price
 * @param {Number} window - Window size for moving average
 * @returns {Array} Moving averages
 */
export const calculateMovingAverage = (prices, window = 7) => {
    if (!prices || prices.length < window) {
      return []
    }
  
    // Sort prices by date
    const sortedPrices = [...prices].sort((a, b) => new Date(a.date) - new Date(b.date))
  
    const movingAverages = []
  
    for (let i = window - 1; i < sortedPrices.length; i++) {
      const windowPrices = sortedPrices.slice(i - window + 1, i + 1)
      const sum = windowPrices.reduce((acc, p) => acc + p.price, 0)
      const average = sum / window
  
      movingAverages.push({
        date: sortedPrices[i].date,
        price: sortedPrices[i].price,
        movingAverage: average,
        windowSize: window,
      })
    }
  
    return movingAverages
  }
  
  /**
   * Detects price trends using linear regression
   * @param {Array} prices - Array of price objects with date and price
   * @param {Number} days - Number of days to analyze
   * @returns {Object} Trend information
   */
  export const detectPriceTrend = (prices, days = 30) => {
    if (!prices || prices.length < 2) {
      return { trend: "insufficient_data", slope: 0, confidence: 0 }
    }
  
    // Filter prices for the specified time period
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
  
    const filteredPrices = prices.filter((p) => new Date(p.date) >= cutoffDate)
  
    if (filteredPrices.length < 2) {
      return { trend: "insufficient_data", slope: 0, confidence: 0 }
    }
  
    // Sort prices by date
    const sortedPrices = [...filteredPrices].sort((a, b) => new Date(a.date) - new Date(b.date))
  
    // Prepare data for linear regression
    const x = sortedPrices.map((p, i) => i) // Use indices as x values
    const y = sortedPrices.map((p) => p.price)
  
    // Calculate linear regression
    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0)
  
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
  
    // Calculate R-squared (coefficient of determination)
    const yMean = sumY / n
    const ssTotal = y.reduce((acc, yi) => acc + Math.pow(yi - yMean, 2), 0)
    const ssResidual = y.reduce((acc, yi, i) => acc + Math.pow(yi - (intercept + slope * x[i]), 2), 0)
    const rSquared = 1 - ssResidual / ssTotal
  
    // Determine trend direction and strength
    let trend
    if (Math.abs(slope) < 0.001) {
      trend = "stable"
    } else if (slope > 0) {
      trend = rSquared > 0.7 ? "strongly_increasing" : "increasing"
    } else {
      trend = rSquared > 0.7 ? "strongly_decreasing" : "decreasing"
    }
  
    return {
      trend,
      slope,
      intercept,
      rSquared,
      startDate: sortedPrices[0].date,
      endDate: sortedPrices[sortedPrices.length - 1].date,
      startPrice: sortedPrices[0].price,
      endPrice: sortedPrices[sortedPrices.length - 1].price,
      percentChange:
        ((sortedPrices[sortedPrices.length - 1].price - sortedPrices[0].price) / sortedPrices[0].price) * 100,
      confidence: rSquared,
    }
  }
  
  /**
   * Detects seasonality in price data
   * @param {Array} prices - Array of price objects with date and price
   * @returns {Object} Seasonality information
   */
  export const detectSeasonality = (prices) => {
    if (!prices || prices.length < 30) {
      return { hasSeasonality: false, confidence: 0, patterns: [] }
    }
  
    // Sort prices by date
    const sortedPrices = [...prices].sort((a, b) => new Date(a.date) - new Date(b.date))
  
    // Check for weekly patterns (7 days)
    const weeklyPattern = checkPeriodicity(sortedPrices, 7)
  
    // Check for monthly patterns (30 days)
    const monthlyPattern = checkPeriodicity(sortedPrices, 30)
  
    // Check for quarterly patterns (90 days)
    const quarterlyPattern = checkPeriodicity(sortedPrices, 90)
  
    // Determine the strongest pattern
    const patterns = [
      { period: "weekly", ...weeklyPattern },
      { period: "monthly", ...monthlyPattern },
      { period: "quarterly", ...quarterlyPattern },
    ].filter((p) => p.correlation > 0.5)
  
    patterns.sort((a, b) => b.correlation - a.correlation)
  
    return {
      hasSeasonality: patterns.length > 0,
      confidence: patterns.length > 0 ? patterns[0].correlation : 0,
      patterns,
    }
  }
  
  /**
   * Checks for periodicity in price data
   * @param {Array} prices - Array of price objects with date and price
   * @param {Number} period - Period length in days
   * @returns {Object} Periodicity information
   */
  const checkPeriodicity = (prices, period) => {
    if (prices.length < period * 2) {
      return { correlation: 0, significance: 0 }
    }
  
    // Group prices by period
    const periods = []
    for (let i = 0; i < Math.floor(prices.length / period); i++) {
      periods.push(prices.slice(i * period, (i + 1) * period))
    }
  
    // Calculate correlation between consecutive periods
    let totalCorrelation = 0
    let correlationCount = 0
  
    for (let i = 0; i < periods.length - 1; i++) {
      const period1 = periods[i].map((p) => p.price)
      const period2 = periods[i + 1].map((p) => p.price)
  
      const correlation = calculateCorrelation(period1, period2)
  
      if (!isNaN(correlation)) {
        totalCorrelation += correlation
        correlationCount++
      }
    }
  
    const avgCorrelation = correlationCount > 0 ? totalCorrelation / correlationCount : 0
  
    return {
      correlation: avgCorrelation,
      significance: avgCorrelation > 0.7 ? "high" : avgCorrelation > 0.5 ? "medium" : "low",
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
      return Number.NaN
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
   * Calculates price volatility
   * @param {Array} prices - Array of price objects with date and price
   * @param {Number} days - Number of days to analyze
   * @returns {Object} Volatility information
   */
  export const calculateVolatility = (prices, days = 30) => {
    if (!prices || prices.length < 2) {
      return { volatility: 0, averagePrice: 0, standardDeviation: 0 }
    }
  
    // Filter prices for the specified time period
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
  
    const filteredPrices = prices.filter((p) => new Date(p.date) >= cutoffDate)
  
    if (filteredPrices.length < 2) {
      return { volatility: 0, averagePrice: 0, standardDeviation: 0 }
    }
  
    // Calculate average price
    const priceValues = filteredPrices.map((p) => p.price)
    const averagePrice = priceValues.reduce((a, b) => a + b, 0) / priceValues.length
  
    // Calculate standard deviation
    const squaredDifferences = priceValues.map((p) => Math.pow(p - averagePrice, 2))
    const variance = squaredDifferences.reduce((a, b) => a + b, 0) / priceValues.length
    const standardDeviation = Math.sqrt(variance)
  
    // Calculate coefficient of variation (volatility)
    const volatility = standardDeviation / averagePrice
  
    return {
      volatility,
      averagePrice,
      standardDeviation,
      interpretation: volatility < 0.05 ? "low" : volatility < 0.15 ? "medium" : "high",
    }
  }
  
  /**
   * Identifies price anomalies
   * @param {Array} prices - Array of price objects with date and price
   * @param {Number} threshold - Z-score threshold for anomalies
   * @returns {Array} Anomalies
   */
  export const identifyAnomalies = (prices, threshold = 2.5) => {
    if (!prices || prices.length < 5) {
      return []
    }
  
    // Calculate mean and standard deviation
    const priceValues = prices.map((p) => p.price)
    const mean = priceValues.reduce((a, b) => a + b, 0) / priceValues.length
  
    const squaredDifferences = priceValues.map((p) => Math.pow(p - mean, 2))
    const variance = squaredDifferences.reduce((a, b) => a + b, 0) / priceValues.length
    const stdDev = Math.sqrt(variance)
  
    // Identify anomalies
    const anomalies = prices.filter((p) => {
      const zScore = Math.abs((p.price - mean) / stdDev)
      return zScore > threshold
    })
  
    return anomalies.map((p) => ({
      ...p,
      zScore: (p.price - mean) / stdDev,
      deviation: p.price - mean,
      percentDeviation: ((p.price - mean) / mean) * 100,
    }))
  }
  
  /**
   * Compares prices across different markets
   * @param {Array} marketPrices - Array of market price objects
   * @returns {Object} Market comparison
   */
  export const compareMarkets = (marketPrices) => {
    if (!marketPrices || Object.keys(marketPrices).length < 2) {
      return { differences: [], insights: [] }
    }
  
    const markets = Object.keys(marketPrices)
    const differences = []
  
    // Compare each pair of markets
    for (let i = 0; i < markets.length; i++) {
      for (let j = i + 1; j < markets.length; j++) {
        const market1 = markets[i]
        const market2 = markets[j]
  
        const avgPrice1 = calculateAverage(marketPrices[market1])
        const avgPrice2 = calculateAverage(marketPrices[market2])
  
        const priceDiff = avgPrice1 - avgPrice2
        const percentDiff = (priceDiff / Math.min(avgPrice1, avgPrice2)) * 100
  
        differences.push({
          market1,
          market2,
          avgPrice1,
          avgPrice2,
          priceDiff,
          percentDiff: Math.abs(percentDiff),
          cheaperMarket: priceDiff > 0 ? market2 : market1,
        })
      }
    }
  
    // Sort differences by percentage difference
    differences.sort((a, b) => b.percentDiff - a.percentDiff)
  
    // Generate insights
    const insights = []
  
    if (differences.length > 0) {
      const topDiff = differences[0]
      insights.push(
        `${topDiff.market1} is ${topDiff.percentDiff.toFixed(2)}% ${topDiff.priceDiff > 0 ? "more expensive" : "cheaper"} than ${topDiff.market2}.`,
      )
  
      if (topDiff.percentDiff > 10) {
        insights.push(
          `There's a significant price difference between ${topDiff.market1} and ${topDiff.market2}, which may present arbitrage opportunities.`,
        )
      }
    }
  
    return { differences, insights }
  }
  
  /**
   * Calculates average of an array
   * @param {Array} arr - Array of numbers
   * @returns {Number} Average
   */
  const calculateAverage = (arr) => {
    if (!arr || arr.length === 0) return 0
    return arr.reduce((a, b) => a + b, 0) / arr.length
  }
  
  /**
   * Analyzes price correlations between products
   * @param {Object} productPrices - Object with product IDs as keys and price arrays as values
   * @returns {Object} Correlation matrix and insights
   */
  export const analyzeProductCorrelations = (productPrices) => {
    const products = Object.keys(productPrices)
  
    if (products.length < 2) {
      return { correlations: {}, insights: [] }
    }
  
    // Calculate correlation matrix
    const correlations = {}
  
    for (let i = 0; i < products.length; i++) {
      correlations[products[i]] = {}
  
      for (let j = 0; j < products.length; j++) {
        if (i === j) {
          correlations[products[i]][products[j]] = 1 // Self-correlation is always 1
        } else if (j > i) {
          // Calculate correlation
          const prices1 = productPrices[products[i]].map((p) => p.price)
          const prices2 = productPrices[products[j]].map((p) => p.price)
  
          const correlation = calculateCorrelation(prices1, prices2)
          correlations[products[i]][products[j]] = correlation
          correlations[products[j]][products[i]] = correlation // Matrix is symmetric
        }
      }
    }
  
    // Find highly correlated and inversely correlated product pairs
    const highlyCorrelated = []
    const inverselyCorrelated = []
  
    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < products.length; j++) {
        const correlation = correlations[products[i]][products[j]]
  
        if (correlation > 0.7) {
          highlyCorrelated.push({
            product1: products[i],
            product2: products[j],
            correlation,
          })
        } else if (correlation < -0.7) {
          inverselyCorrelated.push({
            product1: products[i],
            product2: products[j],
            correlation,
          })
        }
      }
    }
  
    // Generate insights
    const insights = []
  
    if (highlyCorrelated.length > 0) {
      insights.push(
        `${highlyCorrelated[0].product1} and ${highlyCorrelated[0].product2} show a strong positive correlation (${highlyCorrelated[0].correlation.toFixed(2)}), suggesting they may be complementary products.`,
      )
    }
  
    if (inverselyCorrelated.length > 0) {
      insights.push(
        `${inverselyCorrelated[0].product1} and ${inverselyCorrelated[0].product2} show a strong negative correlation (${inverselyCorrelated[0].correlation.toFixed(2)}), suggesting they may be substitute products.`,
      )
    }
  
    return {
      correlations,
      highlyCorrelated,
      inverselyCorrelated,
      insights,
    }
  }
  