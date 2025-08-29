"use client"

import { Button } from "@/components/ui/button"
import { signIn, signOut, useSession } from "next-auth/react"

export function AuthButton() {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  if (loading) return <Button disabled>Loading...</Button>

  if (!session) {
    return (
      <Button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Sign in with Google
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Hi, {session.user?.name || session.user?.email}</span>
      <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
        Sign out
      </Button>
    </div>
  )
}
