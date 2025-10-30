type TickFn = () => Promise<void>

export class Poller {
  private timer: number | null = null
  private interval = 5000
  private active = false
  private tick: TickFn
  private hiddenHandler = () => this.onVisibilityChange()

  constructor(tick: TickFn, intervalMs = 5000) {
    this.tick = tick
    this.interval = intervalMs
  }

  start() {
    if (this.active) return
    this.active = true
    console.log('[Poller] start loop interval', this.interval)
    document.addEventListener('visibilitychange', this.hiddenHandler)
    this.loop()
  }

  private loop = async () => {
    if (!this.active) return
    console.log('[Poller] tick executing...')
    try {
      if (!document.hidden) await this.tick()
      this.schedule(this.interval)
    } catch (e) {
      console.error('[Poller] tick error', e)
      const backoff = (e as any)?.response?.status === 429 ? 15000 : 8000
      this.schedule(backoff)
    }
  }

  private schedule(ms: number) {
    this.timer && clearTimeout(this.timer)
    this.timer = window.setTimeout(this.loop, ms)
  }

  stop() {
    console.log('[Poller] stop')
    this.active = false
    this.timer && clearTimeout(this.timer)
    this.timer = null
    document.removeEventListener('visibilitychange', this.hiddenHandler)
  }

  private onVisibilityChange() {
    if (!document.hidden && this.active) this.loop()
  }
}
