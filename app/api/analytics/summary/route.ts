import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { transactionsCollection, usersCollection } from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const users = await usersCollection()
  const user = await users.findOne({ email: session.user.email })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const trx = await transactionsCollection()
  const agg = await trx
    .aggregate([{ $match: { userId: String(user._id) } }, { $group: { _id: "$type", total: { $sum: "$amount" } } }])
    .toArray()

  const income = agg.find((a) => a._id === "INCOME")?.total || 0
  const expenses = agg.find((a) => a._id === "EXPENSE")?.total || 0
  const savings = income - expenses

  return NextResponse.json({ income, expenses, savings })
}
