import DataInsightsDashboard from "@/components/insights/data-insights-dashboard"

export default function DataInsightsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Agricultural Price Insights</h1>
      <DataInsightsDashboard />
    </div>
  )
}
