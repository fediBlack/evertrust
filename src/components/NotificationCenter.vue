<template>
  <div class="nc">
    <!-- Bouton cloche avec badge -->
    <button class="btn" @click="toggle" aria-label="Notifications">
      🔔
      <span v-if="unread > 0" class="badge">{{ unread }}</span>
    </button>

    <!-- Menu déroulant -->
    <div v-if="open" class="panel" @keydown.esc="close" tabindex="0">
      <header class="hdr">
        <strong>Notifications</strong>
        <button class="link" @click="markAll">Marquer tout comme lu</button>
      </header>

      <ul class="list" v-if="latest.length">
        <li v-for="e in latest" :key="e.ts" class="item" @click="read(e.ts)">
          <div class="row">
            <span class="type">{{ e.type }}</span>
            <time class="ts">{{ fmt(e.ts) }}</time>
          </div>
          <pre class="payload">{{ pretty(e.data) }}</pre>
        </li>
      </ul>
      <p v-else class="empty">Aucune notification</p>
    </div>

    <!-- Toast minimal -->
    <transition name="toast">
      <div v-if="toast" class="toast">
        <strong>{{ toast.type }}</strong>
        <pre>{{ pretty(toast.data) }}</pre>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useEventsStore } from '@/stores/events.store'

const store = useEventsStore()
const unread = computed(() => store.unreadCount)
const latest = computed(() => store.latest)

const open = ref(false)
function toggle() {
  open.value = !open.value
}
function close() {
  open.value = false
}
function markAll() {
  store.markAllRead()
  close()
}
function read(ts: number) {
  store.markTsRead(ts)
}

function fmt(ts: number) {
  return new Date(ts).toLocaleTimeString()
}
function pretty(d: any) {
  try {
    return JSON.stringify(d, null, 2)
  } catch {
    return String(d)
  }
}

// Petit toast : montre le tout dernier event non lu pendant 3s
const toast = ref<{ type: string; data: any } | null>(null)
let toastTimer: number | undefined

watch(
  () => store.events[0]?.ts,
  (ts) => {
    if (!ts) return
    // si c'est "nouveau" (non lu), on toaste
    if (ts > store.lastSeenTs) {
      toast.value = { type: store.events[0].type, data: store.events[0].data }
      clearTimeout(toastTimer)
      toastTimer = window.setTimeout(() => (toast.value = null), 3000)
    }
  },
)

// Démarre/stop le polling si pas global
onMounted(() => {
  if (!store.connected) store.start()
})
onBeforeUnmount(() => {
  /* on peut laisser tourner globalement */
})
</script>

<style scoped>
.nc {
  position: relative;
  display: inline-block;
}
.btn {
  position: relative;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  padding: 6px 8px;
  color: #e5e7eb;
}
.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: #fff;
  border-radius: 999px;
  padding: 0 6px;
  font-size: 11px;
  transform: translate(25%, -25%);
}
.panel {
  position: absolute;
  left: 0;
  margin-top: 6px;
  width: 360px;
  max-height: 60vh;
  overflow: auto;
  background: #0f172a;
  color: #e5e7eb;
  border: 1px solid #1f2937;
  border-radius: 10px;
  padding: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}
.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 6px 8px;
}
.link {
  background: transparent;
  border: none;
  color: #60a5fa;
  cursor: pointer;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.item {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #1f2937;
  margin-bottom: 8px;
  background: #0b1222;
}
.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.type {
  font-weight: 600;
}
.ts {
  opacity: 0.7;
  font-size: 12px;
}
.payload {
  margin: 0;
  white-space: pre-wrap;
  font-size: 12px;
}
.empty {
  opacity: 0.7;
  padding: 12px;
  text-align: center;
}

.toast {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 320px;
  z-index: 1000;
  background: #111827;
  color: white;
  border-radius: 10px;
  padding: 10px 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
