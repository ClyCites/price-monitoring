import EditPriceForm from "@/components/prices/edit-price-form";


export default async function EditPricePage({ params }: any) {


  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Price Entry</h1>
      <EditPriceForm id={params.id} />
    </div>
  );
}
