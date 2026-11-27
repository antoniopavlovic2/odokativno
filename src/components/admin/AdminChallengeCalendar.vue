
<template>
  <section class="calendar-card">

    <div class="calendar-heading">
      <div>
        <h2>Kalendar izazova</h2>

        <p>
          Pregled pripremljenog sadržaja po danima.
        </p>
      </div>

      <v-btn
        icon="mdi-refresh"
        variant="text"
        aria-label="Osvježi kalendar"
        :disabled="disabled"
        :loading="loading"
        @click="loadMonth"
      />
    </div>

    <!-- MJESEČNA STATISTIKA -->

    <div class="calendar-stats">
      <div class="stat-item">
        <strong>{{ completeCount }}</strong>
        <span>Popunjeno</span>
      </div>

      <div class="stat-item">
        <strong>{{ incompleteCount }}</strong>
        <span>Nepotpuno</span>
      </div>

      <div class="stat-item">
        <strong>{{ emptyCount }}</strong>
        <span>Bez izazova</span>
      </div>
    </div>

    <!-- ODABIR MJESECA -->

    <div class="month-navigation">

      <v-btn
        icon="mdi-chevron-left"
        variant="outlined"
        size="small"
        aria-label="Prethodni mjesec"
        :disabled="disabled"
        @click="changeMonth(-1)"
      />

      <h3>{{ monthLabel }}</h3>

      <v-btn
        icon="mdi-chevron-right"
        variant="outlined"
        size="small"
        aria-label="Sljedeći mjesec"
        :disabled="disabled"
        @click="changeMonth(1)"
      />

    </div>

    <div class="today-button">
      <v-btn
        variant="text"
        size="small"
        prepend-icon="mdi-calendar-today"
        :disabled="disabled"
        @click="goToToday"
      >
        Trenutni mjesec
      </v-btn>
    </div>

    <!-- GREŠKA -->

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ errorMessage }}
    </v-alert>

    <!-- UČITAVANJE -->

    <div v-if="loading" class="calendar-loading">
      <v-progress-circular
        indeterminate
        color="primary"
      />

      <p>Učitavanje kalendara...</p>
    </div>

    <!-- KALENDAR -->

    <div v-else-if="!errorMessage">

      <div class="calendar-grid">

        <div
          v-for="day in weekdays"
          :key="day"
          class="weekday"
        >
          {{ day }}
        </div>

        <div
          v-for="n in firstDayOffset"
          :key="'empty-' + n"
          class="empty-cell"
        />

        <button
          v-for="day in calendarDays"
          :key="day.date"
          type="button"
          class="calendar-day"
          :class="[
            day.state,
            {
              'is-today': day.date === today,
            }
          ]"
          :disabled="
            disabled ||
            (!day.challenge && day.date < today)
          "
          :aria-label="dayLabel(day)"
          :title="dayLabel(day)"
          @click="selectDay(day)"
        >

          <span class="day-number">
            {{ day.number }}
          </span>

          <template v-if="day.challenge">

            <span class="challenge-id">
              #{{ formatId(day.challenge.id) }}
            </span>

            <span class="day-count">
              {{ day.activeCount }}/7
            </span>

            <span class="day-status">
              {{ statusShort(day.challenge) }}
            </span>

          </template>

          <template v-else>

            <v-icon
              size="16"
              class="empty-icon"
            >
              {{
                day.date < today
                  ? 'mdi-minus'
                  : 'mdi-plus'
              }}
            </v-icon>

          </template>

        </button>

      </div>

      <!-- LEGENDA -->

      <div class="calendar-legend">

        <div class="legend-item">
          <span class="legend-dot complete" />
          7 aktivnih pitanja
        </div>

        <div class="legend-item">
          <span class="legend-dot incomplete" />
          Nedostaju aktivna pitanja
        </div>

        <div class="legend-item">
          <span class="legend-dot empty" />
          Nema izazova
        </div>

      </div>

      <div class="status-legend">
        N – Nacrt · Z – Zakazano · O – Objavljeno
      </div>

      <p class="calendar-hint">
        Klikni na postojeći izazov za pregled
        pitanja ili na slobodan budući datum
        za kreiranje novog izazova.
      </p>

    </div>

  </section>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onBeforeUnmount,
} from 'vue'

import { supabase } from '@/services/supabase'
import { useAdminStore } from '@/stores/adminStore'

const props = defineProps({
  refreshKey: {
    type: Number,
    default: 0,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'select',
])

const adminStore = useAdminStore()

// =========================================
// DATUMI
// =========================================

function getToday() {
  const parts = new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: 'Europe/Zagreb',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
  ).formatToParts(new Date())

  const values = Object.fromEntries(
    parts.map(part => [
      part.type,
      part.value,
    ])
  )

  return (
    values.year + '-' +
    values.month + '-' +
    values.day
  )
}

const today = ref(getToday())

const initialDate = today.value.split('-')

