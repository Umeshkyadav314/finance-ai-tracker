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

  const json = await req.json()
  const parsed = createSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

  const users = await usersCollection()
  const user = await users.findOne({ email: session.user.email })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const trx = await transactionsCollection()
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
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""
  const from = searchParams.get("from") // ISO
  const to = searchParams.get("to") // ISO
  const type = searchParams.get("type") // INCOME|EXPENSE|all

  const users = await usersCollection()
  const user = await users.findOne({ email: session.user.email })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const filter: any = { userId: String(user._id) }
  if (category) filter.category = category
  if (type && (type === "INCOME" || type === "EXPENSE")) filter.type = type
  if (from || to) {
    filter.date = {}
    if (from) filter.date.$gte = new Date(from)
    if (to) filter.date.$lte = new Date(to)
  }
  if (q) {
    filter.$or = [{ description: { $regex: q, $options: "i" } }, { category: { $regex: q, $options: "i" } }]
  }

  const trx = await transactionsCollection()
  const items = await trx.find(filter).sort({ date: -1 }).limit(500).toArray()
  return NextResponse.json({ items })
}
