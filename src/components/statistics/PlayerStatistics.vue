
<template>
  <section
    v-if="canLoad"
    class="statistics-component"
    :class="{ 'compact-mode': compact }"
  >

    <!-- UČITAVANJE -->

    <div
      v-if="loading && !statistics"
      class="loading-state"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="28"
      />

      <span>Učitavanje statistike...</span>
    </div>

    <!-- GREŠKA -->

    <v-alert
      v-if="errorMessage"
      type="warning"
      variant="tonal"
      class="mb-3"
    >
      {{ errorMessage }}

      <v-btn
        variant="text"
        size="small"
        @click="loadStatistics"
      >
        Pokušaj ponovno
      </v-btn>
    </v-alert>

    <template v-if="statistics">

      <div class="statistics-layout">

        <!-- UKUPNA STATISTIKA -->

        <div
          v-if="!compact"
          class="details-column"
        >

          <section class="statistics-panel">

            <div class="panel-heading">

              <div>
                <h2>Ukupna statistika.</h2>
                <p>Svi tvoji završeni izazovi.</p>
              </div>

              <v-btn
                icon="mdi-refresh"
                variant="text"
                size="small"
                aria-label="Osvježi statistiku"
                :loading="loading"
                @click="loadStatistics"
              />

            </div>

            <div class="statistics-grid">

              <div
                v-for="item in statisticItems"
                :key="item.label"
                class="statistic-tile"
              >

                <v-icon
                  size="28"
                  class="statistic-icon"
                >
                  {{ item.icon }}
                </v-icon>

                <strong>{{ item.value }}</strong>

                <span>{{ item.label }}</span>

              </div>

            </div>

          </section>

          <!-- DODATNA STATISTIKA -->

          <section class="statistics-panel">

            <h2>Dodatna statistika.</h2>

            <div class="additional-statistics">

              <div
                v-for="item in additionalItems"
                :key="item.label"
                class="statistic-row"
              >

                <v-icon size="21">
                  {{ item.icon }}
                </v-icon>

                <span>{{ item.label }}</span>

                <strong>{{ item.value }}</strong>

              </div>

            </div>

          </section>

        </div>

        <!-- TJEDNI STREAK -->

        <div class="weekly-column">

          <section class="weekly-card">

            <div class="weekly-heading">

              <div
                class="fire-icon"
                :class="{
                  'fire-active':
                    statistics.weekCompleted > 0
                }"
              >

                <v-icon
                  :size="compact ? 30 : 42"
                >
                  mdi-fire
                </v-icon>

              </div>

              <div class="weekly-identity">

                <div class="weekly-eyebrow">
                  TJEDNI STREAK
                </div>

                <div class="weekly-number">

                  {{ statistics.weekCompleted }}

                  <span>/ 7 dana</span>

                </div>

                <p class="week-date">
                  {{ weekLabel }}
                </p>

              </div>

            </div>

            <!-- TJEDNI KALENDAR -->

            <div class="week-grid">

              <div
                v-for="(day, index) in statistics.week"
                :key="day.date"
                class="week-day"
              >

                <span class="day-label">
                  {{ dayLabels[index] }}
                </span>

                <div
                  class="day-square"
                  :class="dayClass(day)"
                  :title="dayDescription(day)"
                  :aria-label="dayDescription(day)"
                  role="img"
                >

                  <v-icon
                    :size="compact ? 17 : 21"
                  >

                    {{
                      day.completed
                        ? 'mdi-check-bold'
                        : day.isToday
                          ? 'mdi-play'
                          : day.isFuture
                            ? 'mdi-minus'
                            : 'mdi-close'
                    }}

                  </v-icon>

                </div>

              </div>

            </div>

            <!-- NAPREDAK -->

            <div class="progress-heading">

              <span>Završeni izazovi</span>

              <strong>{{ weeklyPercent }}%</strong>

            </div>

            <div
              class="weekly-track"
              role="progressbar"
              aria-label="Tjedni napredak"
              aria-valuemin="0"
              aria-valuemax="7"
              :aria-valuenow="statistics.weekCompleted"
            >

              <div
                class="weekly-fill"
                :style="{
                  width: weeklyPercent + '%'
                }"
              />

            </div>

            <!-- TJEDNI BODOVI -->

            <div class="weekly-summary">

              <div class="weekly-score">

                <span>BODOVI OVOG TJEDNA</span>

                <strong>
                  {{ formatNumber(statistics.weekScore) }}
                  <small>PTS</small>
                </strong>

                <p>
                  Od mogućih
                  {{ formatNumber(statistics.weekMaxScore) }}
                  bodova
                </p>

              </div>

              <div
                v-if="!compact"
                class="perfect-weeks"
              >

                <v-icon size="23">
                  mdi-trophy-outline
                </v-icon>

                <strong>
                  {{ statistics.perfectWeeks }}
                </strong>

                <span>Savršeni tjedni</span>

              </div>

            </div>

            <!-- DETALJAN PRIKAZ -->

            <template v-if="!compact">

              <div
                v-if="statistics.perfectWeek"
                class="perfect-status"
              >
                <v-icon size="32">
                  mdi-trophy-variant
                </v-icon>

                <strong>SAVRŠENI TJEDAN!</strong>

                <span>
                  Svih sedam izazova je završeno.
                </span>
              </div>

              <p v-else class="weekly-message">
                {{ weeklyMessage }}
              </p>

              <div
                v-if="statistics.playedToday"
                class="completed-today"
              >
                <v-icon size="20">
                  mdi-check-circle
                </v-icon>

                Današnji izazov je završen.
              </div>

              <v-btn
                v-else
                block
                height="46"
                color="#facc15"
                elevation="0"
                prepend-icon="mdi-play-circle-outline"
                class="play-button"
                to="/"
              >
                Odigraj današnji izazov
              </v-btn>

              <p class="reset-note">
                Novi tjedan počinje u ponedjeljak
                u 00:00 prema hrvatskom vremenu.
              </p>

            </template>

          </section>

          <!-- POVEZNICA NA DETALJNU STATISTIKU -->

          <router-link
            v-if="compact"
            :to="{ name: 'statistics' }"
            class="statistics-link"
          >

            <div class="link-icon">
              <v-icon size="25">
                mdi-chart-bar
              </v-icon>
            </div>

            <div class="link-content">

              <strong>Moja statistika.</strong>

              <span>
                Pogledaj sve svoje rezultate.
              </span>

            </div>

            <v-icon size="22">
              mdi-chevron-right
            </v-icon>

          </router-link>

        </div>

      </div>

    </template>

    <!-- PROFIL JOŠ NIJE KREIRAN -->

    <div
      v-else-if="!loading && !errorMessage"
      class="statistics-panel"
    >
      <p>
        Statistika trenutačno nije dostupna.
        Provjeri je li tvoj profil kreiran.
      </p>

      <v-btn
        class="mt-4"
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
  getMyStatistics,
} from '@/services/statisticsService'

