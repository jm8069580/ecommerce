import { create } from "zustand"
import type { Product } from "@/types"
import { api } from "@/lib/api"

interface WishlistState {
  items: Product[]
  loading: boolean
  error: string | null
  hydrated: boolean

  fetchWishlist: () => Promise<void>
  toggleWishlist: (product: Product) => Promise<void>
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

  toggleWishlist: async (product) => {
    const exists = get().items.some((item) => item.id === product.id)

    if (exists) {
      const prev = get().items
      set((state) => ({
        items: state.items.filter((item) => item.id !== product.id),
      }))
      try {
        await api.delete("/wishlist/" + product.id)
      } catch (error) {
        set({ items: prev, error: (error as Error).message })
      }
    } else {
      const prev = get().items
      set((state) => ({ items: [product, ...state.items] }))
      try {
        await api.post("/wishlist/" + product.id)
      } catch (error) {
        set({ items: prev, error: (error as Error).message })
      }
    }
  },

  isInWishlist: (productId) => {
    return get().items.some((item) => item.id === productId)
  },

  clearWishlist: async () => {
    const prev = get().items
    set({ items: [] })
    try {
      await api.delete("/wishlist")
    } catch (error) {
      set({ items: prev, error: (error as Error).message })
    }
  },
}))
