"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePriceTrends } from "@/lib/hooks/use-prices"
import PriceTrendsChart from "./price-trends-chart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import axios from "axios"

export default function PriceTrendsView() {
  const [products, setProducts] = useState<{ _id: string; name: string }[]>([])
  const [markets, setMarkets] = useState<{ _id: string; name: string }[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [selectedMarket, setSelectedMarket] = useState("")
  const [timeRange, setTimeRange] = useState("30") // days
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  // Fetch products and markets
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [productsRes, marketsRes] = await Promise.all([
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/markets`),
        ])

        setProducts(productsRes.data)
        setMarkets(marketsRes.data)

        // Set default selections if data is available
        if (productsRes.data.length > 0) {
          setSelectedProduct(productsRes.data[0]._id)
        }
        if (marketsRes.data.length > 0) {
          setSelectedMarket(marketsRes.data[0]._id)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load products and markets")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [API_URL])

  // Fetch trend data with React Query
  const {
    data: trendData,
    isLoading: isTrendLoading,
    error: trendError,
  } = usePriceTrends(selectedProduct, selectedMarket, Number.parseInt(timeRange))

  // Get product and market names for display
  const getProductName = () => {
    const product = products.find((p) => p._id === selectedProduct)
    return product ? product.name : ""
  }

  const getMarketName = () => {
    const market = markets.find((m) => m._id === selectedMarket)
    return market ? market.name : ""
  }

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
            <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={isLoading}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={isLoading ? "Loading products..." : "Select product"} />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMarket} onValueChange={setSelectedMarket} disabled={isLoading}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={isLoading ? "Loading markets..." : "Select market"} />
              </SelectTrigger>
              <SelectContent>
                {markets.map((market) => (
                  <SelectItem key={market._id} value={market._id}>
                    {market.name}
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

          {error || trendError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error || "Failed to load price trend data. Please try again later."}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {trendData && trendData.trend && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="text-sm font-medium">
                    Price trend for {getProductName()} in {getMarketName()}:
                    <span
                      className={`ml-2 font-bold ${
                        trendData.trend.percentageChange >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {trendData.trend.percentageChange >= 0 ? "+" : ""}
                      {trendData.trend.percentageChange.toFixed(2)}%
                    </span>
                  </p>
                </div>
              )}

              <PriceTrendsChart data={trendData?.prices || []} isLoading={isLoading || isTrendLoading} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
