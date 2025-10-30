import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth.store'

describe('auth.store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('sets and removes token', () => {
    const s = useAuthStore()
    s.setToken('abc')
    expect(s.isAuthenticated).toBe(true)
    expect(s.bearer).toBe('Bearer abc')
    s.logout()
    expect(s.isAuthenticated).toBe(false)
  })
})
