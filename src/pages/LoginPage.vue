<template>
  <section style="max-width:420px;margin:64px auto">
    <h1>Sign in</h1>
    <p>Colle ton token SpaceTraders pour continuer.</p>
    <form @submit.prevent="onSubmit">
      <input v-model="token" placeholder="Token" style="width:100%;padding:8px" />
      <button :disabled="!token" style="margin-top:12px">Continuer</button>
    </form>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const token = ref('')
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

function onSubmit() {
  auth.setToken(token.value)
  const redirect = (route.query.redirect as string) || '/'
  router.push(redirect)
}
</script>
