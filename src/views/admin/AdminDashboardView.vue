
<template>
  <v-container class="admin-page">

    <!-- PROVJERA PRISTUPA -->

    <div
      v-if="
        !authStore.initialized ||
        adminStore.loading ||
        adminStore.status === 'idle'
      "
      class="state-card"
    >
      <v-progress-circular
        indeterminate
        color="primary"
      />

      <h2>Provjera ovlasti...</h2>
    </div>

    <div
      v-else-if="!authStore.isAuthenticated"
      class="state-card"
    >
      <h2>Potrebna je prijava</h2>

      <v-btn
        to="/prijava"
        color="primary"
      >
        Prijavi se
      </v-btn>
    </div>

    <div
      v-else-if="authStore.isRecovery"
      class="state-card"
    >
      <h2>Dovrši obnovu lozinke</h2>

      <v-btn
        to="/nova-lozinka"
        color="primary"
      >
        Postavi novu lozinku
      </v-btn>
    </div>

    <div
      v-else-if="adminStore.status === 'error'"
      class="state-card"
    >
      <h2>Provjera nije uspjela</h2>

      <p>{{ adminStore.errorMessage }}</p>

      <v-btn
        color="primary"
        @click="adminStore.checkAccess()"
      >
        Pokušaj ponovno
      </v-btn>
    </div>

    <div
      v-else-if="!adminStore.isAdmin"
      class="state-card"
    >
      <v-icon
        size="48"
        color="error"
      >
        mdi-shield-lock-outline
      </v-icon>

      <h2>Pristup nije dopušten</h2>

      <p>Nemaš administratorske ovlasti.</p>

      <v-btn to="/" color="primary">
        Povratak na početnu
      </v-btn>
    </div>

    <!-- ADMINISTRACIJA -->

    <template v-else>

      <div class="admin-heading">
        <div>
          <div class="eyebrow">
            ODOKATIVNO. / ADMIN
          </div>

          <h1>Administracija.</h1>

          <p class="muted">
            Upravljaj pitanjima i dnevnim izazovima.
          </p>
        </div>

        <div class="admin-badge">
          <v-icon size="20">
            mdi-shield-check
          </v-icon>

          Administrator
        </div>
      </div>

      <!-- STATISTIKA -->

      <div class="summary-card">
        <v-icon size="44">
          mdi-calendar-month-outline
        </v-icon>

        <div>
          <div>Ukupno dnevnih izazova</div>

          <strong class="summary-value">
            {{ loading ? '...' : totalChallenges }}
          </strong>
        </div>
      </div>

      <AdminChallengeCalendar
        :refresh-key="calendarVersion"
        :disabled="
            loading ||
            creating ||
            questionsLoading ||
            calendarOpening
        "
        @select="onCalendarSelect"
        />
      <!-- ALATNA TRAKA -->

      <div class="section-heading">
        <div>
          <h2>Dnevni izazovi</h2>

          <p class="muted">
            Odaberi izazov za pregled pitanja.
          </p>
        </div>

        <div class="toolbar">
          <v-btn
            icon="mdi-refresh"
            variant="outlined"
            aria-label="Osvježi"
            :loading="loading"
            @click="loadChallenges()"
          />

          <AdminQuestionLibrary />

          <v-btn
            color="primary"
            elevation="0"
            prepend-icon="mdi-plus"
            @click="openCreateDialog"
          >
            Novi izazov
          </v-btn>
        </div>
      </div>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ errorMessage }}
      </v-alert>

      <div v-if="loading" class="state-card">
        <v-progress-circular
          indeterminate
          color="primary"
        />

        <p>Učitavanje izazova...</p>
      </div>

      <div
        v-else-if="!challenges.length"
        class="state-card"
      >
        Nema izazova za prikaz.
      </div>

      <!-- POPIS IZAZOVA -->

      <div v-else class="challenge-list">

        <article
          v-for="challenge in challenges"
          :key="challenge.id"
          :id="'admin-challenge-' + challenge.id"
          class="challenge-card"
          :class="{
            'challenge-open':
              selectedId === challenge.id
          }"
        >

          <button
            type="button"
            class="challenge-header"
            :aria-expanded="
              selectedId === challenge.id
            "
            @click="toggleChallenge(challenge)"
          >
            <div class="challenge-number">
              #{{ formatId(challenge.id) }}
            </div>

            <div class="challenge-info">
              <h3>
                Izazov {{ formatId(challenge.id) }}
              </h3>

              <span class="muted">
                {{ formatDate(challenge.challenge_date) }}
              </span>
            </div>

            <span
              class="status-badge"
              :class="getStatus(challenge)"
            >
              {{ getStatusLabel(challenge) }}
            </span>

            <v-icon>
              {{
                selectedId === challenge.id
                  ? 'mdi-chevron-up'
                  : 'mdi-chevron-down'
              }}
            </v-icon>
          </button>

          <AdminChallengePublish
            :challenge="challenge"
            :questions="challenge.items || []"
            :now="publicationClock"
            :disabled="loading || questionsLoading || creating || calendarOpening || questionDialog"
            @changed="onPublicationChanged"
          />

          <!-- OTVORENI IZAZOV -->

          <div
            v-if="selectedId === challenge.id"
            class="challenge-content"
          >

            <div
              v-if="questionsLoading"
              class="state-card"
            >
              <v-progress-circular
                indeterminate
                color="primary"
              />

              <p>Učitavanje pitanja...</p>
            </div>

            <v-alert
              v-else-if="questionsError"
              type="error"
              variant="tonal"
            >
              {{ questionsError }}
            </v-alert>

            <template v-else>

                <AdminChallengeActions
                    v-if="!challenge.published_at"
                    :challenge="challenge"
                    @changed="onChallengeChanged"
                />

              <div class="section-heading">
                <h4>Pitanja izazova</h4>

                <span
                  class="question-count"
                  :class="{
                    complete:
                      selectedQuestions.length === 7
                  }"
                >
                  {{ selectedQuestions.length }}/7
                </span>
              </div>

              <v-alert
                v-if="challenge.published_at"
                type="info"
                variant="tonal"
                density="compact"
                class="mb-4"
              >
                Zakazani i objavljeni izazovi
                zaštićeni su od izmjena.
              </v-alert>

              <p
                v-if="!selectedQuestions.length"
                class="empty-questions"
              >
                Ovaj izazov još nema pitanja.
                Dodaj prvo pitanje.
              </p>

              <!-- POJEDINAČNO PITANJE -->

              <div
                v-for="(item, index) in selectedQuestions"
                :key="item.question.id"
                class="question-row"
                >

                <div class="question-position">
                  {{ item.position }}
                </div>

                <div class="question-details">

                  <div class="eyebrow">
                    {{
                      item.question.category?.name ||
                      'Bez kategorije'
                    }}
                  </div>

                  <h4>
                    {{ item.question.question }}
                  </h4>

                  <div class="answer-line">
                    <v-icon size="18">
                      mdi-check-circle-outline
                    </v-icon>

                    <strong>
                      {{ formatNumber(item.question.answer) }}
                      {{ item.question.unit }}
                    </strong>
                  </div>

                  <div class="range-line">
                    Raspon:
                    {{ formatNumber(item.question.min_value) }}
                    –
                    {{ formatNumber(item.question.max_value) }}
                    {{ item.question.unit }}
                  </div>

                  <div class="range-line">
                    Korak slidera:
                    {{ formatNumber(item.question.step) }}
                  </div>

                  <div
                    v-if="!item.question.is_active"
                    class="inactive-label"
                  >
                    Neaktivno pitanje
                  </div>

                  <details
                    v-if="
                      item.question.explanation ||
                      item.question.source_url
                    "
                    class="question-extra"
                  >
                    <summary>
                      Objašnjenje i izvor
                    </summary>

                    <p>
                      {{ item.question.explanation }}
                    </p>

                    <a
                      v-if="safeUrl(item.question.source_url)"
                      :href="safeUrl(item.question.source_url)"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Otvori izvor
                    </a>
                  </details>

                </div>

                <!-- UREĐIVANJE -->

                <!-- UPRAVLJANJE PITANJEM -->

                <AdminQuestionActions
                v-if="!challenge.published_at"
                :challenge-id="challenge.id"
                :question-id="item.question.id"
                :question-text="item.question.question"
                :index="index"
                :count="selectedQuestions.length"
                @edit="openQuestionForm(item.question)"
                @changed="onQuestionOrderChanged"
                />

              </div>

              <!-- DODAVANJE PITANJA -->

              <v-btn
                v-if="
                  !challenge.published_at &&
                  selectedQuestions.length < 7
                "
                block
                color="primary"
                elevation="0"
                prepend-icon="mdi-plus"
                class="mt-5"
                @click="openQuestionForm(null)"
              >
                Dodaj pitanje
                {{ selectedQuestions.length + 1 }}/7
              </v-btn>

              <AdminQuestionLibrary
                v-if="
                    !challenge.published_at &&
                    selectedQuestions.length < 7
                "
                class="mt-3"
                :challenge-id="challenge.id"
                :existing-ids="
                    selectedQuestions.map(
                    item => item.question.id
                    )
                "
                @added="onLibraryQuestionAdded"
                />
              <div
                v-if="selectedQuestions.length === 7"
                class="complete-message"
              >
                <v-icon size="18">
                  mdi-check-circle-outline
                </v-icon>

                Izazov ima svih sedam pitanja.
              </div>

            </template>
          </div>
        </article>
      </div>

      <!-- STRANIČENJE -->

      <div
        v-if="totalChallenges > pageSize"
        class="pagination"
      >
        <v-btn
          icon="mdi-chevron-left"
          variant="outlined"
          aria-label="Prethodna stranica"
          :disabled="page === 0 || loading"
          @click="changePage(-1)"
        />

        <span>
          Stranica {{ page + 1 }} od {{ totalPages }}
        </span>

        <v-btn
          icon="mdi-chevron-right"
          variant="outlined"
          aria-label="Sljedeća stranica"
          :disabled="
            page + 1 >= totalPages ||
            loading
          "
          @click="changePage(1)"
        />
      </div>

      <v-btn
        to="/"
        variant="outlined"
        prepend-icon="mdi-arrow-left"
        class="mt-8"
      >
        Povratak na igru
      </v-btn>

      <!-- NOVI IZAZOV -->

      <v-dialog
        v-model="createDialog"
        max-width="480"
        :persistent="creating"
      >
        <v-card class="dialog-card pa-5">

          <h2>Novi dnevni izazov</h2>

          <p class="muted mb-5">
            Odaberi datum za koji želiš pripremiti pitanja.
          </p>

          <v-alert
            v-if="createError"
            type="error"
            variant="tonal"
            class="mb-4"
          >
            {{ createError }}
          </v-alert>

          <v-text-field
            v-model="newDate"
            label="Datum izazova"
            type="date"
            variant="outlined"
            :min="today"
          />

          <div class="dialog-actions">
            <v-btn
              variant="outlined"
              :disabled="creating"
              @click="createDialog = false"
            >
              Odustani
            </v-btn>

            <v-btn
              color="primary"
              variant="flat"
              :loading="creating"
              :disabled="!newDate"
              @click="createChallenge"
            >
              Kreiraj izazov
            </v-btn>
          </div>

        </v-card>
      </v-dialog>

      <!-- OBRAZAC PITANJA -->

      <AdminQuestionForm
        v-if="questionDialog && selectedId !== null"
        :question="editingQuestion"
        :challenge-id="selectedId"
        @close="closeQuestionForm"
        @saved="onQuestionSaved"
      />

      <v-snackbar
        v-model="snackbar"
        color="success"
        :timeout="3500"
      >
        {{ snackbarMessage }}
      </v-snackbar>

    </template>

  </v-container>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick
} from 'vue'

