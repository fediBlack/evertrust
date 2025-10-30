import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useEventsStore } from '@/stores/events.store'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('@/pages/LoginPage.vue') },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/pages/DashboardPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/agent',
    name: 'agent',
    component: () => import('@/pages/AgentPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/systems',
    name: 'systems',
    component: () => import('@/pages/SystemsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/systems/:symbol',
    name: 'system',
    component: () => import('@/pages/SystemDetailPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/ships',
    name: 'ships',
    component: () => import('@/pages/ShipsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/market/:system/:waypoint',
    name: 'market',
    component: () => import('@/pages/MarketPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/events',
    name: 'events',
    component: () => import('@/pages/EventsPage.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})
router.afterEach((to) => {
  if (to.name === 'login') {
    try {
      useEventsStore().stop()
    } catch {}
  }
})
export default router
