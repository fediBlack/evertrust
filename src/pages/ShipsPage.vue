<template>
  <section class="page">
    <h2>Flotte</h2>

    <p v-if="error" class="err">{{ error }}</p>
    <p v-else-if="loading">Chargement…</p>

    <div v-else class="grid">
      <!-- Table -->
      <table class="tbl">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Role</th>
            <th>Status</th>
            <th>Fuel</th>
            <th>Cargo</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in ships" :key="s.symbol" @click="open(s.symbol)" class="row">
            <td>{{ s.symbol }}</td>
            <td>{{ s.registration?.role || '—' }}</td>
            <td>{{ s.nav?.status || '—' }}</td>
            <td>{{ s.fuel?.current ?? '—' }} / {{ s.fuel?.capacity ?? '—' }}</td>
            <td>{{ s.cargo?.units ?? 0 }} / {{ s.cargo?.capacity ?? '—' }}</td>
            <td>
              {{ s.nav?.systemSymbol || '—' }}
              <template v-if="s.nav?.waypointSymbol">/ {{ s.nav.waypointSymbol }}</template>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pager">
        <button :disabled="page <= 1 || loading" @click="prev">Précédent</button>
        <span>Page {{ page }} / {{ totalPages }}</span>
        <button :disabled="page >= totalPages || loading" @click="next">Suivant</button>
      </div>

      <!-- Panneau de détails -->
      <aside class="panel" v-if="selected">
        <header class="panel-h">
          <strong>{{ selected.symbol }}</strong>
          <button @click="close" class="x">✕</button>
        </header>

        <div class="kv">
          <span>Role</span><span>{{ selected.registration?.role || '—' }}</span>
        </div>
        <div class="kv">
          <span>Status</span><span>{{ selected.nav?.status || '—' }}</span>
        </div>
        <div class="kv">
          <span>Mode</span><span>{{ selected.nav?.flightMode || '—' }}</span>
        </div>
        <div class="kv">
          <span>Fuel</span>
          <span>{{ selected.fuel?.current ?? '—' }} / {{ selected.fuel?.capacity ?? '—' }}</span>
        </div>
        <div class="kv">
          <span>Location</span>
          <span>{{ selected.nav?.systemSymbol }}/{{ selected.nav?.waypointSymbol }}</span>
        </div>
        <div class="kv">
          <span>Cargo</span>
          <span>{{ selected.cargo?.units ?? 0 }} / {{ selected.cargo?.capacity ?? '—' }}</span>
        </div>

        <h4 style="margin-top: 12px">Actions</h4>
        <p v-if="actionError" style="color: #c00">{{ actionError }}</p>

        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
          <button @click="orbit" :disabled="busy || selected.nav?.status === 'IN_ORBIT'">
            Mettre en ORBIT
          </button>
          <button @click="dock" :disabled="busy || selected.nav?.status === 'DOCKED'">
            Accoster (DOCK)
          </button>
          <button @click="refuel" :disabled="busy || selected.nav?.status !== 'DOCKED'">
            Ravitailler
          </button>
        </div>

        <div style="margin-top: 8px">
          <label>Destination :</label>
          <select v-model="dest" :disabled="busy || wpLoading" style="margin: 0 8px">
            <option disabled value="">Choisir…</option>
            <option v-for="w in waypoints" :key="w.symbol" :value="w.symbol">
              {{ w.symbol }} — {{ w.type }}
            </option>
          </select>
          <button @click="go" :disabled="busy || !dest">Naviguer</button>
        </div>

        <div style="margin-top: 8px; opacity: 0.8">
          <div><strong>Status:</strong> {{ selected.nav?.status }}</div>
          <div v-if="selected.nav?.route?.arrival">
            <strong>Arrivée:</strong> {{ formatTs(selected.nav.route.arrival) }}
          </div>
        </div>

        <h4 style="margin-top: 12px">Inventaire</h4>
        <table class="tbl small" v-if="(selected.cargo?.inventory || []).length">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Units</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in selected.cargo.inventory" :key="it.symbol">
              <td>{{ it.symbol }}</td>
              <td>{{ it.units }}</td>
              <td>{{ it.name || '—' }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>Pas d’items cargo.</p>

        <p v-if="detailLoading">Mise à jour des détails…</p>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useShipsStore } from '@/stores/ships.store'

const store = useShipsStore()

// Data binding
const selected = computed(() => store.selected)
const ships = computed(() => store.list)
const loading = computed(() => store.loading)
const error = computed(() => store.error)
const detailLoading = computed(() => store.detailLoading)
const actionError = computed(() => store.error)
const busy = computed(() => store.actionLoading || store.detailLoading)

const page = computed(() => store.meta.page)
const totalPages = computed(() => Math.max(1, Math.ceil(store.meta.total / store.meta.limit)))

const waypoints = computed(() => store.waypoints)
const wpLoading = computed(() => store.wpLoading)
const dest = ref('')

// Actions
function orbit() {
  store.orbit()
}
function dock() {
  store.dock()
}
function refuel() {
  store.refuel()
}
async function go() {
  if (!dest.value) return
  await store.navigateTo(dest.value)
  dest.value = ''
}

function open(symbol: string) {
  store.select(symbol)
}
function close() {
  store.clearSelection?.() // safe optional
  store.selected = null
}
function prev() {
  store.fetch(page.value - 1)
}
function next() {
  store.fetch(page.value + 1)
}

function formatTs(ts: string) {
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return ts
  }
}

onMounted(() => store.fetch(1))
</script>

<style scoped>
.page {
  display: grid;
  gap: 12px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
  align-items: start;
}
.tbl {
  width: 100%;
  border-collapse: collapse;
}
.tbl th,
.tbl td {
  padding: 8px;
  border-bottom: 1px solid #eee;
  text-align: left;
}
.tbl .row {
  cursor: pointer;
}
.pager {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
}
.panel {
  border: 1px solid #eee;
  padding: 12px;
  border-radius: 8px;
  position: sticky;
  top: 16px;
  background: #fff;
}
.panel-h {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.panel .kv {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
  padding: 4px 0;
}
.small th,
.small td {
  padding: 6px;
}
.x {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
}
.err {
  color: #c00;
}
@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
