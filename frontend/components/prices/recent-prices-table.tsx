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
}

export default function RecentPricesTable({
  prices,
  isLoading,
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
          {recentPrices.map((price: any) => {
            // Handle both string and object formats for product and market
            const productName =
              typeof price.product === "object"
                ? price.product.name
                : price.product;
            const marketName =
              typeof price.market === "object"
                ? price.market.name
                : price.market;

            return (
              <TableRow key={price._id}>
                <TableCell className="font-medium">{productName}</TableCell>
                <TableCell>{marketName}</TableCell>
                <TableCell>{price.price.toLocaleString()}</TableCell>
                <TableCell>
                  {typeof price.date === "string"
                    ? format(new Date(price.date), "MMM dd, yyyy")
                    : format(price.date, "MMM dd, yyyy")}
                </TableCell>
                <TableCell>{price.quantity}</TableCell>
                <TableCell>{price.unit}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
