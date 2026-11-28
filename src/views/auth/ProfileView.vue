
<template>
  <v-container class="profile-page">

    <!-- ZAGLAVLJE STRANICE -->

    <header class="page-heading">
      <div>
        <div class="eyebrow">
          ODOKATIVNO. / IGRAČ
        </div>

        <h1>Moj profil.</h1>

        <p>
          Tvoj napredak, nagrade i kolekcija.
        </p>
      </div>

      <v-btn
        v-if="canAccess"
        variant="outlined"
        prepend-icon="mdi-cog-outline"
        class="settings-button"
        @click="settingsDialog = true"
      >
        Postavke
      </v-btn>
    </header>

    <!-- UČITAVANJE -->

    <div
      v-if="!authStore.initialized || loading || loggingOut"
      class="loading-state"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="42"
      />

      <p>Učitavanje profila...</p>
    </div>

    <!-- NEPRIJAVLJENI KORISNIK -->

    <div
      v-else-if="!canAccess"
      class="access-card"
    >
      <v-icon size="52">
        mdi-account-lock-outline
      </v-icon>

      <h2>Prijavi se za pristup profilu.</h2>

      <v-btn
        color="primary"
        elevation="0"
        height="48"
        :to="{
          name: authStore.isRecovery
            ? 'reset-password'
            : 'login'
        }"
      >
        Nastavi
      </v-btn>
    </div>

    <!-- PRIJAVLJENI KORISNIK -->

    <template v-else>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-5"
      >
        {{ errorMessage }}
      </v-alert>

      <v-btn
        v-if="loadFailed"
        variant="outlined"
        @click="loadProfile"
      >
        Pokušaj ponovno
      </v-btn>

      <!-- KREIRANJE PROFILA -->

      <section
        v-else-if="!profile"
        class="create-profile-card"
      >
        <div class="create-avatar">
          <v-icon size="42">
            mdi-account-outline
          </v-icon>
        </div>

        <h2>Odaberi korisničko ime.</h2>

        <p>
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
            block
            type="submit"
            color="primary"
            elevation="0"
            height="52"
            :loading="saving"
            :disabled="authStore.loading"
            class="action-button"
          >
            Spremi profil
          </v-btn>

        </v-form>
      </section>

      <!-- GLAVNI PROFIL -->

      <div v-else class="profile-grid">

        <!-- LIJEVI STUPAC -->

        <div class="main-column">

          <!-- BANNER I IDENTITET IGRAČA -->

          <section class="profile-hero">

            <div class="hero-banner">

              <div class="banner-brand">
                ODOKATIVNO.
              </div>

              <div
                class="banner-symbol"
                aria-hidden="true"
              >
                ?
              </div>

              <div class="player-identity">

                <div class="player-avatar">
                  {{ avatarInitial }}
                </div>

                <div class="player-info">

                  <h2>{{ profile.username }}</h2>

                  <p v-if="progressionStore.progress">
                    {{ playerTitle }}
                  </p>

                  <p v-else>
                    Igrač
                  </p>

                </div>

              </div>

            </div>

            <!-- LEVEL I XP -->

            <div class="progress-zone">

              <div
                v-if="
                  progressionStore.loading &&
                  !progressionStore.progress
                "
                class="progress-loading"
              >
                <v-progress-circular
                  indeterminate
                  color="#facc15"
                  size="22"
                  width="3"
                />

                <span>Učitavanje iskustva...</span>
              </div>

              <div
                v-else-if="progressionStore.errorMessage"
                class="progress-error"
              >
                <p>
                  {{ progressionStore.errorMessage }}
                </p>

                <v-btn
                  color="#facc15"
                  variant="outlined"
                  size="small"
                  @click="refreshProgress"
                >
                  Pokušaj ponovno
                </v-btn>
              </div>

              <XPProgressBar
                v-else-if="progressionStore.progress"
                :level="progressionStore.level"
                :xp="progressionStore.xpIntoLevel"
                :xp-required="progressionStore.xpRequired"
              />

              <p v-else class="progress-error">
                Napredak trenutačno nije dostupan.
              </p>

            </div>

          </section>

          <!-- XP I NOVČANIK -->

          <div class="reward-grid">

            <div class="reward-tile experience-tile">

              <div class="tile-icon">
                <v-icon size="28">
                  mdi-lightning-bolt
                </v-icon>
              </div>

              <strong>
                {{
                  progressionStore.progress
                    ? formatNumber(progressionStore.totalXp)
                    : '—'
                }}
                <small>XP</small>
              </strong>

              <span>Ukupno iskustvo</span>

            </div>

            <router-link
              :to="{ name: 'wallet' }"
              class="reward-tile wallet-tile"
            >

              <CoinIcon :size="34" />

              <strong>
                {{
                  walletStore.isReady
                    ? formatNumber(walletStore.balance)
                    : '—'
                }}
              </strong>

              <div class="wallet-caption">
                <span>Moj novčanik</span>

                <v-icon size="20">
                  mdi-chevron-right
                </v-icon>
              </div>

            </router-link>

          </div>

          <!-- ADMIN XP TOOLS -->

          <AdminXPTools />

          <!-- DNEVNI IZAZOV -->

          <v-btn
            block
            color="primary"
            height="54"
            elevation="0"
            prepend-icon="mdi-play-circle-outline"
            class="action-button"
            :to="{ name: 'game' }"
          >
            Dnevni izazov
          </v-btn>

        </div>

        <!-- DESNI STUPAC -->

        <aside class="side-column">

          <!-- STATISTIKA -->

          <section class="feature-card">

            <div class="feature-heading">

              <div class="feature-icon">
                <v-icon size="25">
                  mdi-chart-bar
                </v-icon>
              </div>

              <div>
                <h2>Moja statistika.</h2>
                <p>Tvoji rezultati na jednom mjestu.</p>
              </div>

            </div>

            <div class="statistics-grid">

              <div
                v-for="item in statistics"
                :key="item.label"
                class="statistic-tile"
              >

                <v-icon size="20">
                  {{ item.icon }}
                </v-icon>

                <strong>—</strong>

                <span>{{ item.label }}</span>

              </div>

            </div>

            <div class="coming-soon">
              Statistika stiže uskoro.
            </div>

          </section>

          <!-- KOLEKCIJA -->

          <section class="feature-card">

            <div class="feature-heading">

              <div class="feature-icon">
                <v-icon size="25">
                  mdi-treasure-chest
                </v-icon>
              </div>

              <div>
                <h2>Moja kolekcija.</h2>
                <p>Predmeti za personalizaciju profila.</p>
              </div>

            </div>

            <div class="collection-grid">

              <div
                v-for="item in collection"
                :key="item.label"
                class="collection-item"
              >

                <v-icon size="26">
                  {{ item.icon }}
                </v-icon>

                <span>{{ item.label }}</span>

              </div>

            </div>

            <div class="coming-soon">
              Shop i inventar stižu uskoro.
            </div>

          </section>

          <!-- PRIJATELJI -->

          <section class="friends-card">

            <div class="feature-icon">
              <v-icon size="25">
                mdi-account-group-outline
              </v-icon>
            </div>

            <div class="friends-content">
              <h2>Prijatelji.</h2>

              <p>
                Dodaj prijatelje i uspoređuj rezultate.
              </p>
            </div>

            <span class="soon-label">
              Uskoro
            </span>

          </section>

        </aside>

      </div>

      <!-- POSTAVKE RAČUNA -->

      <v-dialog
        v-model="settingsDialog"
        max-width="520"
        :persistent="loggingOut || saving"
      >

        <v-card class="settings-card">

          <div class="dialog-heading">

            <div>

              <div class="eyebrow">
                ODOKATIVNO. / RAČUN
              </div>

              <h2>Postavke računa.</h2>

            </div>

            <v-btn
              icon="mdi-close"
              variant="text"
              aria-label="Zatvori postavke"
              :disabled="loggingOut || saving"
              @click="settingsDialog = false"
            />

          </div>

          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mb-4"
          >
            {{ errorMessage }}
          </v-alert>

          <!-- INFORMACIJE O RAČUNU -->

          <div class="account-details">

            <div v-if="profile" class="account-row">
              <span>Korisničko ime</span>
              <strong>{{ profile.username }}</strong>
            </div>

            <div class="account-row">
              <span>E-mail adresa</span>
              <strong>{{ authStore.email }}</strong>
            </div>

            <div
              v-if="authStore.user?.email_confirmed_at"
              class="verified-label"
            >
              <v-icon size="17">
                mdi-check-circle
              </v-icon>

              E-mail potvrđen
            </div>

            <div class="account-row">
              <span>Član od</span>
              <strong>{{ memberSince }}</strong>
            </div>

          </div>

          <!-- PRAVNI DOKUMENTI -->

          <router-link
            to="/politika-privatnosti"
            class="settings-link"
          >

            <v-icon>
              mdi-shield-check-outline
            </v-icon>

            <span>Politika privatnosti</span>

            <v-icon class="chevron-icon">
              mdi-chevron-right
            </v-icon>

          </router-link>

          <router-link
            to="/uvjeti-koristenja"
            class="settings-link"
          >

            <v-icon>
              mdi-file-document-outline
            </v-icon>

            <span>Uvjeti korištenja</span>

            <v-icon class="chevron-icon">
              mdi-chevron-right
            </v-icon>

          </router-link>

          <!-- ODJAVA -->

          <v-btn
            block
            variant="outlined"
            prepend-icon="mdi-logout"
            height="48"
            class="logout-button"
            :loading="loggingOut || authStore.loading"
            :disabled="saving"
            @click="logout"
          >
            Odjavi se
          </v-btn>

          <!-- BRISANJE RAČUNA -->

          <section class="danger-section">

            <h3>Brisanje korisničkog računa</h3>

            <p>
              Trajno ukloni svoj račun i povezane
              podatke. Ovu radnju nije moguće
              poništiti.
            </p>

            <v-btn
              block
              color="error"
              variant="outlined"
              prepend-icon="mdi-trash-can-outline"
              to="/brisanje-racuna"
              :disabled="
                saving ||
                loggingOut ||
                authStore.loading
              "
            >
              Obriši račun
            </v-btn>

          </section>

        </v-card>

      </v-dialog>

    </template>

  </v-container>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onUnmounted,
} from 'vue'

