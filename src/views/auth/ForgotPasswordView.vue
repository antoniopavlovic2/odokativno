
<template>
  <AuthLayout
    title="Zaboravio si lozinku?"
    subtitle="Nema veze. Pomoći ćemo ti da ponovno pristupiš svom računu."
  >
    <v-form @submit.prevent="submitRequest">

      <p class="text-body-2 mb-6">
        Unesi e-mail adresu povezanu sa svojim računom
        kako bi zatražio poveznicu za postavljanje nove lozinke.
      </p>

      <v-text-field
        v-model.trim="email"
        label="E-mail adresa"
        type="email"
        name="email"
        autocomplete="email"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
        :rules="[rules.required, rules.email]"
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
        POŠALJI POVEZNICU
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
const email = ref('')

authStore.clearError()

async function submitRequest(event) {
  const { valid } = await event

  if (!valid) return

  await authStore.forgotPassword(email.value)
}
</script>
