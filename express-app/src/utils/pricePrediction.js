/**
 * Simple moving average prediction
 * @param {Array} prices - Array of price objects with date and price
 * @param {Number} days - Number of days to predict
 * @param {Number} window - Window size for moving average
 * @returns {Array} Predicted prices
 */
export const predictWithMovingAverage = (prices, days = 7, window = 14) => {
    if (!prices || prices.length < window) {
      return []
    }
  
    // Sort prices by date
    const sortedPrices = [...prices].sort((a, b) => new Date(a.date) - new Date(b.date))
  
    // Get the most recent prices for the window
    const recentPrices = sortedPrices.slice(-window)
    const priceValues = recentPrices.map((p) => p.price)
  
    // Calculate the moving average
    const movingAvg = priceValues.reduce((a, b) => a + b, 0) / window
  
    // Generate predictions
    const predictions = []
    const lastDate = new Date(sortedPrices[sortedPrices.length - 1].date)
  
    for (let i = 1; i <= days; i++) {
      const predictionDate = new Date(lastDate)
      predictionDate.setDate(predictionDate.getDate() + i)
  
      predictions.push({
        date: predictionDate,
        price: movingAvg,
        method: "moving_average",
        confidence: 0.5, // Fixed confidence for simple moving average
      })
    }
  
    return predictions
  }
  
  /**
   * Linear regression prediction
   * @param {Array} prices - Array of price objects with date and price
   * @param {Number} days - Number of days to predict
   * @returns {Array} Predicted prices
   */
  export const predictWithLinearRegression = (prices, days = 7) => {
    if (!prices || prices.length < 2) {
      return []
    }
  
    // Sort prices by date
    const sortedPrices = [...prices].sort((a, b) => new Date(a.date) - new Date(b.date))
  
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
  
    // Generate predictions
    const predictions = []
    const lastDate = new Date(sortedPrices[sortedPrices.length - 1].date)
    const lastIndex = x[x.length - 1]
  
    for (let i = 1; i <= days; i++) {
      const predictionDate = new Date(lastDate)
      predictionDate.setDate(predictionDate.getDate() + i)
  
      const predictedPrice = intercept + slope * (lastIndex + i)
  
      predictions.push({
        date: predictionDate,
        price: predictedPrice,
        method: "linear_regression",
        confidence: rSquared,
      })
    }
  
    return predictions
  }
  
  /**
   * Weighted moving average prediction
   * @param {Array} prices - Array of price objects with date and price
   * @param {Number} days - Number of days to predict
   * @param {Number} window - Window size for moving average
   * @returns {Array} Predicted prices
   */
  export const predictWithWeightedMovingAverage = (prices, days = 7, window = 14) => {
    if (!prices || prices.length < window) {
      return []
    }
  
    // Sort prices by date
    const sortedPrices = [...prices].sort((a, b) => new Date(a.date) - new Date(b.date))
  
    // Get the most recent prices for the window
    const recentPrices = sortedPrices.slice(-window)
  
    // Calculate weighted moving average (more recent prices have higher weights)
    let weightedSum = 0
    let weightSum = 0
  
    for (let i = 0; i < recentPrices.length; i++) {
      const weight = i + 1 // Weight increases with recency
      weightedSum += recentPrices[i].price * weight
      weightSum += weight
    }
  
    const weightedAvg = weightedSum / weightSum
  
    // Generate predictions
    const predictions = []
    const lastDate = new Date(sortedPrices[sortedPrices.length - 1].date)
  
    for (let i = 1; i <= days; i++) {
      const predictionDate = new Date(lastDate)
      predictionDate.setDate(predictionDate.getDate() + i)
  
      predictions.push({
        date: predictionDate,
        price: weightedAvg,
        method: "weighted_moving_average",
        confidence: 0.6, // Slightly higher confidence than simple moving average
      })
    }
  
    return predictions
  }
  
  /**
   * Exponential smoothing prediction
   * @param {Array} prices - Array of price objects with date and price
   * @param {Number} days - Number of days to predict
   * @param {Number} alpha - Smoothing factor (0-1)
   * @returns {Array} Predicted prices
   */
  export const predictWithExponentialSmoothing = (prices, days = 7, alpha = 0.3) => {
    if (!prices || prices.length < 2) {
      return []
    }
  
    // Sort prices by date
    const sortedPrices = [...prices].sort((a, b) => new Date(a.date) - new Date(b.date))
  
    // Calculate exponential smoothing
    const priceValues = sortedPrices.map((p) => p.price)
    let smoothed = priceValues[0]
  
    for (let i = 1; i < priceValues.length; i++) {
      smoothed = alpha * priceValues[i] + (1 - alpha) * smoothed
    }
  
    // Generate predictions
    const predictions = []
    const lastDate = new Date(sortedPrices[sortedPrices.length - 1].date)
  
    for (let i = 1; i <= days; i++) {
      const predictionDate = new Date(lastDate)
      predictionDate.setDate(predictionDate.getDate() + i)
  
      predictions.push({
        date: predictionDate,
        price: smoothed,
        method: "exponential_smoothing",
        confidence: 0.65,
      })
    }
  
    return predictions
  }
  
  /**
   * Ensemble prediction (combines multiple methods)
   * @param {Array} prices - Array of price objects with date and price
   * @param {Number} days - Number of days to predict
   * @returns {Array} Predicted prices
   */
  export const predictWithEnsemble = (prices, days = 7) => {
    if (!prices || prices.length < 14) {
      // Need enough data for all methods
      return []
    }
  
    // Get predictions from different methods
    const maPredict = predictWithMovingAverage(prices, days)
    const lrPredict = predictWithLinearRegression(prices, days)
    const wmaPredict = predictWithWeightedMovingAverage(prices, days)
    const esPredict = predictWithExponentialSmoothing(prices, days)
  
    // Combine predictions with weighted average based on confidence
    const predictions = []
  
    for (let i = 0; i < days; i++) {
      const date = maPredict[i].date
  
      // Calculate weighted average of predictions
      const totalConfidence =
        maPredict[i].confidence + lrPredict[i].confidence + wmaPredict[i].confidence + esPredict[i].confidence
  
      const weightedPrice =
        (maPredict[i].price * maPredict[i].confidence +
          lrPredict[i].price * lrPredict[i].confidence +
          wmaPredict[i].price * wmaPredict[i].confidence +
          esPredict[i].price * esPredict[i].confidence) /
        totalConfidence
  
      // Calculate ensemble confidence (higher of individual methods)
      const confidence = Math.max(
        maPredict[i].confidence,
        lrPredict[i].confidence,
        wmaPredict[i].confidence,
        esPredict[i].confidence,
      )
  
      predictions.push({
        date,
        price: weightedPrice,
        method: "ensemble",
        confidence,
        components: {
          movingAverage: maPredict[i].price,
          linearRegression: lrPredict[i].price,
          weightedMovingAverage: wmaPredict[i].price,
          exponentialSmoothing: esPredict[i].price,
        },
      })
    }
  
    return predictions
  }
  
  /**
   * Seasonal adjustment prediction
   * @param {Array} prices - Array of price objects with date and price
   * @param {Number} days - Number of days to predict
   * @param {Number} seasonalPeriod - Seasonal period in days
   * @returns {Array} Predicted prices
   */
  export const predictWithSeasonalAdjustment = (prices, days = 7, seasonalPeriod = 7) => {
    if (!prices || prices.length < seasonalPeriod * 2) {
      return []
    }
  
    // Sort prices by date
    const sortedPrices = [...prices].sort((a, b) => new Date(a.date) - new Date(b.date))
  
    // Calculate seasonal indices
    const seasonalIndices = []
  
    for (let i = 0; i < seasonalPeriod; i++) {
      let sum = 0
      let count = 0
  
      for (let j = i; j < sortedPrices.length; j += seasonalPeriod) {
        if (j < sortedPrices.length) {
          sum += sortedPrices[j].price
          count++
        }
      }
  
      seasonalIndices.push(count > 0 ? sum / count : 1)
    }
  
    // Normalize seasonal indices
    const avgIndex = seasonalIndices.reduce((a, b) => a + b, 0) / seasonalPeriod
    const normalizedIndices = seasonalIndices.map((idx) => idx / avgIndex)
  
    // Get base prediction using linear regression
    const basePredict = predictWithLinearRegression(prices, days)
  
    // Apply seasonal adjustment
    const predictions = []
    const lastDate = new Date(sortedPrices[sortedPrices.length - 1].date)
    const dayOfCycle = sortedPrices.length % seasonalPeriod
  
    for (let i = 0; i < days; i++) {
      const predictionDate = new Date(lastDate)
      predictionDate.setDate(predictionDate.getDate() + i + 1)
  
      const seasonalIndex = normalizedIndices[(dayOfCycle + i) % seasonalPeriod]
      const adjustedPrice = basePredict[i].price * seasonalIndex
  
      predictions.push({
        date: predictionDate,
        price: adjustedPrice,
        method: "seasonal_adjustment",
        confidence: basePredict[i].confidence * 0.9, // Slightly lower confidence due to seasonal adjustment
        seasonalIndex,
      })
    }
  
    return predictions
  }
  
  /**
   * Generates a comprehensive price forecast
   * @param {Array} prices - Array of price objects with date and price
   * @param {Number} days - Number of days to predict
   * @returns {Object} Forecast with multiple prediction methods and recommendations
   */
  export const generatePriceForecast = (prices, days = 30) => {
    if (!prices || prices.length < 30) {
      return {
        success: false,
        message: "Insufficient historical data for accurate forecasting",
        minimumDataPoints: 30,
        actualDataPoints: prices ? prices.length : 0,
      }
    }
  
    // Generate predictions using different methods
    const ensemblePrediction = predictWithEnsemble(prices, days)
    const seasonalPrediction = predictWithSeasonalAdjustment(prices, days)
  
    // Determine which method to use based on seasonality detection
    const seasonality = detectSeasonality(prices)
  
    const selectedPrediction =
      seasonality.hasSeasonality && seasonality.confidence > 0.6 ? seasonalPrediction : ensemblePrediction
  
    // Calculate trend from predictions
    const firstPrediction = selectedPrediction[0].price
    const lastPrediction = selectedPrediction[selectedPrediction.length - 1].price
    const predictedChange = ((lastPrediction - firstPrediction) / firstPrediction) * 100
  
    // Generate buying/selling recommendations
    let recommendation = ""
    if (predictedChange < -5) {
      recommendation = "Consider delaying purchases as prices are expected to decrease significantly."
    } else if (predictedChange < 0) {
      recommendation = "Prices are expected to decrease slightly. Consider standard purchasing patterns."
    } else if (predictedChange < 5) {
      recommendation = "Prices are expected to increase slightly. Consider standard purchasing patterns."
    } else {
      recommendation = "Consider accelerating purchases as prices are expected to increase significantly."
    }
  
    return {
      success: true,
      forecast: selectedPrediction,
      alternativeForecasts: {
        ensemble: ensemblePrediction,
        seasonal: seasonalPrediction,
      },
      trend: {
        direction: predictedChange > 0 ? "increasing" : "decreasing",
        percentChange: predictedChange,
        confidence: selectedPrediction[0].confidence,
      },
      seasonality,
      recommendation,
      forecastGeneratedAt: new Date(),
    }
  }
  
  /**
   * Detects seasonality in price data
   * @param {Array} prices - Array of price objects with date and price
   * @returns {Object} Seasonality information
   */
  const detectSeasonality = (prices) => {
    if (!prices || prices.length < 30) {
      return { hasSeasonality: false, confidence: 0 }
    }
  
    // Check for weekly seasonality
    const weeklyCorrelation = checkSeasonalCorrelation(prices, 7)
  
    // Check for monthly seasonality
    const monthlyCorrelation = checkSeasonalCorrelation(prices, 30)
  
    // Determine if there's seasonality
    const hasSeasonality = weeklyCorrelation > 0.5 || monthlyCorrelation > 0.5
    const confidence = Math.max(weeklyCorrelation, monthlyCorrelation)
    const period = weeklyCorrelation > monthlyCorrelation ? 7 : 30
  
    return {
      hasSeasonality,
      confidence,
      period,
      type: period === 7 ? "weekly" : "monthly",
    }
  }
  
  /**
   * Checks for seasonal correlation in price data
   * @param {Array} prices - Array of price objects with date and price
   * @param {Number} period - Period length in days
   * @returns {Number} Correlation coefficient
   */
  const checkSeasonalCorrelation = (prices, period) => {
    if (prices.length < period * 2) {
      return 0
    }
  
    // Sort prices by date
    const sortedPrices = [...prices].sort((a, b) => new Date(a.date) - new Date(b.date))
  
    // Extract price values
    const priceValues = sortedPrices.map((p) => p.price)
  
    // Calculate correlation between periods
    let totalCorrelation = 0
    let correlationCount = 0
  
    for (let i = 0; i < Math.floor(priceValues.length / period) - 1; i++) {
      const period1 = priceValues.slice(i * period, (i + 1) * period)
      const period2 = priceValues.slice((i + 1) * period, (i + 2) * period)
  
      if (period1.length === period && period2.length === period) {
        const correlation = calculateCorrelation(period1, period2)
  
        if (!isNaN(correlation)) {
          totalCorrelation += correlation
          correlationCount++
        }
      }
    }
  
    return correlationCount > 0 ? totalCorrelation / correlationCount : 0
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
  