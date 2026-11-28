
<template>
  <section
    v-if="canLoad"
    class="analytics-section"
  >

    <!-- ZAGLAVLJE -->

    <div class="analytics-heading">

      <div>

        <h2>Analiza rezultata.</h2>

        <p>
          Upoznaj svoje prednosti i prati napredak.
        </p>

      </div>

      <v-btn
        icon="mdi-refresh"
        variant="text"
        aria-label="Osvježi analitiku"
        :loading="loading"
        @click="loadAnalytics"
      />

    </div>

    <!-- ODABIR RAZDOBLJA -->

    <v-btn-toggle
      v-model="period"
      mandatory
      divided
      color="primary"
      class="period-selector"
      aria-label="Razdoblje statistike"
    >

      <v-btn :value="7">
        7 dana
      </v-btn>

      <v-btn :value="30">
        30 dana
      </v-btn>

      <v-btn :value="90">
        90 dana
      </v-btn>

    </v-btn-toggle>

    <!-- UČITAVANJE -->

    <div
      v-if="loading"
      class="loading-state"
    >

      <v-progress-circular
        indeterminate
        color="primary"
        size="30"
      />

      <span>Učitavanje rezultata...</span>

    </div>

    <!-- GREŠKA -->

    <v-alert
      v-else-if="errorMessage"
      type="warning"
      variant="tonal"
    >

      {{ errorMessage }}

      <v-btn
        variant="text"
        @click="loadAnalytics"
      >
        Pokušaj ponovno
      </v-btn>

    </v-alert>

    <!-- ANALITIKA -->

    <template v-else-if="analytics">

      <div class="period-caption">

        <v-icon size="17">
          mdi-calendar-range
        </v-icon>

        {{ formatDate(analytics.startDate) }}

        –

        {{ formatDate(analytics.endDate) }}

      </div>

      <!-- SAŽETAK RAZDOBLJA -->

      <div class="summary-grid">

        <div
          v-for="item in summaryItems"
          :key="item.label"
          class="summary-tile"
        >

          <v-icon
            size="24"
            class="summary-icon"
          >
            {{ item.icon }}
          </v-icon>

          <strong>{{ item.value }}</strong>

          <span>{{ item.label }}</span>

        </div>

      </div>

      <!-- GRAFIKON -->

      <section class="analytics-card">

        <div class="card-heading">

          <div class="heading-icon">

            <v-icon size="25">
              mdi-chart-line
            </v-icon>

          </div>

          <div>

            <h3>Rezultati kroz vrijeme.</h3>

            <p>
              Bodovi iz dnevnih izazova.
            </p>

          </div>

        </div>

        <ScoreHistoryChart
          :series="analytics.series"
        />

      </section>

      <!-- KATEGORIJE -->

      <section class="analytics-card">

        <div class="card-heading">

          <div class="heading-icon">

            <v-icon size="25">
              mdi-target
            </v-icon>

          </div>

          <div>

            <h3>Uspješnost po kategorijama.</h3>

            <p>
              Postotak točnih odgovora.
            </p>

          </div>

        </div>

        <template v-if="analytics.categories.length">

          <div
            v-for="category in analytics.categories"
            :key="category.id"
            class="category-row"
          >

            <div class="category-header">

              <strong>
                {{ category.name }}
              </strong>

              <span>
                {{ formatNumber(category.accuracy) }}%
              </span>

            </div>

            <div
              class="category-track"
              role="progressbar"
              :aria-label="category.name"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuenow="category.accuracy"
            >

              <div
                class="category-fill"
                :style="{
                  width: category.accuracy + '%'
                }"
              />

            </div>

            <div class="category-caption">

              <span>

                {{ category.correctAnswers }}
                /
                {{ category.totalAnswers }}
                točnih

              </span>

              <span>

                Prosjek:
                {{ formatNumber(category.averagePoints) }}
                PTS

              </span>

            </div>

          </div>

          <p class="analytics-note">

            Uspješnost se računa prema svim
            pitanjima iz kategorije, uključujući
            pitanja na kojima je isteklo vrijeme.

          </p>

        </template>

        <div v-else class="empty-state">

          <v-icon size="36">
            mdi-target
          </v-icon>

          <p>
            Još nema dovoljno podataka
            za prikaz kategorija.
          </p>

        </div>

      </section>

      <!-- POVIJEST IZAZOVA -->

      <section class="analytics-card">

        <div class="card-heading">

          <div class="heading-icon">

            <v-icon size="25">
              mdi-history
            </v-icon>

          </div>

          <div>

            <h3>Povijest izazova.</h3>

            <p>

              {{ analytics.history.length }}
              završenih izazova u razdoblju.

            </p>

          </div>

        </div>

        <template v-if="analytics.history.length">

          <div
            v-for="game in visibleHistory"
            :key="game.sessionId"
            class="history-row"
          >

            <div class="history-icon">

              <v-icon size="25">
                mdi-calendar-check-outline
              </v-icon>

            </div>

            <div class="history-info">

              <strong>
                {{ formatDate(game.date) }}
              </strong>

              <span>

                {{ game.correctAnswers }}
                /
                {{ game.totalAnswers }}
                točnih odgovora

              </span>

              <span
                v-if="game.timedOutAnswers > 0"
                class="timeout-label"
              >

                Istek vremena:
                {{ game.timedOutAnswers }}

              </span>

            </div>

            <div class="history-score">

              <strong>
                {{ formatNumber(game.score) }}
              </strong>

              <span>PTS</span>

            </div>

          </div>

          <v-btn
            v-if="
              historyLimit <
              analytics.history.length
            "
            block
            variant="outlined"
            height="46"
            class="more-button"
            @click="historyLimit += 10"
          >

            Prikaži još izazova

          </v-btn>

          <p class="history-count">

            Prikazano
            {{ visibleHistory.length }}
            od
            {{ analytics.history.length }}
            izazova.

          </p>

        </template>

        <div v-else class="empty-state">

          <v-icon size="40">
            mdi-gamepad-variant-outline
          </v-icon>

          <strong>Nema odigranih izazova.</strong>

          <p>
            Tvoji završeni dnevni izazovi
            pojavit će se ovdje.
          </p>

          <v-btn
            color="primary"
            elevation="0"
            to="/"
            prepend-icon="mdi-play-circle-outline"
          >
            Dnevni izazov
          </v-btn>

        </div>

      </section>

    </template>

    <div v-else class="analytics-card empty-state">

      <v-icon size="36">
        mdi-account-outline
      </v-icon>

      <p>
        Kreiraj korisnički profil
        za pristup statistici.
      </p>

      <v-btn
        variant="outlined"
        :to="{ name: 'profile' }"
      >
        Moj profil
      </v-btn>

    </div>

  </section>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
} from 'vue'

