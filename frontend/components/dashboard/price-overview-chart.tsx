"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { usePriceTrends } from "@/lib/hooks/use-prices"

interface PriceOverviewChartProps {
  productType: string
}

// Sample data for when the API is not available
const sampleData = [
  { month: "Jan", price: 2100 },
  { month: "Feb", price: 2200 },
  { month: "Mar", price: 2350 },
  { month: "Apr", price: 2300 },
  { month: "May", price: 2450 },
  { month: "Jun", price: 2400 },
  { month: "Jul", price: 2500 },
  { month: "Aug", price: 2600 },
  { month: "Sep", price: 2550 },
  { month: "Oct", price: 2650 },
  { month: "Nov", price: 2700 },
  { month: "Dec", price: 2750 },
]

export default function PriceOverviewChart({ productType }: PriceOverviewChartProps) {
  // In a real app, fetch from actual API endpoint
  // const { data, isLoading, error } = usePriceTrends(productType, "all", 365);

  // For demo, we'll use sample data
  const { isLoading } = usePriceTrends(productType, "all", 365)

  // For demo, we'll modify the sample data based on product type
  const multiplier =
    productType === "rice"
      ? 1
      : productType === "maize"
        ? 0.7
        : productType === "beans"
          ? 1.2
          : productType === "coffee"
            ? 2.5
            : 1

  const chartData = sampleData.map((item) => ({
    ...item,
    price: Math.round(item.price * multiplier),
  }))

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={{ stroke: "rgba(107, 114, 128, 0.2)" }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}`}
            tickLine={{ stroke: "rgba(107, 114, 128, 0.2)" }}
          />
          <Tooltip
            formatter={(value) => [`UGX ${value}`, "Price"]}
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
            name={`${productType.charAt(0).toUpperCase() + productType.slice(1)} Price (UGX)`}
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ r: 0 }}
            activeDot={{ r: 6, fill: "#16a34a", stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

