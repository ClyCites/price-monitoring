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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Pencil, Trash2, Plus, Loader2, Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import axios from "axios"

// Form schema for product
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface Product {
  _id: string
  name: string
  category: string
  description?: string
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
    },
  })

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await axios.get(`${API_URL}/products`)
        setProducts(response.data)
      } catch (err) {
        console.error("Error fetching products:", err)
        setError("Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [API_URL])

  // Reset form when dialog opens/closes or edit product changes
  useEffect(() => {
    if (isDialogOpen) {
      if (editProduct) {
        form.reset({
          name: editProduct.name,
          category: editProduct.category,
          description: editProduct.description || "",
        })
      } else {
        form.reset({
          name: "",
          category: "",
          description: "",
        })
      }
    }
  }, [isDialogOpen, editProduct, form])

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true)

    try {
      if (editProduct) {
        // Update existing product
        await axios.put(`${API_URL}/products/${editProduct._id}`, data)
        toast.success("Product updated successfully")

        // Update local state
        setProducts(products.map((product) => (product._id === editProduct._id ? { ...product, ...data } : product)))
      } else {
        // Create new product
        const response = await axios.post(`${API_URL}/products`, data)
        toast.success("Product created successfully")

        // Add to local state
        setProducts([...products, response.data.product])
      }

      // Close dialog and reset form
      setIsDialogOpen(false)
      setEditProduct(null)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setIsDeleting(true)
      setDeleteId(id)

      try {
        await axios.delete(`${API_URL}/products/${id}`)
        toast.success("Product deleted successfully")

        // Update local state
        setProducts(products.filter((product) => product._id !== id))
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete product")
      } finally {
        setIsDeleting(false)
        setDeleteId(null)
      }
    }
  }

  const handleEdit = (product: Product) => {
    setEditProduct(product)
    setIsDialogOpen(true)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const categories = ["grain", "vegetable", "fruit", "meat", "beverage", "dairy", "legume", "oil", "spice", "other"]

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Management</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                {editProduct ? "Update product details below" : "Enter product details below"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter product description" {...field} />
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
                      setEditProduct(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editProduct ? "Update Product" : "Add Product"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Manage products for price tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search products..."
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
          ) : filteredProducts.length === 0 ? (
            <div className="text-center p-8 border rounded-md">
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</TableCell>
                      <TableCell className="max-w-xs truncate">{product.description || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(product._id)}
                            disabled={isDeleting && deleteId === product._id}
                          >
                            {isDeleting && deleteId === product._id ? (
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
