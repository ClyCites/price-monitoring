import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getPrices,
  getPriceById,
  addPrice,
  updatePrice,
  deletePrice,
  getPriceTrends,
  getHistoricalPrices,
  compareMarketPrices,
  getTopMarketsForProduct,
  getAveragePricePerMarket,
  predictPrice,
  bulkImportPrices,
  type Price,
} from "@/lib/api/prices"
import { toast } from "sonner"

// Query keys
export const priceKeys = {
  all: ["prices"] as const,
  lists: () => [...priceKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...priceKeys.lists(), filters] as const,
  details: () => [...priceKeys.all, "detail"] as const,
  detail: (id: string) => [...priceKeys.details(), id] as const,
  trends: () => [...priceKeys.all, "trends"] as const,
  trend: (product: string, market: string, days: number) => [...priceKeys.trends(), product, market, days] as const,
  history: () => [...priceKeys.all, "history"] as const,
  historicalData: (product: string, market: string, limit: number) =>
    [...priceKeys.history(), product, market, limit] as const,
  comparison: () => [...priceKeys.all, "comparison"] as const,
  compareMarkets: (product: string) => [...priceKeys.comparison(), product] as const,
  topMarkets: () => [...priceKeys.all, "topMarkets"] as const,
  topMarketsForProduct: (product: string) => [...priceKeys.topMarkets(), product] as const,
  averages: () => [...priceKeys.all, "averages"] as const,
  averageByProduct: (product: string) => [...priceKeys.averages(), product] as const,
  predictions: () => [...priceKeys.all, "predictions"] as const,
  prediction: (product: string, market: string) => [...priceKeys.predictions(), product, market] as const,
}

// Hooks for fetching prices
export function usePrices(product?: string, market?: string) {
  const filters: Record<string, string> = {}
  if (product) filters.product = product
  if (market) filters.market = market

  return useQuery({
    queryKey: priceKeys.list(filters),
    queryFn: () => getPrices(product, market),
  })
}

export function usePriceById(id: string) {
  return useQuery({
    queryKey: priceKeys.detail(id),
    queryFn: () => getPriceById(id),
    enabled: !!id,
  })
}

export function usePriceTrends(product: string, market: string, days = 30) {
  return useQuery({
    queryKey: priceKeys.trend(product, market, days),
    queryFn: () => getPriceTrends(product, market, days),
    enabled: !!product && !!market,
  })
}

export function useHistoricalPrices(product: string, market: string, limit = 30) {
  return useQuery({
    queryKey: priceKeys.historicalData(product, market, limit),
    queryFn: () => getHistoricalPrices(product, market, limit),
    enabled: !!product && !!market,
  })
}

export function useMarketComparison(product: string) {
  return useQuery({
    queryKey: priceKeys.compareMarkets(product),
    queryFn: () => compareMarketPrices(product),
    enabled: !!product,
  })
}

export function useTopMarkets(product: string) {
  return useQuery({
    queryKey: priceKeys.topMarketsForProduct(product),
    queryFn: () => getTopMarketsForProduct(product),
    enabled: !!product,
  })
}

export function useAveragePrices(product: string) {
  return useQuery({
    queryKey: priceKeys.averageByProduct(product),
    queryFn: () => getAveragePricePerMarket(product),
    enabled: !!product,
  })
}

export function usePricePrediction(product: string, market: string) {
  return useQuery({
    queryKey: priceKeys.prediction(product, market),
    queryFn: () => predictPrice(product, market),
    enabled: !!product && !!market,
  })
}

// Hooks for mutations
export function useAddPrice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Price) => addPrice(data),
    onSuccess: () => {
      toast.success("Price entry added successfully", {
        description: "The new price has been saved to the database.",
        duration: 3000,
      })
      queryClient.invalidateQueries({ queryKey: priceKeys.lists() })
    },
    onError: (error: any) => {
      toast.error("Failed to add price entry", {
        description: error.message || "An unexpected error occurred.",
        duration: 5000,
      })
    },
  })
}

export function useUpdatePrice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Price> }) => updatePrice(id, data),
    onSuccess: (_, variables) => {
      toast.success("Price entry updated successfully", {
        description: "Your changes have been saved.",
        duration: 3000,
      })
      queryClient.invalidateQueries({ queryKey: priceKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: priceKeys.lists() })
    },
    onError: (error: any) => {
      toast.error("Failed to update price entry", {
        description: error.message || "An unexpected error occurred.",
        duration: 5000,
      })
    },
  })
}

export function useDeletePrice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePrice(id),
    onSuccess: () => {
      toast.success("Price entry deleted successfully", {
        description: "The entry has been removed from the database.",
        duration: 3000,
      })
      queryClient.invalidateQueries({ queryKey: priceKeys.lists() })
    },
    onError: (error: any) => {
      toast.error("Failed to delete price entry", {
        description: error.message || "An unexpected error occurred.",
        duration: 5000,
      })
    },
  })
}

export function useBulkImportPrices() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (prices: Price[]) => bulkImportPrices(prices),
    onSuccess: (data) => {
      const count = Array.isArray(data) ? data.length : "multiple"
      toast.success(`${count} prices imported successfully`, {
        description: "The database has been updated with the new entries.",
        duration: 3000,
      })
      queryClient.invalidateQueries({ queryKey: priceKeys.lists() })
    },
    onError: (error: any) => {
      toast.error("Failed to import prices", {
        description: error.message || "An unexpected error occurred.",
        duration: 5000,
      })
    },
  })
}

