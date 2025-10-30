import { defineStore } from 'pinia'
import { Api } from '@/api/client'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    messages: [] as string[],
    polling: null as number | null,
  }),
  actions: {
    start() {
      if (this.polling) return
      this.polling = window.setInterval(async () => {
        try {
          const agent = await Api.getAgent()
          const credits = agent.data?.credits
          this.push(`Mise à jour : ${credits} crédits disponibles`)
        } catch {
          this.push('Erreur de mise à jour de l’agent')
        }
      }, 15000)
    },
    stop() {
      if (this.polling) clearInterval(this.polling)
      this.polling = null
    },
    push(msg: string) {
      this.messages.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)
      this.messages = this.messages.slice(0, 10)
    },
  },
})
