"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { usePriceById, useUpdatePrice } from "@/lib/hooks/use-prices";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";

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
});

type PriceFormValues = z.infer<typeof priceFormSchema>;

export default function EditPriceForm({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { data: priceData, isLoading: isLoadingPrice } = usePriceById(id);
  const updatePriceMutation = useUpdatePrice();

  // State for products and markets
  const [products, setProducts] = useState<
    { _id: string; name: string; category: string; description: string }[]
  >([]);
  const [markets, setMarkets] = useState<
    {
      _id: string;
      name: string;
      location: string;
      region: string;
      country: string;
    }[]
  >([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Debug state to track form values
  const [formDebug, setFormDebug] = useState<{
    productId: string | null;
    marketId: string | null;
    priceDataLoaded: boolean;
  }>({
    productId: null,
    marketId: null,
    priceDataLoaded: false,
  });

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
  });

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      setFetchError(null);

      try {
        const response = await axios.get(`${API_URL}/products`);

        if (response.data && Array.isArray(response.data)) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setFetchError(
          //@ts-expect-error
          error.message || "Failed to load products"
        );

        // Fallback to sample products
        const sampleProducts = [
          {
            _id: "67e6a1a9733aa3610bcae3f1",
            name: "Rice",
            category: "Grains",
            description: "A popular carbohydrate source for many households.",
          },
          {
            _id: "67e6a1a9733aa3610bcae3f2",
            name: "Milk",
            category: "Dairy",
            description: "A nutritious dairy product sourced from cattle.",
          },
          {
            _id: "67e6a1a9733aa3610bcae3ef",
            name: "Beans",
            category: "Legumes",
            description:
              "A rich source of protein, commonly consumed in meals.",
          },
          {
            _id: "67e6a1a9733aa3610bcae3f0",
            name: "Tomatoes",
            category: "Vegetables",
            description: "A widely used vegetable in cooking and salads.",
          },
          {
            _id: "67e6a1a9733aa3610bcae3ee",
            name: "Maize",
            category: "Grains",
            description: "A staple food grain grown widely in Uganda.",
          },
        ];
        setProducts(sampleProducts);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [API_URL]);

  // Fetch markets from API
  useEffect(() => {
    const fetchMarkets = async () => {
      setIsLoadingMarkets(true);
      setFetchError(null);

      try {
        const response = await axios.get(`${API_URL}/markets`);

        if (response.data && Array.isArray(response.data)) {
          setMarkets(response.data);
        }
      } catch (error) {
        console.error("Error fetching markets:", error);
        setFetchError(
          //@ts-expect-error
          error.message || "Failed to load markets"
        );

        // Fallback to sample markets
        const sampleMarkets = [
          {
            _id: "67e6a142733aa3610bcae3e4",
            name: "Nakasero Market",
            location: "Kampala",
            region: "Central",
            country: "Uganda",
          },
          {
            _id: "67e6a142733aa3610bcae3e6",
            name: "Mbale Central Market",
            location: "Mbale",
            region: "Eastern",
            country: "Uganda",
          },
          {
            _id: "67e6a142733aa3610bcae3e5",
            name: "Owino Market",
            location: "Kampala",
            region: "Central",
            country: "Uganda",
          },
          {
            _id: "67e6a142733aa3610bcae3e8",
            name: "Mbarara Central Market",
            location: "Mbarara",
            region: "Western",
            country: "Uganda",
          },
          {
            _id: "67e6a142733aa3610bcae3e7",
            name: "Gulu Main Market",
            location: "Gulu",
            region: "Northern",
            country: "Uganda",
          },
          {
            _id: "67f207275a55de78b22bf6f8",
            name: "Bugema Market",
            location: "Gayaza Road",
            region: "Central",
            country: "Uganda",
          },
        ];
        setMarkets(sampleMarkets);
      } finally {
        setIsLoadingMarkets(false);
      }
    };

    fetchMarkets();
  }, [API_URL]);

  // Populate form when price data is loaded
  useEffect(() => {
    if (priceData && !isLoadingProducts && !isLoadingMarkets) {
      const formatDate = () => {
        try {
          if (typeof priceData.date === "string") {
            const dateObj = new Date(priceData.date);
            return format(dateObj, "yyyy-MM-dd");
          } else if (priceData.date instanceof Date) {
            return format(priceData.date, "yyyy-MM-dd");
          }
        } catch (e) {
          console.error("Error formatting date:", e);
          return new Date().toISOString().split("T")[0];
        }
        return new Date().toISOString().split("T")[0];
      };

      // Extract product ID correctly
      let productId = "";
      if (typeof priceData.product === "object" && priceData.product !== null) {
        productId = priceData.product._id;
      } else if (typeof priceData.product === "string") {
        productId = priceData.product;
      }

      // Extract market ID correctly
      let marketId = "";
      if (typeof priceData.market === "object" && priceData.market !== null) {
        marketId = priceData.market._id;
      } else if (typeof priceData.market === "string") {
        marketId = priceData.market;
      }

      // For debugging
      setFormDebug({
        productId,
        marketId,
        priceDataLoaded: true,
      });

      // Set form values
      form.reset({
        product: productId,
        market: marketId,
        price: priceData.price,
        currency: priceData.currency || "UGX",
        date: formatDate(),
        productType: priceData.productType,
        quantity: priceData.quantity,
        unit: priceData.unit,
        category: priceData.category || "grain",
      });
    }
  }, [priceData, form, isLoadingProducts, isLoadingMarkets]);

  const onSubmit = async (data: PriceFormValues) => {
    // Show loading toast
    const loadingToast = toast.loading("Updating price entry...");

    updatePriceMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          // Dismiss loading toast
          toast.dismiss(loadingToast);
          toast.success("Price entry updated successfully");
          router.push("/prices");
        },
        onError: (error: any) => {
          // Dismiss loading toast
          toast.dismiss(loadingToast);
          toast.error(error.message || "Failed to update price entry");
        },
      }
    );
  };

  // Combined loading state
  const isLoading = isLoadingPrice || isLoadingProducts || isLoadingMarkets;

  if (isLoadingPrice) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Price Entry</CardTitle>
      </CardHeader>

      {fetchError && (
        <div className="px-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {fetchError}. Some options may be unavailable or using sample
              data.
            </AlertDescription>
          </Alert>
        </div>
      )}

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
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingProducts}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingProducts
                                ? "Loading products..."
                                : "Select a product"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product._id} value={product._id}>
                            {product.name}
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
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingMarkets}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingMarkets
                                ? "Loading markets..."
                                : "Select a market"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {markets.map((market) => (
                          <SelectItem key={market._id} value={market._id}>
                            {market.name}
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
          <CardFooter className="flex justify-between mt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/prices")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updatePriceMutation.isPending}>
              {updatePriceMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Price
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
