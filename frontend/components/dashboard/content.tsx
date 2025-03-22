import { LineChart, BarChart2, TrendingUp } from "lucide-react"
import { Wheat } from "lucide-react"
import PriceTable from "./price-table"
import PriceTrendChart from "../charts/price-trend-chart"
import PricePredictionChart from "../charts/price-prediction-chart"
import ProductComparisonChart from "../charts/product-comparison-chart"

export default function Content() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2 ">
            <LineChart className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
            Price Trends
          </h2>
          <div className="flex-1">
            <PriceTrendChart className="h-full" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
            AI Price Predictions
          </h2>
          <div className="flex-1">
            <PricePredictionChart className="h-full" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col items-start justify-start border border-gray-200 dark:border-[#1F1F23]">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
          <BarChart2 className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
          Product Comparison
        </h2>
        <ProductComparisonChart />
      </div>

      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col items-start justify-start border border-gray-200 dark:border-[#1F1F23]">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
          <Wheat className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
          Agricultural Product Prices
        </h2>
        <PriceTable />
      </div>
    </div>
  )
}

