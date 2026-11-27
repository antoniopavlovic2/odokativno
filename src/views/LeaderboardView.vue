
<template>
  <v-container class="leaderboard-page">

    <!-- NASLOV -->

    <div class="page-heading">

      <div class="eyebrow">
        ODOKATIVNO. / NATJECANJE
      </div>

      <div class="title-row">
        <h1>Rang-lista.</h1>

        <div class="heading-icon">
          <v-icon size="36">
            mdi-trophy-outline
          </v-icon>
        </div>
      </div>

      <p class="subtitle">
        Tko ima najbolji osjećaj za brojke?
      </p>

    </div>

    <!-- NAVIGACIJA LIGE -->

    <div class="league-tabs">

      <v-btn
        color="#181818"
        variant="flat"
        class="active-tab"
        prepend-icon="mdi-calendar-today"
        aria-current="page"
      >
        Dnevna
      </v-btn>

      <v-btn
        variant="outlined"
        disabled
        prepend-icon="mdi-calendar-month-outline"
      >
        Mjesečna · Uskoro
      </v-btn>

    </div>

    <!-- STATUS UŽIVO -->

    <div
      v-if="leaderboardStore.lastUpdated"
      class="live-status"
    >

      <div
        class="live-indicator"
        :class="{
          'live-offline':
            leaderboardStore.refreshError ||
            leaderboardStore.errorMessage
        }"
      >

        <span class="live-dot"></span>

        {{
          leaderboardStore.refreshError ||
          leaderboardStore.errorMessage
            ? 'VEZA PREKINUTA'
            : 'UŽIVO'
        }}

      </div>

      <span class="live-update-text">

        {{
          leaderboardStore.refreshing
            ? 'Osvježavanje...'
            : 'Zadnje osvježavanje: ' + lastUpdatedLabel
        }}

      </span>

    </div>

    <!-- GREŠKA AUTOMATSKOG OSVJEŽAVANJA -->

    <v-alert
      v-if="leaderboardStore.refreshError"
      type="warning"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      {{ leaderboardStore.refreshError }}
    </v-alert>

    <!-- UČITAVANJE -->

    <div
      v-if="
        !authStore.initialized ||
        leaderboardStore.loading
      "
      class="state-card"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
      />

      <h2>Učitavanje rang-liste...</h2>
    </div>

    <!-- GREŠKA -->

    <div
      v-else-if="leaderboardStore.errorMessage"
      class="state-card"
    >

      <v-icon
        size="52"
        color="error"
      >
        mdi-alert-circle-outline
      </v-icon>

      <h2>Nešto je pošlo po zlu.</h2>

      <p>
        {{ leaderboardStore.errorMessage }}
      </p>

      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-refresh"
        @click="leaderboardStore.refresh()"
      >
        Pokušaj ponovno
      </v-btn>

    </div>

    <!-- SADRŽAJ -->

    <template v-else>

      <!-- INFORMACIJE O IZAZOVU -->

      <div class="challenge-summary">

        <div class="summary-icon">
          <v-icon size="30">
            mdi-calendar-today
          </v-icon>
        </div>

        <div class="summary-details">

          <div class="summary-label">
            DNEVNI IZAZOV
          </div>

          <h2 v-if="leaderboardStore.challenge">
            Izazov #{{ challengeNumber }}
          </h2>

          <h2 v-else>
            Današnji izazov
          </h2>

          <p>{{ challengeDate }}</p>

        </div>

        <div class="player-count">
          <strong>
            {{ formatNumber(leaderboardStore.totalPlayers) }}
          </strong>

          <span>Igrača</span>
        </div>

      </div>

      <!-- NEOBJAVLJEN IZAZOV -->

      <div
        v-if="!leaderboardStore.challenge"
        class="state-card"
      >

        <div class="empty-icon">
          <v-icon size="40">
            mdi-calendar-clock-outline
          </v-icon>
        </div>

        <h2>Izazov još nije dostupan.</h2>

        <p>
          Današnji dnevni izazov još nije objavljen.
          Rezultati će se prikazati nakon što
          igrači završe izazov.
        </p>

        <v-btn
          variant="outlined"
          prepend-icon="mdi-refresh"
          :loading="leaderboardStore.refreshing"
          @click="leaderboardStore.refresh()"
        >
          Osvježi
        </v-btn>

      </div>

      <!-- NEMA REZULTATA -->

      <div
        v-else-if="!leaderboardStore.hasPlayers"
        class="state-card"
      >

        <div class="empty-icon">
          <v-icon size="40">
            mdi-trophy-outline
          </v-icon>
        </div>

        <h2>Budi prvi danas!</h2>

        <p>
          Još nema završenih službenih rezultata.
          Zaigraj i pokušaj osvojiti prvo mjesto.
        </p>

        <div class="empty-actions">

          <v-btn
            to="/igra"
            color="primary"
            variant="flat"
            prepend-icon="mdi-play"
          >
            Zaigraj
          </v-btn>

          <v-btn
            variant="outlined"
            prepend-icon="mdi-refresh"
            :loading="leaderboardStore.refreshing"
            @click="leaderboardStore.refresh()"
          >
            Osvježi
          </v-btn>

        </div>

      </div>

      <!-- RANG-LISTA -->

      <template v-else>

        <!-- PODIUM -->

        <LeaderboardPodium
          :players="leaderboardStore.topPlayers"
        />

        <!-- TABLICA -->

        <div class="results-heading">

          <div>
            <h2>Svi rezultati</h2>

            <p>
              {{ formatNumber(leaderboardStore.totalPlayers) }}
              završenih igara
            </p>
          </div>

          <v-btn
            variant="outlined"
            prepend-icon="mdi-refresh"
            :loading="leaderboardStore.refreshing"
            @click="leaderboardStore.refresh()"
          >
            Osvježi
          </v-btn>

        </div>

        <LeaderboardTable
          :players="leaderboardStore.players"
          :my-username="
            leaderboardStore.myPlacement?.username || ''
          "
        />

        <!-- STRANIČENJE -->

        <div
          v-if="leaderboardStore.totalPages > 1"
          class="pagination"
        >

          <v-btn
            icon="mdi-chevron-left"
            variant="outlined"
            aria-label="Prethodna stranica"
            :disabled="
              !leaderboardStore.hasPreviousPage ||
              leaderboardStore.loading ||
              leaderboardStore.refreshing
            "
            @click="leaderboardStore.previousPage()"
          />

          <span>
            Stranica
            {{ leaderboardStore.page + 1 }}
            od
            {{ leaderboardStore.totalPages }}
          </span>

          <v-btn
            icon="mdi-chevron-right"
            variant="outlined"
            aria-label="Sljedeća stranica"
            :disabled="
              !leaderboardStore.hasNextPage ||
              leaderboardStore.loading ||
              leaderboardStore.refreshing
            "
            @click="leaderboardStore.nextPage()"
          />

        </div>

      </template>

      <!-- VLASTITI PLASMAN -->

      <div
        v-if="leaderboardStore.myPlacement"
        class="personal-card"
      >

        <div class="personal-main">

          <div class="personal-icon">
            <v-icon size="32">
              mdi-medal-outline
            </v-icon>
          </div>

          <div>

            <div class="eyebrow">
              TVOJ DANAŠNJI PLASMAN
            </div>

            <h2>
              {{ leaderboardStore.myPlacement.placement }}.
              mjesto
            </h2>

            <p>
              {{ leaderboardStore.myPlacement.correct_answers }}/7
              točnih odgovora
            </p>

          </div>

        </div>

        <div class="personal-score">

          <strong>
            {{ formatNumber(leaderboardStore.myPlacement.score) }}
          </strong>

          <span>od 700 bodova</span>

        </div>

      </div>

      <!-- GREŠKA VLASTITOG REZULTATA -->

      <v-alert
        v-else-if="leaderboardStore.personalError"
        type="warning"
        variant="tonal"
        class="mt-6"
      >
        {{ leaderboardStore.personalError }}
      </v-alert>

      <!-- REGISTRIRANI IGRAČ BEZ REZULTATA -->

      <div
        v-else-if="
          isRegistered &&
          leaderboardStore.challenge
        "
        class="personal-empty"
      >

        <v-icon size="38">
          mdi-account-clock-outline
        </v-icon>

        <div class="personal-empty-text">
          <h3>Još nemaš današnji rezultat.</h3>

          <p>
            Završi svih sedam pitanja i zauzmi
            svoje mjesto na rang-listi.
          </p>
        </div>

        <v-btn
          to="/igra"
          color="primary"
          variant="flat"
        >
          Zaigraj
        </v-btn>

      </div>

      <!-- GOST -->

      <div
        v-else-if="!isRegistered"
        class="registration-card"
      >

        <div class="registration-icon">
          <v-icon size="32">
            mdi-trophy-outline
          </v-icon>
        </div>

        <div class="registration-text">

          <h2>Želiš biti na rang-listi?</h2>

          <p>
            Kreiraj besplatan račun, odigraj dnevni
            izazov i natječi se s drugim igračima.
          </p>

          <div class="registration-actions">

            <v-btn
              to="/registracija"
              color="primary"
              variant="flat"
              prepend-icon="mdi-account-plus-outline"
            >
              Registriraj se
            </v-btn>

            <v-btn
              to="/prijava"
              variant="outlined"
            >
              Prijava
            </v-btn>

          </div>

        </div>

      </div>

    </template>

    <!-- PRAVILA RANGIRANJA -->

    <div class="ranking-info">

      <v-icon size="20">
        mdi-information-outline
      </v-icon>

      <p>
        Maksimalan dnevni rezultat je 700 bodova.
        Igrači s jednakim brojem bodova dijele isto
        mjesto. Novi dnevni poredak počinje u ponoć
        prema hrvatskom vremenu.
      </p>

    </div>

    <!-- INFORMACIJA O OSVJEŽAVANJU -->

    <div class="refresh-info">

      <v-icon size="16">
        mdi-refresh
      </v-icon>

      <span>
        Rang-lista se automatski osvježava svakih
        10 sekundi dok je stranica otvorena i vidljiva.
      </span>

    </div>

    <!-- POVRATAK -->

    <v-btn
      to="/"
      variant="outlined"
      prepend-icon="mdi-arrow-left"
      class="back-button"
    >
      Povratak na početnu
    </v-btn>

  </v-container>
