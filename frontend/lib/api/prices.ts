import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface Market {
  _id?: string;
  name: string;
  location: string;
  region: string;
  country?: string;
}

export interface Price {
  _id?: string
  product: string
  market: Market | string
  price: number
  currency: string
  date: string | Date
  productType: "solid" | "liquid"
  quantity: number
  unit: "kg" | "liters"
  predictedPrice?: number | null
  predictionDate?: string | Date | null
  trendPercentage?: number
  priceChangePercentage?: number
  category?: "grain" | "vegetable" | "fruit" | "meat" | "beverage"
  isValid?: boolean
}

interface HistoricalPrice {
  date: string | Date;
  price: number;
}

export interface PriceTrend {
  product: {
    id: string
    name: string
    category?: string
  }
  market: {
    id: string
    name: string
    location?: string
  }
  trend: {
    direction: "up" | "down" | "stable"
    percentageChange: number
    absoluteChange: number
  }
  prices: Array<{
    date: string
    price: number
  }>
  historicalPrices: HistoricalPrice[]
}

export interface MarketAverage {
  _id: string
  avgPrice: number
}

// Get all prices with optional filters
export const getPrices = async (product?: string, market?: string) => {
  const url = `${API_URL}/prices`
  const params: Record<string, string> = {}
  if (product) params.product = product
  if (market) params.market = market

  try {
    const { data } = await axios.get(url, { params })
    return data
  } catch (error) {
    console.error("Error fetching prices:", error)
    throw error
  }
}

// Get a specific price by ID
export const getPriceById = async (id: string) => {
  try {
    const { data } = await axios.get(`${API_URL}/prices/${id}`)
    return data
  } catch (error) {
    console.error("Error fetching price by ID:", error)
    throw error
  }
}

// Add a new price entry
export const addPrice = async (priceData: Price) => {
  try {
    const { data } = await axios.post(`${API_URL}/prices`, priceData)
    return data
  } catch (error) {
    console.error("Error adding price:", error)
    throw error
  }
}

// Update a price entry
export const updatePrice = async (id: string, priceData: Partial<Price>) => {
  try {
    const { data } = await axios.put(`${API_URL}/prices/${id}`, priceData)
    return data
  } catch (error) {
    console.error("Error updating price:", error)
    throw error
  }
}

// Delete a price entry
export const deletePrice = async (id: string) => {
  try {
    const { data } = await axios.delete(`${API_URL}/prices/${id}`)
    return data
  } catch (error) {
    console.error("Error deleting price:", error)
    throw error
  }
}

// Update the getPriceTrends function to handle ObjectId requirements
export const getPriceTrends = async (product: string, market: string, days = 30) => {
  try {
    const { data } = await axios.get(`${API_URL}/prices/trends`, {
      params: { product, market, days },
    })
    console.log("Price trends API response:", data)
    return data as PriceTrend
  } catch (error) {
    console.error("Error fetching price trends:", error)
    throw error
  }
}

// Get historical prices for a product and market
// export const getHistoricalPrices = async (product: string, market: string, limit = 30) => {
//   const { data } = await axios.get(`${API_URL}/prices/history/${product}/${market}`, {
//     params: { limit },
//   })
//   return data as Price[]
// }

// Compare prices across different markets for a product
export const compareMarketPrices = async (product: string) => {
  try {
    const { data } = await axios.get(`${API_URL}/prices/compare`, {
      params: { product },
    })
    return data
  } catch (error) {
    console.error("Error fetching market comparison data:", error)
    throw error
  }
}

// Get historical prices for a product and market
export const getHistoricalPrices = async (product: string, market: string, limit = 30) => {
  try {
    const { data } = await axios.get(`${API_URL}/prices/historical`, {
      params: { product, market, limit },
    })
    return data
  } catch (error) {
    console.error("Error fetching historical prices:", error)
    throw error
  }
}

// Compare prices across different markets for a product

// Get top markets for a product (best prices)
export const getTopMarketsForProduct = async (product: string) => {
  try {
    const { data } = await axios.get(`${API_URL}/prices/top-markets`, {
      params: { product },
    })
    return data
  } catch (error) {
    console.error("Error fetching top markets:", error)
    throw error
  }
}

// Get average price per market
export const getAveragePricePerMarket = async (product: string) => {
  try {
    const { data } = await axios.get(`${API_URL}/prices/average`, {
      params: { product },
    })
    return data
  } catch (error) {
    console.error("Error fetching average prices:", error)
    throw error
  }
}

// Predict price for a product in a market
export const predictPrice = async (product: string, market: string, days = 7, method = "ensemble") => {
  try {
    const { data } = await axios.post(`${API_URL}/prices/predict`, {
      product,
      market,
      days,
      method,
    })
    return data
  } catch (error) {
    console.error("Error predicting prices:", error)
    throw error
  }
}

// Bulk import prices
export const bulkImportPrices = async (prices: Price[]) => {
  try {
    const { data } = await axios.post(`${API_URL}/prices/bulk-import`, { prices })
    return data
  } catch (error) {
    console.error("Error bulk importing prices:", error)
    throw error
  }
}

// Get price volatility
export const getPriceVolatility = async (product: string, market: string, days = 30) => {
  try {
    const { data } = await axios.get(`${API_URL}/prices/volatility`, {
      params: { product, market, days },
    })
    return data
  } catch (error) {
    console.error("Error fetching price volatility:", error)
    throw error
  }
}

// Get trending products
export const getTrendingProducts = async (days = 30, limit = 10) => {
  try {
    const { data } = await axios.get(`${API_URL}/prices/trends/popular`, {
      params: { days, limit },
    })
    return data
  } catch (error) {
    console.error("Error fetching trending products:", error)
    throw error
  }
}

// Get price summary for a product
export const getPriceSummary = async (productId: string) => {
  try {
    const { data } = await axios.get(`${API_URL}/prices/price-summary/${productId}`)
    return data
  } catch (error) {
    console.error("Error fetching price summary:", error)
    throw error
  }
}

// Analyze seasonal prices
export const analyzeSeasonalPrices = async (product: string, market: string, days = 365) => {
  try {
    const { data } = await axios.get(`${API_URL}/prices/seasonal`, {
      params: { product, market, days },
    })
    return data
  } catch (error) {
    console.error("Error analyzing seasonal prices:", error)
    throw error
  }
}

// Analyze product correlations
export const analyzeCorrelations = async (market: string, products?: string[], days = 90) => {
  try {
    const params: Record<string, any> = { market, days }
    if (products && products.length > 0) {
      params.products = products.join(",")
    }

    const { data } = await axios.get(`${API_URL}/prices/correlations`, { params })
    return data
  } catch (error) {
    console.error("Error analyzing correlations:", error)
    throw error
  }
}

// Generate market report
export const generateMarketReport = async (market: string, days = 30) => {
  try {
    const { data } = await axios.get(`${API_URL}/prices/report`, {
      params: { market, days },
    })
    return data
  } catch (error) {
    console.error("Error generating market report:", error)
    throw error
  }
}
