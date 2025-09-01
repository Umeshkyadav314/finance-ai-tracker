"use client";

import { AuthButton } from "@/components/auth-button";
import FooterPage from "@/components/footer-page";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold text-blue-600">
            Finance AI Tracker
          </div>
          <div className="flex items-center gap-3">
            
            {session && (
              <Link
                href="/dashboard"
                className="px-3 py-1 rounded border  text-white hover:bg-blue-700 transition"
              >
                Dashboard
              </Link>
            )}
            
            <AuthButton />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <section className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-semibold text-balance">
              Track your finances with AI-powered insights
            </h1>
            <p className="text-muted-foreground text-pretty">
              Sign in with Google, enter transactions in natural language, and
              get beautiful charts and summaries. Built with Next.js, Tailwind,
              MongoDB, and the AI SDK.
            </p>
            <p className="text-muted-foreground text-pretty">
              Get intelligent spending analysis, trend predictions, and
              personalized financial insights powered by advanced AI algorithms.
            </p>
            <p className="text-muted-foreground text-pretty">
              Visualize your financial data with interactive charts, track
              spending patterns, and make informed decisions with comprehensive
              analytics.
            </p>
            {/* <div>
              <AuthButton />
            </div> */}
          </div>
          <div className="rounded-lg border p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
            <h3 className="font-semibold text-lg mb-4 text-blue-600 dark:text-blue-400">
              Key Features
            </h3>
            <ul className="list-disc pl-5 space-y-3 text-sm">
              <li>
                <strong>Google OAuth sign-in</strong> - Secure authentication
                with your Google account
              </li>
              <li>
                <strong>Natural language entry</strong> - "Coffee at Starbucks
                $6.50" gets auto-parsed
              </li>
              <li>
                <strong>AI-powered categorization</strong> - Smart
                classification with confidence scores
              </li>
              <li>
                <strong>Advanced analytics</strong> - Interactive pie charts,
                trend analysis, and spending patterns
              </li>
              <li>
                <strong>Data insights</strong> - Monthly comparisons, budget
                tracking, and financial recommendations
              </li>
              <li>
                <strong>Responsive design</strong> - Works perfectly on all
                devices
              </li>
              <li>
                <strong>Real-time updates</strong> - Instant data
                synchronization across all views
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
              Advanced Data Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg border bg-white dark:bg-gray-800">
                <h3 className="font-semibold mb-2">📊 Interactive Charts</h3>
                <p className="text-sm text-muted-foreground">
                  Pie charts, line graphs, bar charts, and area charts for
                  comprehensive data visualization
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-white dark:bg-gray-800">
                <h3 className="font-semibold mb-2">📈 Trend Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Track monthly income, expenses, and savings patterns with
                  detailed trend analysis
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-white dark:bg-gray-800">
                <h3 className="font-semibold mb-2">🎯 Smart Insights</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered recommendations and spending pattern recognition
                  for better financial decisions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FooterPage />
    </main>
  );
}