</template>

<script setup>
import {
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
} from 'vue'

import { useAuthStore } from '@/stores/authStore'

import {
  useLeaderboardStore,
} from '@/stores/leaderboardStore'

import LeaderboardPodium
  from '@/components/leaderboard/LeaderboardPodium.vue'

import LeaderboardTable
  from '@/components/leaderboard/LeaderboardTable.vue'

const authStore = useAuthStore()

const leaderboardStore =
  useLeaderboardStore()

// =========================================
// POSTAVKE OSVJEŽAVANJA
// =========================================

const REFRESH_INTERVAL = 10000

let refreshInterval = null

// =========================================
// KORISNIČKI RAČUN
// =========================================

const isRegistered = computed(() =>
  authStore.isAuthenticated &&
  !authStore.isRecovery &&
  !authStore.user?.is_anonymous
)

// =========================================
// IZAZOV
// =========================================

const challengeNumber = computed(() =>
  String(
    leaderboardStore.challenge?.id || 0
  ).padStart(3, '0')
)

const challengeDate = computed(() => {

  const value =
    leaderboardStore.challenge?.challenge_date

  const date = value
    ? new Date(`${value}T12:00:00Z`)
    : new Date()

  return new Intl.DateTimeFormat(
    'hr-HR',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Zagreb',
    }
  ).format(date)
})

