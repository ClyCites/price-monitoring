"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useAddPrice } from "@/lib/hooks/use-prices"
import { toast } from "sonner"

// List of agricultural products
const products = [
  "Rice",
  "Maize",
  "Beans",
  "Coffee",
  "Tea",
  "Cassava",
  "Sweet Potatoes",
  "Irish Potatoes",
  "Bananas",
  "Tomatoes",
  "Onions",
  "Cabbage",
  "Carrots",
  "Pineapples",
  "Mangoes",
  "Beef",
  "Chicken",
  "Pork",
  "Fish",
  "Milk",
  "Eggs",
]

// List of markets
const markets = [
  "Kampala Central",
  "Owino Market",
  "Nakasero",
  "Kalerwe",
  "Kikuubo",
  "Nateete",
  "Kireka",
  "Ntinda",
  "Mukono",
  "Jinja",
  "Masaka",
  "Gulu",
  "Mbarara",
  "Arua",
  "Mbale",
  "Lira",
]

// Form schema validation
const priceFormSchema = z.object({
  product: z.string().min(1, "Product is required"),
  market: z.string().min(1, "Market is required"),
  price: z.coerce.number().positive("Price must be a positive number"),
  currency: z.string().default("UGX"),
  date: z.string().min(1, "Date is required"),
  productType: z.enum(["solid", "liquid"], {
    required_error: "Product type is required",
  }),
  quantity: z.coerce.number().positive("Quantity must be a positive number"),
  unit: z.enum(["kg", "liters"], {
    required_error: "Unit is required",
  }),
  category: z.enum(["grain", "vegetable", "fruit", "meat", "beverage"], {
    required_error: "Category is required",
  }),
})

type PriceFormValues = z.infer<typeof priceFormSchema>

export default function AddPriceForm() {
  const router = useRouter()
  const addPriceMutation = useAddPrice()

  const form = useForm<PriceFormValues>({
    resolver: zodResolver(priceFormSchema),
    defaultValues: {
      product: "",
      market: "",
      price: 0,
      currency: "UGX",
      date: new Date().toISOString().split("T")[0],
      productType: "solid",
      quantity: 1,
      unit: "kg",
      category: "grain",
    },
  })

  const onSubmit = async (data: PriceFormValues) => {
    // Show loading toast
    const loadingToast = toast.loading("Adding price entry...")

    addPriceMutation.mutate(data, {
      onSuccess: () => {
        // Dismiss loading toast
        toast.dismiss(loadingToast)
        router.push("/prices")
      },
      onError: (error) => {
        // Dismiss loading toast
        toast.dismiss(loadingToast)
      },
    })
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Price Entry</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Field */}
              <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product} value={product.toLowerCase()}>
                            {product}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Market Field */}
              <FormField
                control={form.control}
                name="market"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a market" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {markets.map((market) => (
                          <SelectItem key={market} value={market}>
                            {market}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price Field */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (UGX)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Field */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Type Field */}
              <FormField
                control={form.control}
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="liquid">Liquid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category Field */}
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
                        <SelectItem value="grain">Grain</SelectItem>
                        <SelectItem value="vegetable">Vegetable</SelectItem>
                        <SelectItem value="fruit">Fruit</SelectItem>
                        <SelectItem value="meat">Meat</SelectItem>
                        <SelectItem value="beverage">Beverage</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity Field */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit Field */}
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/prices")}>
              Cancel
            </Button>
            <Button type="submit" disabled={addPriceMutation.isPending}>
              {addPriceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

