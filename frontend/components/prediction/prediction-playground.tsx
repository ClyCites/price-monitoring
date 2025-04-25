"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import axios from "axios"
import { format } from "date-fns"

interface PredictionResult {
  product: {
    id: string
    name: string
  }
  market: {
    id: string
    name: string
  }
  method: string
  predictions: Array<{
    date: string
    price: number
  }>
  generatedAt: string
}

export default function PredictionPlayground() {
  const [products, setProducts] = useState<Array<{ _id: string; name: string }>>([])
  const [markets, setMarkets] = useState<Array<{ _id: string; name: string }>>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [selectedMarket, setSelectedMarket] = useState("")
  const [predictionDays, setPredictionDays] = useState("7")
  const [predictionMethod, setPredictionMethod] = useState("ensemble")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null)
  const [historicalPrices, setHistoricalPrices] = useState<any[]>([])

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  // Fetch products and markets on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true)
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

        setIsLoadingData(false)
      } catch (err) {
        console.error("Error fetching initial data:", err)
        setError("Failed to load products and markets. Please try again.")
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [API_URL])

  // Fetch historical prices when product or market changes
  useEffect(() => {
    const fetchHistoricalPrices = async () => {
      if (!selectedProduct || !selectedMarket) return

      try {
        const response = await axios.get(`${API_URL}/prices`, {
          params: {
            product: selectedProduct,
            market: selectedMarket,
            limit: 30,
          },
        })

        const formattedData = response.data.map((price: any) => ({
          date: format(new Date(price.date), "yyyy-MM-dd"),
          price: price.price,
        }))

        setHistoricalPrices(formattedData)
      } catch (err) {
        console.error("Error fetching historical prices:", err)
      }
    }

    if (selectedProduct && selectedMarket) {
      fetchHistoricalPrices()
    }
  }, [selectedProduct, selectedMarket, API_URL])

  const handlePredict = async () => {
    if (!selectedProduct || !selectedMarket) {
      setError("Please select both a product and a market")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post(`${API_URL}/prices/predict`, {
        product: selectedProduct,
        market: selectedMarket,
        days: Number.parseInt(predictionDays),
        method: predictionMethod,
      })

      setPredictionResult(response.data)
    } catch (err: any) {
      console.error("Error making prediction:", err)
      setError(err.response?.data?.message || "Failed to generate prediction. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Combine historical and prediction data for chart
  const chartData = () => {
    if (!historicalPrices.length || !predictionResult) return []

    // Format historical data
    const historical = historicalPrices.map((item) => ({
      ...item,
      predictedPrice: null,
    }))

    // Format prediction data
    const predictions = predictionResult.predictions.map((item) => ({
      date: item.date,
      price: null,
      predictedPrice: item.price,
    }))

    // Combine both datasets
    return [...historical, ...predictions]
  }

  const predictionMethods = [
    { value: "ensemble", label: "Ensemble (Recommended)" },
    { value: "moving_average", label: "Moving Average" },
    { value: "linear_regression", label: "Linear Regression" },
    { value: "weighted_moving_average", label: "Weighted Moving Average" },
    { value: "exponential_smoothing", label: "Exponential Smoothing" },
    { value: "seasonal", label: "Seasonal Adjustment" },
  ]

  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Price Prediction Playground</h1>

      <Card>
        <CardHeader>
          <CardTitle>Predict Future Prices</CardTitle>
          <CardDescription>Select a product, market, and prediction method to forecast future prices</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Product</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={isLoadingData}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingData ? "Loading products..." : "Select product"} />
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

            <div>
              <label className="text-sm font-medium mb-1 block">Market</label>
              <Select value={selectedMarket} onValueChange={setSelectedMarket} disabled={isLoadingData}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingData ? "Loading markets..." : "Select market"} />
                </SelectTrigger>
                <SelectContent>
                  {markets.map((market) => (
                    <SelectItem key={market._id} value={market._id}>
                      {market.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Prediction Days</label>
              <Select value={predictionDays} onValueChange={setPredictionDays}>
                <SelectTrigger>
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Prediction Method</label>
              <Select value={predictionMethod} onValueChange={setPredictionMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {predictionMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handlePredict}
            disabled={isLoading || isLoadingData || !selectedProduct || !selectedMarket}
            className="w-full md:w-auto"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Generating Prediction..." : "Predict Prices"}
          </Button>

          {predictionResult && (
            <div className="mt-8">
              <Tabs defaultValue="chart">
                <TabsList className="mb-4">
                  <TabsTrigger value="chart">Chart View</TabsTrigger>
                  <TabsTrigger value="table">Table View</TabsTrigger>
                </TabsList>

                <TabsContent value="chart">
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: "rgba(107, 114, 128, 0.2)" }}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${value}`}
                          tickLine={{ stroke: "rgba(107, 114, 128, 0.2)" }}
                        />
                        <Tooltip
                          formatter={(value) => [`UGX ${value}`, "Price"]}
                          labelFormatter={(label) => `Date: ${label}`}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            borderRadius: "6px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="price"
                          name="Historical Price"
                          stroke="#16a34a"
                          strokeWidth={2}
                          dot={{ strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="predictedPrice"
                          name="Predicted Price"
                          stroke="#f97316"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="table">
                  <div className="border rounded-md overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-right">Predicted Price (UGX)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predictionResult.predictions.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{format(new Date(item.date), "MMM dd, yyyy")}</td>
                            <td className="px-4 py-2 text-right">{item.price.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>
                      Prediction generated at: {format(new Date(predictionResult.generatedAt), "MMM dd, yyyy HH:mm")}
                    </p>
                    <p>
                      Method:{" "}
                      {predictionMethods.find((m) => m.value === predictionResult.method)?.label ||
                        predictionResult.method}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