// =========================================
// POSLJEDNJE OSVJEŽAVANJE
// =========================================

const lastUpdatedLabel = computed(() => {

  if (!leaderboardStore.lastUpdated) {
    return ''
  }

  return new Intl.DateTimeFormat(
    'hr-HR',
    {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
      timeZone: 'Europe/Zagreb',
    }
  ).format(
    new Date(
      leaderboardStore.lastUpdated
    )
  )
})

// =========================================
// FORMATIRANJE BROJEVA
// =========================================

function formatNumber(value) {
  return new Intl.NumberFormat(
    'hr-HR'
  ).format(value)
}

// =========================================
// AUTOMATSKO OSVJEŽAVANJE
// =========================================

function refreshIfVisible() {

  if (
    document.hidden ||
    !authStore.initialized ||
    leaderboardStore.loading ||
    leaderboardStore.refreshing
  ) {
    return
  }

  void leaderboardStore.refresh()
}

// =========================================
// POKRETANJE AUTOMATSKOG OSVJEŽAVANJA
// =========================================

function startAutoRefresh() {

  stopAutoRefresh()

  refreshInterval = window.setInterval(
    refreshIfVisible,
    REFRESH_INTERVAL
  )
}

// =========================================
// ZAUSTAVLJANJE OSVJEŽAVANJA
// =========================================

