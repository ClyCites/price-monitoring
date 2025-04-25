"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import PriceForecastChart from "@/components/insights/price-forecast-chart"
import MarketComparisonChart from "@/components/insights/market-comparison-chart"
import PriceTrendAnalysis from "@/components/insights/price-trend-analysis"
import RegionalHeatmap from "@/components/insights/regional-heatmap"
import { useQuery } from "@tanstack/react-query"

interface HealthData {
  commodities: string[]
  locations: Record<string, string[]>
  status: string
  timestamp: string
}

interface ForecastData {
  commodity: string
  forecast_period: string
  location: string
  predictions: Array<{
    date: string
    price: number
    price_lower: number
    price_upper: number
  }>
  timestamp: string
}

interface MarketTrendsData {
  commodity: string
  date: string
  prices: Array<{
    location_key: string
    price: number
    region: string
  }>
  timestamp: string
}

export default function DataInsightsDashboard() {
  // State for selected options
  const [selectedCommodity, setSelectedCommodity] = useState<string>("")
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [forecastPeriod, setForecastPeriod] = useState<string>("1_week")
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split("T")[0])

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_DEV || "http://localhost:5000"

  // Fetch available commodities and locations
  const {
    data: healthData,
    isLoading: isLoadingHealth,
    refetch: refetchHealth,
  } = useQuery<HealthData>({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/v1/health`)
      if (!response.ok) {
        throw new Error("Failed to fetch API health data")
      }
      return response.json()
    },
  })

  // Set default commodity and location when health data is loaded
  useEffect(() => {
    if (healthData && healthData.commodities.length > 0) {
      const defaultCommodity = healthData.commodities[0]
      setSelectedCommodity(defaultCommodity)

      if (healthData.locations[defaultCommodity]?.length > 0) {
        setSelectedLocation(healthData.locations[defaultCommodity][0])
      }
    }
  }, [healthData])

  // Fetch forecast data
  const {
    data: forecastData,
    isLoading: isLoadingForecast,
    refetch: refetchForecast,
  } = useQuery<ForecastData>({
    queryKey: ["forecast", selectedCommodity, selectedLocation, forecastPeriod],
    queryFn: async () => {
      if (!selectedCommodity || !selectedLocation) return null

      const response = await fetch(`${API_BASE_URL}/v1/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commodity: selectedCommodity,
          location: selectedLocation,
          forecast_period: forecastPeriod,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch forecast data")
      }

      return response.json()
    },
    enabled: !!selectedCommodity && !!selectedLocation,
  })

  // Fetch market trends data
  const {
    data: marketTrendsData,
    isLoading: isLoadingMarketTrends,
    refetch: refetchMarketTrends,
  } = useQuery<MarketTrendsData>({
    queryKey: ["marketTrends", selectedCommodity, currentDate],
    queryFn: async () => {
      if (!selectedCommodity) return null

      const response = await fetch(`${API_BASE_URL}/v1/market-trends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commodity: selectedCommodity,
          date: currentDate,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch market trends data")
      }

      return response.json()
    },
    enabled: !!selectedCommodity,
  })

  // Handle commodity change
  const handleCommodityChange = (value: string) => {
    setSelectedCommodity(value)

    // Reset location if the new commodity doesn't have the currently selected location
    if (healthData && !healthData.locations[value]?.includes(selectedLocation)) {
      setSelectedLocation(healthData.locations[value]?.[0] || "")
    }
  }

  // Refresh all data
  const refreshAllData = () => {
    refetchHealth()
    refetchForecast()
    refetchMarketTrends()
    toast.success("Data refreshed successfully")
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Data Selection</CardTitle>
          <CardDescription>Select commodity and location to analyze price data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Commodity Selection */}
            <div className="space-y-2">
              <label htmlFor="commodity" className="text-sm font-medium">
                Commodity
              </label>
              <Select value={selectedCommodity} onValueChange={handleCommodityChange} disabled={isLoadingHealth}>
                <SelectTrigger id="commodity">
                  <SelectValue placeholder="Select commodity" />
                </SelectTrigger>
                <SelectContent>
                  {healthData?.commodities.map((commodity) => (
                    <SelectItem key={commodity} value={commodity}>
                      {commodity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Selection */}
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
                disabled={isLoadingHealth || !selectedCommodity}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {healthData?.locations[selectedCommodity]?.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location.split("_")[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Forecast Period */}
            <div className="space-y-2">
              <label htmlFor="forecast-period" className="text-sm font-medium">
                Forecast Period
              </label>
              <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                <SelectTrigger id="forecast-period">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2_days">2 Days</SelectItem>
                  <SelectItem value="1_week">1 Week</SelectItem>
                  <SelectItem value="1_month">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <Button onClick={refreshAllData} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Content */}
      <Tabs defaultValue="forecast" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecast">Price Forecast</TabsTrigger>
          <TabsTrigger value="market-comparison">Market Comparison</TabsTrigger>
          <TabsTrigger value="trend-analysis">Trend Analysis</TabsTrigger>
          <TabsTrigger value="regional-map">Regional Map</TabsTrigger>
        </TabsList>

        {/* Price Forecast Tab */}
        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>Price Forecast</CardTitle>
              <CardDescription>
                Predicted price trends for {selectedCommodity} in {selectedLocation?.split("_")[0]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingForecast ? (
                <div className="flex justify-center items-center h-80">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : forecastData?.predictions ? (
                <PriceForecastChart data={forecastData} />
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  Select a commodity and location to view price forecasts
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Comparison Tab */}
        <TabsContent value="market-comparison">
          <Card>
            <CardHeader>
              <CardTitle>Market Price Comparison</CardTitle>
              <CardDescription>Compare {selectedCommodity} prices across different markets</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMarketTrends ? (
                <div className="flex justify-center items-center h-80">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : marketTrendsData?.prices ? (
                <MarketComparisonChart data={marketTrendsData} />
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  Select a commodity to view market comparisons
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trend Analysis Tab */}
        <TabsContent value="trend-analysis">
          <Card>
            <CardHeader>
              <CardTitle>Price Trend Analysis</CardTitle>
              <CardDescription>Analyze historical price trends and seasonality for {selectedCommodity}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingForecast || isLoadingMarketTrends ? (
                <div className="flex justify-center items-center h-80">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : forecastData?.predictions && marketTrendsData?.prices ? (
                <PriceTrendAnalysis forecastData={forecastData} marketTrendsData={marketTrendsData} />
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  Select a commodity and location to view trend analysis
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Map Tab */}
        <TabsContent value="regional-map">
          <Card>
            <CardHeader>
              <CardTitle>Regional Price Heatmap</CardTitle>
              <CardDescription>Visualize {selectedCommodity} price variations across regions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMarketTrends ? (
                <div className="flex justify-center items-center h-80">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : marketTrendsData?.prices ? (
                <RegionalHeatmap data={marketTrendsData} />
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  Select a commodity to view regional price variations
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium">Selected Commodity</h3>
              <p className="text-sm text-muted-foreground">{selectedCommodity || "None selected"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Selected Location</h3>
              <p className="text-sm text-muted-foreground">
                {selectedLocation ? selectedLocation.split("_")[0] : "None selected"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Last Updated</h3>
              <p className="text-sm text-muted-foreground">
                {forecastData?.timestamp ? new Date(forecastData.timestamp).toLocaleString() : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
