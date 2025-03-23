"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PriceOverviewChart from "./price-overview-chart"
import MarketInsightsChart from "./market-insights-chart"
import RecentPricesTable from "../prices/recent-prices-table"
import TopMarketsList from "./top-markets-list"
import { usePrices, useAveragePrices } from "@/lib/hooks/use-prices"
import { GrapeIcon as Grain, Banana, Beef, Coffee } from "lucide-react"

export default function DashboardView() {
  const [selectedProduct, setSelectedProduct] = useState("rice")

  // Fetch prices data
  const { data: prices = [], isLoading: isPricesLoading } = usePrices()

  // Fetch market averages data
  const { data: marketAverages = [], isLoading: isAveragesLoading } = useAveragePrices(selectedProduct)

  // Get sample data for our dashboard stats
  const getStatData = () => {
    // In a real app, calculate these from actual data
    return {
      totalProducts: 24,
      totalMarkets: 16,
      avgPrice: 2250,
      priceChange: +5.7,
    }
  }

  const statData = getStatData()

  return (
    <div className="container mx-auto space-y-6">
      {/* Stats Overview Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={statData.totalProducts.toString()}
          description="Different agricultural products tracked"
          icon={<Grain className="h-5 w-5 text-emerald-600" />}
        />

        <StatCard
          title="Markets Covered"
          value={statData.totalMarkets.toString()}
          description="Across different regions"
          icon={<Banana className="h-5 w-5 text-yellow-500" />}
        />

        <StatCard
          title="Avg. Price (UGX)"
          value={statData.avgPrice.toLocaleString()}
          description={`${statData.priceChange >= 0 ? "↑" : "↓"} ${Math.abs(statData.priceChange)}% from last month`}
          icon={<Beef className="h-5 w-5 text-red-500" />}
          trend={statData.priceChange >= 0 ? "up" : "down"}
        />

        <StatCard
          title="Categories"
          value="5"
          description="Grains, Fruits, Vegetables, Meat, Beverages"
          icon={<Coffee className="h-5 w-5 text-amber-600" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Price Trends Overview</CardTitle>
            <CardDescription>Historical price trends for major agricultural products</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="rice" onValueChange={setSelectedProduct}>
              <TabsList className="mb-4">
                <TabsTrigger value="rice">Rice</TabsTrigger>
                <TabsTrigger value="maize">Maize</TabsTrigger>
                <TabsTrigger value="beans">Beans</TabsTrigger>
                <TabsTrigger value="coffee">Coffee</TabsTrigger>
              </TabsList>

              <PriceOverviewChart productType={selectedProduct} />
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Insights</CardTitle>
            <CardDescription>Price comparison across different markets</CardDescription>
          </CardHeader>
          <CardContent>
            <MarketInsightsChart isLoading={isAveragesLoading} data={marketAverages} />
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Price Updates</CardTitle>
            <CardDescription>Latest price entries from various markets</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentPricesTable prices={prices} isLoading={isPricesLoading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Markets</CardTitle>
            <CardDescription>Markets with the best prices for {selectedProduct}</CardDescription>
          </CardHeader>
          <CardContent>
            <TopMarketsList markets={marketAverages} isLoading={isAveragesLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
}

function StatCard({ title, value, description, icon, trend = "neutral" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">{icon}</div>
        </div>
        <p
          className={`text-xs mt-2 ${
            trend === "up"
              ? "text-emerald-600 dark:text-emerald-400"
              : trend === "down"
                ? "text-red-600 dark:text-red-400"
                : "text-muted-foreground"
          }`}
        >
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

