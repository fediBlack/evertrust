<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed } from 'vue'
import { useEventsStore } from '@/stores/events.store'

const store = useEventsStore()
const events = computed(() => store.events)
const connected = computed(() => store.connected)

onMounted(() => {
  console.log('[EventsPage] mounted → start()')
  store.start()
  store.markAllRead()
})

onBeforeUnmount(() => {
  console.log('[EventsPage] beforeUnmount → stop()')
  store.stop()
})

function pretty(ev: any) {
  return JSON.stringify(ev, null, 2)
}
</script>

<template>
  <section style="padding: 16px">
    <h2>Événements (polling)</h2>
    <p v-if="!connected">Connexion…</p>
    <ul>
      <li v-for="e in events" :key="e.ts + e.type">
        <strong>{{ e.type }}</strong>
        <pre>{{ pretty(e.data) }}</pre>
      </li>
    </ul>
  </section>
</template>
