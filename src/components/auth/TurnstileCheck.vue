
<template>
  <div class="turnstile-check">
    <div ref="container"></div>

    <p
      v-if="loading"
      class="check-message"
      role="status"
    >
      Učitavanje sigurnosne provjere...
    </p>

    <div v-if="errorMessage" class="check-error">
      <p role="alert">{{ errorMessage }}</p>

      <v-btn
        variant="text"
        size="small"
        prepend-icon="mdi-refresh"
        @click="initialize"
      >
        Pokušaj ponovno
      </v-btn>
    </div>
  </div>
</template>

<script>
let scriptPromise = null

function loadTurnstile() {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile)
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')

      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

      script.async = true
      script.defer = true

      const fail = () => {
        window.clearTimeout(timeout)
        script.remove()
        scriptPromise = null

        reject(
          new Error('Turnstile nije učitan.')
        )
      }

      const timeout = window.setTimeout(fail, 15000)

      script.onload = () => {
        window.clearTimeout(timeout)

        if (!window.turnstile) {
          fail()
          return
        }

        resolve(window.turnstile)
      }

      script.onerror = fail

      document.head.appendChild(script)
    })
  }

  return scriptPromise
}
</script>

<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
} from 'vue'

const emit = defineEmits(['update:modelValue'])

const container = ref(null)
const loading = ref(true)
const errorMessage = ref('')

const siteKey =
  process.env.VUE_APP_TURNSTILE_SITE_KEY

let widgetId = null
let active = true
let generation = 0

function removeWidget() {
  if (widgetId !== null && window.turnstile) {
    window.turnstile.remove(widgetId)
    widgetId = null
  }
}

async function initialize() {
  const current = ++generation

  emit('update:modelValue', '')

  removeWidget()

  loading.value = true
  errorMessage.value = ''

  if (!siteKey) {
    loading.value = false
    errorMessage.value =
      'Sigurnosna provjera nije konfigurirana.'

    return
  }

  try {
    const turnstile = await loadTurnstile()

    if (
      !active ||
      current !== generation ||
      !container.value
    ) {
      return
    }

    widgetId = turnstile.render(container.value, {
      sitekey: siteKey,
      theme: 'light',
      language: 'auto',
      size: 'flexible',

      callback(token) {
        if (!active || current !== generation) return

        errorMessage.value = ''
        emit('update:modelValue', token)
      },

      'expired-callback'() {
        emit('update:modelValue', '')
      },

      'timeout-callback'() {
        emit('update:modelValue', '')

        errorMessage.value =
          'Provjera je istekla. Pokušaj ponovno.'
      },

      'error-callback'() {
        emit('update:modelValue', '')

        errorMessage.value =
          'Sigurnosna provjera nije uspjela.'
      },
    })

  } catch {
    if (!active || current !== generation) return

    errorMessage.value =
      'Provjeri internetsku vezu i pokušaj ponovno.'

  } finally {
    if (active && current === generation) {
      loading.value = false
    }
  }
}

onMounted(initialize)

onBeforeUnmount(() => {
  active = false
  generation += 1
  removeWidget()
})
</script>

<style scoped>
.turnstile-check {
  width: 100%;
  margin: 16px 0;
}

.check-message {
  font-size: 12px;
  color: #64635d;
  text-align: center;
  margin-top: 8px;
}

.check-error {
  font-size: 12px;
  color: #b91c1c;
  text-align: center;
  margin-top: 8px;
}
</style>
