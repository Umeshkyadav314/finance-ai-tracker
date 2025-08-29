import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { CATEGORIES } from "@/lib/categories"

export async function POST(req: NextRequest) {
  const { input } = await req.json()
  if (!input || typeof input !== "string") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const system = `
You are a transaction parser. Extract: amount(number), currency(string default "USD"),
category(one of: ${CATEGORIES.join(", ")}), description(string),
type("INCOME"|"EXPENSE"), confidence(0-1), date(ISO string or empty).
Return ONLY JSON without code fences.
`

  const { text } = await generateText({
    model: openai("gpt-4o"),
    system,
    prompt: `Input: "${input}"\nReturn JSON only.`,
  })

  try {
    const parsed = JSON.parse(text)
    parsed.currency ||= "USD"
    if (!CATEGORIES.includes(parsed.category)) parsed.category = "Other"
    if (parsed.type !== "INCOME" && parsed.type !== "EXPENSE") {
      parsed.type = parsed.amount >= 0 ? "INCOME" : "EXPENSE"
    }
    if (!parsed.date) parsed.date = new Date().toISOString()
    if (typeof parsed.confidence !== "number") parsed.confidence = 0.5
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json(
      {
        error: "Parse failed",
        fallback: {
          amount: 0,
          currency: "USD",
          category: "Other",
          description: input,
          type: "EXPENSE",
          confidence: 0,
          date: new Date().toISOString(),
        },
      },
      { status: 200 },
    )
  }
}
