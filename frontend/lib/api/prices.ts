import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface Price {
  _id?: string
  product: string
  market: string
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

export interface PriceTrend {
  product: string
  market: string
  trendPercentage: string
  historicalPrices: Price[]
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

  const { data } = await axios.get(url, { params })
  return data
}

// Get a specific price by ID
export const getPriceById = async (id: string) => {
  const { data } = await axios.get(`${API_URL}/prices/${id}`)
  return data
}

// Add a new price entry
export const addPrice = async (priceData: Price) => {
  const { data } = await axios.post(`${API_URL}/prices`, priceData)
  return data
}

// Update a price entry
export const updatePrice = async (id: string, priceData: Partial<Price>) => {
  const { data } = await axios.put(`${API_URL}/prices/${id}`, priceData)
  return data
}

// Delete a price entry
export const deletePrice = async (id: string) => {
  const { data } = await axios.delete(`${API_URL}/prices/${id}`)
  return data
}

// Get price trends for a specific product and market
export const getPriceTrends = async (product: string, market: string, days = 30) => {
  const { data } = await axios.get(`${API_URL}/prices/trends/${product}/${market}`, {
    params: { days },
  })
  return data as PriceTrend
}

// Get historical prices for a product and market
export const getHistoricalPrices = async (product: string, market: string, limit = 30) => {
  const { data } = await axios.get(`${API_URL}/prices/history/${product}/${market}`, {
    params: { limit },
  })
  return data as Price[]
}

// Compare prices across different markets for a product
export const compareMarketPrices = async (product: string) => {
  const { data } = await axios.get(`${API_URL}/prices/compare`, {
    params: { product },
  })
  return data as Price[]
}

// Get top markets for a product (best prices)
export const getTopMarketsForProduct = async (product: string) => {
  const { data } = await axios.get(`${API_URL}/prices/top-markets/${product}`)
  return data as MarketAverage[]
}

// Get average price per market
export const getAveragePricePerMarket = async (product: string) => {
  const { data } = await axios.get(`${API_URL}/prices/average/${product}`)
  return data as MarketAverage[]
}

// Predict price for a product in a market
export const predictPrice = async (product: string, market: string) => {
  const { data } = await axios.post(`${API_URL}/prices/predict`, {
    product,
    market,
  })
  return data
}

// Bulk import prices
export const bulkImportPrices = async (prices: Price[]) => {
  const { data } = await axios.post(`${API_URL}/prices/bulk-import`, { prices })
  return data
}

