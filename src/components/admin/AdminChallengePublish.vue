
<template>
  <div class="publication-row">

    <div class="publication-details">

      <strong>
        {{ activeCount }}/7 aktivnih pitanja
      </strong>

      <span>{{ description }}</span>

    </div>

    <v-btn
      v-if="action"
      :color="action === 'cancel' ? undefined : 'primary'"
      :variant="action === 'cancel' ? 'outlined' : 'flat'"
      :prepend-icon="actionIcon"
      :disabled="disabled || busy || !canExecute"
      :loading="busy"
      @click="openDialog"
    >
      {{ actionLabel }}
    </v-btn>

    <!-- POTVRDA OBJAVE -->

    <v-dialog
      v-model="dialog"
      max-width="480"
      :persistent="busy"
    >

      <v-card class="publication-dialog pa-5">

        <h2>{{ dialogTitle }}</h2>

        <p class="challenge-preview">
          Izazov #{{ String(challenge.id).padStart(3, '0') }}
          · {{ formattedDate }}
        </p>

        <p class="confirmation-text">
          {{ confirmationText }}
        </p>

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
            @click="dialog = false"
          >
            Odustani
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            :loading="busy"
            :disabled="
              busy ||
              disabled ||
              !canExecute ||
              action !== selectedAction
            "
            @click="savePublication"
          >
            Potvrdi
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

  questions: {
    type: Array,
    default: () => [],
  },

  now: {
    type: Number,
    required: true,
  },

  disabled: {
    type: Boolean,
    default: false,
  },

})

const emit = defineEmits(['changed'])

const adminStore = useAdminStore()

const dialog = ref(false)
const busy = ref(false)
const selectedAction = ref('')
const errorMessage = ref('')

let alive = true

// =========================================
// AKTIVNA PITANJA
// =========================================

const activeCount = computed(() =>
  props.questions.filter(
    item => item.question?.is_active === true
  ).length
)

// =========================================
// DANAŠNJI DATUM
// =========================================

const today = computed(() => {

  const parts = new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: 'Europe/Zagreb',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
  ).formatToParts(
    new Date(props.now)
  )

  const values = Object.fromEntries(
    parts.map(
      part => [part.type, part.value]
    )
  )

  return `${values.year}-${values.month}-${values.day}`
})

// =========================================
// STATUS IZAZOVA
// =========================================

const status = computed(() => {

  if (!props.challenge.published_at) {
    return 'draft'
  }

  return new Date(
    props.challenge.published_at
  ).getTime() > props.now

    ? 'scheduled'
    : 'published'
})

const formattedDate = computed(() =>

  new Intl.DateTimeFormat(
    'hr-HR',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Zagreb',
    }
  ).format(
    new Date(
      `${props.challenge.challenge_date}T12:00:00Z`
    )
  )
)

// =========================================
// DOSTUPNA AKCIJA
// =========================================

const action = computed(() => {

  if (status.value === 'scheduled') {
    return 'cancel'
  }

  if (status.value !== 'draft') {
    return ''
  }

  if (
    props.challenge.challenge_date === today.value
  ) {
    return 'publish_now'
  }

  if (
    props.challenge.challenge_date > today.value
  ) {
    return 'schedule'
  }

  return ''
})

const canExecute = computed(() =>

  adminStore.isAdmin &&

  Boolean(action.value) &&

  (
    action.value === 'cancel' ||

    (
      props.questions.length === 7 &&
      activeCount.value === 7
    )
  )
)

// =========================================
// TEKST I IKONE GUMBA
// =========================================

const actionLabel = computed(() => ({

  publish_now: 'Objavi odmah',

  schedule: 'Zakaži objavu',

  cancel: 'Otkaži zakazivanje',

}[action.value] || ''))

const actionIcon = computed(() => ({

  publish_now: 'mdi-publish',

  schedule: 'mdi-calendar-check-outline',

  cancel: 'mdi-calendar-remove',

}[action.value] || ''))

