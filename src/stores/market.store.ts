import { defineStore } from 'pinia'
import { Api } from '@/api/client'

export const useMarketStore = defineStore('market', {
  state: () => ({
    data: null as any,
    loading: false,
    error: '' as string,
  }),
  actions: {
    async fetch(systemSymbol: string, waypointSymbol: string) {
      this.loading = true
      this.error = ''
      try {
        const res = await Api.getMarket(systemSymbol, waypointSymbol)
        this.data = res.data ?? res
      } catch (e: any) {
        this.error = e?.message || 'Unable to fetch market'
      } finally {
        this.loading = false
      }
    },
  },
})
