import { AuthButton } from "@/components/auth-button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <main className="min-h-dvh flex flex-col">
      <header className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold text-blue-600">Finance AI Tracker</div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AuthButton />
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
              Sign in with Google, enter transactions in natural language, and get beautiful charts and summaries. Built
              with Next.js, Tailwind, MongoDB, and the AI SDK.
            </p>
            <div>
              <AuthButton />
            </div>
          </div>
          <div className="rounded-lg border p-6">
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Google OAuth sign-in</li>
              <li>Natural language entry: “Coffee at Starbucks $6.50”</li>
              <li>Auto-categorization with confidence</li>
              <li>Dashboard with pie and line charts</li>
              <li>Responsive, modern UI</li>
            </ul>
          </div>
        </div>
      </section>
      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} WarrantyMe — Demo Assignment
        </div>
      </footer>
    </main>
  )
}
