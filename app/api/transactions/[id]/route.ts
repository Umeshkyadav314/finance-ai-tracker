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

  const users = await usersCollection()
  const user = await users.findOne({ email: session.user.email })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

  const updates: any = { ...parsed.data }
  if (updates.date) updates.date = new Date(updates.date)
  updates.updatedAt = new Date()

  const trx = await transactionsCollection()
  const res = await trx.updateOne({ _id: new ObjectId(params.id), userId: String(user._id) }, { $set: updates })
  if (!res.matchedCount) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const users = await usersCollection()
  const user = await users.findOne({ email: session.user.email })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const trx = await transactionsCollection()
  const res = await trx.deleteOne({ _id: new ObjectId(params.id), userId: String(user._id) })
  if (!res.deletedCount) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
