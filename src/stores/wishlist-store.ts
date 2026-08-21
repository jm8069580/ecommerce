import { create } from "zustand"
import type { Product } from "@/types"
import { api } from "@/lib/api"

interface WishlistState {
  items: Product[]
  loading: boolean
  error: string | null
  hydrated: boolean

  fetchWishlist: () => Promise<void>
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  toggleWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => Promise<void>
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  hydrated: false,

  fetchWishlist: async () => {
    set({ loading: true, error: null })
    try {
      const items = await api.get<Product[]>("/wishlist")
      set({ items, loading: false, hydrated: true })
    } catch (error) {
      set({ error: (error as Error).message, loading: false, hydrated: true })
    }
  },

  addToWishlist: async (productId) => {
    set({ error: null })
    try {
      await api.post("/wishlist/" + productId)
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  removeFromWishlist: async (productId) => {
    const prev = get().items
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    }))
    try {
      await api.delete("/wishlist/" + productId)
    } catch (error) {
      set({ items: prev, error: (error as Error).message })
      throw error
    }
  },

  toggleWishlist: async (productId) => {
    const inWishlist = get().isInWishlist(productId)
    if (inWishlist) {
      await get().removeFromWishlist(productId)
    } else {
      await get().addToWishlist(productId)
      await get().fetchWishlist()
    }
  },

  isInWishlist: (productId) => {
    return get().items.some((item) => item.id === productId)
  },

  clearWishlist: async () => {
    set({ items: [] })
    try {
      await api.delete("/wishlist")
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },
}))