const year = ref(Number(initialDate[0]))
const month = ref(Number(initialDate[1]) - 1)

const weekdays = [
  'PON',
  'UTO',
  'SRI',
  'ČET',
  'PET',
  'SUB',
  'NED',
]

function dateKey(y, m, d) {
  return (
    String(y) + '-' +
    String(m + 1).padStart(2, '0') + '-' +
    String(d).padStart(2, '0')
  )
}

const monthStart = computed(() =>
  dateKey(
    year.value,
    month.value,
    1
  )
)

const monthEnd = computed(() => {
  const next = new Date(
    Date.UTC(
      year.value,
      month.value + 1,
      1
    )
  )

  return dateKey(
    next.getUTCFullYear(),
    next.getUTCMonth(),
    1
  )
})

const monthLabel = computed(() => {
  const value = new Intl.DateTimeFormat(
    'hr-HR',
    {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }
  ).format(
    new Date(
      Date.UTC(
        year.value,
        month.value,
        1
      )
    )
  )

  return value.charAt(0).toUpperCase() +
    value.slice(1)
})

const daysInMonth = computed(() =>
  new Date(
    Date.UTC(
      year.value,
      month.value + 1,
      0
    )
  ).getUTCDate()
)

const firstDayOffset = computed(() => {
  const day = new Date(
    Date.UTC(
      year.value,
      month.value,
      1
    )
  ).getUTCDay()

  return (day + 6) % 7
})

// =========================================
// STANJE
// =========================================

const challenges = ref([])
const loading = ref(false)
const errorMessage = ref('')

let requestId = 0

const challengesByDate = computed(() =>
  new Map(
    challenges.value.map(
      challenge => [
        challenge.challenge_date,
        challenge,
      ]
    )
  )
)

// =========================================
// DANI U KALENDARU
// =========================================

const calendarDays = computed(() =>
  Array.from(
    { length: daysInMonth.value },
    (_, index) => {
      const number = index + 1

      const date = dateKey(
        year.value,
        month.value,
        number
      )

      const challenge =
        challengesByDate.value.get(date) ||
        null

      const items = challenge?.items || []

      const activeCount = items.filter(
        item =>
          item.question?.is_active === true
      ).length

      let state = 'empty'

      if (challenge) {
        state = activeCount === 7
          ? 'complete'
          : 'incomplete'
      }

      return {
        number,
        date,
        challenge,
        activeCount,
        questionCount: items.length,
        state,
      }
    }
  )
)

const completeCount = computed(() =>
  calendarDays.value.filter(
    day => day.state === 'complete'
  ).length
)

const incompleteCount = computed(() =>
  calendarDays.value.filter(
    day => day.state === 'incomplete'
  ).length
)

const emptyCount = computed(() =>
  calendarDays.value.filter(
    day => day.state === 'empty'
  ).length
)

// =========================================
// FORMATIRANJE I STATUS
// =========================================

function formatId(id) {
  return String(id).padStart(3, '0')
}

function statusLabel(challenge) {
  if (!challenge.published_at) {
    return 'Nacrt'
  }

  return new Date(
    challenge.published_at
  ).getTime() > Date.now()
    ? 'Zakazano'
    : 'Objavljeno'
}

function statusShort(challenge) {
  const labels = {
    Nacrt: 'N',
    Zakazano: 'Z',
    Objavljeno: 'O',
  }

  return labels[statusLabel(challenge)]
}

function dayLabel(day) {
  const date = new Intl.DateTimeFormat(
    'hr-HR',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Zagreb',
    }
  ).format(
    new Date(`${day.date}T12:00:00Z`)
  )

  if (!day.challenge) {
    return date + ' – Nema izazova'
  }

  return (
    date +
    ' – Izazov ' +
    formatId(day.challenge.id) +
    ' – ' +
    day.questionCount +
    ' pitanja, ' +
    day.activeCount +
    ' aktivnih – ' +
    statusLabel(day.challenge)
  )
}

// =========================================
// DOHVAT IZ SUPABASEA
// =========================================

async function loadMonth() {
  const request = ++requestId

  if (
    !adminStore.isAdmin ||
    !supabase
  ) {
    challenges.value = []
    loading.value = false
    return
  }

  today.value = getToday()

  loading.value = true
  errorMessage.value = ''
  challenges.value = []

  try {
    const { data, error } = await supabase
      .from('daily_challenges')
      .select(`
        id,
        challenge_date,
        published_at,
        items:daily_challenge_questions (
          position,
          question:questions (
            is_active
          )
        )
      `)
      .gte(
        'challenge_date',
        monthStart.value
      )
      .lt(
        'challenge_date',
        monthEnd.value
      )
      .order('challenge_date')

    if (
      request !== requestId ||
      !adminStore.isAdmin
    ) {
      return
    }

    if (error) throw error

    challenges.value = data || []

  } catch (error) {
    if (request === requestId) {
      errorMessage.value =
        error.message ||
        'Dohvat kalendara nije uspio.'
    }

  } finally {
    if (request === requestId) {
      loading.value = false
    }
  }
}

