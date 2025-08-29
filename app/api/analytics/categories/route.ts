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
  const categories = await trx
    .aggregate([
      { $match: { userId: String(user._id), type: "EXPENSE" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $project: { category: "$_id", _id: 0, total: 1 } },
      { $sort: { total: -1 } },
    ])
    .toArray()

  return NextResponse.json({ categories })
}
