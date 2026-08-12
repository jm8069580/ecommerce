import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { Session } from "next-auth"

type AuthResult =
  | { session: Session; error: null }
  | { session: null; error: NextResponse }

export async function requireAuth(): Promise<AuthResult> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      ),
    }
  }

  return { session, error: null }
}

export async function requireAdmin(): Promise<AuthResult> {
  const result = await requireAuth()
  if (result.error) return result

  if (result.session.user.role !== "ADMIN") {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Acceso denegado" },
        { status: 403 }
      ),
    }
  }

  return result
}