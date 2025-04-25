"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import MarketsTable from "./markets-table";
import Link from "next/link";
import { toast } from "sonner";
import { useDeleteMarket, useMarkets } from "@/lib/hooks/use-markets";

export default function MarketsView() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch markets with React Query
  const { data: markets = [], isLoading, refetch } = useMarkets();

  // Delete market mutation
  const deleteMarketMutation = useDeleteMarket();

  const handleDeleteMarket = async (id: string) => {
    // Show a confirmation toast
    toast.promise(
      // Return the promise from the mutation
      new Promise((resolve, reject) => {
        deleteMarketMutation.mutate(id, {
          onSuccess: () => resolve(true),
          onError: (error: unknown) => reject(error),
        });
      }),
      {
        loading: "Deleting market...",
        success: "Market deleted successfully",
        error: "Failed to delete market",
      }
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredMarkets = markets.filter((market: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      market.name.toLowerCase().includes(searchLower) ||
      market.location.toLowerCase().includes(searchLower) ||
      market.region.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Markets Management</h1>
        <Link href="/add-market">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Market
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Markets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search markets by name, location or region..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8"
              />
            </div>
          </div>

          <MarketsTable
            markets={filteredMarkets}
            isLoading={isLoading}
            onDelete={handleDeleteMarket}
            isDeleting={deleteMarketMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
