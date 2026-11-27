
<template>
  <AuthLayout
    title="Moj profil"
    subtitle="Tvoje mjesto za rezultate i statistiku."
  >
    <!-- Učitavanje -->
    <div
      v-if="!authStore.initialized || loading"
      class="text-center py-8"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="42"
      />

      <p class="mt-4">
        Učitavanje profila...
      </p>
    </div>

    <!-- Prijavljeni korisnik -->
    <template
      v-else-if="
        authStore.isAuthenticated &&
        !authStore.isRecovery
      "
    >
      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ errorMessage }}
      </v-alert>

      <!-- Greška učitavanja -->
      <v-btn
        v-if="loadFailed"
        block
        variant="outlined"
        class="mb-4"
        @click="loadProfile"
      >
        Pokušaj ponovno
      </v-btn>

      <!-- Kreiranje profila -->
      <template v-else-if="!profile">
        <h2 class="mb-3">
          Odaberi korisničko ime
        </h2>

        <p class="text-body-2 mb-5">
          Ovo će ime biti prikazano na
          budućoj rang-listi.
          Mora biti jedinstveno.
        </p>

        <v-form @submit.prevent="createProfile">
          <v-text-field
            v-model.trim="username"
            label="Korisničko ime"
            prepend-inner-icon="mdi-account-outline"
            autocomplete="username"
            variant="outlined"
            :rules="[rules.required, rules.username]"
            :disabled="saving"
          />

          <v-btn
            type="submit"
            block
            color="primary"
            height="52"
            elevation="0"
            class="font-weight-bold"
            :loading="saving"
            :disabled="authStore.loading"
          >
            SPREMI PROFIL
          </v-btn>
        </v-form>
      </template>

      <!-- Postojeći profil -->
      <template v-else>
        <div class="profile-heading">
          <div class="profile-avatar">
            <v-icon
              icon="mdi-account-outline"
              size="42"
            />
          </div>

          <h2>{{ profile.username }}</h2>

          <p class="profile-email">
            {{ authStore.email }}
          </p>

          <div
            v-if="authStore.user?.email_confirmed_at"
            class="verified-label"
          >
            <v-icon
              icon="mdi-check-circle"
              size="17"
            />
            E-mail potvrđen
          </div>
        </div>

        <v-divider class="my-5" />

        <div class="profile-info">
          <span>Član od</span>
          <strong>{{ memberSince }}</strong>
        </div>

        <v-divider class="my-5" />

        <v-btn
          block
          color="primary"
          height="52"
          elevation="0"
          to="/igra"
          class="font-weight-bold mb-3"
          prepend-icon="mdi-play-circle-outline"
        >
          ZAIGRAJ
        </v-btn>
      </template>

      <v-btn
        block
        variant="outlined"
        color="secondary"
        height="48"
        prepend-icon="mdi-logout"
        class="mt-3"
        :loading="authStore.loading"
        :disabled="saving"
        @click="logout"
      >
        Odjavi se
      </v-btn>
    </template>

    <!-- Gost -->
    <template v-else>
      <p class="mb-4">
        Za pristup profilu potrebno je
        prijaviti se.
      </p>

      <v-btn
        block
        color="primary"
        to="/prijava"
      >
        PRIJAVI SE
      </v-btn>
    </template>
  </AuthLayout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

import AuthLayout from '@/components/layout/AuthLayout.vue'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/services/supabase'
import { rules } from '@/utils/validation'

const router = useRouter()
const authStore = useAuthStore()

const profile = ref(null)
const username = ref('')
const loading = ref(true)
const saving = ref(false)
const loggingOut = ref(false)
const loadFailed = ref(false)
const errorMessage = ref('')

let requestId = 0

const memberSince = computed(() => {
  if (!profile.value?.created_at) return ''

  return new Intl.DateTimeFormat('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(profile.value.created_at))
})

async function loadProfile() {
  const currentRequest = ++requestId

  profile.value = null
  errorMessage.value = ''
  loadFailed.value = false
  loading.value = true

  if (!authStore.initialized) return

  if (loggingOut.value) return

  if (authStore.isRecovery) {
    loading.value = false
    router.replace({ name: 'reset-password' })
    return
  }

  if (!authStore.isAuthenticated) {
    loading.value = false
    router.replace({ name: 'login' })
    return
  }

  const userId = authStore.userId

  username.value = authStore.username || ''

  try {
    if (!supabase) {
      throw new Error('Supabase nije konfiguriran.')
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, created_at')
      .eq('id', userId)
      .maybeSingle()

    if (currentRequest !== requestId) return

    if (error) throw error

    profile.value = data
  } catch (error) {
    if (currentRequest !== requestId) return

    console.warn('[PROFILE]', error.message)

    loadFailed.value = true
    errorMessage.value =
      'Profil trenutno nije moguće učitati.'
  } finally {
    if (currentRequest === requestId) {
      loading.value = false
    }
  }
}

async function createProfile(event) {
  const { valid } = await event

  if (
    !valid ||
    saving.value ||
    !supabase ||
    !authStore.userId ||
    authStore.isRecovery
  ) {
    return
  }

  const userId = authStore.userId

  saving.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: username.value.trim(),
      })
      .select('id, username, created_at')
      .single()

    if (authStore.userId !== userId) return

    if (error) throw error

    profile.value = data
  } catch (error) {
    if (authStore.userId !== userId) return

    if (error.code === '23505') {
      // Provjeri je li profil već kreiran
      // u drugoj kartici preglednika.
      await loadProfile()

      if (!profile.value && !loadFailed.value) {
        errorMessage.value =
          'Korisničko ime je zauzeto. Odaberi drugo.'
      }
    } else {
      console.warn('[PROFILE]', error.message)

      errorMessage.value =
        'Profil nije spremljen. Pokušaj ponovno.'
    }
  } finally {
    saving.value = false
  }
}

async function logout() {
  if (loggingOut.value || saving.value) return

  loggingOut.value = true
  errorMessage.value = ''

  const success = await authStore.logout()

  if (success) {
    profile.value = null
    router.replace({ name: 'home' })
  } else {
    loggingOut.value = false

    errorMessage.value =
      authStore.errorMessage ||
      'Odjava nije uspjela.'
  }
}

watch(
  [
    () => authStore.initialized,
    () => authStore.userId,
    () => authStore.isRecovery,
  ],
  () => {
    if (!loggingOut.value) loadProfile()
  },
  { immediate: true }
)
</script>

<style scoped>
.profile-heading {
  text-align: center;
}

.profile-avatar {
  width: 84px;
  height: 84px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #facc15;
  border: 2px solid #181818;
  border-radius: 50%;
}

.profile-heading h2 {
  font-size: 24px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.profile-email {
  font-size: 14px;
  color: #64635d;
  margin-top: 6px;
  overflow-wrap: anywhere;
}

.verified-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #15803d;
  font-size: 12px;
  font-weight: 600;
  margin-top: 12px;
}

.profile-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
}

.profile-info span {
  color: #64635d;
}
</style>
