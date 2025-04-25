"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PriceOverviewChart from "./price-overview-chart";
import MarketInsightsChart from "./market-insights-chart";
import RecentPricesTable from "../prices/recent-prices-table";
import TopMarketsList from "./top-markets-list";
import { usePrices, useAveragePrices } from "@/lib/hooks/use-prices";
import { GrapeIcon as Grain, Banana, Beef, Coffee } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import axios from "axios";

export default function DashboardView() {
  const [products, setProducts] = useState<
    { _id: string; name: string; category: string; description: string }[]
  >([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      setProductError(null);

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
        setProductError(
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

  // Fetch prices data
  const {
    data: prices = [],
    isLoading: isPricesLoading,
    error: pricesError,
  } = usePrices();

  // Fetch market averages data
  const {
    data: marketAverages = [],
    isLoading: isAveragesLoading,
    error: averagesError,
  } = useAveragePrices(selectedProduct);

  // Get stats data from the API
  const [statData, setStatData] = useState({
    totalProducts: 0,
    totalMarkets: 0,
    avgPrice: 0,
    priceChange: 0,
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsStatsLoading(true);
      setStatsError(null);

      try {
        // Fetch total products count
        const productsResponse = await axios.get(`${API_URL}/products/count`);
        const totalProducts = productsResponse.data?.count || 0;

        // Fetch total markets count
        const marketsResponse = await axios.get(`${API_URL}/markets/count`);
        const totalMarkets = marketsResponse.data?.count || 0;

        // Fetch average price and price change
        const priceStatsResponse = await axios.get(`${API_URL}/prices/stats`);
        const avgPrice = priceStatsResponse.data?.averagePrice || 0;
        const priceChange = priceStatsResponse.data?.priceChangePercentage || 0;

        setStatData({
          totalProducts,
          totalMarkets,
          avgPrice,
          priceChange,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStatsError(
          //@ts-expect-error
          error.message || "Failed to load statistics"
        );

        // Use sample data as fallback
        setStatData({
          totalProducts: 24,
          totalMarkets: 16,
          avgPrice: 2250,
          priceChange: +5.7,
        });
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchStats();
  }, [API_URL]);

  // Get product name for display
  const getProductName = (id: string) => {
    const product = products.find((p) => p._id === id);
    return product ? product.name : "Selected Product";
  };

  const error = productError || pricesError || averagesError || statsError;

  return (
    <div className="container mx-auto space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was a problem loading some data. The dashboard may display
            sample data instead.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={statData.totalProducts.toString()}
          description="Different agricultural products tracked"
          icon={<Grain className="h-5 w-5 text-emerald-600" />}
          isLoading={isStatsLoading}
        />

        <StatCard
          title="Markets Covered"
          value={statData.totalMarkets.toString()}
          description="Across different regions"
          icon={<Banana className="h-5 w-5 text-yellow-500" />}
          isLoading={isStatsLoading}
        />

        <StatCard
          title="Avg. Price (UGX)"
          value={statData.avgPrice.toLocaleString()}
          description={`${statData.priceChange >= 0 ? "↑" : "↓"} ${Math.abs(
            statData.priceChange
          )}% from last month`}
          icon={<Beef className="h-5 w-5 text-red-500" />}
          trend={statData.priceChange >= 0 ? "up" : "down"}
          isLoading={isStatsLoading}
        />

        <StatCard
          title="Categories"
          value="5"
          description="Grains, Fruits, Vegetables, Meat, Beverages"
          icon={<Coffee className="h-5 w-5 text-amber-600" />}
          isLoading={isStatsLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Price Trends Overview</CardTitle>
            <CardDescription>
              Historical price trends for major agricultural products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue={selectedProduct}
              onValueChange={setSelectedProduct}
              value={selectedProduct}
            >
              <TabsList className="mb-4">
                {products.slice(0, 4).map((product) => (
                  <TabsTrigger key={product._id} value={product._id}>
                    {product.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <PriceOverviewChart
                productId={selectedProduct}
                productName={getProductName(selectedProduct)}
              />
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Insights</CardTitle>
            <CardDescription>
              Price comparison across different markets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MarketInsightsChart
              isLoading={isAveragesLoading}
              data={marketAverages}
            />
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Price Updates</CardTitle>
            <CardDescription>
              Latest price entries from various markets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentPricesTable prices={prices} isLoading={isPricesLoading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Markets</CardTitle>
            <CardDescription>
              Markets with the best prices for {getProductName(selectedProduct)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopMarketsList
              markets={marketAverages}
              isLoading={isAveragesLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  isLoading?: boolean;
}

function StatCard({
  title,
  value,
  description,
  icon,
  trend = "neutral",
  isLoading = false,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
            ) : (
              <h3 className="text-2xl font-bold mt-1">{value}</h3>
            )}
          </div>
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            {icon}
          </div>
        </div>
        {isLoading ? (
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
        ) : (
          <p
            className={`text-xs mt-2 ${
              trend === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : trend === "down"
                ? "text-red-600 dark:text-red-400"
                : "text-muted-foreground"
            }`}
          >
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