function stopAutoRefresh() {

  if (refreshInterval !== null) {

    window.clearInterval(
      refreshInterval
    )

    refreshInterval = null
  }
}

// =========================================
// PROMJENA VIDLJIVOSTI STRANICE
// =========================================

function handleVisibilityChange() {

  if (document.hidden) {

    stopAutoRefresh()

    return
  }

  refreshIfVisible()

  startAutoRefresh()
}

// =========================================
// INICIJALIZACIJA
// =========================================

watch(
  [
    () => authStore.initialized,
    () => authStore.userId,
    () => authStore.isAuthenticated,
    () => authStore.isRecovery,
    () => authStore.user?.is_anonymous,
  ],

  () => {

    // Uklanjamo podatke prethodnog korisnika
    // ako se promijeni korisnička sesija.

    leaderboardStore.reset()

    if (!authStore.initialized) {
      return
    }

    void leaderboardStore.loadLeaderboard(0)

  },

  { immediate: true }
)

// =========================================
// OTVARANJE RANG-LISTE
// =========================================

onMounted(() => {

  if (!document.hidden) {
    startAutoRefresh()
  }

  document.addEventListener(
    'visibilitychange',
    handleVisibilityChange
  )
})

// =========================================
// NAPUŠTANJE RANG-LISTE
// =========================================

onBeforeUnmount(() => {

  stopAutoRefresh()

  document.removeEventListener(
    'visibilitychange',
    handleVisibilityChange
  )

  leaderboardStore.reset()
})
</script>

<style scoped>
.leaderboard-page {
  max-width: 960px;
  margin: 0 auto;
  padding-top: 48px;
  padding-bottom: 64px;
  color: #181818;
}

/* NASLOV */

.page-heading {
  margin-bottom: 28px;
}

.eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.4px;
  margin-bottom: 8px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.title-row h1 {
  font-size: clamp(44px, 7vw, 70px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -3px;
}

.heading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #facc15;
  border: 2px solid #181818;
  width: 64px;
  height: 64px;
  border-radius: 14px;
  flex-shrink: 0;
}

.subtitle {
  color: #66645d;
  font-size: 16px;
  margin-top: 10px;
}

/* LIGE */

.league-tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
}

.league-tabs .v-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  border-radius: 8px;
}

.active-tab {
  color: #facc15 !important;
}

/* STATUS UŽIVO */

.live-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.live-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #15803d;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #16a34a;
  animation: live-pulse 2s infinite;
}

.live-offline {
  color: #991b1b;
  background: #fee2e2;
  border-color: #fecaca;
}

.live-offline .live-dot {
  background: #dc2626;
  animation: none;
}

.live-update-text {
  font-size: 12px;
  color: #66645d;
  font-variant-numeric: tabular-nums;
}

@keyframes live-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.5);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(22, 163, 74, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .live-dot {
    animation: none;
  }
}

/* SAŽETAK IZAZOVA */

.challenge-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 14px;
  padding: 24px;
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 10px;
  background: #f0ede3;
  flex-shrink: 0;
}

.summary-details {
  flex: 1;
  min-width: 0;
}

.summary-label {
  font-size: 11px;
  color: #66645d;
  font-weight: 700;
  letter-spacing: 1px;
}

.summary-details h2 {
  font-size: 23px;
  margin-top: 4px;
}

.summary-details p {
  font-size: 14px;
  color: #66645d;
}

.player-count {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.player-count strong {
  font-size: 30px;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.player-count span {
  font-size: 12px;
  color: #66645d;
}

/* TABLICA */

.results-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 32px 0 16px;
}

.results-heading h2 {
  font-size: 26px;
  letter-spacing: -0.7px;
}

.results-heading p {
  color: #66645d;
  font-size: 13px;
  margin-top: 4px;
}

/* STRANIČENJE */

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  font-size: 14px;
}

