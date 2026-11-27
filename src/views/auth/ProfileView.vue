
<template>
  <AuthLayout
    title="Moj profil"
    subtitle="Tvoje mjesto za rezultate i statistiku."
  >
    <!-- UČITAVANJE -->

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

    <!-- PRIJAVLJENI KORISNIK -->

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

      <v-btn
        v-if="loadFailed"
        block
        variant="outlined"
        class="mb-4"
        @click="loadProfile"
      >
        Pokušaj ponovno
      </v-btn>

      <!-- KREIRANJE PROFILA -->

      <template v-else-if="!profile">
        <h2 class="mb-3">
          Odaberi korisničko ime
        </h2>

        <p class="text-body-2 mb-5">
          Ovo će ime biti prikazano na rang-listi.
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

      <!-- KORISNIČKI PODACI -->

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
          class="font-weight-bold mb-3 action-button"
          prepend-icon="mdi-play-circle-outline"
        >
          ZAIGRAJ
        </v-btn>
      </template>

      <!-- ODJAVA -->

      <v-btn
        block
        variant="outlined"
        color="secondary"
        height="48"
        prepend-icon="mdi-logout"
        class="mt-3 action-button"
        :loading="authStore.loading"
        :disabled="saving"
        @click="logout"
      >
        Odjavi se
      </v-btn>

      <!-- UPRAVLJANJE RAČUNOM -->

      <section class="account-section">
        <h3 class="section-title">
          UPRAVLJANJE RAČUNOM
        </h3>

        <router-link
          to="/politika-privatnosti"
          class="settings-link"
        >
          <v-icon
            icon="mdi-shield-check-outline"
            size="22"
            class="settings-icon"
          />

          <span>Politika privatnosti</span>

          <v-icon
            icon="mdi-chevron-right"
            size="20"
            class="chevron-icon"
          />
        </router-link>

        <router-link
          to="/uvjeti-koristenja"
          class="settings-link"
        >
          <v-icon
            icon="mdi-file-document-outline"
            size="22"
            class="settings-icon"
          />

          <span>Uvjeti korištenja</span>

          <v-icon
            icon="mdi-chevron-right"
            size="20"
            class="chevron-icon"
          />
        </router-link>
      </section>

      <!-- BRISANJE RAČUNA -->

      <section class="danger-section">
        <div class="danger-heading">
          <v-icon
            icon="mdi-trash-can-outline"
            size="22"
          />

          <h3>Brisanje korisničkog računa</h3>
        </div>

        <p>
          Trajno ukloni svoj korisnički račun
          i povezane podatke.
          Ovu radnju nije moguće poništiti.
        </p>

        <v-btn
          block
          color="error"
          variant="outlined"
          height="48"
          prepend-icon="mdi-trash-can-outline"
          class="delete-button"
          to="/brisanje-racuna"
          :disabled="saving || authStore.loading"
        >
          Obriši račun
        </v-btn>
      </section>
    </template>

    <!-- NEPRIJAVLJENI KORISNIK -->

    <template v-else>
      <div class="text-center">
        <v-icon
          icon="mdi-account-lock-outline"
          size="48"
          class="mb-4"
        />

        <p class="mb-5">
          Za pristup profilu potrebno je
          prijaviti se.
        </p>

        <v-btn
          block
          color="primary"
          height="48"
          :to="authStore.isRecovery
            ? '/nova-lozinka'
            : '/prijava'"
        >
          NASTAVI
        </v-btn>
      </div>
    </template>
  </AuthLayout>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onUnmounted,
} from 'vue'

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

// ==========================
// DATUM REGISTRACIJE
// ==========================

const memberSince = computed(() => {
  const createdAt =
    authStore.user?.created_at ||
    profile.value?.created_at

  if (!createdAt) return ''

  return new Intl.DateTimeFormat('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Zagreb',
  }).format(new Date(createdAt))
})

