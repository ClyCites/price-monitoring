"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface PriceTrendChartProps {
  className?: string
}

const timeRanges = ["1W", "1M", "3M", "6M", "1Y", "All"]

export default function PriceTrendChart({ className }: PriceTrendChartProps) {
  const [selectedRange, setSelectedRange] = useState("3M")

  // Sample data for rice prices over time
  const data = [
    { date: "Jan", price: 420 },
    { date: "Feb", price: 430 },
    { date: "Mar", price: 425 },
    { date: "Apr", price: 440 },
    { date: "May", price: 455 },
    { date: "Jun", price: 470 },
    { date: "Jul", price: 465 },
    { date: "Aug", price: 450 },
    { date: "Sep", price: 445 },
    { date: "Oct", price: 460 },
    { date: "Nov", price: 475 },
    { date: "Dec", price: 450 },
  ]

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Rice Price Trends</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Historical price data for rice</p>
        </div>
        <div className="flex space-x-1">
          {timeRanges.map((range) => (
            <Button
              key={range}
              variant={selectedRange === range ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSelectedRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                          <span className="font-bold text-xs">{payload[0].payload.date}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">Price</span>
                          <span className="font-bold text-xs">${payload[0].value}</span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#22c55e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              dot={{ r: 0 }}
              activeDot={{ r: 6, fill: "#22c55e", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

