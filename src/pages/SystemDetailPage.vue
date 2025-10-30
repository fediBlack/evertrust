<template>
  <section style="padding: 16px">
    <nav style="margin-bottom: 8px">
      <a @click.prevent="back" href="#">← Retour</a>
    </nav>

    <h2>System {{ symbol }}</h2>
    <p v-if="sysError" style="color: #c00">{{ sysError }}</p>
    <p v-else-if="sysLoading">Chargement du système…</p>

    <div v-else-if="system">
      <div style="border: 1px solid #eee; padding: 12px; border-radius: 8px; margin-bottom: 12px">
        <div><strong>Type:</strong> {{ system.type }}</div>
        <div><strong>Coords:</strong> ({{ system.x }}, {{ system.y }})</div>
        <div><strong>Sector:</strong> {{ system.sectorSymbol }}</div>
      </div>

      <h3>Waypoints</h3>
      <p v-if="wpError" style="color: #c00">{{ wpError }}</p>
      <p v-else-if="wpLoading">Chargement des waypoints…</p>

      <table v-else style="width: 100%; border-collapse: collapse">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #eee; padding: 8px">Symbol</th>
            <th style="text-align: left; border-bottom: 1px solid #eee; padding: 8px">Type</th>
            <th style="text-align: left; border-bottom: 1px solid #eee; padding: 8px">Traits</th>
            <th style="text-align: left; border-bottom: 1px solid #eee; padding: 8px">Faction</th>
            <th style="text-align: left; border-bottom: 1px solid #eee; padding: 8px">Market</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="w in waypoints" :key="w.symbol">
            <td style="padding: 8px">{{ w.symbol }}</td>
            <td style="padding: 8px">{{ w.type }}</td>
            <td style="padding: 8px">
              <span v-for="t in w.traits || []" :key="t.symbol" style="margin-right: 6px">{{
                t.symbol
              }}</span>
            </td>
            <td style="padding: 8px">{{ w.faction?.symbol || '—' }}</td>
            <td style="padding: 8px">
              <RouterLink
                v-if="hasMarket(w)"
                :to="{ name: 'market', params: { system: symbol, waypoint: w.symbol } }"
              >
                Voir marché
              </RouterLink>
              <span v-else>—</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 12px; display: flex; gap: 8px; align-items: center">
        <button :disabled="wpPage <= 1 || wpLoading" @click="wpPrev">Précédent</button>
        <span>Page {{ wpPage }} / {{ wpTotalPages }}</span>
        <button :disabled="wpPage >= wpTotalPages || wpLoading" @click="wpNext">Suivant</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Api } from '@/api/client'

interface Trait {
  symbol: string
  name?: string
  description?: string
}

interface Waypoint {
  symbol: string
  type: string
  traits?: Trait[]
  faction?: { symbol: string }
}

const route = useRoute()
const router = useRouter()
const symbol = route.params.symbol as string

// System
const system = ref<any>(null)
const sysLoading = ref(false)
const sysError = ref('')

// Waypoints
const waypoints = ref<any[]>([])
const wpMeta = ref({ page: 1, limit: 20, total: 0 })
const wpLoading = ref(false)
const wpError = ref('')

const wpPage = computed(() => wpMeta.value.page)
const wpTotalPages = computed(() => Math.max(1, Math.ceil(wpMeta.value.total / wpMeta.value.limit)))

function back() {
  router.back()
}

function hasMarket(w: Waypoint) {
  return !!w.traits?.some((t: Trait) => t.symbol === 'MARKETPLACE')
}
async function fetchSystem() {
  sysLoading.value = true
  sysError.value = ''
  try {
    const res = await Api.getSystem(symbol)
    system.value = res.data ?? res
  } catch (e: any) {
    sysError.value = e?.message || 'Unable to fetch system'
  } finally {
    sysLoading.value = false
  }
}

async function fetchWaypoints(page = 1) {
  wpLoading.value = true
  wpError.value = ''
  try {
    const res = await Api.listWaypoints(symbol, page, wpMeta.value.limit)
    waypoints.value = res.data
    wpMeta.value = res.meta
  } catch (e: any) {
    wpError.value = e?.message || 'Unable to fetch waypoints'
  } finally {
    wpLoading.value = false
  }
}

function wpPrev() {
  fetchWaypoints(wpPage.value - 1)
}
function wpNext() {
  fetchWaypoints(wpPage.value + 1)
}

onMounted(() => {
  fetchSystem()
  fetchWaypoints(1)
})

// Si on navigue vers un autre système via la même page
watch(
  () => route.params.symbol,
  (s) => {
    if (typeof s === 'string') {
      system.value = null
      waypoints.value = []
      wpMeta.value = { page: 1, limit: 20, total: 0 }
      fetchSystem()
      fetchWaypoints(1)
    }
  }
)
</script>
