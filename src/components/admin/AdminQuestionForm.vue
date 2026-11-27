
<template>
  <v-dialog
    :model-value="true"
    max-width="760"
    persistent
    scrollable
  >
    <v-card class="question-form">

      <v-card-title class="form-heading">
        <div>
          <div class="eyebrow">
            ODOKATIVNO. / ADMIN
          </div>

          <h2>
            {{ question ? 'Uredi pitanje' : 'Novo pitanje' }}
          </h2>
        </div>

        <v-btn
          icon="mdi-close"
          variant="text"
          aria-label="Zatvori"
          :disabled="saving || categorySaving"
          @click="emit('close')"
        />
      </v-card-title>

      <v-divider />

      <v-card-text>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ errorMessage }}
        </v-alert>

        <form
          id="admin-question-form"
          @submit.prevent="saveQuestion"
        >

          <v-textarea
            v-model="form.question"
            label="Tekst pitanja"
            variant="outlined"
            rows="3"
            maxlength="500"
            counter
            required
          />

          <v-select
            v-model="form.category_id"
            :items="categories"
            item-title="name"
            item-value="id"
            label="Kategorija"
            variant="outlined"
            :loading="categoriesLoading"
          />

          <v-btn
            variant="text"
            prepend-icon="mdi-plus"
            class="mb-4"
            @click="showCategory = !showCategory"
          >
            Nova kategorija
          </v-btn>

          <div
            v-if="showCategory"
            class="category-form"
          >
            <v-text-field
              v-model="categoryName"
              label="Naziv kategorije"
              variant="outlined"
              maxlength="80"
            />

            <v-btn
              color="primary"
              elevation="0"
              :loading="categorySaving"
              :disabled="saving || !categoryName.trim()"
              @click="createCategory"
            >
              Dodaj
            </v-btn>
          </div>

          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.answer"
                label="Točan odgovor"
                type="number"
                step="any"
                variant="outlined"
                required
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.unit"
                label="Mjerna jedinica"
                placeholder="km, m, kg, %..."
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.unit_label"
                label="Puni naziv mjerne jedinice"
                placeholder="kilometara, metara..."
                variant="outlined"
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="form.min_value"
                label="Minimalna vrijednost"
                type="number"
                step="any"
                variant="outlined"
                required
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="form.max_value"
                label="Maksimalna vrijednost"
                type="number"
                step="any"
                variant="outlined"
                required
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.step"
                label="Korak slidera"
                type="number"
                step="any"
                variant="outlined"
                hint="Primjer: 1, 5, 10 ili 0.1"
                persistent-hint
                required
              />
            </v-col>
          </v-row>

          <!-- PREGLED RASPONA -->

          <div
            v-if="validPreview"
            class="range-preview"
          >
            <div class="preview-label">
              PREGLED RASPONA
            </div>

            <strong>{{ form.question }}</strong>

            <div class="preview-track">
              <div
                class="preview-marker"
                :style="{
                  left: answerPosition + '%'
                }"
              />
            </div>

            <div class="preview-values">
              <span>
                {{ form.min_value }} {{ form.unit }}
              </span>

              <span>
                {{ form.max_value }} {{ form.unit }}
              </span>
            </div>

            <div class="preview-answer">
              Točan odgovor:
              {{ form.answer }} {{ form.unit }}
            </div>
          </div>

          <v-textarea
            v-model="form.explanation"
            label="Objašnjenje odgovora"
            variant="outlined"
            rows="4"
          />

          <v-text-field
            v-model="form.source_url"
            label="Izvor informacije"
            placeholder="https://..."
            variant="outlined"
          />

          <v-text-field
            v-model="form.image_url"
            label="URL fotografije"
            placeholder="https://..."
            variant="outlined"
          />

          <v-text-field
            v-model="form.image_alt"
            label="Opis fotografije"
            variant="outlined"
          />

          <v-switch
            v-model="form.is_active"
            color="success"
            label="Aktivno pitanje"
            inset
            hide-details
          />

        </form>

      </v-card-text>

      <v-divider />

      <v-card-actions class="form-actions">
        <v-btn
          variant="outlined"
          :disabled="saving || categorySaving"
          @click="emit('close')"
        >
          Odustani
        </v-btn>

        <v-spacer />

        <v-btn
          type="submit"
          form="admin-question-form"
          color="primary"
          variant="flat"
          prepend-icon="mdi-content-save-outline"
          :loading="saving"
          :disabled="categorySaving || categoriesLoading"
        >
          Spremi pitanje
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
} from 'vue'

import { supabase } from '@/services/supabase'
import { useAdminStore } from '@/stores/adminStore'

const props = defineProps({
  question: {
    type: Object,
    default: null,
  },
  challengeId: {
    type: [Number, String],
    required: true,
  },
})

const emit = defineEmits([
  'close',
  'saved',
])

const adminStore = useAdminStore()

const question = computed(() => props.question)
const categories = ref([])
const categoriesLoading = ref(true)

const saving = ref(false)
const categorySaving = ref(false)

const errorMessage = ref('')

const showCategory = ref(false)
const categoryName = ref('')

