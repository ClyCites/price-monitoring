"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMarketComparison } from "@/lib/hooks/use-prices"
import MarketComparisonChart from "./market-comparison-chart"
import MarketComparisonTable from "./market-comparison-table"

// Sample products
const products = ["Rice", "Maize", "Beans", "Coffee", "Tea"]

export default function MarketComparisonView() {
  const [selectedProduct, setSelectedProduct] = useState("rice")

  const { data: marketPrices = [], isLoading } = useMarketComparison(selectedProduct)

  const generateSampleMarketData = (product: string) => {
    const markets = ["Kampala Central", "Owino Market", "Nakasero", "Kalerwe", "Kikuubo", "Nateete", "Kireka", "Ntinda"]

    const basePrice =
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

    return markets.map((market) => {
      // Add variation based on market
      const marketFactor =
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
                  : market === "Nateete"
                    ? 0.9
                    : market === "Kireka"
                      ? 0.92
                      : market === "Ntinda"
                        ? 1.15
                        : 1.0

      const price = Math.round(basePrice * marketFactor)

      return {
        _id: Math.random().toString(36).substring(2, 9), // Simulate MongoDB ID
        product: product.toLowerCase(),
        market,
        price,
        date: new Date().toISOString(),
        productType: "solid",
        quantity: 1,
        unit: "kg",
      }
    })
  }

  // Use sample data for demo
  const sampleMarketData = generateSampleMarketData(selectedProduct)
  const displayData = marketPrices.length > 0 ? marketPrices : sampleMarketData

  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Market Price Comparison</h1>

      <Card>
        <CardHeader>
          <CardTitle>Market Comparison</CardTitle>
          <CardDescription>Compare prices across different markets for the same product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
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
          </div>

          <div className="space-y-6">
            <MarketComparisonChart data={displayData} isLoading={isLoading} productName={selectedProduct} />

            <MarketComparisonTable data={displayData} isLoading={isLoading} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