import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/authStore'
import { useWalletStore } from '@/stores/walletStore'

import {
  useProgressionStore,
} from '@/stores/progressionStore'

import { supabase } from '@/services/supabase'
import { rules } from '@/utils/validation'

import XPProgressBar
  from '@/components/progression/XPProgressBar.vue'

import CoinIcon
  from '@/components/wallet/CoinIcon.vue'

import AdminXPTools
  from '@/components/admin/AdminXPTools.vue'

const router = useRouter()

const authStore = useAuthStore()
const walletStore = useWalletStore()
const progressionStore = useProgressionStore()

const profile = ref(null)
const username = ref('')

const loading = ref(true)
const saving = ref(false)
const loggingOut = ref(false)

const loadFailed = ref(false)
const errorMessage = ref('')

const settingsDialog = ref(false)

let requestId = 0

// =========================================
// PRISTUP PROFILU
// =========================================

const canAccess = computed(() =>

  authStore.initialized &&
  authStore.isAuthenticated &&
  !authStore.isRecovery &&
  !authStore.user?.is_anonymous

)

// =========================================
// AVATAR I TITULA
// =========================================

const avatarInitial = computed(() =>

  (
    profile.value?.username?.charAt(0) || 'O'
  ).toUpperCase()

)

const playerTitle = computed(() => {

  const level = progressionStore.level

  if (level >= 100) return 'Kralj odokativnog'
  if (level >= 75) return 'Fenomen'
  if (level >= 50) return 'Legenda'
  if (level >= 40) return 'Brojčani genij'
  if (level >= 30) return 'Ekspert'
  if (level >= 20) return 'Majstor procjene'
  if (level >= 15) return 'Odokativac'
  if (level >= 10) return 'Procjenitelj'
  if (level >= 5) return 'Pogađač'

  return 'Početnik'
})

