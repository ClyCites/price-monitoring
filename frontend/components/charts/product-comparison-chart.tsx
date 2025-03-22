"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

export default function ProductComparisonChart() {
  // Sample data for product price comparison
  const data = [
    { month: "Jan", rice: 420, wheat: 320, corn: 215, soybeans: 520 },
    { month: "Feb", rice: 430, wheat: 335, corn: 220, soybeans: 515 },
    { month: "Mar", rice: 425, wheat: 340, corn: 225, soybeans: 510 },
    { month: "Apr", rice: 440, wheat: 330, corn: 230, soybeans: 525 },
    { month: "May", rice: 455, wheat: 325, corn: 235, soybeans: 530 },
    { month: "Jun", rice: 470, wheat: 320, corn: 240, soybeans: 535 },
  ]

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Product Price Comparison</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Monthly price comparison across products</p>
        </div>
        <Select defaultValue="6m">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
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
                            <span className="text-[0.70rem] uppercase text-muted-foreground">{entry.name}</span>
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
                  <div className="flex justify-center gap-4 text-xs mt-2">
                    {payload?.map((entry, index) => (
                      <div key={`item-${index}`} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span>{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )
              }}
            />
            <Bar dataKey="rice" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="wheat" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="corn" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="soybeans" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

