"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "axios"

export default function ApiTester() {
  const [endpoint, setEndpoint] = useState("/prices")
  const [method, setMethod] = useState("GET")
  const [params, setParams] = useState("product=rice")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const testApi = async () => {
    setLoading(true)
    setError("")
    setResult("")

    try {
      const url = `${API_URL}${endpoint}`
      const queryParams = {}

      // Parse params string into object
      if (params) {
        params.split("&").forEach((param) => {
          const [key, value] = param.split("=")
          queryParams[key] = value
        })
      }

      let response
      if (method === "GET") {
        response = await axios.get(url, { params: queryParams })
      } else if (method === "POST") {
        response = await axios.post(url, queryParams)
      }

      setResult(JSON.stringify(response.data, null, 2))
    } catch (err) {
      console.error("API test error:", err)
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>API Tester</CardTitle>
        <CardDescription>Test API endpoints to debug issues</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="w-1/4">
              <select name="method" className="w-full p-2 border rounded" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
            <div className="flex-1">
              <Input
                placeholder="Endpoint (e.g., /prices)"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Input
              placeholder="Query params (e.g., product=rice&market=Kampala)"
              value={params}
              onChange={(e) => setParams(e.target.value)}
            />
          </div>

          <Button onClick={testApi} disabled={loading}>
            {loading ? "Testing..." : "Test Endpoint"}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-4">
              <p className="font-semibold mb-2">Response:</p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">{result}</pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
