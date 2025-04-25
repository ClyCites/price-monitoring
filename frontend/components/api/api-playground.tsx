"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ApiResponse {
  data: any
  status: number
  timestamp: string
}

export default function ApiPlayground() {
  // Forecast endpoint state
  const [forecastCommodity, setForecastCommodity] = useState("Beans")
  const [forecastLocation, setForecastLocation] = useState("Adjumani (refugee settlement)_Adjumani_Adjumani")
  const [forecastPeriod, setForecastPeriod] = useState("1_week")
  const [forecastLoading, setForecastLoading] = useState(false)
  const [forecastResponse, setForecastResponse] = useState<ApiResponse | null>(null)

  // Market trends endpoint state
  const [trendsCommodity, setTrendsCommodity] = useState("Beans")
  const [trendsDate, setTrendsDate] = useState(new Date().toISOString().split("T")[0])
  const [trendsLoading, setTrendsLoading] = useState(false)
  const [trendsResponse, setTrendsResponse] = useState<ApiResponse | null>(null)

  // Request history
  const [requestHistory, setRequestHistory] = useState<
    Array<{
      endpoint: string
      request: any
      response: ApiResponse
      timestamp: string
    }>
  >([])

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_DEV || "http://127.0.0.1:5000"

  // Handle forecast form submission
  const handleForecastSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForecastLoading(true)

    const requestData = {
      commodity: forecastCommodity,
      location: forecastLocation,
      forecast_period: forecastPeriod,
    }

    try {
      const response = await fetch(`${API_BASE_URL}/v1/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      const apiResponse: ApiResponse = {
        data,
        status: response.status,
        timestamp: new Date().toISOString(),
      }

      setForecastResponse(apiResponse)

      // Add to history
      setRequestHistory((prev) => [
        {
          endpoint: "forecast",
          request: requestData,
          response: apiResponse,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 9), // Keep last 10 requests
      ])

      if (!response.ok) {
        toast.error(`Error: ${data.message || "Failed to get forecast"}`)
      }
    } catch (error) {
      console.error("Forecast API error:", error)
      toast.error("Failed to connect to the forecast API")
    } finally {
      setForecastLoading(false)
    }
  }

  // Handle market trends form submission
  const handleTrendsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTrendsLoading(true)

    const requestData = {
      commodity: trendsCommodity,
      date: trendsDate,
    }

    try {
      const response = await fetch(`${API_BASE_URL}/v1/market-trends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      const apiResponse: ApiResponse = {
        data,
        status: response.status,
        timestamp: new Date().toISOString(),
      }

      setTrendsResponse(apiResponse)

      // Add to history
      setRequestHistory((prev) => [
        {
          endpoint: "market-trends",
          request: requestData,
          response: apiResponse,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 9), // Keep last 10 requests
      ])

      if (!response.ok) {
        toast.error(`Error: ${data.message || "Failed to get market trends"}`)
      }
    } catch (error) {
      console.error("Market trends API error:", error)
      toast.error("Failed to connect to the market trends API")
    } finally {
      setTrendsLoading(false)
    }
  }

  // Format JSON for display
  const formatJson = (json: any) => {
    try {
      return JSON.stringify(json, null, 2)
    } catch (e) {
      return "Error formatting JSON"
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="forecast" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forecast">Price Forecast</TabsTrigger>
          <TabsTrigger value="market-trends">Market Trends</TabsTrigger>
          <TabsTrigger value="history">Request History</TabsTrigger>
        </TabsList>

        {/* Forecast Tab */}
        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>Price Forecast API</CardTitle>
              <CardDescription>
                Predict future prices for agricultural commodities based on historical data and market factors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForecastSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="forecast-commodity" className="text-sm font-medium">
                      Commodity
                    </label>
                    <Input
                      id="forecast-commodity"
                      value={forecastCommodity}
                      onChange={(e) => setForecastCommodity(e.target.value)}
                      placeholder="Enter commodity name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="forecast-location" className="text-sm font-medium">
                      Location
                    </label>
                    <Input
                      id="forecast-location"
                      value={forecastLocation}
                      onChange={(e) => setForecastLocation(e.target.value)}
                      placeholder="Enter location"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="forecast-period" className="text-sm font-medium">
                    Forecast Period
                  </label>
                  <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                    <SelectTrigger id="forecast-period">
                      <SelectValue placeholder="Select forecast period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2_days">2 Days</SelectItem>
                      <SelectItem value="1_week">1 Week</SelectItem>
                      <SelectItem value="1_month">1 Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={forecastLoading}>
                  {forecastLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Forecast...
                    </>
                  ) : (
                    "Get Price Forecast"
                  )}
                </Button>
              </form>

              {forecastResponse && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Response</h3>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-sm">
                      {formatJson(forecastResponse.data)}
                    </pre>
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(formatJson(forecastResponse.data))
                          toast.success("Response copied to clipboard")
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Status: {forecastResponse.status} • Time:{" "}
                    {new Date(forecastResponse.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Trends Tab */}
        <TabsContent value="market-trends">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends API</CardTitle>
              <CardDescription>
                Analyze market trends for agricultural commodities across different locations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrendsSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="trends-commodity" className="text-sm font-medium">
                      Commodity
                    </label>
                    <Input
                      id="trends-commodity"
                      value={trendsCommodity}
                      onChange={(e) => setTrendsCommodity(e.target.value)}
                      placeholder="Enter commodity name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="trends-date" className="text-sm font-medium">
                      Date
                    </label>
                    <Input
                      id="trends-date"
                      type="date"
                      value={trendsDate}
                      onChange={(e) => setTrendsDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={trendsLoading}>
                  {trendsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Trends...
                    </>
                  ) : (
                    "Get Market Trends"
                  )}
                </Button>
              </form>

              {trendsResponse && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Response</h3>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-sm">
                      {formatJson(trendsResponse.data)}
                    </pre>
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(formatJson(trendsResponse.data))
                          toast.success("Response copied to clipboard")
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Status: {trendsResponse.status} • Time: {new Date(trendsResponse.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Request History</CardTitle>
              <CardDescription>View your recent API requests and responses.</CardDescription>
            </CardHeader>
            <CardContent>
              {requestHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No request history yet. Make some API calls to see them here.
                </div>
              ) : (
                <div className="space-y-4">
                  {requestHistory.map((item, index) => (
                    <Card key={index}>
                      <CardHeader className="py-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {item.endpoint === "forecast" ? "Price Forecast" : "Market Trends"}
                          </CardTitle>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="py-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Request</h4>
                            <pre className="bg-muted p-2 rounded-md overflow-auto max-h-[200px] text-xs">
                              {formatJson(item.request)}
                            </pre>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Response</h4>
                            <pre className="bg-muted p-2 rounded-md overflow-auto max-h-[200px] text-xs">
                              {formatJson(item.response.data)}
                            </pre>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">Status: {item.response.status}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Documentation Link */}
      <div className="text-center">
        <a
          href="#"
          className="text-sm text-primary hover:underline"
          onClick={(e) => {
            e.preventDefault()
            toast.info("API documentation link will be added here")
          }}
        >
          View API Documentation
        </a>
      </div>
    </div>
  )
}
