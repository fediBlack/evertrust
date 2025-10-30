import { defineStore } from 'pinia'
import { Api } from '@/api/client'
import { Poller } from '@/services/poller'

type ShipLite = {
  symbol: string
  nav?: { status?: string; systemSymbol?: string; waypointSymbol?: string; flightMode?: string }
  fuel?: { current?: number; capacity?: number }
  cargo?: { units?: number; capacity?: number }
}

export const useEventsStore = defineStore('events', {
  state: () => ({
    events: [] as { ts: number; type: string; data: any }[],
    connected: false,
    _poller: null as Poller | null,
    _prev: new Map<string, ShipLite>(),
    lastSeenTs: 0, // 👈 pour savoir ce qui est “non lu”
  }),

  getters: {
    unreadCount: (s) => s.events.filter((e) => e.ts > s.lastSeenTs).length,
    latest: (s) => s.events.slice(0, 10), // pour le menu
  },

  actions: {
    start() {
      console.log('[EventsStore] start() called')
      if (this.connected) return
      const boundTick = async () => {
        await this.tick()
      }
      this._poller = new Poller(boundTick, 5000)
      this._poller.start()
      this.connected = true
    },

    stop() {
      console.log('[EventsStore] stop() called')
      this._poller?.stop()
      this._poller = null
      this.connected = false
    },

    push(type: string, data: any) {
      this.events.unshift({ ts: Date.now(), type, data })
      if (this.events.length > 100) this.events.pop()
    },

    markAllRead() {
      this.lastSeenTs = Date.now()
    },
    markTsRead(ts: number) {
      if (ts > this.lastSeenTs) this.lastSeenTs = ts
    },

    async tick() {
      console.log('[Polling] tick start')
      const res = await Api.myShips(1, 20) // <= 20 sinon 3001
      const ships = (res.data || []) as any[]
      console.log('[Polling] ships loaded', ships.length)

      for (const s of ships) {
        const ship: ShipLite = {
          symbol: s.symbol,
          nav: {
            status: s.nav?.status,
            systemSymbol: s.nav?.systemSymbol,
            waypointSymbol: s.nav?.waypointSymbol,
            flightMode: s.nav?.flightMode,
          },
          fuel: { current: s.fuel?.current, capacity: s.fuel?.capacity },
          cargo: { units: s.cargo?.units, capacity: s.cargo?.capacity },
        }

        const prev = this._prev.get(ship.symbol)
        if (!prev) {
          this._prev.set(ship.symbol, ship)
          continue
        }

        if (prev.nav?.status !== ship.nav?.status)
          this.push('nav:status', {
            symbol: ship.symbol,
            from: prev.nav?.status,
            to: ship.nav?.status,
          })
        if (prev.nav?.waypointSymbol !== ship.nav?.waypointSymbol)
          this.push('nav:waypoint', {
            symbol: ship.symbol,
            from: prev.nav?.waypointSymbol,
            to: ship.nav?.waypointSymbol,
          })
        if (prev.fuel?.current !== ship.fuel?.current)
          this.push('fuel', {
            symbol: ship.symbol,
            from: prev.fuel?.current,
            to: ship.fuel?.current,
          })
        if (prev.cargo?.units !== ship.cargo?.units)
          this.push('cargo', {
            symbol: ship.symbol,
            from: prev.cargo?.units,
            to: ship.cargo?.units,
          })

        // update snapshot
        this._prev.set(ship.symbol, ship)
      }

      // purge ships disparus
      for (const key of Array.from(this._prev.keys())) {
        if (!ships.find((s) => s.symbol === key)) this._prev.delete(key)
      }
    },
  },
})
