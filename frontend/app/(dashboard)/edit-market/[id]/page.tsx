import EditMarketForm from "@/components/markets/edit-market-form"

// Use any to bypass TypeScript checking for now
export default function EditMarketPage({ params }: any) {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Market</h1>
      <EditMarketForm id={params.id} />
    </div>
  )
}