import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useAdminStore } from '@/stores/adminStore'

import AdminQuestionForm
  from '@/components/admin/AdminQuestionForm.vue'

import AdminQuestionActions
  from '@/components/admin/AdminQuestionActions.vue'

import AdminQuestionLibrary
  from '@/components/admin/AdminQuestionLibrary.vue'

import AdminChallengeActions
  from '@/components/admin/AdminChallengeActions.vue'

import AdminChallengeCalendar
  from '@/components/admin/AdminChallengeCalendar.vue'

import AdminChallengePublish
  from '@/components/admin/AdminChallengePublish.vue'

const authStore = useAuthStore()
const adminStore = useAdminStore()

// =========================================
// STANJE
// =========================================

const challenges = ref([])
const calendarVersion = ref(0)
const publicationClock = ref(Date.now())
let publicationInterval = null
const calendarOpening = ref(false)
const selectedQuestions = ref([])
const selectedId = ref(null)

const loading = ref(false)
const questionsLoading = ref(false)

const errorMessage = ref('')
const questionsError = ref('')

const page = ref(0)
const pageSize = 20
const totalChallenges = ref(0)

const createDialog = ref(false)
const creating = ref(false)
const createError = ref('')
const newDate = ref('')

const questionDialog = ref(false)
const editingQuestion = ref(null)

