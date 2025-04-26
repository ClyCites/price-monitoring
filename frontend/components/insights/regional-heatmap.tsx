"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface RegionalHeatmapProps {
  data: MarketTrendsData
}

export default function RegionalHeatmap({ data }: RegionalHeatmapProps) {
  const [viewType, setViewType] = useState<"map" | "table">("map")

  // Format data for display
  const marketData = data.prices.map((price) => ({
    market: price.location_key.split("_")[0],
    region: price.region,
    price: Math.round(price.price),
  }))

  // Sort data by price (ascending)
  marketData.sort((a, b) => a.price - b.price)

  // Calculate price range for color scaling
  const minPrice = Math.min(...marketData.map((item) => item.price))
  const maxPrice = Math.max(...marketData.map((item) => item.price))
  const priceRange = maxPrice - minPrice

  // Format currency
  const formatCurrency = (value: number) => {
    return `UGX ${value.toLocaleString()}`
  }

  // Get color based on price (green for low, red for high)
  const getPriceColor = (price: number) => {
    if (priceRange === 0) return "bg-blue-100"

    const normalizedPrice = (price - minPrice) / priceRange

    if (normalizedPrice < 0.2) return "bg-green-100"
    if (normalizedPrice < 0.4) return "bg-green-200"
    if (normalizedPrice < 0.6) return "bg-yellow-100"
    if (normalizedPrice < 0.8) return "bg-orange-100"
    return "bg-red-100"
  }

  // Group markets by region
  const regionGroups = marketData.reduce(
    (groups, item) => {
      const region = item.region || "Unknown"
      if (!groups[region]) {
        groups[region] = []
      }
      groups[region].push(item)
      return groups
    },
    {} as Record<string, typeof marketData>,
  )

  return (
    <div className="space-y-4">
      <Tabs value={viewType} onValueChange={(value) => setViewType(value as "map" | "table")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">Visual Map</TabsTrigger>
          <TabsTrigger value="table">Data Table</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Simplified map visualization */}
            <div className="border rounded-lg p-4 h-[400px] overflow-auto">
              <h3 className="text-sm font-medium mb-4">Regional Price Map</h3>
              <div className="space-y-4">
                {Object.entries(regionGroups).map(([region, markets]) => (
                  <div key={region} className="space-y-2">
                    <h4 className="text-xs font-medium">{region}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {markets.map((market) => (
                        <div
                          key={market.market}
                          className={`${getPriceColor(market.price)} p-2 rounded-md text-center`}
                        >
                          <div className="text-xs font-medium dark:text-black">{market.market}</div>
                          <div className="text-xs dark:text-black">{formatCurrency(market.price)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price legend and statistics */}
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium mb-2">Price Legend</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-100 mr-2"></div>
                      <span className="text-xs">
                        Very Low: {formatCurrency(minPrice)} - {formatCurrency(minPrice + priceRange * 0.2)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-200 mr-2"></div>
                      <span className="text-xs">
                        Low: {formatCurrency(minPrice + priceRange * 0.2)} -{" "}
                        {formatCurrency(minPrice + priceRange * 0.4)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-100 mr-2"></div>
                      <span className="text-xs">
                        Medium: {formatCurrency(minPrice + priceRange * 0.4)} -{" "}
                        {formatCurrency(minPrice + priceRange * 0.6)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-orange-100 mr-2"></div>
                      <span className="text-xs">
                        High: {formatCurrency(minPrice + priceRange * 0.6)} -{" "}
                        {formatCurrency(minPrice + priceRange * 0.8)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-100 mr-2"></div>
                      <span className="text-xs">
                        Very High: {formatCurrency(minPrice + priceRange * 0.8)} - {formatCurrency(maxPrice)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium mb-2">Regional Statistics</h3>
                  <div className="space-y-2">
                    {Object.entries(regionGroups).map(([region, markets]) => {
                      const regionPrices = markets.map((m) => m.price)
                      const avgPrice = regionPrices.reduce((sum, price) => sum + price, 0) / regionPrices.length

                      return (
                        <div key={region} className="flex justify-between items-center">
                          <span className="text-xs">{region}</span>
                          <span className="text-xs font-medium">{formatCurrency(avgPrice)}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="table" className="pt-4">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-2 text-xs font-medium">Market</th>
                  <th className="text-left p-2 text-xs font-medium">Region</th>
                  <th className="text-right p-2 text-xs font-medium">Price</th>
                  <th className="text-right p-2 text-xs font-medium">Comparison</th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((item, index) => (
                  <tr key={item.market} className={index % 2 === 0 ? "bg-muted/30" : "bg-muted/30"}>
                    <td className="p-2 text-xs">{item.market}</td>
                    <td className="p-2 text-xs">{item.region}</td>
                    <td className="p-2 text-xs text-right">{formatCurrency(item.price)}</td>
                    <td className="p-2 text-xs text-right">
                      {index === 0 ? (
                        <span className="text-green-600">Lowest</span>
                      ) : index === marketData.length - 1 ? (
                        <span className="text-red-600">Highest</span>
                      ) : (
                        <span className="text-muted-foreground">
                          {((item.price / marketData[0].price - 1) * 100).toFixed(1)}% above lowest
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <div>
        <h3 className="text-sm font-medium mb-2">Regional Insights</h3>
        <p className="text-sm text-muted-foreground">
          The data shows significant regional price variations for {data.commodity}.
          {Object.keys(regionGroups).length > 1
            ? ` Prices are generally ${
                regionGroups[Object.keys(regionGroups)[0]][0].price <
                regionGroups[Object.keys(regionGroups)[Object.keys(regionGroups).length - 1]][0].price
                  ? "lower"
                  : "higher"
              } in ${Object.keys(regionGroups)[0]} compared to ${
                Object.keys(regionGroups)[Object.keys(regionGroups).length - 1]
              }. Consider sourcing from lower-priced regions when possible.`
            : " Limited regional data is available for comprehensive comparison."}
        </p>
      </div>
    </div>
  )
}