import { getTodayDate } from '@/utils/date'

defineProps({

  compact: {
    type: Boolean,
    default: false,
  },

})

const authStore = useAuthStore()

const statistics = ref(null)
const loading = ref(false)
const errorMessage = ref('')

let requestId = 0
let refreshTimer = null

const dayLabels = [
  'PON',
  'UTO',
  'SRI',
  'ČET',
  'PET',
  'SUB',
  'NED',
]

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
    month: 'short',
    timeZone: 'Europe/Zagreb',
  }
)

function formatNumber(value) {
  return numberFormatter.format(value ?? 0)
}

function formatShortDate(date) {

  return dateFormatter.format(
    new Date(date + 'T12:00:00Z')
  )

}

// =========================================
// GLAVNA STATISTIKA
// =========================================

const statisticItems = computed(() => {

  const s = statistics.value

  if (!s) return []

  return [

    {
      label: 'Odigrani izazovi',
      value: formatNumber(s.gamesPlayed),
      icon: 'mdi-gamepad-variant-outline',
    },

    {
      label: 'Točnost odgovora',
      value: formatNumber(s.accuracy) + '%',
      icon: 'mdi-target',
    },

    {
      label: 'Najbolji rezultat',
      value: formatNumber(s.bestScore),
      icon: 'mdi-trophy-outline',
    },

    {
      label: 'Prosječni rezultat',
      value: formatNumber(s.averageScore),
      icon: 'mdi-chart-bar',
    },

    {
      label: 'Točni odgovori',
      value: formatNumber(s.correctAnswers),
      icon: 'mdi-check-circle-outline',
    },

    {
      label: 'Izazovi sa 7 točnih',
      value: formatNumber(s.perfectGames),
      icon: 'mdi-star-outline',
    },

  ]

})