import { useAuthStore } from '@/stores/authStore'

import {
  getMyStatisticsAnalytics,
} from '@/services/statisticsService'

import { getTodayDate } from '@/utils/date'

import ScoreHistoryChart
  from './ScoreHistoryChart.vue'

const authStore = useAuthStore()

// =========================================
// STANJE KOMPONENTE
// =========================================

const period = ref(30)

const analytics = ref(null)

const loading = ref(false)

const errorMessage = ref('')

const historyLimit = ref(10)

let requestId = 0

let refreshTimer = null

// =========================================
// PROVJERA PRISTUPA
// =========================================

const canLoad = computed(() =>

  authStore.initialized &&

  authStore.isAuthenticated &&

  !authStore.isRecovery &&

  !authStore.user?.is_anonymous

)

// =========================================
// FORMATIRANJE
// =========================================

const numberFormatter = new Intl.NumberFormat(
  'hr-HR',
  {
    maximumFractionDigits: 1,
  }
)

const dateFormatter = new Intl.DateTimeFormat(
  'hr-HR',
  {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: 'Europe/Zagreb',
  }
)

function formatNumber(value) {

  return numberFormatter.format(value ?? 0)

}

function formatDate(date) {

  return dateFormatter.format(

    new Date(date + 'T12:00:00Z')

  )

}

