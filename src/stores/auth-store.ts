import { create } from "zustand"
import {
  authStorage,
  getMe,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  type AuthUser,
} from "@/lib/api"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthState {
  user: AuthUser | null
  status: AuthStatus
  init: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => {
  let unauthorizedBound = false

  const handleUnauthorized = () => {
    set({ user: null, status: "unauthenticated" })
  }

  return {
    user: null,
    status: "loading",

    init: async () => {
      const hasTokens = !!authStorage.getAccessToken()

      if (!hasTokens) {
        set({ user: null, status: "unauthenticated" })
        return
      }

      if (!unauthorizedBound && typeof window !== "undefined") {
        unauthorizedBound = true
        window.addEventListener("bts:unauthorized", handleUnauthorized)
      }

      try {
        const user = await getMe()
        set({ user, status: "authenticated" })
      } catch {
        set({ user: null, status: "unauthenticated" })
      }
    },

    login: async (email, password) => {
      const auth = await apiLogin(email, password)
      set({ user: auth.user, status: "authenticated" })
    },

    register: async (name, email, password) => {
      const auth = await apiRegister(name, email, password)
      set({ user: auth.user, status: "authenticated" })
    },

    logout: async () => {
      await apiLogout()
      set({ user: null, status: "unauthenticated" })
    },
  }
})