// =========================================
// DATUM REGISTRACIJE
// =========================================

const memberSince = computed(() => {

  const createdAt =
    authStore.user?.created_at ||
    profile.value?.created_at

  if (!createdAt) return '—'

  return new Intl.DateTimeFormat('hr-HR', {

    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Zagreb',

  }).format(new Date(createdAt))
})

// =========================================
// BUDUĆA STATISTIKA I KOLEKCIJA
// =========================================

const statistics = [

  {
    label: 'Odigrani izazovi',
    icon: 'mdi-gamepad-variant-outline',
  },

  {
    label: 'Točnost odgovora',
    icon: 'mdi-target',
  },

  {
    label: 'Najbolji rezultat',
    icon: 'mdi-trophy-outline',
  },

  {
    label: 'Trenutni streak',
    icon: 'mdi-fire',
  },

]

const collection = [

  {
    label: 'Avatari',
    icon: 'mdi-account-circle-outline',
  },

  {
    label: 'Okviri',
    icon: 'mdi-image-frame',
  },

  {
    label: 'Banneri',
    icon: 'mdi-image-outline',
  },

  {
    label: 'Titule',
    icon: 'mdi-crown-outline',
  },

]

// =========================================
// FORMATIRANJE
// =========================================

const formatter = new Intl.NumberFormat('hr-HR')