// =========================================
// OPIS STATUSA
// =========================================

const description = computed(() => {

  if (status.value === 'published') {

    return props.challenge.challenge_date < today.value

      ? 'Arhiva · zaključano'
      : 'Objavljeno · zaključano'
  }

  if (status.value === 'scheduled') {

    return `Objava ${formattedDate.value} u 00:00`
  }

  if (!action.value) {
    return 'Datum izazova je prošao.'
  }

  if (
    activeCount.value !== 7 ||
    props.questions.length !== 7
  ) {
    return 'Za objavu je potrebno svih 7 aktivnih pitanja.'
  }

  return action.value === 'publish_now'

    ? 'Spremno za trenutnu objavu.'

    : `Automatska objava u 00:00 (${formattedDate.value})`
})

// =========================================
// DIJALOG ZA POTVRDU
// =========================================

const dialogTitle = computed(() => ({

  publish_now:
    'Objavi današnji izazov?',

  schedule:
    'Zakaži objavu izazova?',

  cancel:
    'Otkaži zakazivanje?',

}[selectedAction.value] || 'Potvrdi promjenu'))

const confirmationText = computed(() => ({

  publish_now:
    'Izazov će odmah biti dostupan igračima. Nakon objave pitanja i datum više se ne mogu uređivati kroz administraciju.',

  schedule:
    'Izazov će automatski postati dostupan na predviđeni datum u 00:00 prema hrvatskom vremenu. Pitanja će biti zaključana, a zakazivanje možeš otkazati prije objave.',

  cancel:
    'Izazov će ponovno postati nacrt i moći ćeš uređivati pitanja i datum.',

}[selectedAction.value] || ''))

function openDialog() {

  if (
    props.disabled ||
    busy.value ||
    !canExecute.value
  ) {
    return
  }

  selectedAction.value = action.value

  errorMessage.value = ''

  dialog.value = true
}

// =========================================
// SPREMANJE U SUPABASE
// =========================================

async function savePublication() {

  if (
    props.disabled ||
    busy.value ||
    !canExecute.value ||
    selectedAction.value !== action.value
  ) {
    return
  }

  busy.value = true

  errorMessage.value = ''

  const challengeId = props.challenge.id

  const requestedAction = selectedAction.value

  try {

    if (!supabase) {

      throw new Error(
        'Veza sa Supabaseom nije konfigurirana.'
      )
    }

    const { data, error } = await supabase.rpc(
      'admin_set_challenge_publication',
      {
        p_challenge_id: challengeId,
        p_action: requestedAction,
      }
    )

    if (error) throw error

    if (data !== true) {

      throw new Error(
        'Promjena nije spremljena.'
      )
    }

    if (!alive || !adminStore.isAdmin) {
      return
    }

    dialog.value = false

    emit('changed', {
      challengeId,
      action: requestedAction,
    })

  } catch (error) {

    if (alive) {

      errorMessage.value =
        error.message ||
        'Promjena objave nije uspjela.'
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
.publication-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid #e5e2d8;
  background: #f8f6ed;
}

.publication-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.publication-details strong {
  font-size: 13px;
}

.publication-details span {
  color: #66645d;
  font-size: 12px;
}

.publication-row .v-btn {
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0;
}

.publication-dialog {
  background: #fffdf6;
  color: #181818;
  border-radius: 16px !important;
}

.publication-dialog h2 {
  font-size: 24px;
}

.challenge-preview {
  margin: 16px 0;
  font-weight: 700;
}

.confirmation-text {
  color: #66645d;
  line-height: 1.6;
  margin-bottom: 20px;
}

.dialog-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 600px) {

  .publication-row {
    padding: 12px;
  }

  .publication-details {
    flex-basis: 100%;
  }

  .publication-row > .v-btn {
    width: 100%;
  }
}
</style>
