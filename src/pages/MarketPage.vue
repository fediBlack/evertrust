<template>
  <section style="padding: 16px">
    <h2>Marché {{ waypoint }}</h2>

    <p v-if="error" style="color: #c00">{{ error }}</p>
    <p v-else-if="loading">Chargement…</p>

    <div v-else-if="market">
      <div style="margin-bottom: 16px">
        <strong>Exports:</strong>
        <span v-for="e in market.exports" :key="e.symbol">{{ e.name || e.symbol }}</span>
      </div>
      <div style="margin-bottom: 16px">
        <strong>Imports:</strong>
        <span v-for="e in market.imports" :key="e.symbol">{{ e.name || e.symbol }}</span>
      </div>

      <h3>Trade Goods</h3>
      <table style="width: 100%; border-collapse: collapse">
        <thead>
          <tr>
            <th>Good</th>
            <th>Volume</th>
            <th>Supply</th>
            <th>Purchase Price</th>
            <th>Sell Price</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in market.tradeGoods" :key="g.symbol">
            <td>{{ g.symbol }}</td>
            <td>{{ g.tradeVolume }}</td>
            <td>{{ g.supply }}</td>
            <td>{{ g.purchasePrice }}</td>
            <td>{{ g.sellPrice }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMarketStore } from '@/stores/market.store'

const route = useRoute()
const system = route.params.system as string
const waypoint = route.params.waypoint as string

const store = useMarketStore()
const loading = computed(() => store.loading)
const error = computed(() => store.error)
const market = computed(() => store.data)

onMounted(() => store.fetch(system, waypoint))
</script>