// =========================================
// SAŽETAK ODABRANOG RAZDOBLJA
// =========================================

const summaryItems = computed(() => {

  const s = analytics.value?.summary

  if (!s) return []

  return [

    {
      label: 'Odigrani izazovi',
      value: formatNumber(s.gamesPlayed),
      icon: 'mdi-gamepad-variant-outline',
    },

    {
      label: 'Prosječni rezultat',
      value: s.gamesPlayed
        ? formatNumber(s.averageScore)
        : '—',
      icon: 'mdi-chart-bar',
    },

    {
      label: 'Najbolji rezultat',
      value: s.gamesPlayed
        ? formatNumber(s.bestScore)
        : '—',
      icon: 'mdi-trophy-outline',
    },

    {
      label: 'Točnost odgovora',
      value: s.gamesPlayed
        ? formatNumber(s.accuracy) + '%'
        : '—',
      icon: 'mdi-target',
    },

  ]

})

// =========================================
// POVIJEST IZAZOVA
// =========================================

const visibleHistory = computed(() =>

  (analytics.value?.history || [])
    .slice(0, historyLimit.value)

)

// =========================================
// DOHVAT ANALITIKE
// =========================================

async function loadAnalytics() {

  const currentRequest = ++requestId

  const userId = authStore.userId

  const selectedPeriod = period.value

  errorMessage.value = ''

  analytics.value = null

  historyLimit.value = 10

  if (!canLoad.value) {

    loading.value = false

    return

  }

  loading.value = true

  try {

    const data = await getMyStatisticsAnalytics(
      selectedPeriod
    )

    if (

      currentRequest !== requestId ||

      userId !== authStore.userId ||

      selectedPeriod !== period.value ||

      !canLoad.value

    ) {

      return

    }

    if (

      data &&

      (

        !data.summary ||

        !Array.isArray(data.series) ||

        !Array.isArray(data.categories) ||

        !Array.isArray(data.history)

      )

    ) {

      throw new Error(
        'Neispravni podaci analitike.'
      )

    }

    analytics.value = data

  } catch (error) {

    if (currentRequest !== requestId) return

    console.error('[STATISTICS ANALYTICS]', error)

    errorMessage.value =

      'Analitiku trenutačno nije moguće učitati.'

  } finally {

    if (currentRequest === requestId) {

      loading.value = false

    }

  }

}

// =========================================
// AUTOMATSKO OSVJEŽAVANJE
// =========================================

function checkDate() {

  if (

    canLoad.value &&

    !loading.value &&

    analytics.value &&

    analytics.value.today !== getTodayDate()

  ) {

    void loadAnalytics()

  }

}

function onVisibilityChange() {

  if (

    document.visibilityState === 'visible' &&

    canLoad.value &&

    !loading.value

  ) {

    void loadAnalytics()

  }

}

// =========================================
// PROMJENA RAZDOBLJA I KORISNIKA
// =========================================

watch(

  [
    period,
    () => authStore.userId,
    canLoad,
  ],

  () => {

    void loadAnalytics()

  },

  {
    immediate: true,
    flush: 'sync',
  }

)

onMounted(() => {

  refreshTimer = setInterval(
    checkDate,
    60000
  )

  document.addEventListener(
    'visibilitychange',
    onVisibilityChange
  )

})

onBeforeUnmount(() => {

  requestId++

  clearInterval(refreshTimer)

  document.removeEventListener(
    'visibilitychange',
    onVisibilityChange
  )

})
</script>

<style scoped>
.analytics-section {
  margin-top: 40px;
  color: #181818;
  min-width: 0;
}

/* ZAGLAVLJE */