function formatNumber(value) {
  return formatter.format(value)
}

// =========================================
// XP I O-COINS
// =========================================

function refreshProgress() {

  if (!canAccess.value || !profile.value) {
    return
  }

  void progressionStore.loadProgress()
}

function refreshPlayerData() {

  if (!canAccess.value || !profile.value) {
    return
  }

  refreshProgress()

  void walletStore.refresh()
}

// =========================================
// UČITAVANJE PROFILA
// =========================================

async function loadProfile() {

  const currentRequest = ++requestId

  profile.value = null

  errorMessage.value = ''
  loadFailed.value = false
  loading.value = true
  saving.value = false

  if (!authStore.initialized) return

  if (loggingOut.value) return

  if (authStore.isRecovery) {

    loading.value = false
    settingsDialog.value = false

    router.replace({
      name: 'reset-password',
    })

    return
  }

  if (!canAccess.value) {

    loading.value = false
    settingsDialog.value = false

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

    if (
      currentRequest !== requestId ||
      authStore.userId !== userId ||
      !canAccess.value
    ) {
      return
    }

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

// =========================================
// KREIRANJE PROFILA
// =========================================

async function createProfile(event) {

  const userId = authStore.userId

  const { valid } = await event

  if (
    !valid ||
    saving.value ||
    !supabase ||
    !canAccess.value ||
    !userId ||
    authStore.userId !== userId ||
    authStore.loading ||
    loggingOut.value
  ) {
    return
  }

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
      currentRequest !== requestId ||
      !canAccess.value
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
        canAccess.value &&
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

    if (currentRequest === requestId) {

      saving.value = false

    }
  }
}

// =========================================
// ODJAVA
// =========================================

async function logout() {

  if (
    loggingOut.value ||
    saving.value ||
    authStore.loading
  ) {
    return
  }

  loggingOut.value = true

  errorMessage.value = ''

  try {

    const success = await authStore.logout()

    if (!success) {

      errorMessage.value =
        authStore.errorMessage ||
        'Odjava nije uspjela.'

      return
    }

    requestId++

    profile.value = null

    settingsDialog.value = false

    await router.replace({
      name: 'home',
    })

  } catch (error) {

    console.warn('[PROFILE LOGOUT]', error)

    errorMessage.value =
      'Odjava nije uspjela.'

  } finally {

    loggingOut.value = false

  }
}

// =========================================
// PRAĆENJE AUTENTIFIKACIJE
// =========================================

watch(

  [
    () => authStore.initialized,
    () => authStore.userId,
    () => authStore.isRecovery,
    () => authStore.user?.is_anonymous,
  ],

  () => {

    settingsDialog.value = false

    if (!loggingOut.value) {

      void loadProfile()

    }
  },

  { immediate: true }
)

// Dohvat XP-a i coinsa nakon učitavanja
// ili kreiranja korisničkog profila.

watch(
  () => profile.value?.id,
  id => {

    if (id) {

      refreshPlayerData()

    }
  }
)

onUnmounted(() => {

  requestId++

})
</script>

<style scoped>
/* STRANICA */

.profile-page {
  max-width: 1100px;
  padding: 48px 24px 64px;
  color: #181818;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 30px;
}

.eyebrow {
  color: #66645d;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}

.page-heading h1 {
  font-size: clamp(38px, 6vw, 58px);
  font-weight: 700;
  letter-spacing: -2.5px;
  line-height: 1.1;
}

.page-heading p {
  margin-top: 12px;
  font-size: 14px;
  color: #66645d;
}

.settings-button {
  border-radius: 9px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  flex-shrink: 0;
}

/* GLAVNI RASPORED */

.profile-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1.3fr)
    minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.main-column,
.side-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

/* PROFIL IGRAČA */

.profile-hero {
  background: #181818;
  color: #fffdf6;
  border-radius: 18px;
  overflow: hidden;
}

.hero-banner {
  position: relative;
  padding: 24px;
  overflow: hidden;
  background:
    repeating-linear-gradient(
      135deg,
      transparent 0px,
      transparent 32px,
      rgba(250, 204, 21, 0.055) 32px,
      rgba(250, 204, 21, 0.055) 56px
    );
}

.banner-brand {
  position: relative;
  z-index: 1;
  color: #facc15;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 3px;
  margin-bottom: 26px;
}

.banner-symbol {
  position: absolute;
  right: 12px;
  bottom: -88px;
  color: rgba(250, 204, 21, 0.09);
  font-size: 310px;
  font-weight: 700;
  line-height: 1;
  pointer-events: none;
}

.player-identity {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 20px;
}

.player-avatar {
  width: 92px;
  height: 92px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 4px solid #facc15;
  border-radius: 50%;
  background: #252525;
  color: #facc15;
  font-size: 44px;
  font-weight: 700;
}

.player-info {
  flex: 1;
  min-width: 0;
}

.player-info h2 {
  color: #fffdf6;
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.8px;
  overflow-wrap: anywhere;
}

.player-info p {
  color: #facc15;
  font-size: 14px;
  font-weight: 500;
  margin-top: 8px;
}

/* XP NAPREDAK */

.progress-zone {
  padding: 22px 24px 26px;
  border-top: 1px solid #383838;
}

.progress-zone :deep(.xp-track) {
  background: #414141;
  border-color: #505050;
}

.progress-zone :deep(.next-level),
.progress-zone :deep(.xp-footer span) {
  color: #d4d4d4;
}

.progress-zone :deep(.xp-footer strong) {
  color: #fffdf6;
}

.progress-zone :deep(.tier-basic) {
  background: #facc15;
  color: #181818;
}

.progress-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 13px;
}

