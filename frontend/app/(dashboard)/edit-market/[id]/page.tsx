import EditMarketForm from "@/components/markets/edit-market-form";

export default function EditMarketPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Market</h1>
      <EditMarketForm id={params.id} /> {/* ✅ Only pass the id */}
    </div>
  );
}