.analytics-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.analytics-heading h2 {
  font-size: 29px;
  font-weight: 700;
  letter-spacing: -0.8px;
}

.analytics-heading p {
  font-size: 13px;
  color: #66645d;
  margin-top: 6px;
}

/* RAZDOBLJE */

.period-selector {
  border: 1px solid #d8d5ca;
  border-radius: 9px;
  background: #fffdf6;
  overflow: hidden;
}

.period-selector .v-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

.period-caption {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 18px 0;
  color: #66645d;
  font-size: 12px;
}

/* SAŽETAK */

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 22px;
}

.summary-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 20px;
  min-width: 0;
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 12px;
}

.summary-icon {
  color: #a16207;
}

.summary-tile strong {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.summary-tile span {
  font-size: 12px;
  color: #66645d;
}

/* KARTICE */

.analytics-card {
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 20px;
  min-width: 0;
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.heading-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  background: #facc15;
  border-radius: 10px;
}

.card-heading h3 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.card-heading p {
  margin-top: 4px;
  font-size: 12px;
  color: #66645d;
}

/* KATEGORIJE */

.category-row {
  padding: 16px 0;
  border-bottom: 1px solid #e5e2d8;
}

.category-row:last-of-type {
  border-bottom: none;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.category-header strong {
  font-size: 15px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.category-header span {
  font-size: 17px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.category-track {
  height: 10px;
  background: #e5e2d8;
  border-radius: 8px;
  overflow: hidden;
}

.category-fill {
  height: 100%;
  background: #facc15;
  border-radius: 8px;
  transition: width 500ms ease;
}

.category-caption {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  font-size: 11px;
  color: #66645d;
}

.analytics-note {
  font-size: 11px;
  color: #66645d;
  line-height: 1.7;
  margin-top: 18px;
}

/* POVIJEST */

.history-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 17px 0;
  border-bottom: 1px solid #e5e2d8;
}

.history-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  background: #f8f6ed;
  color: #a16207;
  border-radius: 10px;
}

.history-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 4px;
}

.history-info strong {
  font-size: 15px;
  font-weight: 700;
}

.history-info span {
  font-size: 12px;
  color: #66645d;
}

.history-info .timeout-label {
  color: #9a3412;
  font-size: 11px;
}

.history-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.history-score strong {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.history-score span {
  font-size: 11px;
  color: #66645d;
}

.more-button {
  margin-top: 20px;
  border-radius: 9px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

.history-count {
  text-align: center;
  font-size: 11px;
  color: #66645d;
  margin-top: 18px;
}

/* PRAZNA STANJA */

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 32px 16px;
  text-align: center;
  color: #66645d;
  font-size: 13px;
}

.empty-state strong {
  color: #181818;
  font-size: 16px;
}

.empty-state p {
  line-height: 1.6;
  max-width: 300px;
}

/* TABLETI */

@media (max-width: 850px) {

  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

}

/* MOBITELI */

@media (max-width: 600px) {

  .analytics-section {
    margin-top: 28px;
  }

  .analytics-heading h2 {
    font-size: 24px;
  }

  .analytics-heading p {
    font-size: 12px;
  }

  .period-selector {
    width: 100%;
  }

  .period-selector .v-btn {
    flex: 1;
    min-width: 0;
    padding: 0 8px;
    font-size: 12px;
  }

  .summary-grid {
    gap: 10px;
  }

  .summary-tile {
    padding: 14px;
  }

  .summary-tile strong {
    font-size: 26px;
  }

  .analytics-card {
    padding: 16px;
  }

  .card-heading {
    gap: 10px;
  }

  .card-heading h3 {
    font-size: 18px;
  }

  .heading-icon {
    width: 38px;
    height: 38px;
  }

  .history-row {
    gap: 10px;
  }

  .history-icon {
    width: 36px;
    height: 36px;
  }

  .history-score strong {
    font-size: 21px;
  }

}

@media (prefers-reduced-motion: reduce) {

  .category-fill {
    transition: none;
  }

}
</style>
