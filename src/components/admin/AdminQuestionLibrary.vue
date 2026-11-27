
<template>
  <div class="library-wrapper">

    <v-btn
      variant="outlined"
      prepend-icon="mdi-database-outline"
      :block="selectionMode"
      @click="opened = true"
    >
      {{
        selectionMode
          ? 'Odaberi iz baze'
          : 'Baza svih pitanja'
      }}
    </v-btn>

    <v-dialog
      v-model="opened"
      max-width="850"
      scrollable
      :persistent="savingId !== null"
    >
      <v-card class="library-card">

        <v-card-title class="library-heading">
          <div>
            <div class="eyebrow">
              ODOKATIVNO. / ADMIN
            </div>

            <h2>
              {{
                selectionMode
                  ? 'Odaberi pitanje'
                  : 'Baza svih pitanja'
              }}
            </h2>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            aria-label="Zatvori"
            :disabled="savingId !== null"
            @click="opened = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text>

          <form
            class="search-form"
            @submit.prevent="applySearch"
          >
            <v-text-field
              v-model="search"
              label="Pretraži pitanja"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              clearable
              :disabled="savingId !== null"
            />

            <v-btn
              type="submit"
              color="primary"
              elevation="0"
              :disabled="savingId !== null"
            >
              Pretraži
            </v-btn>
          </form>

          <div class="library-summary">
            Pronađeno pitanja: {{ totalQuestions }}
          </div>

          <v-alert
            v-if="selectionMode"
            type="info"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            Odaberi postojeće pitanje koje želiš
            dodati u ovaj izazov.
          </v-alert>

          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mb-4"
          >
            {{ errorMessage }}
          </v-alert>

          <!-- UČITAVANJE -->

          <div v-if="loading" class="empty-state">
            <v-progress-circular
              indeterminate
              color="primary"
            />

            <p>Učitavanje pitanja...</p>
          </div>

          <!-- PRAZAN REZULTAT -->

          <div
            v-else-if="!questions.length"
            class="empty-state"
          >
            <v-icon size="42">
              mdi-database-search-outline
            </v-icon>

            <p>Nema pitanja za prikaz.</p>
          </div>

          <!-- POPIS PITANJA -->

          <div v-else class="question-list">

            <article
              v-for="item in questions"
              :key="item.id"
              class="library-question"
            >

              <div class="question-heading">
                <div class="eyebrow">
                  #{{ formatId(item.id) }}
                  ·
                  {{ item.category?.name || 'Bez kategorije' }}
                </div>

                <span
                  class="status-label"
                  :class="{
                    inactive: !item.is_active
                  }"
                >
                  {{
                    item.is_active
                      ? 'Aktivno'
                      : 'Neaktivno'
                  }}
                </span>
              </div>

              <h3>{{ item.question }}</h3>

              <div class="answer">
                <v-icon size="18">
                  mdi-check-circle-outline
                </v-icon>

                {{ formatNumber(item.answer) }}
                {{ item.unit }}
              </div>

              <div class="range">
                Raspon:
                {{ formatNumber(item.min_value) }}
                –
                {{ formatNumber(item.max_value) }}
                {{ item.unit }}
              </div>

              <div class="question-footer">

                <div class="usage-info">

                  <div
                    v-if="!item.usage?.length"
                    class="unused-label"
                  >
                    Nije dodijeljeno izazovu
                  </div>

                  <div v-else>
                    Broj izazova:
                    {{ item.usage.length }}
                  </div>

                  <div
                    v-if="hasPublishedUsage(item)"
                    class="used-warning"
                  >
                    Dio zakazanog ili objavljenog izazova
                  </div>

                </div>

                <v-btn
                  v-if="selectionMode"
                  :color="
                    alreadyAdded(item.id)
                      ? 'success'
                      : 'primary'
                  "
                  :variant="
                    alreadyAdded(item.id)
                      ? 'tonal'
                      : 'flat'
                  "
                  :prepend-icon="
                    alreadyAdded(item.id)
                      ? 'mdi-check'
                      : 'mdi-plus'
                  "
                  :loading="savingId === item.id"
                  :disabled="
                    alreadyAdded(item.id) ||
                    !item.is_active ||
                    savingId !== null ||
                    existingIds.length >= 7
                  "
                  @click="attachQuestion(item)"
                >
                  {{
                    alreadyAdded(item.id)
                      ? 'Dodano'
                      : 'Dodaj'
                  }}
                </v-btn>

              </div>

            </article>

          </div>

          <!-- STRANIČENJE -->

          <div
            v-if="totalPages > 1"
            class="pagination"
          >
            <v-btn
              icon="mdi-chevron-left"
              variant="outlined"
              aria-label="Prethodna stranica"
              :disabled="
                page === 0 ||
                loading ||
                savingId !== null
              "
              @click="changePage(-1)"
            />

            <span>
              {{ page + 1 }} / {{ totalPages }}
            </span>

            <v-btn
              icon="mdi-chevron-right"
              variant="outlined"
              aria-label="Sljedeća stranica"
              :disabled="
                page + 1 >= totalPages ||
                loading ||
                savingId !== null
              "
              @click="changePage(1)"
            />
          </div>

        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn
            variant="outlined"
            :disabled="savingId !== null"
            @click="opened = false"
          >
            Zatvori
          </v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>
  </div>
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
  challengeId: {
    type: [Number, String],
    default: null,
  },

  existingIds: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits([
  'added',
])

const adminStore = useAdminStore()

const opened = ref(false)
const loading = ref(false)
const savingId = ref(null)

const questions = ref([])
const errorMessage = ref('')

const search = ref('')
const appliedSearch = ref('')

const page = ref(0)
const pageSize = 20
const totalQuestions = ref(0)