const snackbar = ref(false)
const snackbarMessage = ref('')

let challengeRequest = 0
let questionRequest = 0
let createRequest = 0

const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(totalChallenges.value / pageSize)
  )
)

// =========================================
// DATUM I FORMATIRANJE
// =========================================

function todayDate() {
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

const today = ref(todayDate())

function formatId(id) {
  return String(id).padStart(3, '0')
}

function formatDate(value) {
  return new Intl.DateTimeFormat('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Zagreb',
  }).format(
    new Date(`${value}T12:00:00Z`)
  )
}

function formatNumber(value) {
  if (value === null || value === undefined) {
    return '–'
  }

  return new Intl.NumberFormat('hr-HR', {
    maximumFractionDigits: 10,
  }).format(value)
}

function getStatus(challenge) {
  if (!challenge.published_at) {
    return 'draft'
  }

  return new Date(challenge.published_at).getTime()
    > publicationClock.value
    ? 'scheduled'
    : 'published'
}

function getStatusLabel(challenge) {
  const labels = {
    draft: 'Nacrt',
    scheduled: 'Zakazano',
    published: 'Objavljeno',
  }

  return labels[getStatus(challenge)]
}

function safeUrl(value) {
  if (!value) return null

  try {
    const url = new URL(value)

    return ['http:', 'https:'].includes(url.protocol)
      ? url.href
      : null

  } catch {
    return null
  }
}

