import { create } from "zustand"
import { api } from "@/lib/api"

export interface StoreConfig {
  appName: string
  currency: string
  shippingCountries: string[]
  freeShippingThreshold: number
  taxRate: number
}

interface ConfigUpdate {
  appName?: string
  currency?: string
  shippingCountries?: string[]
  freeShippingThreshold?: number
  taxRate?: number
}

interface ConfigState {
  config: StoreConfig | null
  loading: boolean
  saving: boolean
  error: string | null

  fetchConfig: () => Promise<void>
  updateConfig: (data: ConfigUpdate) => Promise<void>
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: null,
  loading: false,
  saving: false,
  error: null,

  fetchConfig: async () => {
    set({ loading: true, error: null })
    try {
      const config = await api.get<StoreConfig>("/config")
      set({ config, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  updateConfig: async (data) => {
    set({ saving: true, error: null })
    try {
      const config = await api.put<StoreConfig>("/config", data)
      set({ config, saving: false })
    } catch (error) {
      set({ error: (error as Error).message, saving: false })
      throw error
    }
  },
}))
