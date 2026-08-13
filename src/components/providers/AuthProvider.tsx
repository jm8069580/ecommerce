"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth-store"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((state) => state.init)

  useEffect(() => {
    init()
  }, [init])

  return <>{children}</>
}
