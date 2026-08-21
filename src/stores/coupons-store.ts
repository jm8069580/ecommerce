import { create } from "zustand"
import { api, ApiError } from "@/lib/api"

export interface CouponValidationResult {
  valid: boolean
  discount: number
  message: string
}

interface CouponsState {
  appliedCode: string | null
  discount: number
  validating: boolean
  error: string | null

  validateCoupon: (code: string, subtotal: number) => Promise<CouponValidationResult>
  clearCoupon: () => void
}

export const useCouponsStore = create<CouponsState>((set) => ({
  appliedCode: null,
  discount: 0,
  validating: false,
  error: null,

  validateCoupon: async (code, subtotal) => {
    set({ validating: true, error: null })
    try {
      const params = new URLSearchParams({ code, subtotal: subtotal.toString() })
      const result = await api.get<CouponValidationResult>(
        `/coupons/validate?${params}`
      )
      if (result.valid) {
        set({
          appliedCode: code.toUpperCase(),
          discount: result.discount,
          validating: false,
        })
      } else {
        set({
          appliedCode: null,
          discount: 0,
          validating: false,
          error: result.message,
        })
      }
      return result
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Error al validar cupon"
      set({
        appliedCode: null,
        discount: 0,
        validating: false,
        error: message,
      })
      return { valid: false, discount: 0, message }
    }
  },

  clearCoupon: () => {
    set({ appliedCode: null, discount: 0, error: null })
  },
}))