/* VLASTITI PLASMAN */

.personal-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 32px;
  background: #facc15;
  border: 2px solid #181818;
  border-radius: 16px;
  padding: 24px;
}

.personal-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.personal-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 58px;
  height: 58px;
  border-radius: 12px;
  background: #181818;
  color: #facc15;
  flex-shrink: 0;
}

.personal-card h2 {
  font-size: 30px;
  letter-spacing: -0.8px;
}

.personal-card p {
  font-size: 13px;
  margin-top: 4px;
}

.personal-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.personal-score strong {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.personal-score span {
  font-size: 12px;
}

.personal-empty {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  margin-top: 28px;
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 14px;
}

.personal-empty-text {
  flex: 1;
}

.personal-empty h3 {
  font-size: 19px;
}

.personal-empty p {
  color: #66645d;
  font-size: 14px;
  margin-top: 6px;
}

/* REGISTRACIJA */

.registration-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
  margin-top: 28px;
  border: 2px solid #181818;
  border-radius: 16px;
  background: #fffdf6;
}

.registration-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: #facc15;
  flex-shrink: 0;
}

.registration-text {
  flex: 1;
}

.registration-text h2 {
  font-size: 24px;
  letter-spacing: -0.5px;
}

.registration-text p {
  font-size: 14px;
  line-height: 1.6;
  color: #66645d;
  margin-top: 8px;
}

.registration-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

/* PRAZNO STANJE */

.state-card {
  text-align: center;
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 16px;
  padding: 48px 24px;
  margin: 24px 0;
}

.state-card h2 {
  font-size: 26px;
  letter-spacing: -0.6px;
  margin: 20px 0 12px;
}

.state-card p {
  max-width: 440px;
  margin: 0 auto 24px;
  color: #66645d;
  line-height: 1.6;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border: 2px solid #181818;
  border-radius: 20px;
  background: #facc15;
  margin: 0 auto;
}

.empty-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

/* INFORMACIJE */

.ranking-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 28px;
  color: #66645d;
}

.ranking-info p {
  font-size: 13px;
  line-height: 1.6;
}

.refresh-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  color: #66645d;
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
}

.refresh-info .v-icon {
  flex-shrink: 0;
}

.back-button {
  margin-top: 24px;
}

.leaderboard-page .v-btn {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
  border-radius: 8px;
}

/* MOBITEL */

@media (max-width: 600px) {

  .leaderboard-page {
    padding-top: 24px;
    padding-bottom: 40px;
  }

  .title-row h1 {
    font-size: 44px;
    letter-spacing: -2px;
  }

  .heading-icon {
    width: 48px;
    height: 48px;
  }

  .subtitle {
    font-size: 14px;
  }

  .live-update-text {
    font-size: 10px;
  }

  .live-indicator {
    font-size: 10px;
    padding: 5px 8px;
  }

  .challenge-summary {
    gap: 10px;
    padding: 16px;
  }

  .summary-icon {
    width: 40px;
    height: 40px;
  }

  .summary-details h2 {
    font-size: 18px;
  }

  .summary-label {
    font-size: 9px;
  }

  .summary-details p {
    font-size: 12px;
  }

  .player-count strong {
    font-size: 24px;
  }

  .personal-card {
    padding: 18px;
    gap: 10px;
  }

  .personal-main {
    gap: 10px;
  }

  .personal-icon {
    display: none;
  }

  .personal-card h2 {
    font-size: 23px;
  }

  .personal-score strong {
    font-size: 36px;
  }

  .personal-card .eyebrow {
    font-size: 9px;
    letter-spacing: 0.8px;
  }

  .personal-empty {
    align-items: flex-start;
    flex-direction: column;
    padding: 18px;
  }

  .registration-card {
    flex-direction: column;
    padding: 18px;
  }

  .results-heading h2 {
    font-size: 22px;
  }

  .state-card {
    padding: 36px 18px;
  }

  .state-card h2 {
    font-size: 23px;
  }

  .refresh-info {
    font-size: 11px;
  }
}
</style>
