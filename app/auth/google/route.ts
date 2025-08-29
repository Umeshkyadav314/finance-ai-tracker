import { NextResponse } from "next/server"

export async function POST() {
  const url = `/api/auth/signin?callbackUrl=/dashboard`
  return NextResponse.json({ url })
}
