import { Metadata } from "next";
import EditMarketForm from "@/components/markets/edit-market-form";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Edit Market ${params.id}`,
  };
}

export default async function EditMarketPage({ params }: PageProps) {
  const { id } = params;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Market</h1>
      <EditMarketForm id={id} />
    </div>
  );
}
