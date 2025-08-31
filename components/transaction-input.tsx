"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { X } from "lucide-react"

type Parsed = {
  amount: number
  currency: string
  category: string
  description?: string
  type: "INCOME" | "EXPENSE"
  confidence: number
  date?: string
}

export function TransactionInput({ onCreated }: { onCreated: () => void }) {
  const [raw, setRaw] = useState("")
  const [parsed, setParsed] = useState<Parsed | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleParse() {
    setLoading(true)
    setError(null)

    // Check if user is trying to input multiple transactions
    const quoteCount = (raw.match(/"/g) || []).length
    if (quoteCount > 2) {
      setError("Please enter one transaction at a time. Multiple transactions detected.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/transactions/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: raw }),
      })
      const data = await res.json()
      if (res.ok) {
        if (data.error && data.fallback) {
          // Show fallback parsing result with warning
          setParsed(data.fallback)
          setError(data.error)
        } else if (!data.error) {
          setParsed(data)
        } else {
          setError(data.error || "Failed to parse")
        }
      } else {
        setError(data.error || "Failed to parse")
      }
    } catch (e: any) {
      setError(e.message || "Failed to parse")
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm() {
    if (!parsed) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to save")
      }
      setParsed(null)
      setRaw("")
      onCreated()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setRaw("")
    setParsed(null)
    setError(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-pretty">Smart Transaction Entry</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nl" className="cursor-pointer">Describe your transaction</Label>
          <Input
            id="nl"
            placeholder='Enter one transaction at a time, e.g. : " Lunch $12.50 "'
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            className="cursor-text"
          />
          
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button
            onClick={handleParse}
            disabled={!raw || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto cursor-pointer"
          >
            {loading ? "Parsing..." : "Parse with AI"}
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            disabled={!raw && !parsed && !error}
            className="w-full sm:w-auto cursor-pointer"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
          {error && <span className="text-sm text-rose-600">{error}</span>}
        </div>

        {parsed && (
          <div className="rounded-md border p-4 space-y-2">
            <div className="text-sm text-muted-foreground">
              {error && error.includes("fallback") ? "Fallback Parse" : "AI Parse"} (confidence {(parsed.confidence * 100).toFixed(0)}%)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                Amount:{" "}
                <strong>
                  ${parsed.amount.toFixed(2)} {parsed.currency}
                </strong>
              </div>
              <div>
                Type:{" "}
                <strong className={parsed.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}>
                  {parsed.type}
                </strong>
              </div>
              <div>
                Category: <strong>{parsed.category}</strong>
              </div>
              <div>
                Description: <strong>{parsed.description || "-"}</strong>
              </div>
              <div>
                Date: <strong>{parsed.date ? new Date(parsed.date).toLocaleString() : "-"}</strong>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button
                onClick={handleConfirm}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto cursor-pointer"
              >
                {loading ? "Saving..." : "Confirm & Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setParsed(null)}
                className="w-full sm:w-auto cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
