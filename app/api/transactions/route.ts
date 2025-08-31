import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { transactionsCollection, usersCollection } from "@/lib/mongodb"
import { z } from "zod"

const createSchema = z.object({
  amount: z.number(),
  currency: z.string().default("USD"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string(),
  description: z.string().optional(),
  date: z.string().optional(), // ISO
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const json = await req.json()
    const parsed = createSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

    const users = await usersCollection()
    if (!users) return NextResponse.json({ error: "Database not available" }, { status: 503 })

    const user = await users.findOne({ email: session.user.email })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const trx = await transactionsCollection()
    if (!trx) return NextResponse.json({ error: "Database not available" }, { status: 503 })

    const now = new Date()
    const date = parsed.data.date ? new Date(parsed.data.date) : now

    const doc = {
      // @ts-expect-error _id set by Mongo
      userId: String(user._id),
      amount: parsed.data.amount,
      currency: parsed.data.currency || "USD",
      type: parsed.data.type,
      category: parsed.data.category,
      description: parsed.data.description || "",
      date,
      createdAt: now,
      updatedAt: now,
    }
    const res = await trx.insertOne(doc as any)
    return NextResponse.json({ id: res.insertedId, ...doc }, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q") || ""
    const category = searchParams.get("category") || ""
    const from = searchParams.get("from") // Date input format (YYYY-MM-DD)
    const to = searchParams.get("to") // Date input format (YYYY-MM-DD)
    const type = searchParams.get("type") // INCOME|EXPENSE|all

    const users = await usersCollection()
    if (!users) return NextResponse.json({ error: "Database not available" }, { status: 503 })

    const user = await users.findOne({ email: session.user.email })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Debug logging
    console.log("User found:", { email: session.user.email, userId: user._id })
    console.log("Filter params:", { q, category, type, from, to })

    const filter: any = { userId: String(user._id) }
    if (category && category !== "all") filter.category = category
    if (type && type !== "all" && (type === "INCOME" || type === "EXPENSE")) filter.type = type
    
    // Fix date filtering - handle date input format properly
    if (from || to) {
      filter.date = {}
      if (from) {
        // Convert YYYY-MM-DD to start of day in UTC
        const fromDate = new Date(from + 'T00:00:00.000Z')
        filter.date.$gte = fromDate
        console.log("From date filter:", fromDate)
      }
      if (to) {
        // Convert YYYY-MM-DD to end of day in UTC
        const toDate = new Date(to + 'T23:59:59.999Z')
        filter.date.$lte = toDate
        console.log("To date filter:", toDate)
      }
    }
    
    if (q) {
      filter.$or = [{ description: { $regex: q, $options: "i" } }, { category: { $regex: q, $options: "i" } }]
    }

    const trx = await transactionsCollection()
    if (!trx) return NextResponse.json({ error: "Database not available" }, { status: 503 })

    // Debug logging
    console.log("Filter:", JSON.stringify(filter, null, 2))
    
    // Check total transactions for this user
    const totalCount = await trx.countDocuments({ userId: String(user._id) })
    console.log("Total transactions for user:", totalCount)
    
    const items = await trx.find(filter).sort({ date: -1 }).limit(500).toArray()
    
    // Debug logging
    console.log("Found items:", items.length)
    if (items.length > 0) {
      console.log("First item sample:", {
        _id: items[0]._id,
        userId: items[0].userId,
        description: items[0].description,
        amount: items[0].amount,
        date: items[0].date
      })
    }
    
    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