function notify(message) {
  snackbarMessage.value = message
  snackbar.value = true

  calendarVersion.value++
}

// =========================================
// DOHVAT IZAZOVA
// =========================================

function closeChallenge() {
  questionRequest++

  selectedId.value = null
  selectedQuestions.value = []
  questionsLoading.value = false
  questionsError.value = ''
}

async function loadChallenges() {
  if (!adminStore.isAdmin || !supabase) {
    return
  }

  const request = ++challengeRequest

  closeChallenge()

  loading.value = true
  errorMessage.value = ''
  challenges.value = []

  const from = page.value * pageSize

  try {
    const { data, error, count } = await supabase
      .from('daily_challenges')
      .select(
        `id, challenge_date, published_at,
          items:daily_challenge_questions (
            question:questions (is_active)
          )`,
        { count: 'exact' }
      )
      .order('challenge_date', {
        ascending: true,
      })
      .range(from, from + pageSize - 1)

    if (
      request !== challengeRequest ||
      !adminStore.isAdmin
    ) {
      return
    }

    if (error) throw error

    challenges.value = data || []
    totalChallenges.value = count || 0

  } catch (error) {
    if (request === challengeRequest) {
      errorMessage.value =
        error.message ||
        'Dohvat izazova nije uspio.'
    }

  } finally {
    if (request === challengeRequest) {
      loading.value = false
    }
  }
}

// =========================================
// DOHVAT PITANJA
// =========================================

async function loadQuestions(challengeId) {
  if (!adminStore.isAdmin) return

  const request = ++questionRequest

  selectedId.value = challengeId
  selectedQuestions.value = []
  questionsError.value = ''
  questionsLoading.value = true

  try {
    const { data, error } = await supabase
      .from('daily_challenge_questions')
      .select(`
        position,
        question:questions (
          id,
          category_id,
          question,
          answer,
          unit,
          unit_label,
          min_value,
          max_value,
          step,
          image_url,
          image_alt,
          explanation,
          source_url,
          is_active,
          category:categories (
            id,
            name
          )
        )
      `)
      .eq('challenge_id', challengeId)
      .order('position')

    if (
      request !== questionRequest ||
      !adminStore.isAdmin
    ) {
      return
    }

    if (error) throw error

    selectedQuestions.value =
      (data || []).filter(item => item.question)

    // Osvježi broj pitanja i na zatvorenoj kartici.
    const challenge = challenges.value.find(
      item => item.id === challengeId
    )

    if (challenge) {
      challenge.items = (data || []).map(item => ({
        question: item.question
          ? { is_active: item.question.is_active }
          : null,
      }))
    }

  } catch (error) {
    if (request === questionRequest) {
      questionsError.value =
        error.message ||
        'Dohvat pitanja nije uspio.'
    }

  } finally {
    if (request === questionRequest) {
      questionsLoading.value = false
    }
  }
}

