import ApiTester from "@/components/debug/api-tester"

export default function ApiDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">API Debugging</h1>
      <ApiTester />
    </div>
  )
}
