"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { format, parseISO } from "date-fns"

interface PriceTrendsChartProps {
  data: Array<{
    date: string
    price: number
  }>
  isLoading: boolean
}

export default function PriceTrendsChart({ data, isLoading }: PriceTrendsChartProps) {
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

  // Format dates for display
  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: format(parseISO(item.date), "MMM dd"),
  }))

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} tickLine={{ stroke: "rgba(107, 114, 128, 0.2)" }} />
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
            name="Price (UGX)"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

