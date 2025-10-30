<template>
  <section style="padding: 16px">
    <h2>Agent</h2>
    <p v-if="error" style="color: #c00">{{ error }}</p>
    <p v-else-if="loading">Chargement…</p>

    <div v-else-if="agent">
      <div style="border: 1px solid #eee; padding: 12px; border-radius: 8px">
        <div><strong>Symbol:</strong> {{ agent.symbol }}</div>
        <div><strong>Headquarters:</strong> {{ agent.headquarters }}</div>
        <div><strong>Credits:</strong> {{ agent.credits }}</div>
        <div><strong>Starting Faction:</strong> {{ agent.startingFaction }}</div>
      </div>
    </div>

    <p v-else>Pas de données agent.</p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAgentStore } from '@/stores/agent.store'

const store = useAgentStore()
const loading = computed(() => store.loading)
const error = computed(() => store.error)
const agent = computed(() => store.data)

onMounted(() => store.fetch())
</script>
