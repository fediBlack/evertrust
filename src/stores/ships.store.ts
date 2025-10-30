import { defineStore } from 'pinia'
import { Api } from '@/api/client'

type Meta = { page: number; limit: number; total: number }

export const useShipsStore = defineStore('ships', {
  state: () => ({
    list: [] as any[],
    selected: null as any | null,
    meta: { page: 1, limit: 20, total: 0 } as Meta,
    loading: false,
    error: '' as string,
    detailLoading: false,
    actionLoading: false,
    waypoints: [] as any[], // destinations du système courant
    wpLoading: false,
  }),

  actions: {
    async fetch(page = 1) {
      this.loading = true
      this.error = ''
      try {
        const res = await Api.myShips(page, this.meta.limit)
        this.list = res.data
        this.meta = res.meta
      } catch (e: any) {
        this.error = e?.response?.data?.error?.message || e?.message || 'Unable to fetch ships'
      } finally {
        this.loading = false
      }
    },

    async select(shipSymbol: string) {
      this.detailLoading = true
      this.error = ''
      try {
        const res = await Api.getShip(shipSymbol)
        this.selected = res.data ?? res
        // charger les waypoints du système du navire (pour le select destination)
        const sys = this.selected?.nav?.systemSymbol
        if (sys) {
          this.wpLoading = true
          const w = await Api.listWaypoints(sys, 1, 20) // <= 20
          this.waypoints = w.data
        }
      } catch (e: any) {
        this.error = e?.response?.data?.error?.message || e?.message || 'Unable to load ship'
      } finally {
        this.detailLoading = false
        this.wpLoading = false
      }
    },

    async refreshSelected() {
      if (!this.selected?.symbol) return
      const res = await Api.getShip(this.selected.symbol)
      this.selected = res.data ?? res
    },

    async orbit() {
      if (!this.selected?.symbol) return
      this.actionLoading = true
      this.error = ''
      try {
        await Api.shipOrbit(this.selected.symbol)
        await this.refreshSelected()
      } catch (e: any) {
        this.error = e?.response?.data?.error?.message || e?.message || 'Orbit failed'
      } finally {
        this.actionLoading = false
      }
    },

    async dock() {
      if (!this.selected?.symbol) return
      this.actionLoading = true
      this.error = ''
      try {
        await Api.shipDock(this.selected.symbol)
        await this.refreshSelected()
      } catch (e: any) {
        this.error = e?.response?.data?.error?.message || e?.message || 'Dock failed'
      } finally {
        this.actionLoading = false
      }
    },

    async refuel() {
      if (!this.selected?.symbol) return
      this.actionLoading = true
      this.error = ''
      try {
        await Api.shipRefuel(this.selected.symbol)
        await this.refreshSelected()
      } catch (e: any) {
        this.error =
          e?.response?.data?.error?.message || e?.message || 'Refuel failed (need DOCKED)'
      } finally {
        this.actionLoading = false
      }
    },

    async navigateTo(waypointSymbol: string) {
      if (!this.selected?.symbol) return
      this.actionLoading = true
      this.error = ''
      try {
        // prérequis SpaceTraders: être en ORBIT pour naviguer
        if (this.selected?.nav?.status === 'DOCKED') {
          await Api.shipOrbit(this.selected.symbol)
        }
        const res = await Api.shipNavigate(this.selected.symbol, waypointSymbol)
        // la réponse contient un ETA/arrival -> on rafraîchit l’état du navire
        await this.refreshSelected()
        return res
      } catch (e: any) {
        this.error = e?.response?.data?.error?.message || e?.message || 'Navigation failed'
      } finally {
        this.actionLoading = false
      }
    },
    clearSelection() {
      this.selected = null
    },
  },
})
