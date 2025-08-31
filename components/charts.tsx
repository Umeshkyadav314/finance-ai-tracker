"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#6b7280", "#0ea5e9", "#22c55e"]

export function CategoryPie() {
  const { data, error } = useSWR("/api/analytics/categories", fetcher, { refreshInterval: 20_000 })
  const cat = data?.categories || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {error ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Unable to load chart data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={cat} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                {cat.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

type TrendPoint = { year: number; month: number; type: "INCOME" | "EXPENSE"; total: number }

export function TrendsLine() {
  const { data, error } = useSWR("/api/analytics/trends", fetcher, { refreshInterval: 20_000 })
  const raw: TrendPoint[] = data?.trends || []
  const byKey = new Map<string, any>()
  for (const p of raw) {
    const key = `${p.year}-${String(p.month).padStart(2, "0")}`
    const row = byKey.get(key) || { month: key, income: 0, expenses: 0 }
    if (p.type === "INCOME") row.income = p.total
    else row.expenses = p.total
    byKey.set(key, row)
  }
  const rows = Array.from(byKey.values())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Trends</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {error ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Unable to load chart data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="income" stroke="#10b981" strokeWidth={2} />
              <Line dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
