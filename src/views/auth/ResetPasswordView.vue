
<template>
  <AuthLayout
    title="Novi početak."
    subtitle="Postavi novu lozinku za svoj Odokativno račun."
  >
    <v-form @submit.prevent="submitReset">

      <v-text-field
        v-model="password"
        label="Nova lozinka"
        name="password"
        autocomplete="new-password"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-outline"
        variant="outlined"
        :rules="[rules.required, rules.password]"
        class="mb-2"
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

      <v-text-field
        v-model="confirmPassword"
        label="Ponovi novu lozinku"
        name="confirmPassword"
        autocomplete="new-password"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-check-outline"
        variant="outlined"
        :rules="[
          rules.required,
          value => value === password || 'Lozinke se ne podudaraju.'
        ]"
        class="mb-3"
      />

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
        SPREMI NOVU LOZINKU
      </v-btn>

    </v-form>

    <template #bottom>
      <router-link to="/prijava" class="auth-link">
        Povratak na prijavu
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

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

authStore.clearError()

async function submitReset(event) {
  const { valid } = await event

  if (!valid) return

  await authStore.resetPassword(password.value)
}
</script>
