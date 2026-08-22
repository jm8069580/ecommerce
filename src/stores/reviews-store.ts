import { create } from "zustand"
import { api, ApiError } from "@/lib/api"

export interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  user: {
    id: string
    name: string
  }
  productId: string
  createdAt: string
  updatedAt: string
}

export interface ReviewSummary {
  averageRating: number
  totalReviews: number
  distribution: { rating: number; count: number }[]
}

interface ReviewsState {
  reviews: Review[]
  summary: ReviewSummary | null
  loading: boolean
  error: string | null

  fetchReviews: (productId: string) => Promise<void>
  fetchSummary: (productId: string) => Promise<void>
  createReview: (
    productId: string,
    data: { rating: number; title?: string; comment?: string }
  ) => Promise<void>
  updateReview: (
    productId: string,
    data: { rating?: number; title?: string; comment?: string }
  ) => Promise<void>
  deleteReview: (productId: string) => Promise<void>
}

export const useReviewsStore = create<ReviewsState>((set) => ({
  reviews: [],
  summary: null,
  loading: false,
  error: null,

  fetchReviews: async (productId) => {
    set({ loading: true, error: null })
    try {
      const reviews = await api.get<Review[]>(
        `/reviews/product/${productId}`
      )
      set({ reviews, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchSummary: async (productId) => {
    try {
      const summary = await api.get<ReviewSummary>(
        `/reviews/product/${productId}/summary`
      )
      set({ summary })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  createReview: async (productId, data) => {
    set({ error: null })
    try {
      await api.post(`/reviews/product/${productId}`, data)
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : (error as Error).message
      set({ error: message })
      throw error
    }
  },

  updateReview: async (productId, data) => {
    set({ error: null })
    try {
      await api.patch(`/reviews/product/${productId}`, data)
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : (error as Error).message
      set({ error: message })
      throw error
    }
  },

  deleteReview: async (productId) => {
    set({ error: null })
    try {
      await api.delete(`/reviews/product/${productId}`)
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : (error as Error).message
      set({ error: message })
      throw error
    }
  },
}))
