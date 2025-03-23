"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePrices, useDeletePrice } from "@/lib/hooks/use-prices"
import { Plus, Filter, Search } from "lucide-react"
import PricesTable from "./prices-table"
import Link from "next/link"
import { toast } from "sonner"

export default function PricesView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [productFilter, setProductFilter] = useState("all")
  const [marketFilter, setMarketFilter] = useState("all")

  // Fetch prices with React Query
  const {
    data: prices = [],
    isLoading,
    refetch,
  } = usePrices(productFilter !== "all" ? productFilter : undefined, marketFilter !== "all" ? marketFilter : undefined)

  // Delete price mutation
  const deletePriceMutation = useDeletePrice()

  // Get unique products and markets for filters
  const products = Array.from(new Set(prices.map((price: any) => price.product)))
  const markets = Array.from(new Set(prices.map((price: any) => price.market)))

  const handleDeletePrice = async (id: string) => {
    // Show a confirmation toast
    toast.promise(
      // Return the promise from the mutation
      new Promise((resolve, reject) => {
        deletePriceMutation.mutate(id, {
          onSuccess: () => resolve(true),
          onError: (error) => reject(error),
        })
      }),
      {
        loading: "Deleting price entry...",
        success: "Price entry deleted successfully",
        error: "Failed to delete price entry",
      },
    )
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = () => {
    toast.loading("Applying filters...", {
      id: "filter-toast",
      duration: 1000,
    })
    refetch().then(() => {
      toast.success("Filters applied", {
        id: "filter-toast",
      })
    })
  }

  const filteredPrices = prices.filter((price: any) => {
    const searchLower = searchTerm.toLowerCase()
    return price.product.toLowerCase().includes(searchLower) || price.market.toLowerCase().includes(searchLower)
  })

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Price Management</h1>
        <Link href="/add-price">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Price
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products or markets..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map((product: string) => (
                    <SelectItem key={product} value={product}>
                      {product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={marketFilter} onValueChange={setMarketFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by market" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Markets</SelectItem>
                  {markets.map((market: string) => (
                    <SelectItem key={market} value={market}>
                      {market}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleFilterChange} disabled={isLoading}>
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>

          <PricesTable
            prices={filteredPrices}
            isLoading={isLoading}
            onDelete={handleDeletePrice}
            isDeleting={deletePriceMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}