// =========================================
// NAVIGACIJA
// =========================================

function changeMonth(direction) {
  const next = new Date(
    Date.UTC(
      year.value,
      month.value + direction,
      1
    )
  )

  year.value = next.getUTCFullYear()
  month.value = next.getUTCMonth()
}

function goToToday() {
  today.value = getToday()

  const parts = today.value.split('-')

  year.value = Number(parts[0])
  month.value = Number(parts[1]) - 1
}

function selectDay(day) {
  if (
    props.disabled ||
    loading.value ||
    !adminStore.isAdmin
  ) {
    return
  }

  if (
    !day.challenge &&
    day.date < getToday()
  ) {
    return
  }

  emit('select', {
    date: day.date,
    challenge: day.challenge,
  })
}

// =========================================
// AUTOMATSKO OSVJEŽAVANJE
// =========================================

watch(
  [
    monthStart,
    () => props.refreshKey,
    () => adminStore.isAdmin,
  ],
  loadMonth,
  { immediate: true }
)

onBeforeUnmount(() => {
  requestId++
})
</script>

<style scoped>
.calendar-card {
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
}

.calendar-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.calendar-heading h2 {
  font-size: 26px;
  letter-spacing: -0.8px;
}

.calendar-heading p {
  font-size: 14px;
  color: #66645d;
  margin-top: 4px;
}

/* STATISTIKA */

.calendar-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  background: #f8f6ed;
  border: 1px solid #e5e2d8;
  padding: 16px;
  border-radius: 10px;
}

.stat-item strong {
  font-size: 28px;
  line-height: 1.2;
}

.stat-item span {
  font-size: 12px;
  color: #66645d;
  margin-top: 6px;
}

/* NAVIGACIJA */

.month-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.month-navigation h3 {
  font-size: 21px;
  text-align: center;
}

.today-button {
  display: flex;
  justify-content: center;
  margin: 8px 0 16px;
}

/* KALENDAR */

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #66645d;
  padding-bottom: 8px;
}

.calendar-day {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-width: 0;
  min-height: 94px;
  padding: 8px 2px;
  border: 1px solid #d8d5ca;
  border-radius: 9px;
  color: #181818;
  cursor: pointer;
  transition:
    border-color 0.15s,
    transform 0.15s;
}

.calendar-day:not(:disabled):hover {
  border-color: #181818;
  transform: translateY(-2px);
}

.calendar-day:disabled {
  cursor: default;
  opacity: 0.6;
}

.calendar-day.is-today {
  outline: 2px solid #181818;
  outline-offset: -2px;
}

.day-number {
  font-size: 18px;
  font-weight: 700;
}

.challenge-id {
  font-size: 12px;
  font-weight: 600;
  color: #66645d;
}

.day-count {
  font-size: 13px;
  font-weight: 700;
}

.day-status {
  font-size: 10px;
  font-weight: 700;
}

.complete {
  background: #dcfce7;
  color: #166534;
}

.incomplete {
  background: #fef3c7;
  color: #92400e;
}

.empty {
  background: #f4f1e7;
  color: #66645d;
}

.empty-icon {
  opacity: 0.6;
}

/* LEGENDA */

.calendar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #66645d;
  font-size: 12px;
}

.legend-dot {
  width: 14px;
  height: 14px;
  border: 1px solid rgba(24, 24, 24, 0.12);
  border-radius: 4px;
  flex-shrink: 0;
}

.status-legend {
  margin-top: 12px;
  color: #66645d;
  font-size: 12px;
}

.calendar-hint {
  font-size: 13px;
  color: #66645d;
  margin-top: 16px;
  line-height: 1.5;
}

.calendar-loading {
  text-align: center;
  padding: 32px 12px;
}

.calendar-loading p {
  margin-top: 12px;
  color: #66645d;
  font-size: 14px;
}

/* MOBITEL */

@media (max-width: 600px) {
  .calendar-card {
    padding: 12px;
  }

  .calendar-heading h2 {
    font-size: 21px;
  }

  .calendar-heading p {
    font-size: 12px;
  }

  .calendar-stats {
    gap: 6px;
  }

  .stat-item {
    padding: 10px 6px;
  }

  .stat-item strong {
    font-size: 22px;
  }

  .stat-item span {
    font-size: 10px;
  }

  .calendar-grid {
    gap: 3px;
  }

  .weekday {
    font-size: 9px;
  }

  .calendar-day {
    min-height: 70px;
    padding: 5px 1px;
    border-radius: 6px;
    gap: 2px;
  }

  .day-number {
    font-size: 15px;
  }

  .challenge-id {
    font-size: 9px;
  }

  .day-count {
    font-size: 11px;
  }

  .day-status {
    font-size: 9px;
  }

  .calendar-legend {
    gap: 8px;
  }
}
</style>
