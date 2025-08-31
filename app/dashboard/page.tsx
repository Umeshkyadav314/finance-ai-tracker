"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { SummaryCards } from "@/components/summary-cards"
import { CategoryPie, TrendsLine } from "@/components/charts"
import { TransactionInput } from "@/components/transaction-input"
import { TransactionList } from "@/components/transaction-list"
import { AuthButton } from "@/components/auth-button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/")
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="text-lg sm:text-xl font-semibold text-blue-600">Dashboard</div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <AuthButton />
            </div>
          </div>
        </div>
      </header>
      <section className="flex-1">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <SummaryCards />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
  const [refreshKey, setRefreshKey] = useState(0)
  return (
    <div className="space-y-4">
      <TransactionInput onCreated={() => setRefreshKey((k) => k + 1)} />
      <TransactionList refreshKey={refreshKey} />
    </div>
  )
}
