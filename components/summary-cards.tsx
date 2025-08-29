"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function SummaryCards() {
  const { data } = useSWR("/api/analytics/summary", fetcher, { refreshInterval: 10_000 })
  const income = data?.income || 0
  const expenses = data?.expenses || 0
  const savings = data?.savings || 0
  const fmt = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD" })

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Income</CardTitle>
        </CardHeader>
        <CardContent className="text-emerald-600 font-semibold">{fmt(income)}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent className="text-rose-600 font-semibold">{fmt(expenses)}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Savings</CardTitle>
        </CardHeader>
        <CardContent className="font-semibold">{fmt(savings)}</CardContent>
      </Card>
    </div>
  )
}
