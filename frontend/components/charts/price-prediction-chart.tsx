"use client"

import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

interface PricePredictionChartProps {
  className?: string
}

export default function PricePredictionChart({ className }: PricePredictionChartProps) {
  // Sample data for actual and predicted prices
  const data = [
    { date: "Jan", actual: 420, predicted: 425 },
    { date: "Feb", actual: 430, predicted: 428 },
    { date: "Mar", actual: 425, predicted: 432 },
    { date: "Apr", actual: 440, predicted: 438 },
    { date: "May", actual: 455, predicted: 450 },
    { date: "Jun", actual: 470, predicted: 465 },
    // Past data ends, future predictions begin
    { date: "Jul", predicted: 480 },
    { date: "Aug", predicted: 490 },
    { date: "Sep", predicted: 485 },
    { date: "Oct", predicted: 495 },
    { date: "Nov", predicted: 510 },
    { date: "Dec", predicted: 520 },
  ]

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">AI Price Forecast</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Actual vs. predicted prices</p>
        </div>
        <Select defaultValue="rice">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rice">Rice</SelectItem>
            <SelectItem value="wheat">Wheat</SelectItem>
            <SelectItem value="corn">Corn</SelectItem>
            <SelectItem value="soybeans">Soybeans</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="text-xs font-bold">{label}</div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {payload.map((entry) => (
                          <div key={entry.name} className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {entry.name === "actual" ? "Actual" : "Predicted"}
                            </span>
                            <span className="font-bold text-xs" style={{ color: entry.color }}>
                              ${entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend
              content={({ payload }) => {
                return (
                  <div className="flex justify-center gap-4 text-xs">
                    {payload?.map((entry, index) => (
                      <div key={`item-${index}`} className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: entry.color,
                            borderStyle: entry.value === "predicted" ? "dashed" : "solid",
                            borderWidth: entry.value === "predicted" ? "1px" : "0",
                            borderColor: entry.color,
                          }}
                        />
                        <span>{entry.value === "actual" ? "Actual" : "Predicted"}</span>
                      </div>
                    ))}
                  </div>
                )
              }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

