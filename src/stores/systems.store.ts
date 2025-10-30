import { defineStore } from 'pinia'
import { Api } from '@/api/client'

type Meta = { page: number; limit: number; total: number }

export const useSystemsStore = defineStore('systems', {
  state: () => ({
    list: [] as any[],
    meta: { page: 1, limit: 20, total: 0 } as Meta,
    loading: false,
    error: '' as string,
  }),
  actions: {
    async fetch(page = 1) {
      this.loading = true
      this.error = ''
      try {
        const res = await Api.listSystems(page, this.meta.limit)
        this.list = res.data
        this.meta = res.meta
      } catch (e: any) {
        this.error = e?.message || 'Unable to fetch systems'
      } finally {
        this.loading = false
      }
    },
  },
})
