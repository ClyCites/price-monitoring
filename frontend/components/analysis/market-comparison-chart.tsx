"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import type { Price } from "@/lib/api/prices"

interface MarketComparisonChartProps {
  data: Price[]
  isLoading: boolean
  productName: string
}

export default function MarketComparisonChart({ data, isLoading, productName }: MarketComparisonChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center border border-dashed rounded-md">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  // Format data for the chart
  const chartData = data.map((item) => ({
    market: item.market,
    price: item.price,
  }))

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="market"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "rgba(107, 114, 128, 0.2)" }}
            angle={-45}
            textAnchor="end"
            height={70}
          />
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
          <Bar
            dataKey="price"
            name={`${productName.charAt(0).toUpperCase() + productName.slice(1)} Price (UGX)`}
            fill="#16a34a"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

