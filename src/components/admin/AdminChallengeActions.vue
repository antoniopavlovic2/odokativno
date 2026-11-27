
<template>
  <div class="challenge-actions">

    <v-btn
      variant="outlined"
      prepend-icon="mdi-calendar-edit"
      :disabled="busy"
      @click="openDialog('reschedule')"
    >
      Promijeni datum
    </v-btn>

    <v-btn
      variant="outlined"
      color="error"
      prepend-icon="mdi-trash-can-outline"
      :disabled="busy"
      @click="openDialog('delete')"
    >
      Obriši nacrt
    </v-btn>

    <!-- DIJALOG -->

    <v-dialog
      v-model="opened"
      max-width="500"
      :persistent="busy"
    >
      <v-card class="action-card pa-6">

        <div
          class="action-icon"
          :class="{ danger: isDelete }"
        >
          <v-icon size="32">
            {{
              isDelete
                ? 'mdi-trash-can-outline'
                : 'mdi-calendar-edit'
            }}
          </v-icon>
        </div>

        <h2>
          {{
            isDelete
              ? 'Obriši nacrt izazova?'
              : 'Promijeni datum izazova'
          }}
        </h2>

        <div class="challenge-preview">
          <strong>
            Izazov #{{ formatId(challenge.id) }}
          </strong>

          <span>
            {{ formatDate(challenge.challenge_date) }}
          </span>
        </div>

        <p v-if="isDelete" class="description">
          Dnevni izazov bit će trajno obrisan.
          Sva njegova pitanja ostat će spremljena
          u bazi pitanja i moći ćeš ih ponovno koristiti.
        </p>

        <template v-else>

          <p class="description">
            Odaberi novi datum dnevnog izazova.
            Sva pitanja i njihov redoslijed
            ostat će nepromijenjeni.
          </p>

          <v-text-field
            v-model="newDate"
            type="date"
            label="Novi datum"
            variant="outlined"
            :min="today"
            :disabled="busy"
          />

        </template>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ errorMessage }}
        </v-alert>

        <div class="dialog-actions">

          <v-btn
            variant="outlined"
            :disabled="busy"
            @click="opened = false"
          >
            Odustani
          </v-btn>

          <v-btn
            :color="isDelete ? 'error' : 'primary'"
            variant="flat"
            :loading="busy"
            :disabled="
              !isDelete &&
              (
                !newDate ||
                newDate < today ||
                newDate === challenge.challenge_date
              )
            "
            @click="saveAction"
          >
            {{
              isDelete
                ? 'Obriši izazov'
                : 'Spremi datum'
            }}
          </v-btn>

        </div>

      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onBeforeUnmount,
} from 'vue'

import { supabase } from '@/services/supabase'
import { useAdminStore } from '@/stores/adminStore'

const props = defineProps({
  challenge: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  'changed',
])

const adminStore = useAdminStore()

const opened = ref(false)
const busy = ref(false)
const action = ref('reschedule')

const newDate = ref('')
const today = ref('')
const errorMessage = ref('')

let alive = true

const isDelete = computed(() =>
  action.value === 'delete'
)

// =========================================
// FORMATIRANJE
// =========================================

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

// =========================================
// OTVARANJE DIJALOGA
// =========================================

function openDialog(type) {
  if (
    !adminStore.isAdmin ||
    busy.value ||
    props.challenge.published_at
  ) {
    return
  }

  action.value = type
  today.value = getToday()

  newDate.value =
    props.challenge.challenge_date

  errorMessage.value = ''
  opened.value = true
}

// =========================================
// SPREMANJE
// =========================================

async function saveAction() {
  if (
    busy.value ||
    !adminStore.isAdmin ||
    !supabase ||
    props.challenge.published_at
  ) {
    return
  }

  errorMessage.value = ''

  if (
    !isDelete.value &&
    (
      !newDate.value ||
      newDate.value < getToday()
    )
  ) {
    errorMessage.value =
      'Odaberi ispravan budući ili današnji datum.'

    return
  }

  const challengeId = props.challenge.id
  const selectedAction = action.value

  const date = isDelete.value
    ? null
    : newDate.value

  busy.value = true

  try {
    const { data, error } = await supabase.rpc(
      'admin_manage_challenge',
      {
        p_challenge_id: challengeId,
        p_action: selectedAction,
        p_date: date,
      }
    )

    if (error) throw error

    if (data !== true) {
      throw new Error(
        'Promjena izazova nije spremljena.'
      )
    }

    if (!alive || !adminStore.isAdmin) {
      return
    }

    opened.value = false

    emit('changed', {
      challengeId,
      action: selectedAction,
      date,
    })

  } catch (error) {
    if (alive) {
      errorMessage.value =
        error.message ||
        'Promjena izazova nije uspjela.'
    }

  } finally {
    busy.value = false
  }
}

onBeforeUnmount(() => {
  alive = false
})
</script>

<style scoped>
.challenge-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e2d8;
}

.challenge-actions .v-btn {
  text-transform: none;
  letter-spacing: 0;
  border-radius: 8px;
  font-weight: 600;
}

.action-card {
  background: #fffdf6;
  color: #181818;
  border-radius: 16px !important;
}

.action-card h2 {
  font-size: 26px;
  line-height: 1.3;
  letter-spacing: -0.8px;
  margin-bottom: 16px;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: #facc15;
  color: #181818;
  border-radius: 12px;
  margin-bottom: 20px;
}

.action-icon.danger {
  background: #fee2e2;
  color: #dc2626;
}

.challenge-preview {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: #f8f6ed;
  border: 1px solid #d8d5ca;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}

.challenge-preview span {
  color: #66645d;
  font-size: 14px;
}

.description {
  color: #66645d;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .challenge-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .action-card h2 {
    font-size: 22px;
  }
}
</style>
