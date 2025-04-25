"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMarketComparison } from "@/lib/hooks/use-prices"
import MarketComparisonChart from "./market-comparison-chart"
import MarketComparisonTable from "./market-comparison-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import axios from "axios"

export default function MarketComparisonView() {
  const [products, setProducts] = useState<{ _id: string; name: string }[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [productError, setProductError] = useState<string | null>(null)

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true)
      setProductError(null)

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        const response = await axios.get(`${API_URL}/products`)

        if (response.data && Array.isArray(response.data)) {
          setProducts(response.data)
          // Set the first product as default if available
          if (response.data.length > 0) {
            setSelectedProductId(response.data[0]._id)
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        setProductError(error instanceof Error ? error.message : "Failed to load products")
      } finally {
        setIsLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [])

  // Use the hook for React Query approach with the selected product ID
  const { data: marketPrices = [], isLoading: isDataLoading, error: dataError } = useMarketComparison(selectedProductId)

  // Get the selected product name for display
  const getSelectedProductName = () => {
    const product = products.find((p) => p._id === selectedProductId)
    return product ? product.name : "Selected Product"
  }

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
            <Select value={selectedProductId} onValueChange={setSelectedProductId} disabled={isLoadingProducts}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={isLoadingProducts ? "Loading products..." : "Select product"} />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {productError || dataError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load market comparison data. Please try again later.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              <MarketComparisonChart
                data={marketPrices}
                isLoading={isLoadingProducts || isDataLoading}
                productName={getSelectedProductName()}
              />
              <MarketComparisonTable data={marketPrices} isLoading={isLoadingProducts || isDataLoading} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