let requestId = 0
let alive = true

const selectionMode = computed(() =>
  props.challengeId !== null
)

const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(totalQuestions.value / pageSize)
  )
)

// =========================================
// FORMATIRANJE
// =========================================

function formatId(id) {
  return String(id).padStart(3, '0')
}

function formatNumber(value) {
  if (value === null || value === undefined) {
    return '–'
  }

  return new Intl.NumberFormat('hr-HR', {
    maximumFractionDigits: 10,
  }).format(value)
}

function alreadyAdded(id) {
  return props.existingIds.some(
    existingId =>
      String(existingId) === String(id)
  )
}

function hasPublishedUsage(item) {
  return (item.usage || []).some(
    usage => Boolean(
      usage.challenge?.published_at
    )
  )
}

// =========================================
// DOHVAT PITANJA
// =========================================

async function loadQuestions() {
  if (
    !adminStore.isAdmin ||
    !supabase ||
    !opened.value
  ) {
    return
  }

  const request = ++requestId

  loading.value = true
  errorMessage.value = ''
  questions.value = []

  const from = page.value * pageSize

  try {
    let query = supabase
      .from('questions')
      .select(`
        id,
        question,
        answer,
        unit,
        min_value,
        max_value,
        is_active,
        category:categories (
          id,
          name
        ),
        usage:daily_challenge_questions (
          challenge_id,
          challenge:daily_challenges (
            challenge_date,
            published_at
          )
        )
      `, {
        count: 'exact',
      })

    if (appliedSearch.value) {
      query = query.ilike(
        'question',
        '%' + appliedSearch.value + '%'
      )
    }

    const { data, error, count } = await query
      .order('id', {
        ascending: false,
      })
      .range(
        from,
        from + pageSize - 1
      )

    if (
      request !== requestId ||
      !alive ||
      !adminStore.isAdmin ||
      !opened.value
    ) {
      return
    }

    if (error) throw error

    questions.value = data || []
    totalQuestions.value = count || 0

  } catch (error) {
    if (request === requestId && alive) {
      errorMessage.value =
        error.message ||
        'Dohvat pitanja nije uspio.'
    }

  } finally {
    if (request === requestId && alive) {
      loading.value = false
    }
  }
}

// =========================================
// PRETRAŽIVANJE I STRANIČENJE
// =========================================

function applySearch() {
  appliedSearch.value =
    (search.value || '').trim()

  page.value = 0

  loadQuestions()
}

function changePage(direction) {
  const nextPage = page.value + direction

  if (
    loading.value ||
    savingId.value !== null ||
    nextPage < 0 ||
    nextPage >= totalPages.value
  ) {
    return
  }

  page.value = nextPage

  loadQuestions()
}

// =========================================
// DODAVANJE U IZAZOV
// =========================================

async function attachQuestion(item) {
  if (
    !adminStore.isAdmin ||
    !selectionMode.value ||
    !supabase ||
    savingId.value !== null ||
    alreadyAdded(item.id) ||
    !item.is_active ||
    props.existingIds.length >= 7
  ) {
    return
  }

  const challengeId = props.challengeId

  savingId.value = item.id
  errorMessage.value = ''

  try {
    const { error } = await supabase.rpc(
      'admin_attach_question',
      {
        p_challenge_id: challengeId,
        p_question_id: item.id,
      }
    )

    if (error) throw error

    if (!alive || !adminStore.isAdmin) {
      return
    }

    opened.value = false

    emit('added', challengeId)

  } catch (error) {
    if (alive) {
      errorMessage.value =
        error.message ||
        'Dodavanje pitanja nije uspjelo.'
    }

  } finally {
    savingId.value = null
  }
}

// =========================================
// OTVARANJE I ZATVARANJE
// =========================================

watch(opened, value => {
  if (value) {
    page.value = 0
    search.value = ''
    appliedSearch.value = ''
    totalQuestions.value = 0

    loadQuestions()

  } else {
    requestId++

    questions.value = []
    errorMessage.value = ''
    loading.value = false
  }
})

onBeforeUnmount(() => {
  alive = false
  requestId++
})
</script>

<style scoped>
.library-card {
  background: #fffdf6;
  color: #181818;
  border-radius: 16px !important;
}

.library-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 24px;
  white-space: normal;
}

.library-heading h2 {
  font-size: 28px;
  letter-spacing: -1px;
}

.eyebrow {
  color: #66645d;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.library-summary {
  font-size: 13px;
  color: #66645d;
  margin-bottom: 16px;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.library-question {
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 12px;
  padding: 18px;
  overflow-wrap: anywhere;
}

.question-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.library-question h3 {
  font-size: 18px;
  line-height: 1.4;
  margin-bottom: 10px;
}

.status-label {
  color: #15803d;
  font-weight: 600;
  font-size: 11px;
}

.status-label.inactive {
  color: #dc2626;
}

.answer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  color: #15803d;
  font-weight: 700;
}

.range {
  margin-top: 5px;
  font-size: 13px;
  color: #66645d;
}

.question-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  border-top: 1px solid #e5e2d8;
  padding-top: 14px;
}

.usage-info {
  font-size: 12px;
  color: #66645d;
}

.unused-label {
  color: #15803d;
  font-weight: 600;
}

.used-warning {
  color: #92400e;
  margin-top: 4px;
}

.empty-state {
  text-align: center;
  padding: 40px 16px;
  color: #66645d;
}

.empty-state p {
  margin-top: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

@media (max-width: 600px) {
  .library-heading {
    padding: 16px;
  }

  .library-heading h2 {
    font-size: 23px;
  }

  .search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .library-question {
    padding: 14px;
  }

  .library-question h3 {
    font-size: 16px;
  }
}
</style>