function toggleChallenge(challenge) {
  if (selectedId.value === challenge.id) {
    closeChallenge()
  } else {
    loadQuestions(challenge.id)
  }
}

// =========================================
// NOVI IZAZOV
// =========================================

function openCreateDialog(date = '') {
  today.value = todayDate()

  newDate.value =
    typeof date === 'string'
      ? date
      : ''

  createError.value = ''
  createDialog.value = true
}

async function createChallenge() {
  if (
    !adminStore.isAdmin ||
    creating.value ||
    !newDate.value
  ) {
    return
  }

  const request = ++createRequest
  const date = newDate.value

  creating.value = true
  createError.value = ''

  try {
    const { data, error } = await supabase.rpc(
      'admin_create_challenge',
      {
        p_date: date,
      }
    )

    if (
      request !== createRequest ||
      !adminStore.isAdmin
    ) {
      return
    }

    if (error) throw error

    createDialog.value = false

    notify('Novi izazov uspješno je kreiran.')

    // Pronalazimo stranicu na kojoj se
    // nalazi novokreirani izazov.

    const result = await supabase
      .from('daily_challenges')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .lt('challenge_date', date)

    if (
      request !== createRequest ||
      !adminStore.isAdmin
    ) {
      return
    }

    if (!result.error) {
      page.value = Math.floor(
        (result.count || 0) / pageSize
      )
    }

    await loadChallenges()

    if (
      request === createRequest &&
      adminStore.isAdmin &&
      challenges.value.some(
        challenge =>
          String(challenge.id) === String(data)
      )
    ) {
      const challenge = challenges.value.find(
        item => String(item.id) === String(data)
      )

      await loadQuestions(challenge.id)
    }

  } catch (error) {
    if (request === createRequest) {
      createError.value =
        error.message ||
        'Kreiranje izazova nije uspjelo.'
    }

  } finally {
    if (request === createRequest) {
      creating.value = false
    }
  }
}

// =========================================
// DODAVANJE I UREĐIVANJE PITANJA
// =========================================

function openQuestionForm(question) {
  if (!adminStore.isAdmin) return

  editingQuestion.value = question
  questionDialog.value = true
}

function closeQuestionForm() {
  questionDialog.value = false
  editingQuestion.value = null
}

async function onQuestionSaved() {
  const challengeId = selectedId.value

  closeQuestionForm()

  if (!adminStore.isAdmin) return

  notify('Pitanje je uspješno spremljeno.')

  if (challengeId !== null) {
    await loadQuestions(challengeId)
  }
}

async function onQuestionOrderChanged(
  challengeId,
  action
) {
  if (!adminStore.isAdmin) return

  if (action === 'remove') {
    notify('Pitanje je uklonjeno iz izazova.')
  } else if (
    action === 'up' ||
    action === 'down'
  ) {
    notify('Redoslijed pitanja je spremljen.')
  }

  if (selectedId.value === challengeId) {
    await loadQuestions(challengeId)
  }
}

async function onLibraryQuestionAdded(challengeId) {
  if (!adminStore.isAdmin) return

  notify('Pitanje je dodano iz baze.')

  if (selectedId.value === challengeId) {
    await loadQuestions(challengeId)
  }
}