// ==========================
// UČITAVANJE PROFILA
// ==========================

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

    router.replace({
      name: 'reset-password',
    })

    return
  }

  if (!authStore.isAuthenticated) {
    loading.value = false

    router.replace({
      name: 'login',
    })

    return
  }

  const userId = authStore.userId

  username.value = authStore.username || ''

  try {
    if (!supabase) {
      throw new Error(
        'Supabase nije konfiguriran.'
      )
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

// ==========================
// KREIRANJE PROFILA
// ==========================

async function createProfile(event) {
  const { valid } = await event

  if (
    !valid ||
    saving.value ||
    !supabase ||
    !authStore.userId ||
    authStore.isRecovery ||
    authStore.loading
  ) {
    return
  }

  const userId = authStore.userId
  const currentRequest = ++requestId

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

    if (
      authStore.userId !== userId ||
      currentRequest !== requestId
    ) {
      return
    }

    if (error) throw error

    profile.value = data

  } catch (error) {
    if (
      authStore.userId !== userId ||
      currentRequest !== requestId
    ) {
      return
    }

    if (error.code === '23505') {
      const attemptedUsername = username.value

      await loadProfile()

      if (
        authStore.userId === userId &&
        !profile.value &&
        !loadFailed.value
      ) {
        username.value = attemptedUsername

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

// ==========================
// ODJAVA
// ==========================

async function logout() {
  if (loggingOut.value || saving.value) {
    return
  }

  loggingOut.value = true
  errorMessage.value = ''

  const success = await authStore.logout()

  if (success) {
    requestId += 1
    profile.value = null

    router.replace({
      name: 'home',
    })

  } else {
    loggingOut.value = false

    errorMessage.value =
      authStore.errorMessage ||
      'Odjava nije uspjela.'
  }
}

// ==========================
// PRAĆENJE AUTENTIFIKACIJE
// ==========================

watch(
  [
    () => authStore.initialized,
    () => authStore.userId,
    () => authStore.isRecovery,
  ],
  () => {
    if (!loggingOut.value) {
      loadProfile()
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  requestId += 1
})
</script>

<style scoped>
/* KORISNIČKI PROFIL */

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
  letter-spacing: -0.5px;
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

.profile-info strong {
  text-align: right;
}

.action-button {
  border-radius: 12px;
}

/* UPRAVLJANJE RAČUNOM */

.account-section {
  margin-top: 28px;
  padding-top: 24px;

  border-top: 1px solid #dedcd3;
}

.section-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;

  color: #64635d;
  margin-bottom: 12px;
}

.settings-link {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 15px 8px;

  font-size: 14px;
  font-weight: 500;

  color: #181818;
  text-decoration: none;

  border-bottom: 1px solid #dedcd3;

  transition: background 0.2s ease;
}

.settings-link:hover {
  background: #f8f6ed;
}

.settings-icon {
  color: #64635d;
  flex-shrink: 0;
}

.chevron-icon {
  margin-left: auto;
  color: #64635d;
}

/* BRISANJE RAČUNA */

.danger-section {
  margin-top: 24px;
  padding: 18px;

  background: #fff5f5;

  border: 1px solid #fecaca;
  border-radius: 14px;
}

.danger-heading {
  display: flex;
  align-items: center;
  gap: 8px;

  color: #b91c1c;

  margin-bottom: 10px;
}

.danger-heading h3 {
  font-size: 14px;
  font-weight: 700;
}

.danger-section p {
  font-size: 12px;
  line-height: 1.7;

  color: #64635d;

  margin-bottom: 16px;
}

.delete-button {
  border-radius: 10px;

  font-size: 13px;
  font-weight: 600;

  text-transform: none;
  letter-spacing: 0;
}

/* MOBITEL */

@media (max-width: 599px) {
  .profile-avatar {
    width: 72px;
    height: 72px;
  }

  .profile-heading h2 {
    font-size: 22px;
  }

  .profile-info {
    font-size: 13px;
  }

  .danger-section {
    padding: 14px;
  }

  .danger-heading h3 {
    font-size: 13px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .settings-link {
    transition: none;
  }
}
</style>
