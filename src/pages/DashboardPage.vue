<template>
  <section style="padding: 24px">
    <h1 style="font-size: 1.5rem; font-weight: bold">Dashboard</h1>
    <p>Bienvenue dans la zone protégée. Sélectionne une section :</p>

    <nav style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px; width: 200px">
      <RouterLink to="/agent">👤 Agent</RouterLink>
      <RouterLink to="/systems">🌌 Systèmes stellaires</RouterLink>
      <RouterLink to="/ships">🚀 Flotte</RouterLink>
    </nav>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