async function onChallengeChanged(result) {
  if (!adminStore.isAdmin) return

  // BRISANJE IZAZOVA

  if (result.action === 'delete') {
    notify('Nacrt izazova je obrisan.')

    const remaining = Math.max(
      0,
      totalChallenges.value - 1
    )

    const lastPage = Math.max(
      0,
      Math.ceil(remaining / pageSize) - 1
    )

    page.value = Math.min(
      page.value,
      lastPage
    )

    await loadChallenges()

    return
  }

  // PROMJENA DATUMA

  if (result.action === 'reschedule') {
    notify('Datum izazova je promijenjen.')

    const { count, error } = await supabase
      .from('daily_challenges')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .lt('challenge_date', result.date)

    if (!adminStore.isAdmin) return

    if (!error) {
      page.value = Math.floor(
        (count || 0) / pageSize
      )
    }

    await loadChallenges()

    if (!adminStore.isAdmin) return

    const challenge = challenges.value.find(
      item =>
        String(item.id) ===
        String(result.challengeId)
    )

    if (challenge) {
      await loadQuestions(challenge.id)
    }
  }
}


async function onPublicationChanged(result) {
  if (!adminStore.isAdmin) return

  const userId = authStore.userId
  const openId = selectedId.value
  const messages = {
    publish_now: 'Današnji izazov je objavljen.',
    schedule: 'Objava izazova uspješno je zakazana.',
    cancel: 'Izazov je ponovno spremljen kao nacrt.',
  }

  publicationClock.value = Date.now()
  notify(messages[result.action] || 'Objava je spremljena.')

  const reload = loadChallenges()
  const request = challengeRequest
  await reload

  if (
    request !== challengeRequest ||
    !adminStore.isAdmin ||
    authStore.userId !== userId ||
    selectedId.value !== null
  ) return

  const openChallenge = challenges.value.find(item => item.id === openId)
  if (openChallenge) await loadQuestions(openChallenge.id)
}

async function onCalendarSelect(day) {
  if (
    !adminStore.isAdmin ||
    calendarOpening.value ||
    loading.value ||
    questionsLoading.value ||
    creating.value
  ) {
    return
  }

  // Ako nema izazova,
  // otvaramo obrazac za novi izazov.

  if (!day.challenge) {
    openCreateDialog(day.date)
    return
  }

  // Ako izazov postoji,
  // pronalazimo njegovu stranicu u popisu.

  const userId = authStore.userId
  const request = challengeRequest

  calendarOpening.value = true
  errorMessage.value = ''

  try {
    const { count, error } = await supabase
      .from('daily_challenges')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .lt('challenge_date', day.date)

    if (
      !adminStore.isAdmin ||
      authStore.userId !== userId ||
      request !== challengeRequest
    ) {
      return
    }

    if (error) throw error

    page.value = Math.floor(
      (count || 0) / pageSize
    )

    await loadChallenges()

    if (
      !adminStore.isAdmin ||
      authStore.userId !== userId
    ) {
      return
    }

    const challenge = challenges.value.find(
      item =>
        String(item.id) ===
        String(day.challenge.id)
    )

    if (!challenge) {
      throw new Error(
        'Izazov više nije dostupan na ovom datumu.'
      )
    }

    await loadQuestions(challenge.id)

    await nextTick()

    if (
      !adminStore.isAdmin ||
      authStore.userId !== userId ||
      selectedId.value !== challenge.id
    ) {
      return
    }

    const element = document.getElementById(
      'admin-challenge-' + challenge.id
    )

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }

  } catch (error) {
    if (
      adminStore.isAdmin &&
      authStore.userId === userId
    ) {
      errorMessage.value =
        error.message ||
        'Otvaranje izazova nije uspjelo.'
    }

  } finally {
    calendarOpening.value = false
  }
}


// =========================================
// STRANIČENJE
// =========================================

function changePage(direction) {
  const nextPage = page.value + direction

  if (
    loading.value ||
    nextPage < 0 ||
    nextPage >= totalPages.value
  ) {
    return
  }

  page.value = nextPage
  loadChallenges()
}

// =========================================
// INICIJALIZACIJA I SIGURNOST
// =========================================

watch(
  () => adminStore.isAdmin,
  allowed => {
    if (allowed) {
      page.value = 0
      loadChallenges()

    } else {
      challengeRequest++
      questionRequest++
      createRequest++

      closeChallenge()
      closeQuestionForm()

      challenges.value = []
      totalChallenges.value = 0
      loading.value = false
      creating.value = false
      createDialog.value = false
      createError.value = ''
      errorMessage.value = ''
      snackbar.value = false
      page.value = 0
    }
  },
  { immediate: true }
)

