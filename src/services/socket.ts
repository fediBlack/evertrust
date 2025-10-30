import { useAuthStore } from '@/stores/auth.store'

class SpaceSocket {
  private socket: WebSocket | null = null
  private token = ''
  private listeners = new Set<(msg: any) => void>()
  private connecting = false

  connect() {
    if (this.socket || this.connecting) return
    const auth = useAuthStore()
    if (!auth.isAuthenticated) return

    this.connecting = true
    this.token = auth.token
    console.log(this.token)

    this.socket = new WebSocket('wss://api.spacetraders.io/v2/ws')

    this.socket.onopen = () => {
      this.connecting = false
      console.log('[WS] Connected')
      this.socket?.send(JSON.stringify({ token: this.token }))
    }

    this.socket.onmessage = (event) => {
      let msg: any = event.data
      try {
        msg = JSON.parse(event.data)
      } catch {}
      this.listeners.forEach((cb) => cb(msg))
    }

    this.socket.onclose = () => {
      console.warn('[WS] Closed, reconnecting...')
      this.socket = null
      this.connecting = false
      // reconnexion automatique après 1.5s
      setTimeout(() => this.connect(), 1500)
    }

    this.socket.onerror = (err) => {
      console.error('[WS] Error:', err)
    }
  }

  onMessage(cb: (msg: any) => void) {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb) // désabonnement propre
  }

  disconnect() {
    this.socket?.close()
    this.socket = null
    this.connecting = false
  }
}

export const spaceSocket = new SpaceSocket()
