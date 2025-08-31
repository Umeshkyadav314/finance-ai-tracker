import { type NextRequest, NextResponse } from "next/server"
import { CATEGORIES } from "@/lib/categories"

export async function POST(req: NextRequest) {
  const { input } = await req.json()
  if (!input || typeof input !== "string") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    // Provide better fallback parsing when AI is not available
    const fallback = parseFallback(input)
    return NextResponse.json(
      {
        error: "AI parsing not configured - using fallback parser",
        fallback: fallback,
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
      // Fallback to basic parsing if AI response is invalid
      const fallback = parseFallback(input)
      return NextResponse.json(
        {
          error: "AI parsing failed - using fallback parser",
          fallback: fallback,
        },
        { status: 200 },
      )
    }
  } catch (aiError: any) {
    // Handle OpenAI quota or other API errors
    console.error("OpenAI API error:", aiError.message)
    const fallback = parseFallback(input)
    return NextResponse.json(
      {
        error: "AI parsing temporarily unavailable - using fallback parser",
        fallback: fallback,
      },
      { status: 200 },
    )
  }
}

// Fallback parsing function when AI is not available
function parseFallback(input: string) {
  // Extract amount using regex - get the first amount found
  const amountMatch = input.match(/\$?(\d+(?:\.\d{2})?)/)
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0

  // Determine if it's income or expense based on keywords
  const incomeKeywords = ['salary', 'payment', 'income', 'earned', 'freelance', 'bonus', 'refund', 'deposit']
  const expenseKeywords = ['coffee', 'lunch', 'dinner', 'breakfast', 'restaurant', 'food', 'meal', 'gas', 'uber', 'taxi', 'bus', 'train', 'fuel', 'parking', 'grocery', 'shopping', 'clothes', 'movie', 'concert', 'game', 'entertainment', 'doctor', 'medicine', 'pharmacy', 'medical', 'health', 'electricity', 'water', 'internet', 'phone', 'bill']

  // Check for expense keywords first (more common)
  const isExpense = expenseKeywords.some(keyword =>
    input.toLowerCase().includes(keyword)
  )

  // Only mark as income if explicitly mentioned
  const isIncome = incomeKeywords.some(keyword =>
    input.toLowerCase().includes(keyword)
  )

  // Default to expense unless clearly income
  const transactionType = isIncome ? "INCOME" : "EXPENSE"

  // Basic category detection
  let category = "Other"
  const categoryKeywords: Record<string, string[]> = {
    "Food & Dining": ['coffee', 'lunch', 'dinner', 'breakfast', 'restaurant', 'food', 'meal', 'starbucks'],
    "Transportation": ['gas', 'uber', 'taxi', 'bus', 'train', 'fuel', 'parking', 'station'],
    "Shopping": ['grocery', 'walmart', 'target', 'amazon', 'clothes', 'shopping'],
    "Entertainment": ['movie', 'concert', 'game', 'entertainment'],
    "Healthcare": ['doctor', 'medicine', 'pharmacy', 'medical', 'health'],
    "Utilities": ['electricity', 'water', 'internet', 'phone', 'bill']
  }

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => input.toLowerCase().includes(keyword))) {
      category = cat
      break
    }
  }

  // Clean up description - remove quotes and extra text
  let cleanDescription = input
    .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
    .trim()

  // If multiple transactions, just show the first one
  if (cleanDescription.includes('"') && cleanDescription.split('"').length > 2) {
    const firstTransaction = cleanDescription.split('"')[1] || cleanDescription
    cleanDescription = firstTransaction
  }

  return {
    amount: amount,
    currency: "USD",
    category: category,
    description: cleanDescription,
    type: transactionType,
    confidence: 0.3, // Lower confidence for fallback
    date: new Date().toISOString(),
  }
}