// =========================================
// DODATNA STATISTIKA
// =========================================

const additionalItems = computed(() => {

  const s = statistics.value

  if (!s) return []

  return [

    {
      label: 'Ukupno bodova',
      value: formatNumber(s.totalScore),
      icon: 'mdi-lightning-bolt',
    },

    {
      label: 'Najbolji tjedni rezultat',
      value: formatNumber(s.bestWeeklyScore),
      icon: 'mdi-trophy-outline',
    },

    {
      label: 'Ukupno pitanja',
      value: formatNumber(s.totalAnswers),
      icon: 'mdi-help-circle-outline',
    },

    {
      label: 'Netočni odgovori',
      value: formatNumber(s.incorrectAnswers),
      icon: 'mdi-close-circle-outline',
    },

    {
      label: 'Isteklo vrijeme',
      value: formatNumber(s.timedOutAnswers),
      icon: 'mdi-timer-outline',
    },

    {
      label: 'Savršeni tjedni',
      value: formatNumber(s.perfectWeeks),
      icon: 'mdi-calendar-check-outline',
    },

  ]

})

// =========================================
// TJEDNI NAPREDAK
// =========================================

const weeklyPercent = computed(() =>

  Math.round(
    (statistics.value?.weekCompleted || 0)
    / 7 * 100
  )

)

const weekLabel = computed(() => {

  const s = statistics.value

  if (!s) return ''

  return (
    formatShortDate(s.weekStart) +
    ' – ' +
    formatShortDate(s.weekEnd)
  )

})

const weeklyMessage = computed(() => {

  const s = statistics.value

  if (!s) return ''

  if (s.missedDays > 0) {

    return (
      'Savršeni tjedan više nije moguć, ' +
      'ali još možeš skupljati tjedne bodove.'
    )

  }

  const remaining = 7 - s.weekCompleted

  return (
    'Još ' +
    remaining +
    (remaining === 1 ? ' izazov' : ' izazova') +
    ' do savršenog tjedna!'
  )

})

// =========================================
// KALENDAR
// =========================================

function dayClass(day) {

  if (day.completed) return 'day-completed'

  if (day.isToday) return 'day-today'

  if (day.isFuture) return 'day-future'

  return 'day-missed'

}

function dayDescription(day) {

  let status = 'Propušten dan'

  if (day.completed) {
    status = 'Izazov završen'
  } else if (day.isToday) {
    status = 'Današnji izazov'
  } else if (day.isFuture) {
    status = 'Budući izazov'
  }

  return day.date + ': ' + status

}

// =========================================
// AUTENTIFIKACIJA
// =========================================

const canLoad = computed(() =>

  authStore.initialized &&
  authStore.isAuthenticated &&
  !authStore.isRecovery &&
  !authStore.user?.is_anonymous

)

// =========================================
// DOHVAT STATISTIKE
// =========================================

async function loadStatistics() {

  const currentRequest = ++requestId

  const userId = authStore.userId

  errorMessage.value = ''

  if (!canLoad.value) {

    statistics.value = null
    loading.value = false

    return
  }

  loading.value = true

  try {

    const data = await getMyStatistics()

    if (
      currentRequest !== requestId ||
      userId !== authStore.userId ||
      !canLoad.value
    ) {
      return
    }

    if (
      data &&
      (
        !data.weekStart ||
        !Array.isArray(data.week) ||
        typeof data.weekCompleted !== 'number'
      )
    ) {
      throw new Error(
        'Potrebna je tjedna verzija Queryja 42.'
      )
    }

    statistics.value = data

  } catch (error) {

    if (currentRequest !== requestId) return

    console.error('[STATISTICS]', error)

    errorMessage.value =
      'Statistiku nije moguće učitati.'

  } finally {

    if (currentRequest === requestId) {
      loading.value = false
    }

  }

}

