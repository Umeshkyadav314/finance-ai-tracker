import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { transactionsCollection, usersCollection } from "@/lib/mongodb"
import { z } from "zod"

const updateSchema = z.object({
  amount: z.number().optional(),
  currency: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const users = await usersCollection()
    if (!users) return NextResponse.json({ error: "Database not available" }, { status: 503 })

    const user = await users.findOne({ email: session.user.email })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

    const updates: any = { ...parsed.data }
    if (updates.date) updates.date = new Date(updates.date)
    updates.updatedAt = new Date()

    const trx = await transactionsCollection()
    if (!trx) return NextResponse.json({ error: "Database not available" }, { status: 503 })

    const res = await trx.updateOne({ _id: new ObjectId(params.id), userId: String(user._id) }, { $set: updates })
    if (!res.matchedCount) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const users = await usersCollection()
    if (!users) return NextResponse.json({ error: "Database not available" }, { status: 503 })

    const user = await users.findOne({ email: session.user.email })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const trx = await transactionsCollection()
    if (!trx) return NextResponse.json({ error: "Database not available" }, { status: 503 })

    const res = await trx.deleteOne({ _id: new ObjectId(params.id), userId: String(user._id) })
    if (!res.deletedCount) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
