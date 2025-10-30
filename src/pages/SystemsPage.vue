<template>
  <section style="padding: 16px">
    <h2>Star Systems</h2>

    <p v-if="error" style="color: #c00">{{ error }}</p>
    <p v-else-if="loading">Chargement…</p>

    <table v-else style="width: 100%; border-collapse: collapse">
      <thead>
        <tr>
          <th style="text-align: left; border-bottom: 1px solid #eee; padding: 8px">Symbol</th>
          <th style="text-align: left; border-bottom: 1px solid #eee; padding: 8px">Type</th>
          <th style="text-align: right; border-bottom: 1px solid #eee; padding: 8px">X</th>
          <th style="text-align: right; border-bottom: 1px solid #eee; padding: 8px">Y</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in systems" :key="s.symbol" @click="go(s.symbol)" style="cursor: pointer">
          <td style="padding: 8px">{{ s.symbol }}</td>
          <td style="padding: 8px">{{ s.type }}</td>
          <td style="padding: 8px; text-align: right">{{ s.x }}</td>
          <td style="padding: 8px; text-align: right">{{ s.y }}</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 12px; display: flex; gap: 8px; align-items: center">
      <button :disabled="page <= 1 || loading" @click="prev">Précédent</button>
      <span>Page {{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages || loading" @click="next">Suivant</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSystemsStore } from '@/stores/systems.store'

const router = useRouter()
const store = useSystemsStore()

const loading = computed(() => store.loading)
const error = computed(() => store.error)
const systems = computed(() => store.list)
const page = computed(() => store.meta.page)
const totalPages = computed(() => Math.max(1, Math.ceil(store.meta.total / store.meta.limit)))

function go(symbol: string) {
  router.push({ name: 'system', params: { symbol } })
}
function prev() {
  store.fetch(page.value - 1)
}
function next() {
  store.fetch(page.value + 1)
}

onMounted(() => store.fetch(1))
</script>
