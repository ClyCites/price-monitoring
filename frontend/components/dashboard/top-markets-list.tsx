"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { MarketAverage } from "@/lib/api/prices";

interface TopMarketsListProps {
  markets: MarketAverage[];
  isLoading: boolean;
}

// Sample data when API is not available
const sampleMarkets = [
  { _id: "Nakasero Market", avgPrice: 2500, trend: "up" },
  { _id: "Mbale Central Market", avgPrice: 2400, trend: "down" },
  { _id: "Owino Market", avgPrice: 2600, trend: "up" },
  { _id: "Mbarara Central Market", avgPrice: 2350, trend: "down" },
  { _id: "Gulu Main Market", avgPrice: 2450, trend: "up" },
];

export default function TopMarketsList({
  markets = [],
  isLoading,
}: TopMarketsListProps) {
  // Format the markets data to handle different structures
  const formatMarkets = () => {
    if (markets.length === 0) return sampleMarkets;

    return markets.map((market, index) => {
      // Handle different data structures
      const marketName =
        typeof market.market === "object"
          ? market.market?.name
          : //@ts-expect-error
          market._id?.name
          ? //@ts-expect-error
            market._id.name
          : typeof market._id === "string"
          ? market._id
          : "Unknown Market";

      const price = market.avgPrice || market.price || 0;

      return {
        _id: marketName,
        avgPrice: price,
        trend: index % 2 === 0 ? "up" : "down", // Just for demonstration
      };
    });
  };

  const displayMarkets = formatMarkets();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayMarkets.map((market) => (
        <div
          key={market._id}
          className="flex items-center justify-between p-3 rounded-md border border-gray-200 dark:border-gray-700"
        >
          <div>
            <p className="font-medium">{market._id}</p>
            <p className="text-sm text-muted-foreground">
              UGX {market.avgPrice.toLocaleString()}
            </p>
          </div>
          <div
            className={
              market.trend === "up" ? "text-green-600" : "text-red-600"
            }
          >
            {market.trend === "up" ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