.progress-error {
  color: #d4d4d4;
  font-size: 13px;
}

.progress-error p {
  margin-bottom: 12px;
}

/* NAGRADE */

.reward-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.reward-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 20px;
  border-radius: 14px;
  min-width: 0;
}

.experience-tile {
  background: #fffdf6;
  border: 1px solid #d8d5ca;
}

.tile-icon {
  color: #a16207;
  min-height: 34px;
  display: flex;
  align-items: center;
}

.reward-tile strong {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.reward-tile small {
  font-size: 14px;
  letter-spacing: 0;
}

.reward-tile span {
  font-size: 12px;
  color: #66645d;
}

.wallet-tile {
  color: #181818;
  text-decoration: none;
  background: #fef3c7;
  border: 1px solid #e6c465;
  transition:
    background 150ms ease,
    border-color 150ms ease;
}

.wallet-tile:hover {
  background: #fde68a;
  border-color: #ca8a04;
}

.wallet-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
}

.wallet-caption span {
  color: #785414;
}

.action-button {
  border-radius: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
}

/* DESNI STUPAC */

.feature-card,
.friends-card {
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 14px;
  padding: 20px;
}

.feature-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.feature-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: #f0ede3;
  color: #181818;
  border-radius: 10px;
}

.feature-heading h2,
.friends-content h2 {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.feature-heading p,
.friends-content p {
  color: #66645d;
  font-size: 12px;
  margin-top: 4px;
}

/* STATISTIKA */

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.statistic-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  background: #f8f6ed;
  border-radius: 10px;
  padding: 14px;
  color: #66645d;
}

