import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { transactionsCollection, usersCollection } from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const users = await usersCollection()
    if (!users) return NextResponse.json({ error: "Database not available" }, { status: 503 })

    const user = await users.findOne({ email: session.user.email })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const trx = await transactionsCollection()
    if (!trx) return NextResponse.json({ error: "Database not available" }, { status: 503 })

    const trends = await trx
      .aggregate([
        { $match: { userId: String(user._id) } },
        {
          $group: {
            _id: { y: { $year: "$date" }, m: { $month: "$date" }, type: "$type" },
            total: { $sum: "$amount" },
          },
        },
        { $project: { year: "$_id.y", month: "$_id.m", type: "$_id.type", total: 1, _id: 0 } },
        { $sort: { year: 1, month: 1 } },
      ])
      .toArray()

    return NextResponse.json({ trends })
  } catch (error) {
    console.error("Error in analytics trends:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
