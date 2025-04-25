"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePriceTrends } from "@/lib/hooks/use-prices";
import PriceTrendsChart from "./price-trends-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import axios from "axios";

export default function PriceTrendsView() {
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

  // Selected values
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const [timeRange, setTimeRange] = useState("30"); // days

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      setFetchError(null);

      try {
        const response = await axios.get(`${API_URL}/products`);

        if (response.data && Array.isArray(response.data)) {
          setProducts(response.data);
          // Set the first product as default if available
          if (response.data.length > 0) {
            setSelectedProduct(response.data[0]._id);
          }
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
        setSelectedProduct(sampleProducts[0]._id);
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
          if (response.data.length > 0) {
            setSelectedMarket(response.data[0]._id);
          }
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
        setSelectedMarket(sampleMarkets[0]._id);
      } finally {
        setIsLoadingMarkets(false);
      }
    };

    fetchMarkets();
  }, [API_URL]);

  // Fetch trend data with React Query
  const {
    data: trendData,
    isLoading: isTrendLoading,
    error: trendError,
  } = usePriceTrends(
    selectedProduct,
    selectedMarket,
    Number.parseInt(timeRange)
  );

  // Helper function to generate sample trend data when API is not available
  interface HistoricalPrice {
    date: string | Date;
    price: number;
  }

  interface SampleTrendData {
    product: string;
    market: string;
    trendPercentage: string;
    historicalPrices: HistoricalPrice[];
  }

  const generateSampleTrendData = (
    product: string,
    market: string,
    days: number
  ): SampleTrendData => {
    const historicalPrices: HistoricalPrice[] = [];
    const today = new Date();
    const basePrice = 2500;

    // Generate price points for the specified number of days
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Add some randomness to prices
      const randomVariation = 1 + (Math.random() * 0.1 - 0.05); // -5% to +5%
      const price = Math.round(basePrice * randomVariation);

      // Add slight upward trend over time
      const trendFactor = 1 + 0.002 * (days - i);

      historicalPrices.push({
        date: date.toISOString().split("T")[0],
        price: Math.round(price * trendFactor),
      });
    }

    // Calculate trend percentage
    const firstPrice = historicalPrices[0].price;
    const latestPrice = historicalPrices[historicalPrices.length - 1].price;
    const trendPercentage = ((latestPrice - firstPrice) / firstPrice) * 100;

    return {
      product,
      market,
      trendPercentage: trendPercentage.toFixed(2),
      historicalPrices,
    };
  };

  // Use sample data for demo if API fails
  const displayData: SampleTrendData = trendData
    ? {
        product: selectedProduct,
        market: selectedMarket,
        trendPercentage: "0", // Default or calculated value
        historicalPrices: trendData.historicalPrices,
      }
    : generateSampleTrendData(
        selectedProduct,
        selectedMarket,
        Number.parseInt(timeRange)
      );
  const isLoading = isLoadingProducts || isLoadingMarkets || isTrendLoading;
  const error = fetchError || trendError;

  // Get product and market names for display
  interface Product {
    _id: string;
    name: string;
    category: string;
    description: string;
  }

  const getProductName = (id: string): string => {
    const product: Product | undefined = products.find((p) => p._id === id);
    return product ? product.name : "Selected Product";
  };

  interface Market {
    _id: string;
    name: string;
    location: string;
    region: string;
    country: string;
  }

  const getMarketName = (id: string): string => {
    const market: Market | undefined = markets.find((m) => m._id === id);
    return market ? market.name : "Selected Market";
  };

  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Price Trends Analysis</h1>

      <Card>
        <CardHeader>
          <CardTitle>Price Trends</CardTitle>
          <CardDescription>
            Analyze how prices have changed over time for different products and
            markets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select
              value={selectedProduct}
              onValueChange={setSelectedProduct}
              disabled={isLoadingProducts}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue
                  placeholder={
                    isLoadingProducts ? "Loading products..." : "Select product"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedMarket}
              onValueChange={setSelectedMarket}
              disabled={isLoadingMarkets}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue
                  placeholder={
                    isLoadingMarkets ? "Loading markets..." : "Select market"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {markets.map((market) => (
                  <SelectItem key={market._id} value={market._id}>
                    {market.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load price trend data. Please try again later.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="text-sm font-medium">
                  Price trend for {getProductName(selectedProduct)} in{" "}
                  {getMarketName(selectedMarket)}:
                  <span
                    className={`ml-2 font-bold ${
                      Number.parseFloat(displayData.trendPercentage) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Number.parseFloat(displayData.trendPercentage) >= 0
                      ? "+"
                      : ""}
                    {displayData.trendPercentage}%
                  </span>
                </p>
              </div>

              <PriceTrendsChart
                data={displayData.historicalPrices.map((price) => ({
                  ...price,
                  date:
                    typeof price.date === "string"
                      ? price.date
                      : price.date.toISOString(),
                }))}
                isLoading={isLoading}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
