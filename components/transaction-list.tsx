"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORIES } from "@/lib/categories"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function TransactionList({ refreshKey }: { refreshKey: number }) {
  const [q, setQ] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [type, setType] = useState<string>("all")
  const [from, setFrom] = useState<string>("")
  const [to, setTo] = useState<string>("")

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (category !== "all") params.set("category", category)
    if (type !== "all") params.set("type", type)
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    return `/api/transactions?${params.toString()}`
  }, [q, category, type, from, to, refreshKey])

  const { data, mutate } = useSWR(query, fetcher)
  const items = data?.items || []

  async function remove(id: string) {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" })
    mutate()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-2">
          <Label>Search</Label>
          <Input placeholder="Search description/category" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div>
          <Label>Category</Label>
          <Select onValueChange={(v) => setCategory(v)} value={category}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Type</Label>
          <Select onValueChange={(v) => setType(v)} value={type}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label>From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="flex-1">
            <Label>To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="rounded-md border divide-y">
        {items.map((t: any) => (
          <div key={t._id} className="p-3 flex items-center justify-between">
            <div className="flex flex-col">
              <div className="text-sm font-medium">{t.description || t.category}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(t.date).toLocaleString()} • {t.category}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`font-semibold ${t.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                {t.type === "INCOME" ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
              </div>
              <Button size="sm" variant="outline" onClick={() => remove(t._id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No transactions found.</div>
        )}
      </div>
    </div>
  )
}
