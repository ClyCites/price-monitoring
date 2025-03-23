"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import type { Price } from "@/lib/api/prices"

interface MarketComparisonTableProps {
  data: Price[]
  isLoading: boolean
}

export default function MarketComparisonTable({ data, isLoading }: MarketComparisonTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <p className="text-muted-foreground">No market data available</p>
      </div>
    )
  }

  // Calculate average price across all markets
  const avgPrice = data.reduce((sum, item) => sum + item.price, 0) / data.length

  // Sort data by price (lowest to highest)
  const sortedData = [...data].sort((a, b) => a.price - b.price)

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Market</TableHead>
            <TableHead>Price (UGX)</TableHead>
            <TableHead>Compared to Average</TableHead>
            <TableHead>Best Deal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, index) => {
            const priceDiff = item.price - avgPrice
            const percentDiff = (priceDiff / avgPrice) * 100

            return (
              <TableRow key={item._id || index}>
                <TableCell className="font-medium">{item.market}</TableCell>
                <TableCell>{item.price.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className={priceDiff < 0 ? "text-green-600" : "text-red-600"}>
                      {priceDiff < 0 ? (
                        <ArrowDownRight className="h-4 w-4 inline mr-1" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 inline mr-1" />
                      )}
                      {Math.abs(percentDiff).toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground text-xs ml-2">
                      ({priceDiff < 0 ? "-" : "+"}UGX {Math.abs(priceDiff).toLocaleString()})
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {index === 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Best Price
                    </span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

