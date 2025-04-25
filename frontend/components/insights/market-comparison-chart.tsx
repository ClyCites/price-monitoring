"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent } from "@/components/ui/card"

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

interface MarketComparisonChartProps {
  data: MarketTrendsData
}

export default function MarketComparisonChart({ data }: MarketComparisonChartProps) {
  // Format data for the chart
  const chartData = data.prices.map((price) => ({
    market: price.location_key.split("_")[0],
    price: Math.round(price.price),
    region: price.region,
  }))

  // Sort data by price (ascending)
  chartData.sort((a, b) => a.price - b.price)

  // Calculate average price
  const averagePrice = chartData.reduce((sum, item) => sum + item.price, 0) / chartData.length

  // Format currency
  const formatCurrency = (value: number) => {
    return `UGX ${value.toLocaleString()}`
  }

  // Colors for bars
  const colors = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"]

  return (
    <div className="space-y-6">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 70 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="market" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip
              formatter={(value: number) => [`${formatCurrency(value)}`, "Price"]}
              labelFormatter={(label) => `Market: ${label}`}
            />
            <Legend />
            <Bar dataKey="price" name="Price" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-1">Lowest Price</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(chartData[0]?.price || 0)}</p>
            <p className="text-xs text-muted-foreground">Market: {chartData[0]?.market || "N/A"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-1">Average Price</h3>
            <p className="text-2xl font-bold">{formatCurrency(averagePrice)}</p>
            <p className="text-xs text-muted-foreground">Across {chartData.length} markets</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-1">Highest Price</h3>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(chartData[chartData.length - 1]?.price || 0)}
            </p>
            <p className="text-xs text-muted-foreground">Market: {chartData[chartData.length - 1]?.market || "N/A"}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Price Difference Analysis</h3>
        <p className="text-sm text-muted-foreground">
          The price difference between the cheapest and most expensive market is
          <span className="font-medium text-amber-600">
            {" "}
            {formatCurrency((chartData[chartData.length - 1]?.price || 0) - (chartData[0]?.price || 0))}
          </span>
          , representing a
          <span className="font-medium text-amber-600">
            {" "}
            {Math.round(((chartData[chartData.length - 1]?.price || 0) / (chartData[0]?.price || 1) - 1) * 100)}%
          </span>
          price premium in {chartData[chartData.length - 1]?.market || "N/A"} compared to{" "}
          {chartData[0]?.market || "N/A"}.
        </p>
      </div>
    </div>
  )
}
