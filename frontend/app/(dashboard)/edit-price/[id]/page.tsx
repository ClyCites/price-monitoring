import EditPriceForm from "@/components/prices/edit-price-form";

interface EditPricePageProps {
  params: {
    id: string;
  };
}

export default async function EditPricePage({ params }: EditPricePageProps) {
  // Await the params to resolve the error
  const id = params.id;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Price Entry</h1>
      <EditPriceForm id={id} />
    </div>
  );
}
