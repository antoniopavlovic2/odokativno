
<template>
  <div class="question-actions">

    <!-- POMAKNI GORE -->

    <v-btn
      icon="mdi-arrow-up"
      size="small"
      variant="outlined"
      class="action-button"
      aria-label="Pomakni pitanje gore"
      title="Pomakni gore"
      :disabled="busy || index === 0"
      @click="changeQuestion('up')"
    />

    <!-- POMAKNI DOLJE -->

    <v-btn
      icon="mdi-arrow-down"
      size="small"
      variant="outlined"
      class="action-button"
      aria-label="Pomakni pitanje dolje"
      title="Pomakni dolje"
      :disabled="busy || index >= count - 1"
      @click="changeQuestion('down')"
    />

    <!-- UREDI PITANJE -->

    <v-btn
      icon="mdi-pencil-outline"
      size="small"
      variant="outlined"
      class="action-button"
      aria-label="Uredi pitanje"
      title="Uredi pitanje"
      :disabled="busy"
      @click="emit('edit')"
    />

    <!-- UKLONI PITANJE -->

    <v-btn
      icon="mdi-trash-can-outline"
      size="small"
      variant="outlined"
      color="error"
      class="action-button"
      aria-label="Ukloni pitanje iz izazova"
      title="Ukloni pitanje"
      :disabled="busy"
      @click="confirmDialog = true"
    />

    <!-- POTVRDA UKLANJANJA -->

    <v-dialog
      v-model="confirmDialog"
      max-width="460"
      :persistent="busy"
    >
      <v-card class="confirm-card pa-6">

        <div class="confirm-icon">
          <v-icon size="32">
            mdi-trash-can-outline
          </v-icon>
        </div>

        <h2>Ukloni pitanje?</h2>

        <p class="question-preview">
          {{ questionText }}
        </p>

        <p class="description">
          Pitanje će biti uklonjeno iz ovog
          dnevnog izazova, ali će ostati
          spremljeno u bazi pitanja.
        </p>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ errorMessage }}
        </v-alert>

        <div class="confirm-actions">
          <v-btn
            variant="outlined"
            :disabled="busy"
            @click="confirmDialog = false"
          >
            Odustani
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            :loading="busy"
            @click="changeQuestion('remove')"
          >
            Ukloni pitanje
          </v-btn>
        </div>

      </v-card>
    </v-dialog>

    <!-- GREŠKA -->

    <v-snackbar
      v-model="showError"
      color="error"
      :timeout="5000"
    >
      {{ errorMessage }}
    </v-snackbar>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

import { supabase } from '@/services/supabase'
import { useAdminStore } from '@/stores/adminStore'

const props = defineProps({
  challengeId: {
    type: [Number, String],
    required: true,
  },

  questionId: {
    type: [Number, String],
    required: true,
  },

  questionText: {
    type: String,
    required: true,
  },

  index: {
    type: Number,
    required: true,
  },

  count: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits([
  'edit',
  'changed',
])

const adminStore = useAdminStore()

const busy = ref(false)
const confirmDialog = ref(false)
const showError = ref(false)
const errorMessage = ref('')

// =========================================
// PROMJENA PITANJA
// =========================================

async function changeQuestion(action) {
  if (
    busy.value ||
    !adminStore.isAdmin ||
    !supabase
  ) {
    return
  }

  if (action === 'up' && props.index === 0) {
    return
  }

  if (
    action === 'down' &&
    props.index >= props.count - 1
  ) {
    return
  }

  const challengeId = props.challengeId
  const questionId = props.questionId

  busy.value = true
  errorMessage.value = ''
  showError.value = false

  try {
    const { data, error } = await supabase.rpc(
      'admin_change_challenge_question',
      {
        p_challenge_id: challengeId,
        p_question_id: questionId,
        p_action: action,
      }
    )

    if (error) throw error

    if (!adminStore.isAdmin) {
      return
    }

    confirmDialog.value = false

    emit(
      'changed',
      challengeId,
      data === true ? action : 'refresh'
    )

  } catch (error) {
    errorMessage.value =
      error.message ||
      'Promjena pitanja nije uspjela.'

    if (!confirmDialog.value) {
      showError.value = true
    }

  } finally {
    busy.value = false
  }
}

watch(confirmDialog, opened => {
  if (opened) {
    errorMessage.value = ''
    showError.value = false
  }
})
</script>

<style scoped>
.question-actions {
  display: grid;
  grid-template-columns: repeat(4, 34px);
  gap: 6px;
  flex-shrink: 0;
  align-items: center;
}

.action-button {
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 8px;
}

.confirm-card {
  background: #fffdf6;
  color: #181818;
  border-radius: 16px !important;
}

.confirm-card h2 {
  font-size: 26px;
  letter-spacing: -0.8px;
  margin-bottom: 12px;
}

.confirm-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: #fee2e2;
  color: #dc2626;
  margin-bottom: 20px;
}

.question-preview {
  background: #f8f6ed;
  border: 1px solid #d8d5ca;
  padding: 14px;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 16px;
  overflow-wrap: anywhere;
}

.description {
  color: #66645d;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.confirm-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .question-actions {
    grid-template-columns: repeat(2, 36px);
    gap: 5px;
  }

  .action-button {
    width: 36px;
    height: 36px;
  }
}
</style>