onMounted(() => {
  publicationInterval = window.setInterval(() => {
    publicationClock.value = Date.now()
    const newToday = todayDate()
    if (today.value !== newToday) {
      today.value = newToday
      calendarVersion.value++
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (publicationInterval !== null) {
    window.clearInterval(publicationInterval)
  }
  challengeRequest++
  questionRequest++
  createRequest++
})
</script>

<style scoped>
.admin-page {
  max-width: 1000px;
  margin: 0 auto;
  padding-top: 40px;
  padding-bottom: 64px;
}

.admin-heading,
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

h1 {
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 700;
  letter-spacing: -2px;
  line-height: 1.1;
  margin-bottom: 10px;
}

.eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #66645d;
  margin-bottom: 6px;
}

.muted {
  color: #66645d;
  font-size: 14px;
}

.admin-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #181818;
  color: #facc15;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #facc15;
  border: 2px solid #181818;
  border-radius: 16px;
  padding: 24px;
  margin: 32px 0;
}

.summary-value {
  font-size: 36px;
  line-height: 1.2;
}

.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.challenge-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.challenge-card {
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 14px;
  overflow: hidden;
}

.challenge-open {
  border-color: #181818;
}

.challenge-header {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 20px;
  text-align: left;
  color: #181818;
  cursor: pointer;
}

.challenge-header:hover {
  background: #f4f1e7;
}

.challenge-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 62px;
  height: 52px;
  padding: 8px;
  background: #facc15;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 700;
}

.challenge-info {
  flex: 1;
  min-width: 0;
}

.status-badge {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.draft {
  background: #edeae0;
  color: #66645d;
}

.scheduled {
  background: #fef3c7;
  color: #92400e;
}

.published {
  background: #dcfce7;
  color: #15803d;
}

.challenge-content {
  border-top: 1px solid #d8d5ca;
  padding: 20px;
}

.question-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid #e5e2d8;
}

.question-position {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0ede3;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  font-weight: 700;
  flex-shrink: 0;
}

.question-details {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.question-details h4 {
  font-size: 18px;
  margin-bottom: 8px;
}

.answer-line {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #15803d;
  font-size: 14px;
}

.range-line {
  color: #66645d;
  font-size: 13px;
  margin-top: 5px;
}

.question-extra {
  margin-top: 12px;
  color: #66645d;
  font-size: 13px;
}

.question-extra summary {
  cursor: pointer;
  font-weight: 600;
}

.question-extra p {
  margin-top: 8px;
}

.question-extra a {
  display: inline-block;
  margin-top: 8px;
  color: #181818;
}

.question-count {
  padding: 6px 12px;
  border-radius: 6px;
  background: #edeae0;
  font-weight: 700;
  font-size: 14px;
}

.question-count.complete {
  background: #dcfce7;
  color: #15803d;
}

.complete-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  color: #15803d;
  font-size: 14px;
  font-weight: 600;
}

.inactive-label {
  color: #dc2626;
  font-size: 12px;
  margin-top: 8px;
}

.empty-questions {
  text-align: center;
  color: #66645d;
  padding: 20px;
}

.state-card {
  text-align: center;
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 12px;
  padding: 32px 20px;
  margin: 20px 0;
}

.state-card h2,
.state-card p {
  margin: 16px 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.dialog-card {
  background: #fffdf6;
  border-radius: 16px !important;
}

.dialog-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .admin-page {
    padding-top: 24px;
  }

  .admin-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-heading {
    flex-wrap: wrap;
  }

  .challenge-header {
    gap: 8px;
    padding: 12px;
  }

  .challenge-number {
    min-width: 44px;
    height: 44px;
    font-size: 14px;
  }

  .challenge-info h3 {
    font-size: 15px;
  }

  .challenge-info span {
    font-size: 11px;
  }

  .status-badge {
    font-size: 10px;
    padding: 5px 6px;
  }

  .challenge-content {
    padding: 12px;
  }

  .question-row {
    gap: 8px;
  }

  .question-position {
    width: 26px;
    height: 26px;
    font-size: 12px;
  }

  .question-details h4 {
    font-size: 16px;
  }
}
</style>
