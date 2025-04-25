"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Check, Copy } from "lucide-react"

interface ApiResponseViewerProps {
  data: any
  maxHeight?: string
}

export default function ApiResponseViewer({ data, maxHeight = "400px" }: ApiResponseViewerProps) {
  const [copied, setCopied] = useState(false)

  const formatJson = (json: any) => {
    try {
      return JSON.stringify(json, null, 2)
    } catch (e) {
      return "Error formatting JSON"
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(formatJson(data))
    setCopied(true)
    toast.success("Copied to clipboard")

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-md overflow-auto text-sm" style={{ maxHeight }}>
        {formatJson(data)}
      </pre>
      <div className="absolute top-2 right-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
