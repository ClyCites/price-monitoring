"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import type { Price } from "@/lib/api/prices";

interface RecentPricesTableProps {
  prices: Price[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  isDeleting?: boolean; 
}

export default function RecentPricesTable({
  prices,
  isLoading,
  onDelete,
  isDeleting = false, // Default to false if not provided
}: RecentPricesTableProps) {
  // Display only the 5 most recent entries
  const recentPrices = Array.isArray(prices) ? prices.slice(0, 5) : [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (recentPrices.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <p className="text-muted-foreground">No recent price entries found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Market</TableHead>
            <TableHead>Price (UGX)</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentPrices.map((price: any, index) => {
            // Handle both string and object formats for product and market
            const productName =
              typeof price.product === "object"
                ? price.product.name
                : typeof price.product === "string"
                ? price.product
                : "Unknown Product";

            const marketName =
              typeof price.market === "object"
                ? price.market.name
                : typeof price.market === "string"
                ? price.market
                : "Unknown Market";

            // Format date safely
            const formatDate = (dateValue: string | Date | undefined): string => {
              try {
              if (!dateValue) return "N/A";
              return typeof dateValue === "string"
                ? format(new Date(dateValue), "MMM dd, yyyy")
                : format(dateValue, "MMM dd, yyyy");
              } catch (error) {
              console.error("Error formatting date:", error);
              return "Invalid Date";
              }
            };

            return (
              <TableRow key={price._id || index}>
                <TableCell className="font-medium">{productName}</TableCell>
                <TableCell>{marketName}</TableCell>
                <TableCell>{price.price?.toLocaleString() || "N/A"}</TableCell>
                <TableCell>{formatDate(price.date)}</TableCell>
                <TableCell>{price.quantity || 1}</TableCell>
                <TableCell>{price.unit || "kg"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
