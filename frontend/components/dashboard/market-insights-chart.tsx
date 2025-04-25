"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { MarketAverage as OriginalMarketAverage } from "@/lib/api/prices";

interface MarketAverage extends OriginalMarketAverage {
  marketId: { name: string } | string;
}

interface MarketInsightsChartProps {
  isLoading: boolean;
  data: MarketAverage[];
}

// Sample data for when API is not available
const sampleData = [
  { marketId: "Nakasero Market", avgPrice: 2500 },
  { marketId: "Mbale Central Market", avgPrice: 2400 },
  { marketId: "Owino Market", avgPrice: 2600 },
  { marketId: "Mbarara Central Market", avgPrice: 2350 },
  { marketId: "Gulu Main Market", avgPrice: 2450 },
  { marketId: "Bugema Market", avgPrice: 2300 },
];

export default function MarketInsightsChart({
  isLoading,
  data = [],
}: MarketInsightsChartProps) {
  // Use sample data if no real data is available
  const chartData = data.length > 0 ? data : sampleData;

  // Format data for the chart if needed
  const formattedData = chartData.map((market) => {
    // Handle both object and string formats
    const marketName =
      typeof market.marketId === "object" && market.marketId?.name
        ? market.marketId.name
        : typeof market.marketId === "string"
        ? market.marketId
        : "Unknown Market";

    return {
      market: marketName,
      avgPrice: market.avgPrice || 0,
    };
  });

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="market"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "rgba(107, 114, 128, 0.2)" }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
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
          <Bar
            dataKey="avgPrice"
            name="Average Price (UGX)"
            fill="#16a34a"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
