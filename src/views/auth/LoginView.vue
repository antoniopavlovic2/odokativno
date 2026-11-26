
<template>
  <AuthLayout
    title="Dobro nam došao!"
    subtitle="Prijavi se i nastavi tamo gdje si stao."
  >
    <v-form @submit.prevent="submitLogin">

      <v-text-field
        v-model.trim="email"
        label="E-mail adresa"
        type="email"
        name="email"
        autocomplete="email"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
        :rules="[rules.required, rules.email]"
        class="mb-2"
      />

      <v-text-field
        v-model="password"
        label="Lozinka"
        name="password"
        autocomplete="current-password"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-outline"
        variant="outlined"
        :rules="[rules.required]"
      >
        <template #append-inner>
          <v-btn
            :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            :aria-label="showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'"
            variant="text"
            size="small"
            @click="showPassword = !showPassword"
          />
        </template>
      </v-text-field>

      <div class="text-right mb-6">
        <router-link
          to="/zaboravljena-lozinka"
          class="auth-link text-caption"
        >
          Zaboravio si lozinku?
        </router-link>
      </div>

      <v-alert
        v-if="authStore.error"
        type="info"
        variant="tonal"
        class="mb-4"
      >
        {{ authStore.error }}
      </v-alert>

      <v-btn
        type="submit"
        color="primary"
        block
        height="52"
        elevation="0"
        class="font-weight-bold"
        :loading="authStore.loading"
      >
        PRIJAVI SE
      </v-btn>

    </v-form>

    <template #bottom>
      Nemaš račun?

      <router-link to="/registracija" class="auth-link">
        Registriraj se
      </router-link>
    </template>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import { useAuthStore } from '@/stores/authStore'
import { rules } from '@/utils/validation'

const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

authStore.clearError()

async function submitLogin(event) {
  const { valid } = await event

  if (!valid) return

  await authStore.login(email.value, password.value)
}
</script>
