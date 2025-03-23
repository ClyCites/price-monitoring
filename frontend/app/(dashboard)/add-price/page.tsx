import AddPriceForm from "@/components/prices/add-price-form"

export default function AddPricePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Add New Price Entry</h1>
      <AddPriceForm />
    </div>
  )
}