const form = reactive({
  category_id:
    question.value?.category?.id ||
    question.value?.category_id ||
    null,

  question: question.value?.question ?? '',
  answer: question.value?.answer ?? '',
  unit: question.value?.unit ?? '',
  unit_label: question.value?.unit_label ?? '',
  min_value: question.value?.min_value ?? '',
  max_value: question.value?.max_value ?? '',
  step: question.value?.step ?? 1,
  image_url: question.value?.image_url ?? '',
  image_alt: question.value?.image_alt ?? '',
  explanation: question.value?.explanation ?? '',
  source_url: question.value?.source_url ?? '',
  is_active: question.value?.is_active ?? true,
})

function numberValue(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  ) {
    return NaN
  }

  return Number(value)
}

const validPreview = computed(() => {
  const min = numberValue(form.min_value)
  const max = numberValue(form.max_value)
  const answer = numberValue(form.answer)

  return (
    [min, max, answer].every(Number.isFinite) &&
    max > min &&
    answer >= min &&
    answer <= max
  )
})

const answerPosition = computed(() => {
  if (!validPreview.value) return 0

  return (
    (
      Number(form.answer) -
      Number(form.min_value)
    ) /
    (
      Number(form.max_value) -
      Number(form.min_value)
    )
  ) * 100
})

// =========================================
// KATEGORIJE
// =========================================

async function loadCategories() {
  if (!adminStore.isAdmin) {
    categoriesLoading.value = false
    return
  }

  categoriesLoading.value = true

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name')

    if (error) throw error

    categories.value = data || []

  } catch (error) {
    errorMessage.value =
      error.message ||
      'Dohvat kategorija nije uspio.'

  } finally {
    categoriesLoading.value = false
  }
}

async function createCategory() {
  if (
    !adminStore.isAdmin ||
    categorySaving.value ||
    saving.value
  ) {
    return
  }

  categorySaving.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase.rpc(
      'admin_create_category',
      {
        p_name: categoryName.value.trim(),
      }
    )

    if (error) throw error

    await loadCategories()

    form.category_id = data

    categoryName.value = ''
    showCategory.value = false

  } catch (error) {
    errorMessage.value =
      error.message ||
      'Dodavanje kategorije nije uspjelo.'

  } finally {
    categorySaving.value = false
  }
}

// =========================================
// SPREMANJE PITANJA
// =========================================

async function saveQuestion() {
  if (
    !adminStore.isAdmin ||
    saving.value ||
    categorySaving.value ||
    categoriesLoading.value
  ) {
    return
  }

  errorMessage.value = ''

  if (form.question.trim().length < 5) {
    errorMessage.value =
      'Unesi tekst pitanja.'
    return
  }

  if (!form.category_id) {
    errorMessage.value =
      'Odaberi kategoriju.'
    return
  }

  if (!validPreview.value) {
    errorMessage.value =
      'Točan odgovor mora biti unutar ispravnog raspona.'
    return
  }

  const step = numberValue(form.step)

  if (
    !Number.isFinite(step) ||
    step <= 0 ||
    step >
      Number(form.max_value) -
      Number(form.min_value)
  ) {
    errorMessage.value =
      'Neispravan korak slidera.'
    return
  }

  saving.value = true

  const payload = {
    ...form,
    answer: Number(form.answer),
    min_value: Number(form.min_value),
    max_value: Number(form.max_value),
    step,
  }

  try {
    let result

    if (question.value) {
        result = await supabase.rpc(
            'admin_save_question',
            {
            p_id: question.value.id,
            p_data: payload,
            }
    )} else {
      result = await supabase.rpc(
        'admin_add_challenge_question',
        {
          p_challenge_id: props.challengeId,
          p_data: payload,
        }
      )
    }

    if (result.error) {
      throw result.error
    }

    emit('saved')

  } catch (error) {
    errorMessage.value =
      error.message ||
      'Spremanje pitanja nije uspjelo.'

  } finally {
    saving.value = false
  }
}

onMounted(loadCategories)
</script>

<style scoped>
.question-form {
  background: #fffdf6;
  color: #181818;
  border-radius: 16px !important;
}

.form-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 24px;
  white-space: normal;
}

.form-heading h2 {
  font-size: 26px;
  letter-spacing: -1px;
}

.eyebrow {
  color: #66645d;
  font-size: 11px;
  letter-spacing: 1.2px;
  font-weight: 700;
}

.category-form {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.range-preview {
  background: #f8f6ed;
  border: 1px solid #d8d5ca;
  border-radius: 12px;
  padding: 20px;
  margin: 8px 0 24px;
}

.preview-label {
  font-size: 11px;
  letter-spacing: 1px;
  font-weight: 700;
  color: #66645d;
  margin-bottom: 12px;
}

.preview-track {
  position: relative;
  height: 8px;
  background: #facc15;
  border-radius: 8px;
  margin: 28px 0 14px;
}

.preview-marker {
  position: absolute;
  top: -6px;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  background: #16a34a;
  border: 2px solid #fff;
  border-radius: 50%;
}

.preview-values {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.preview-answer {
  color: #15803d;
  font-weight: 700;
  margin-top: 16px;
}

.form-actions {
  padding: 16px;
}

@media (max-width: 600px) {
  .form-heading {
    padding: 16px;
  }

  .form-heading h2 {
    font-size: 22px;
  }

  .category-form {
    flex-direction: column;
  }
}
</style>
