"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Pencil, Trash2, Plus, Loader2, Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import axios from "axios"

// Form schema for market
const marketSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  region: z.string().min(2, "Region must be at least 2 characters"),
  country: z.string().optional(),
})

type MarketFormValues = z.infer<typeof marketSchema>

interface Market {
  _id: string
  name: string
  location: string
  region: string
  country?: string
}

export default function MarketManagement() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editMarket, setEditMarket] = useState<Market | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const form = useForm<MarketFormValues>({
    resolver: zodResolver(marketSchema),
    defaultValues: {
      name: "",
      location: "",
      region: "",
      country: "",
    },
  })

  // Fetch markets
  useEffect(() => {
    const fetchMarkets = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await axios.get(`${API_URL}/markets`)
        setMarkets(response.data)
      } catch (err) {
        console.error("Error fetching markets:", err)
        setError("Failed to load markets")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMarkets()
  }, [API_URL])

  // Reset form when dialog opens/closes or edit market changes
  useEffect(() => {
    if (isDialogOpen) {
      if (editMarket) {
        form.reset({
          name: editMarket.name,
          location: editMarket.location,
          region: editMarket.region,
          country: editMarket.country || "",
        })
      } else {
        form.reset({
          name: "",
          location: "",
          region: "",
          country: "",
        })
      }
    }
  }, [isDialogOpen, editMarket, form])

  const onSubmit = async (data: MarketFormValues) => {
    setIsSubmitting(true)

    try {
      if (editMarket) {
        // Update existing market
        await axios.put(`${API_URL}/markets/${editMarket._id}`, data)
        toast.success("Market updated successfully")

        // Update local state
        setMarkets(markets.map((market) => (market._id === editMarket._id ? { ...market, ...data } : market)))
      } else {
        // Create new market
        const response = await axios.post(`${API_URL}/markets`, data)
        toast.success("Market created successfully")

        // Add to local state
        setMarkets([...markets, response.data.market])
      }

      // Close dialog and reset form
      setIsDialogOpen(false)
      setEditMarket(null)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this market?")) {
      setIsDeleting(true)
      setDeleteId(id)

      try {
        await axios.delete(`${API_URL}/markets/${id}`)
        toast.success("Market deleted successfully")

        // Update local state
        setMarkets(markets.filter((market) => market._id !== id))
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete market")
      } finally {
        setIsDeleting(false)
        setDeleteId(null)
      }
    }
  }

  const handleEdit = (market: Market) => {
    setEditMarket(market)
    setIsDialogOpen(true)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Filter markets based on search term
  const filteredMarkets = markets.filter(
    (market) =>
      market.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      market.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      market.region.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Market Management</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Market
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editMarket ? "Edit Market" : "Add New Market"}</DialogTitle>
              <DialogDescription>
                {editMarket ? "Update market details below" : "Enter market details below"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Market Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter market name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter region" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setEditMarket(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editMarket ? "Update Market" : "Add Market"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Markets</CardTitle>
          <CardDescription>Manage markets for price tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search markets..."
                className="pl-9"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          {error ? (
            <div className="text-center p-8 border rounded-md">
              <p className="text-red-500">{error}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="text-center p-8 border rounded-md">
              <p className="text-muted-foreground">No markets found</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMarkets.map((market) => (
                    <TableRow key={market._id}>
                      <TableCell className="font-medium">{market.name}</TableCell>
                      <TableCell>{market.location}</TableCell>
                      <TableCell>{market.region}</TableCell>
                      <TableCell>{market.country || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(market)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(market._id)}
                            disabled={isDeleting && deleteId === market._id}
                          >
                            {isDeleting && deleteId === market._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
