"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import type { MarketAverage } from "@/lib/api/prices"

interface MarketInsightsChartProps {
  isLoading: boolean
  data: MarketAverage[]
}

// Sample data for when API is not available
const sampleData = [
  { _id: "Kampala Central", avgPrice: 2500 },
  { _id: "Owino Market", avgPrice: 2400 },
  { _id: "Nakasero", avgPrice: 2600 },
  { _id: "Kalerwe", avgPrice: 2350 },
  { _id: "Kikuubo", avgPrice: 2450 },
  { _id: "Nateete", avgPrice: 2300 },
]

export default function MarketInsightsChart({ isLoading, data = [] }: MarketInsightsChartProps) {
  // Use sample data if no real data is available
  const chartData = data.length > 0 ? data : sampleData

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="_id" tick={{ fontSize: 12 }} tickLine={{ stroke: "rgba(107, 114, 128, 0.2)" }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}`}
            tickLine={{ stroke: "rgba(107, 114, 128, 0.2)" }}
          />
          <Tooltip
            formatter={(value) => [`UGX ${value}`, "Average Price"]}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "6px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend />
          <Bar dataKey="avgPrice" name="Average Price (UGX)" fill="#16a34a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

