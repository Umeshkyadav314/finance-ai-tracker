import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SummaryCards } from "@/components/summary-cards"
import { CategoryPie, TrendsLine } from "@/components/charts"
import { TransactionInput } from "@/components/transaction-input"
import { TransactionList } from "@/components/transaction-list"
import { AuthButton } from "@/components/auth-button"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/")

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold text-blue-600">Dashboard</div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </header>
      <section className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
          <SummaryCards />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CategoryPie />
            <TrendsLine />
          </div>
          <TransactionsSection />
        </div>
      </section>
    </main>
  )
}

function TransactionsSection() {
  // eslint-disable-next-line @next/next/no-async-client-component
  // @ts-expect-error Server file with client island below
  return <TransactionsClient />
}
// eslint-disable-next-line
;("use client")
import { useState } from "react"
function TransactionsClient() {
  const [refreshKey, setRefreshKey] = useState(0)
  return (
    <div className="space-y-4">
      <TransactionInput onCreated={() => setRefreshKey((k) => k + 1)} />
      <TransactionList refreshKey={refreshKey} />
    </div>
  )
}
