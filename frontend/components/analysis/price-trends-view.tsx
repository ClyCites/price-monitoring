"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePriceTrends } from "@/lib/hooks/use-prices"
import PriceTrendsChart from "./price-trends-chart"

// Sample products and markets
const products = ["Rice", "Maize", "Beans", "Coffee", "Tea"]

const markets = ["Kampala Central", "Owino Market", "Nakasero", "Kalerwe", "Kikuubo"]

export default function PriceTrendsView() {
  const [selectedProduct, setSelectedProduct] = useState("rice")
  const [selectedMarket, setSelectedMarket] = useState("Kampala Central")
  const [timeRange, setTimeRange] = useState("30") // days

  // Fetch trend data with React Query
  const { data: trendData, isLoading } = usePriceTrends(selectedProduct, selectedMarket, Number.parseInt(timeRange))

  // Helper function to generate sample trend data when API is not available
  const generateSampleTrendData = (product: string, market: string, days: number) => {
    const historicalPrices = []
    const today = new Date()
    let basePrice =
      product === "rice"
        ? 2500
        : product === "maize"
          ? 1800
          : product === "beans"
            ? 3200
            : product === "coffee"
              ? 5500
              : product === "tea"
                ? 4000
                : 2000

    // Adjust base price based on market
    const marketMultiplier =
      market === "Kampala Central"
        ? 1.1
        : market === "Owino Market"
          ? 1.0
          : market === "Nakasero"
            ? 1.2
            : market === "Kalerwe"
              ? 0.95
              : market === "Kikuubo"
                ? 1.05
                : 1.0

    basePrice = basePrice * marketMultiplier

    // Generate price points for the specified number of days
    for (let i = days; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Add some randomness to prices
      const randomVariation = 1 + (Math.random() * 0.1 - 0.05) // -5% to +5%
      const price = Math.round(basePrice * randomVariation)

      // Add slight upward trend over time
      const trendFactor = 1 + 0.002 * (days - i)

      historicalPrices.push({
        date: date.toISOString().split("T")[0],
        price: Math.round(price * trendFactor),
      })
    }

    // Calculate trend percentage
    const firstPrice = historicalPrices[0].price
    const latestPrice = historicalPrices[historicalPrices.length - 1].price
    const trendPercentage = ((latestPrice - firstPrice) / firstPrice) * 100

    return {
      product,
      market,
      trendPercentage: trendPercentage.toFixed(2),
      historicalPrices,
    }
  }

  // Use sample data for demo
  const sampleTrendData = generateSampleTrendData(selectedProduct, selectedMarket, Number.parseInt(timeRange))

  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Price Trends Analysis</h1>

      <Card>
        <CardHeader>
          <CardTitle>Price Trends</CardTitle>
          <CardDescription>
            Analyze how prices have changed over time for different products and markets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product} value={product.toLowerCase()}>
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMarket} onValueChange={setSelectedMarket}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Select market" />
              </SelectTrigger>
              <SelectContent>
                {markets.map((market) => (
                  <SelectItem key={market} value={market}>
                    {market}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm font-medium">
                Price trend for {selectedProduct.charAt(0).toUpperCase() + selectedProduct.slice(1)} in {selectedMarket}
                :
                <span
                  className={`ml-2 font-bold ${
                    Number.parseFloat(sampleTrendData.trendPercentage) >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {Number.parseFloat(sampleTrendData.trendPercentage) >= 0 ? "+" : ""}
                  {sampleTrendData.trendPercentage}%
                </span>
              </p>
            </div>

            <PriceTrendsChart data={sampleTrendData.historicalPrices} isLoading={isLoading} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

