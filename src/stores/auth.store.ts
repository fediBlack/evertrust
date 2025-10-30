import { defineStore } from 'pinia'
const TOKEN_KEY = ''

export const useAuthStore = defineStore('auth', {
  state: () => ({ token: localStorage.getItem(TOKEN_KEY) || '' }),
  getters: {
    isAuthenticated: (s) => !!s.token,
    bearer: (s) => (s.token ? `Bearer ${s.token}` : ''),
  },
  actions: {
    setToken(t: string) {
      this.token = t
      localStorage.setItem(TOKEN_KEY, t)
    },
    logout() {
      this.token = ''
      localStorage.removeItem(TOKEN_KEY)
    },
  },
})