.statistic-tile strong {
  font-size: 27px;
  line-height: 1.3;
  color: #181818;
}

.statistic-tile span {
  font-size: 11px;
}

.coming-soon {
  font-size: 11px;
  color: #66645d;
  margin-top: 16px;
  text-align: center;
}

/* KOLEKCIJA */

.collection-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.collection-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f8f6ed;
  border-radius: 9px;
  padding: 14px 4px;
  color: #77756d;
}

.collection-item span {
  font-size: 11px;
  font-weight: 500;
}

/* PRIJATELJI */

.friends-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.friends-content {
  flex: 1;
  min-width: 0;
}

.soon-label {
  background: #f0ede3;
  border-radius: 5px;
  padding: 5px 7px;
  font-size: 10px;
  color: #66645d;
  white-space: nowrap;
}

/* UČITAVANJE I KREIRANJE PROFILA */

.loading-state,
.access-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  text-align: center;
  padding: 64px 20px;
}

.loading-state p {
  color: #66645d;
  font-size: 14px;
}

.create-profile-card {
  max-width: 500px;
  margin: 20px auto;
  padding: 28px;
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 16px;
}

.create-avatar {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #facc15;
  margin-bottom: 20px;
}

.create-profile-card h2 {
  font-size: 24px;
  font-weight: 700;
}

.create-profile-card p {
  color: #66645d;
  font-size: 14px;
  line-height: 1.6;
  margin: 12px 0 24px;
}

/* POSTAVKE RAČUNA */

.settings-card {
  padding: 24px;
  background: #fffdf6;
  color: #181818;
  border-radius: 16px !important;
}

.dialog-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.dialog-heading h2 {
  font-size: 25px;
  font-weight: 700;
  letter-spacing: -0.8px;
}

.account-details {
  background: #f8f6ed;
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 16px;
}

.account-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

.account-row:last-child {
  margin-bottom: 0;
}

.account-row span {
  color: #66645d;
  font-size: 12px;
}

.account-row strong {
  font-size: 14px;
  overflow-wrap: anywhere;
}

.verified-label {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 16px;
  color: #15803d;
  font-size: 12px;
  font-weight: 600;
}

.settings-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 4px;
  color: #181818;
  text-decoration: none;
  border-bottom: 1px solid #e5e2d8;
  font-size: 14px;
}

.settings-link:hover {
  background: #f8f6ed;
}

.chevron-icon {
  margin-left: auto;
  color: #66645d;
}

.logout-button {
  margin-top: 20px;
  border-radius: 9px;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
}

/* BRISANJE RAČUNA */

.danger-section {
  margin-top: 24px;
  padding: 16px;
  border: 1px solid #fecaca;
  background: #fff5f5;
  border-radius: 10px;
}

.danger-section h3 {
  font-size: 14px;
  font-weight: 700;
  color: #b91c1c;
}

.danger-section p {
  font-size: 12px;
  line-height: 1.6;
  color: #66645d;
  margin: 10px 0 16px;
}

/* TABLET I MOBITEL */

@media (max-width: 850px) {

  .profile-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .profile-page {
    max-width: 620px;
  }
}

@media (max-width: 600px) {

  .profile-page {
    padding: 28px 16px 40px;
  }

  .page-heading {
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 24px;
  }

  .page-heading h1 {
    font-size: 36px;
    letter-spacing: -1.5px;
  }

  .page-heading p {
    font-size: 12px;
  }

  .settings-button {
    font-size: 11px;
    padding: 0 10px;
  }

  .hero-banner {
    padding: 20px;
  }

  .player-avatar {
    width: 70px;
    height: 70px;
    font-size: 34px;
  }

  .player-identity {
    gap: 14px;
  }

  .player-info h2 {
    font-size: 23px;
  }

  .progress-zone {
    padding: 18px 20px;
  }

  .reward-tile {
    padding: 16px;
  }

  .reward-tile strong {
    font-size: 27px;
  }

  .feature-card,
  .friends-card {
    padding: 16px;
  }

  .settings-card {
    padding: 18px;
  }

  .dialog-heading h2 {
    font-size: 21px;
  }
}

@media (prefers-reduced-motion: reduce) {

  .wallet-tile {
    transition: none;
  }
}
</style>
