import EditMarketForm from "@/components/markets/edit-market-form";

interface EditMarketPageProps {
  params: {
    id: string;
  };
}

export default async function EditMarketPage({ params }: EditMarketPageProps) {
  // Await the params to resolve the error
  const id = params.id;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Market</h1>
      <EditMarketForm id={id} />
    </div>
  );
}
