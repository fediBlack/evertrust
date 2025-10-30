import { defineStore } from 'pinia'
import { Api } from '@/api/client'

export const useAgentStore = defineStore('agent', {
  state: () => ({
    data: null as any,
    loading: false,
    error: '' as string,
  }),
  actions: {
    async fetch() {
      this.loading = true
      this.error = ''
      try {
        const r = await Api.getAgent()
        this.data = r?.data ?? r
      } catch (e: any) {
        this.error = e?.message || 'Unable to fetch agent'
      } finally {
        this.loading = false
      }
    },
  },
})
