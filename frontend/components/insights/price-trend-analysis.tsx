"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, TrendingUpIcon } from "lucide-react"

interface PricePrediction {
  date: string
  price: number
  price_lower: number
  price_upper: number
}

interface ForecastData {
  commodity: string
  forecast_period: string
  location: string
  predictions: PricePrediction[]
  timestamp: string
}

interface MarketPrice {
  location_key: string
  price: number
  region: string
}

interface MarketTrendsData {
  commodity: string
  date: string
  prices: MarketPrice[]
  timestamp: string
}

interface PriceTrendAnalysisProps {
  forecastData: ForecastData
  marketTrendsData: MarketTrendsData
}

export default function PriceTrendAnalysis({ forecastData, marketTrendsData }: PriceTrendAnalysisProps) {
  // Format data for the chart
  const chartData = forecastData.predictions.map((prediction) => ({
    date: new Date(prediction.date).toLocaleDateString(),
    price: Math.round(prediction.price),
    price_lower: Math.round(prediction.price_lower),
    price_upper: Math.round(prediction.price_upper),
  }))

  // Calculate trend metrics
  const firstPrice = chartData[0]?.price || 0
  const lastPrice = chartData[chartData.length - 1]?.price || 0
  const priceDifference = lastPrice - firstPrice
  const percentageChange = (priceDifference / firstPrice) * 100

  // Determine trend direction
  const trendDirection = priceDifference > 0 ? "up" : priceDifference < 0 ? "down" : "stable"

  // Calculate volatility (standard deviation of prices)
  const prices = chartData.map((d) => d.price)
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length
  const volatility = Math.sqrt(variance)

  // Calculate price range
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice

  // Format currency
  const formatCurrency = (value: number) => {
    return `UGX ${value.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Price Trend for {forecastData.commodity}</h3>
        <Badge variant={trendDirection === "up" ? "destructive" : trendDirection === "down" ? "default" : "outline"}>
          {trendDirection === "up" ? (
            <ArrowUpIcon className="mr-1 h-3 w-3" />
          ) : trendDirection === "down" ? (
            <ArrowDownIcon className="mr-1 h-3 w-3" />
          ) : (
            <ArrowRightIcon className="mr-1 h-3 w-3" />
          )}
          {percentageChange.toFixed(1)}% {trendDirection}
        </Badge>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip
              formatter={(value: number) => [`${formatCurrency(value)}`, ""]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <ReferenceLine y={mean} stroke="#8884d8" strokeDasharray="3 3" label="Average" />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Predicted Price"
            />
            <Line type="monotone" dataKey="price_upper" stroke="#93c5fd" strokeDasharray="3 3" name="Upper Bound" />
            <Line type="monotone" dataKey="price_lower" stroke="#93c5fd" strokeDasharray="3 3" name="Lower Bound" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Price Trend</h3>
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">
              {trendDirection === "up" ? (
                <span className="text-red-600">Rising</span>
              ) : trendDirection === "down" ? (
                <span className="text-green-600">Falling</span>
              ) : (
                <span className="text-amber-600">Stable</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {Math.abs(percentageChange).toFixed(1)}%{" "}
              {trendDirection === "up" ? "increase" : trendDirection === "down" ? "decrease" : "change"} over period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-1">Price Volatility</h3>
            <p className="text-2xl font-bold">{formatCurrency(volatility)}</p>
            <p className="text-xs text-muted-foreground">Standard deviation of prices</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-1">Price Range</h3>
            <p className="text-2xl font-bold">{formatCurrency(priceRange)}</p>
            <p className="text-xs text-muted-foreground">
              From {formatCurrency(minPrice)} to {formatCurrency(maxPrice)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Market Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Based on the forecast, prices for {forecastData.commodity} in {forecastData.location.split("_")[0]} are
          expected to
          {trendDirection === "up"
            ? " increase over the coming period. Consider purchasing soon before prices rise further."
            : trendDirection === "down"
              ? " decrease in the coming period. Consider delaying purchases to benefit from lower prices."
              : " remain relatively stable in the coming period."}{" "}
          The price volatility is {volatility > 200 ? "high" : volatility > 100 ? "moderate" : "low"}, indicating
          {volatility > 200
            ? " significant uncertainty in the market."
            : volatility > 100
              ? " some uncertainty in the market."
              : " a relatively stable market."}
        </p>
      </div>
    </div>
  )
}
