
<template>
  <AuthLayout
    title="Imaš dobro oko?"
    subtitle="Kreiraj račun i pokaži koliko dobro procjenjuješ."
  >
    <v-form @submit.prevent="submitRegister">

      <v-text-field
        v-model.trim="username"
        label="Korisničko ime"
        name="username"
        autocomplete="username"
        prepend-inner-icon="mdi-account-outline"
        variant="outlined"
        :rules="[rules.required, rules.username]"
        hint="Ime koje će biti prikazano na rang-listi."
        class="mb-2"
      />

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
        label="Ponovi lozinku"
        name="confirmPassword"
        autocomplete="new-password"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-check-outline"
        variant="outlined"
        :rules="[
          rules.required,
          value => value === password || 'Lozinke se ne podudaraju.'
        ]"
        class="mb-2"
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
        KREIRAJ RAČUN
      </v-btn>

    </v-form>

    <template #bottom>
      Već imaš račun?

      <router-link to="/prijava" class="auth-link">
        Prijavi se
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

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

authStore.clearError()

async function submitRegister(event) {
  const { valid } = await event

  if (!valid) return

  await authStore.register(
    username.value,
    email.value,
    password.value
  )
}
</script>
