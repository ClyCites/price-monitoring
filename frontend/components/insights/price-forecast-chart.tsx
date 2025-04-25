"use client"

import { Card } from "@/components/ui/card"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from "recharts"

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

interface PriceForecastChartProps {
  data: ForecastData
}

export default function PriceForecastChart({ data }: PriceForecastChartProps) {
  // Format data for the chart
  const chartData = data.predictions.map((prediction) => ({
    date: new Date(prediction.date).toLocaleDateString(),
    price: Math.round(prediction.price),
    price_lower: Math.round(prediction.price_lower),
    price_upper: Math.round(prediction.price_upper),
    confidence_range: Math.round(prediction.price_upper - prediction.price_lower),
  }))

  // Calculate min and max for Y axis
  const minPrice = Math.min(...data.predictions.map((p) => p.price_lower))
  const maxPrice = Math.max(...data.predictions.map((p) => p.price_upper))
  const yAxisMin = Math.floor(minPrice * 0.95)
  const yAxisMax = Math.ceil(maxPrice * 1.05)

  // Format currency
  const formatCurrency = (value: number) => {
    return `UGX ${value.toLocaleString()}`
  }

  return (
    <div className="space-y-4">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[yAxisMin, yAxisMax]} tickFormatter={formatCurrency} />
            <Tooltip
              formatter={(value: number) => [`${formatCurrency(value)}`, ""]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="price_upper"
              fill="rgba(59, 130, 246, 0.1)"
              stroke="transparent"
              name="Upper Bound"
            />
            <Area
              type="monotone"
              dataKey="price_lower"
              fill="rgba(59, 130, 246, 0.1)"
              stroke="transparent"
              name="Lower Bound"
              baseValue={yAxisMin}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Predicted Price"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-1">Current Price</h3>
          <p className="text-2xl font-bold">{formatCurrency(chartData[0]?.price || 0)}</p>
          <p className="text-xs text-muted-foreground">As of {chartData[0]?.date}</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium mb-1">Forecasted High</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(Math.max(...chartData.map((d) => d.price)))}
          </p>
          <p className="text-xs text-muted-foreground">
            Expected on{" "}
            {chartData[chartData.findIndex((d) => d.price === Math.max(...chartData.map((d) => d.price)))].date}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium mb-1">Price Volatility</h3>
          <p className="text-2xl font-bold text-amber-600">
            {formatCurrency(Math.max(...chartData.map((d) => d.confidence_range)))}
          </p>
          <p className="text-xs text-muted-foreground">Maximum price uncertainty range</p>
        </Card>
      </div>
    </div>
  )
}
