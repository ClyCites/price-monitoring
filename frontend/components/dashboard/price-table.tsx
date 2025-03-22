"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { ArrowUpRight, ArrowDownLeft, Wheat, type LucideIcon, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface PriceData {
  id: string
  product: string
  category: string
  currentPrice: string
  previousPrice: string
  change: string
  changeType: "increase" | "decrease" | "stable"
  region: string
  lastUpdated: string
  icon: LucideIcon
}

const PRICE_DATA: PriceData[] = [
  {
    id: "1",
    product: "Rice",
    category: "Grains",
    currentPrice: "$450.00",
    previousPrice: "$420.00",
    change: "+7.14%",
    changeType: "increase",
    region: "Southeast Asia",
    lastUpdated: "Today, 2:45 PM",
    icon: Wheat,
  },
  {
    id: "2",
    product: "Wheat",
    category: "Grains",
    currentPrice: "$320.50",
    previousPrice: "$350.75",
    change: "-8.62%",
    changeType: "decrease",
    region: "North America",
    lastUpdated: "Today, 1:30 PM",
    icon: Wheat,
  },
  {
    id: "3",
    product: "Corn",
    category: "Grains",
    currentPrice: "$215.25",
    previousPrice: "$210.00",
    change: "+2.50%",
    changeType: "increase",
    region: "South America",
    lastUpdated: "Today, 11:15 AM",
    icon: Wheat,
  },
  {
    id: "4",
    product: "Soybeans",
    category: "Legumes",
    currentPrice: "$520.75",
    previousPrice: "$505.50",
    change: "+3.02%",
    changeType: "increase",
    region: "North America",
    lastUpdated: "Yesterday, 4:30 PM",
    icon: Wheat,
  },
  {
    id: "5",
    product: "Coffee",
    category: "Cash Crops",
    currentPrice: "$185.25",
    previousPrice: "$190.00",
    change: "-2.50%",
    changeType: "decrease",
    region: "South America",
    lastUpdated: "Yesterday, 2:15 PM",
    icon: Wheat,
  },
  {
    id: "6",
    product: "Cotton",
    category: "Fibers",
    currentPrice: "$92.50",
    previousPrice: "$92.50",
    change: "0.00%",
    changeType: "stable",
    region: "South Asia",
    lastUpdated: "Yesterday, 10:45 AM",
    icon: Wheat,
  },
]

export default function PriceTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredData, setFilteredData] = useState(PRICE_DATA)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)

    if (term.trim() === "") {
      setFilteredData(PRICE_DATA)
    } else {
      const filtered = PRICE_DATA.filter(
        (item) =>
          item.product.toLowerCase().includes(term.toLowerCase()) ||
          item.category.toLowerCase().includes(term.toLowerCase()) ||
          item.region.toLowerCase().includes(term.toLowerCase()),
      )
      setFilteredData(filtered)
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-9"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Change
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Region
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30 mr-3">
                      <item.icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.product}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {item.category}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.currentPrice}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        item.changeType === "increase"
                          ? "text-green-600 dark:text-green-400"
                          : item.changeType === "decrease"
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-600 dark:text-gray-400",
                      )}
                    >
                      {item.change}
                    </span>
                    {item.changeType === "increase" ? (
                      <ArrowUpRight className="ml-1 h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : item.changeType === "decrease" ? (
                      <ArrowDownLeft className="ml-1 h-4 w-4 text-red-600 dark:text-red-400" />
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{item.region}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {item.lastUpdated}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

