import { type NextRequest, NextResponse } from "next/server"
import { CATEGORIES } from "@/lib/categories"

export async function POST(req: NextRequest) {
  const { input } = await req.json()
  if (!input || typeof input !== "string") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error: "OpenAI API key not configured",
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

  const system = `
You are a transaction parser. Extract: amount(number), currency(string default "USD"),
category(one of: ${CATEGORIES.join(", ")}), description(string),
type("INCOME"|"EXPENSE"), confidence(0-1), date(ISO string or empty).
Return ONLY JSON without code fences.
`

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Input: "${input}"\nReturn JSON only.` }
        ],
        temperature: 0,
      }),
    })

    const data = await response.json()
    const text = data.choices[0]?.message?.content

    try {
      const parsed = JSON.parse(text) as any
      parsed.currency ||= "USD"
      if (!CATEGORIES.includes(parsed.category)) parsed.category = "Other"
      if (parsed.type !== "INCOME" && parsed.type !== "EXPENSE") {
        parsed.type = parsed.amount >= 0 ? "INCOME" : "EXPENSE"
      }
      if (!parsed.date) parsed.date = new Date().toISOString()
      if (typeof parsed.confidence !== "number") parsed.confidence = 0.5
      return NextResponse.json(parsed)
    } catch (parseError) {
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
  } catch (aiError: any) {
    // Handle OpenAI quota or other API errors
    console.error("OpenAI API error:", aiError.message)
    return NextResponse.json(
      {
        error: "AI parsing temporarily unavailable",
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