// =========================================
// PROMJENA DANA
// =========================================

function checkDate() {

  if (
    canLoad.value &&
    !loading.value &&
    statistics.value &&
    statistics.value.today !== getTodayDate()
  ) {
    void loadStatistics()
  }

}

function onVisibilityChange() {

  if (
    document.visibilityState === 'visible' &&
    canLoad.value &&
    !loading.value
  ) {
    void loadStatistics()
  }

}

watch(
  [
    () => authStore.userId,
    canLoad,
  ],
  () => {

    statistics.value = null

    void loadStatistics()

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
.statistics-component {
  color: #181818;
  min-width: 0;
}

.statistics-layout {
  display: grid;
  grid-template-columns:
    minmax(0, 1.3fr)
    minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.details-column,
.weekly-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

/* STATISTIKA */

.statistics-panel {
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 14px;
  padding: 24px;
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.statistics-panel h2 {
  font-size: 23px;
  font-weight: 700;
  letter-spacing: -0.6px;
}

.panel-heading p {
  margin-top: 4px;
  color: #66645d;
  font-size: 13px;
}

.statistics-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.statistic-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 20px;
  background: #f8f6ed;
  border-radius: 10px;
  min-width: 0;
}

.statistic-icon {
  color: #a16207;
  margin-bottom: 5px;
}

.statistic-tile strong {
  font-size: 34px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.statistic-tile span {
  color: #66645d;
  font-size: 12px;
}

/* TJEDNI STREAK */

.weekly-card {
  background: #181818;
  border-radius: 14px;
  color: #fffdf6;
  padding: 24px;
}

.weekly-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.fire-icon {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  background: #2b2b2b;
  color: #888;
  border-radius: 12px;
  flex-shrink: 0;
}

.fire-active {
  color: #fb923c;
  background: #36291e;
  animation: fire-glow 2s ease-in-out infinite;
}

@keyframes fire-glow {

  0%, 100% {
    filter: drop-shadow(0 0 2px #fb923c22);
  }

  50% {
    filter: drop-shadow(0 0 9px #fb923c66);
  }

}

.weekly-identity {
  flex: 1;
  min-width: 0;
}

.weekly-eyebrow {
  color: #facc15;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.4px;
}

.weekly-number {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -1px;
}

.weekly-number span {
  font-size: 17px;
  color: #bdbdbd;
  font-weight: 500;
}

.week-date {
  color: #bdbdbd;
  font-size: 12px;
  margin-top: 5px;
}

/* TJEDNI KALENDAR */

.week-grid {
  display: grid;
  grid-template-columns:
    repeat(7, minmax(0, 1fr));
  gap: 6px;
  margin-bottom: 22px;
}

.week-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.day-label {
  color: #bdbdbd;
  font-size: 10px;
  font-weight: 600;
}

.day-square {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  border: 1px solid transparent;
}

.day-completed {
  background: #facc15;
  color: #181818;
}

.day-today {
  background: #332e1c;
  color: #facc15;
  border-color: #facc15;
}

.day-future {
  background: #292929;
  color: #888;
}

.day-missed {
  background: #353535;
  color: #aaa;
}

/* PROGRESS BAR */

.progress-heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #bdbdbd;
  font-size: 11px;
  margin-bottom: 10px;
}

.progress-heading strong {
  color: #facc15;
}

.weekly-track {
  height: 10px;
  border-radius: 8px;
  background: #414141;
  overflow: hidden;
}

.weekly-fill {
  height: 100%;
  border-radius: 8px;
  background: #facc15;
  transition: width 700ms ease;
}

/* TJEDNI BODOVI */

.weekly-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
  padding: 18px 0;
  border-top: 1px solid #383838;
  border-bottom: 1px solid #383838;
}

.weekly-score {
  min-width: 0;
}

.weekly-score span {
  display: block;
  color: #bdbdbd;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
}

.weekly-score strong {
  display: block;
  color: #facc15;
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -1px;
  overflow-wrap: anywhere;
}

.weekly-score small {
  color: #bdbdbd;
  font-size: 12px;
  letter-spacing: 0;
}

.weekly-score p {
  color: #bdbdbd;
  font-size: 11px;
}

.perfect-weeks {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding-left: 15px;
  border-left: 1px solid #383838;
  color: #facc15;
}

.perfect-weeks strong {
  color: #fffdf6;
  font-size: 25px;
}

.perfect-weeks span {
  color: #bdbdbd;
  font-size: 11px;
  text-align: center;
}

/* STATUS TJEDNA */

.weekly-message {
  color: #d4d4d4;
  font-size: 13px;
  line-height: 1.6;
  text-align: center;
  margin: 20px 0;
}

.perfect-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 20px 0;
  color: #facc15;
  text-align: center;
}

.perfect-status span {
  color: #d4d4d4;
  font-size: 12px;
}

.completed-today {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #86efac;
  background: #163521;
  border-radius: 8px;
  font-size: 12px;
  padding: 12px 6px;
}

.play-button {
  color: #181818 !important;
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
  letter-spacing: 0;
}

.reset-note {
  color: #bdbdbd;
  font-size: 11px;
  text-align: center;
  line-height: 1.6;
  margin-top: 16px;
}

/* DODATNA STATISTIKA */

.additional-statistics {
  margin-top: 12px;
}

.statistic-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #e5e2d8;
  color: #66645d;
  font-size: 13px;
}

.statistic-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.statistic-row span {
  flex: 1;
}

.statistic-row strong {
  color: #181818;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}

/* KOMPAKTNI PRIKAZ NA PROFILU */

.compact-mode .statistics-layout {
  grid-template-columns: minmax(0, 1fr);
}

.compact-mode .weekly-card {
  padding: 20px;
}

.compact-mode .weekly-heading {
  margin-bottom: 18px;
}

.compact-mode .fire-icon {
  width: 46px;
  height: 46px;
}

.compact-mode .weekly-number {
  font-size: 28px;
}

.compact-mode .weekly-number span {
  font-size: 14px;
}

.compact-mode .week-grid {
  margin-bottom: 16px;
}

.compact-mode .weekly-summary {
  margin-top: 16px;
  padding-bottom: 0;
  border-bottom: none;
}

.compact-mode .weekly-score strong {
  font-size: 27px;
}

/* POVEZNICA NA STATISTIKU */

.statistics-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 12px;
  color: #181818;
  text-decoration: none;
  transition:
    background 150ms ease,
    border-color 150ms ease;
}

.statistics-link:hover {
  background: #fef3c7;
  border-color: #ca8a04;
}

.link-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  background: #f0ede3;
  border-radius: 9px;
  flex-shrink: 0;
}

.link-content {
  flex: 1;
  min-width: 0;
}

.link-content strong {
  display: block;
  font-size: 16px;
  font-weight: 700;
}

.link-content span {
  display: block;
  color: #66645d;
  font-size: 12px;
  margin-top: 4px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 30px 0;
  color: #66645d;
  font-size: 13px;
}

/* RESPONZIVNOST */

@media (max-width: 850px) {

  .statistics-layout {
    grid-template-columns: minmax(0, 1fr);
  }

}

@media (max-width: 600px) {

  .statistics-panel,
  .weekly-card,
  .compact-mode .weekly-card {
    padding: 16px;
  }

  .statistic-tile {
    padding: 14px;
  }

  .statistic-tile strong {
    font-size: 28px;
  }

  .fire-icon {
    width: 50px;
    height: 50px;
  }

  .weekly-number {
    font-size: 30px;
  }

  .week-grid {
    gap: 4px;
  }

  .day-label {
    font-size: 9px;
  }

  .weekly-score strong {
    font-size: 27px;
  }

}

@media (prefers-reduced-motion: reduce) {

  .fire-active {
    animation: none;
  }

  .weekly-fill,
  .statistics-link {
    transition: none;
  }

}
</style>
