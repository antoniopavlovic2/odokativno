
<template>
  <AuthLayout
    :title="completed ? 'Lozinka je promijenjena!' : 'Novi početak.'"
    :subtitle="
      completed
        ? 'Tvoj račun ponovno je spreman za igru.'
        : 'Postavi novu lozinku za svoj Odokativno račun.'
    "
  >
    <!-- Uspješno promijenjena lozinka -->
    <div v-if="completed" class="text-center">
      <div class="status-icon success-icon">
        <v-icon
          icon="mdi-check-circle-outline"
          size="44"
        />
      </div>

      <h2 class="mb-4">
        Uspješno!
      </h2>

      <p class="text-body-2 mb-6">
        Tvoja nova lozinka je spremljena.
        Možeš nastaviti s igranjem.
      </p>

      <v-btn
        block
        color="primary"
        height="52"
        elevation="0"
        class="font-weight-bold"
        :to="authStore.isAuthenticated ? '/profil' : '/prijava'"
      >
        NASTAVI
      </v-btn>
    </div>

    <!-- Učitavanje autentifikacije -->
    <div
      v-else-if="!authStore.initialized"
      class="text-center py-8"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="42"
      />

      <p class="mt-4">
        Učitavanje...
      </p>
    </div>

    <!-- Nevažeća poveznica -->
    <div
      v-else-if="!canResetPassword"
      class="text-center"
    >
      <div class="status-icon warning-icon">
        <v-icon
          icon="mdi-link-off"
          size="42"
        />
      </div>

      <h2 class="mb-4">
        Poveznica nije valjana
      </h2>

      <p class="text-body-2 mb-6">
        Poveznica za obnovu lozinke nedostaje,
        istekla je ili je već iskorištena.
        Zatraži novu poveznicu.
      </p>

      <v-btn
        block
        color="primary"
        height="52"
        elevation="0"
        class="font-weight-bold"
        to="/zaboravljena-lozinka"
      >
        ZATRAŽI NOVU POVEZNICU
      </v-btn>
    </div>

    <!-- Obrazac za novu lozinku -->
    <v-form
      v-else
      @submit.prevent="submitReset"
    >
      <v-text-field
        v-model="password"
        label="Nova lozinka"
        name="password"
        autocomplete="new-password"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-outline"
        variant="outlined"
        :rules="[rules.required, rules.password]"
        :disabled="loading"
        class="mb-3"
      >
        <template #append-inner>
          <v-btn
            :icon="
              showPassword
                ? 'mdi-eye-off'
                : 'mdi-eye'
            "
            :aria-label="
              showPassword
                ? 'Sakrij lozinku'
                : 'Prikaži lozinku'
            "
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
        :disabled="loading"
        :rules="[
          rules.required,
          value =>
            value === password ||
            'Lozinke se ne podudaraju.'
        ]"
        class="mb-3"
      />

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ errorMessage }}
      </v-alert>

      <v-btn
        type="submit"
        block
        color="primary"
        height="52"
        elevation="0"
        class="font-weight-bold"
        :loading="loading"
        :disabled="loading"
      >
        SPREMI NOVU LOZINKU
      </v-btn>

      <div class="text-center mt-5">
        <router-link
          to="/zaboravljena-lozinka"
          class="auth-link text-caption"
        >
          Zatraži novu poveznicu
        </router-link>
      </div>
    </v-form>

    <template #bottom>
      <router-link
        to="/prijava"
        class="auth-link"
      >
        Povratak na prijavu
      </router-link>
    </template>
  </AuthLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AuthLayout from '@/components/layout/AuthLayout.vue'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/services/supabase'
import { rules } from '@/utils/validation'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

const loading = ref(false)
const completed = ref(false)
const tokenRejected = ref(false)
const errorMessage = ref('')

authStore.clearError()

// Dohvaćanje jednokratnog tokena iz URL-a.
const recoveryToken = computed(() => {
  const hash = route.hash.replace(/^#/, '')

  const params = new URLSearchParams(hash)

  return params.get('recovery_token')
})

// Podržavamo nove poveznice i postojeće
// valjane Supabase recovery sesije.
const canResetPassword = computed(() => {
  if (tokenRejected.value) return false

  return Boolean(
    recoveryToken.value ||
    (
      authStore.isAuthenticated &&
      authStore.isRecovery
    )
  )
})

async function submitReset(event) {
  const { valid } = await event

  if (
    !valid ||
    loading.value ||
    !canResetPassword.value
  ) {
    return
  }

  if (!supabase) {
    errorMessage.value =
      'Obnova lozinke trenutno nije dostupna.'

    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    // Provjera jednokratnog recovery tokena.
    if (recoveryToken.value) {
      const { data, error } =
        await supabase.auth.verifyOtp({
          token_hash: recoveryToken.value,
          type: 'recovery',
        })

      if (error) {
        if (
          error.code === 'otp_expired' ||
          error.status === 403
        ) {
          tokenRejected.value = true
        }

        throw error
      }

      if (!data.session) {
        throw new Error(
          'Recovery sesija nije dostupna.'
        )
      }

      // Token je uspješno potvrđen.
      authStore.setSession(data.session)
      authStore.isRecovery = true

      // Uklanjamo iskorišteni token iz URL-a.
      await router.replace({
        name: 'reset-password',
        query: {},
        hash: '',
      })
    }

    // Provjera valjane recovery sesije.
    if (
      !authStore.isAuthenticated ||
      !authStore.isRecovery
    ) {
      tokenRejected.value = true
      return
    }

    // Spremanje nove lozinke.
    const success = await authStore.resetPassword(
      password.value
    )

    if (!success) {
      errorMessage.value =
        authStore.errorMessage ||
        'Lozinka nije promijenjena. Pokušaj ponovno.'

      return
    }

    // Lozinke više ne držimo u obrascu.
    password.value = ''
    confirmPassword.value = ''

    completed.value = true

  } catch (error) {
    errorMessage.value =
      'Obnova lozinke nije uspjela. Pokušaj ponovno ili zatraži novu poveznicu.'

  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.status-icon {
  width: 84px;
  height: 84px;
  border: 2px solid #181818;
  border-radius: 50%;
  margin: 0 auto 24px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  background: #dcfce7;
  color: #15803d;
  border-color: #15803d;
}

.warning-icon {
  background: #fef3c7;
  color: #b45309;
  border-color: #b45309;
}
</style>
