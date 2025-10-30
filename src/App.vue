<template>
  <div class="layout">
    <aside class="sidebar">
      <h2>Space UI</h2>

      <div style="margin: 8px 0 16px">
        <NotificationCenter />
      </div>
      <nav>
        <RouterLink to="/">🏠 Dashboard</RouterLink>
        <RouterLink to="/agent">👤 Agent</RouterLink>
        <RouterLink to="/systems">🌌 Systèmes</RouterLink>
        <RouterLink to="/ships">🚀 Flotte</RouterLink
        ><RouterLink to="/events">📡 Événements</RouterLink>
      </nav>
    </aside>
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import NotificationCenter from '@/components/NotificationCenter.vue'
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
}
.sidebar {
  background: #111827;
  color: #fff;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sidebar h2 {
  margin: 0 0 8px;
  font-size: 18px;
}
.sidebar a {
  color: #e5e7eb;
  text-decoration: none;
  padding: 6px 0;
  display: block;
}
.sidebar a.router-link-active {
  color: #3b82f6;
  font-weight: 600;
}
.content {
  padding: 24px;
}
</style>
