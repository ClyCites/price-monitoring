"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useMarketById, useUpdateMarket } from "@/lib/hooks/use-markets"
import { useEffect } from "react"

// Form schema validation
const marketFormSchema = z.object({
  name: z.string().min(2, { message: "Market name must be at least 2 characters" }),
  location: z.string().min(2, { message: "Location is required" }),
  region: z.string().min(2, { message: "Region is required" }),
  country: z.string().default("Uganda"),
})

type MarketFormValues = z.infer<typeof marketFormSchema>

export default function EditMarketForm({ id }: { id: string }) {
  const router = useRouter()
  const { data: market, isLoading: isLoadingMarket } = useMarketById(id)
  const updateMarketMutation = useUpdateMarket()

  const form = useForm<MarketFormValues>({
    resolver: zodResolver(marketFormSchema),
    defaultValues: {
      name: "",
      location: "",
      region: "",
      country: "Uganda",
    },
  })

  // Populate form when market data is loaded
  useEffect(() => {
    if (market) {
      form.reset({
        name: market.name,
        location: market.location,
        region: market.region,
        country: market.country || "Uganda",
      })
    }
  }, [market, form])

  const onSubmit = async (data: MarketFormValues) => {
    // Show loading toast
    const loadingToast = toast.loading("Updating market...")

    updateMarketMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          // Dismiss loading toast
          toast.dismiss(loadingToast)
          toast.success("Market updated successfully")
          router.push("/markets")
        },
        onError: (error: any) => {
          // Dismiss loading toast
          toast.dismiss(loadingToast)
          toast.error(error.message || "Failed to update market")
        },
      },
    )
  }

  if (isLoadingMarket) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Market</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
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
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between mt-5">
            <Button type="button" variant="outline" onClick={() => router.push("/markets")}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMarketMutation.isPending}>
              {updateMarketMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Market
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
