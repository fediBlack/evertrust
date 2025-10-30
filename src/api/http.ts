import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import router from '@/router' // ⬅️ use SPA navigation, not window.location

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// Prevent multiple concurrent redirects
let isRedirecting401 = false

http.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth?.isAuthenticated) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

http.interceptors.response.use(
  (r) => r,
  async (err) => {
    const status = err?.response?.status
    if (status === 401 && !isRedirecting401) {
      isRedirecting401 = true
      try {
        const auth = useAuthStore()
        auth?.logout()

        // Optional: stop polling events before leaving
        try {
          const { useEventsStore } = await import('@/stores/events.store')
          useEventsStore().stop()
        } catch {}

        // push to /login without hard reload
        const redirect = router.currentRoute.value.fullPath
        if (router.currentRoute.value.name !== 'login') {
          await router.push({ name: 'login', query: { redirect } })
        }
      } finally {
        // small delay to avoid re-entrancy if multiple responses race
        setTimeout(() => {
          isRedirecting401 = false
        }, 500)
      }
    }
    return Promise.reject(err)
  },
)
