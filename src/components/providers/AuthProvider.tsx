"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { useWishlistStore } from "@/stores/wishlist-store"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((state) => state.init)
  const status = useAuthStore((state) => state.status)
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist)

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (status === "authenticated") {
      fetchWishlist()
    }
  }, [status, fetchWishlist])

  return <>{children}</>
}
