import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMarkets,
  getMarketById,
  addMarket,
  updateMarket,
  deleteMarket,
} from "@/lib/api/markets";

// Query keys
export const marketKeys = {
  all: ["markets"] as const,
  lists: () => [...marketKeys.all, "list"] as const,
  list: (filters: Record<string, string>) =>
    [...marketKeys.lists(), filters] as const,
  details: () => [...marketKeys.all, "detail"] as const,
  detail: (id: string) => [...marketKeys.details(), id] as const,
};

// Hooks for fetching markets
export function useMarkets() {
  return useQuery({
    queryKey: marketKeys.lists(),
    queryFn: () => getMarkets(),
  });
}

export function useMarketById(id: string) {
  return useQuery({
    queryKey: marketKeys.detail(id),
    queryFn: () => getMarketById(id),
    enabled: !!id,
  });
}

// Hooks for mutations
export function useAddMarket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => addMarket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketKeys.lists() });
    },
  });
}

export function useUpdateMarket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateMarket(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: marketKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: marketKeys.lists() });
    },
  });
}

export function useDeleteMarket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMarket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketKeys.lists() });
    },
  });
}
