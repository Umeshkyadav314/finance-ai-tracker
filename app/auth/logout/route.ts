import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const c = cookies()
  c.set("next-auth.session-token", "", { httpOnly: true, maxAge: 0, path: "/" })
  c.set("__Secure-next-auth.session-token", "", { httpOnly: true, maxAge: 0, path: "/" })
  return NextResponse.json({ ok: true })
}
