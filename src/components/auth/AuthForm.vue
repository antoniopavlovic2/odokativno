
<template>
  <AuthLayout :title="title" :subtitle="subtitle">
    <!-- USPJEŠNA REGISTRACIJA ILI ZAHTJEV ZA OBNOVU -->

    <div v-if="completed" class="text-center">
      <div class="email-icon">
        <v-icon
          icon="mdi-email-check-outline"
          size="40"
        />
      </div>

      <h2 class="mb-4">Provjeri svoj e-mail!</h2>

      <p class="text-body-2 mb-4">
        {{ completedMessage }}
      </p>

      <strong class="registered-email">
        {{ email }}
      </strong>

      <p class="text-caption my-5">
        Ako ne vidiš poruku, provjeri neželjenu poštu.
      </p>

      <v-btn
        block
        color="primary"
        height="52"
        elevation="0"
        class="font-weight-bold"
        to="/prijava"
      >
        POVRATAK NA PRIJAVU
      </v-btn>
    </div>

    <!-- OBRAZAC -->

    <v-form v-else @submit.prevent="submit">
      <v-text-field
        v-if="isRegister"
        v-model.trim="username"
        label="Korisničko ime"
        name="username"
        autocomplete="username"
        prepend-inner-icon="mdi-account-outline"
        variant="outlined"
        :rules="[rules.required, rules.username]"
        :disabled="busy"
        hint="Dostupnost imena potvrđujemo nakon potvrde e-maila."
        class="mb-2"
      />

      <v-text-field
        v-model.trim="email"
        label="E-mail adresa"
        name="email"
        type="email"
        autocomplete="email"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
        :rules="[rules.required, rules.email]"
        :disabled="busy"
        class="mb-2"
      />

      <v-text-field
        v-if="!isForgot"
        v-model="password"
        label="Lozinka"
        name="password"
        :type="showPassword ? 'text' : 'password'"
        :autocomplete="isRegister
          ? 'new-password'
          : 'current-password'"
        prepend-inner-icon="mdi-lock-outline"
        variant="outlined"
        :rules="isRegister
          ? [rules.required, rules.password]
          : [rules.required]"
        :disabled="busy"
        class="mb-2"
      >
        <template #append-inner>
          <v-btn
            :icon="showPassword
              ? 'mdi-eye-off'
              : 'mdi-eye'"
            :aria-label="showPassword
              ? 'Sakrij lozinku'
              : 'Prikaži lozinku'"
            variant="text"
            size="small"
            @click="showPassword = !showPassword"
          />
        </template>
      </v-text-field>

      <v-text-field
        v-if="isRegister"
        v-model="confirmPassword"
        label="Ponovi lozinku"
        name="confirmPassword"
        autocomplete="new-password"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-check-outline"
        variant="outlined"
        :disabled="busy"
        :rules="[
          rules.required,
          value =>
            value === password ||
            'Lozinke se ne podudaraju.'
        ]"
        class="mb-2"
      />

      <div v-if="isLogin" class="text-right mb-4">
        <router-link
          to="/zaboravljena-lozinka"
          class="auth-link text-caption"
        >
          Zaboravio si lozinku?
        </router-link>
      </div>

      <!-- UVJETI KORIŠTENJA -->

      <template v-if="isRegister">
        <v-checkbox
          v-model="acceptedTerms"
          color="secondary"
          density="compact"
          hide-details
          :disabled="busy"
        >
          <template #label>
            <span class="terms-label">
              Prihvaćam
              <router-link
                to="/uvjeti-koristenja"
                target="_blank"
                rel="noopener noreferrer"
                @click.stop
              >
                uvjete korištenja.
              </router-link>
            </span>
          </template>
        </v-checkbox>

        <p class="privacy-notice mb-4">
          Informacije o obradi osobnih podataka
          dostupne su u našoj
          <router-link
            to="/politika-privatnosti"
            target="_blank"
            rel="noopener noreferrer"
          >
            politici privatnosti.
          </router-link>
        </p>
      </template>

      <!-- CLOUDFLARE TURNSTILE -->

      <TurnstileCheck
        :key="captchaKey"
        v-model="captchaToken"
      />

      <v-alert
        v-if="authStore.errorMessage"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ authStore.errorMessage }}
      </v-alert>

      <v-btn
        type="submit"
        color="primary"
        block
        height="52"
        elevation="0"
        class="font-weight-bold"
        :loading="busy"
        :disabled="
          busy ||
          !captchaToken ||
          (isRegister && !acceptedTerms)
        "
      >
        {{ buttonText }}
      </v-btn>
    </v-form>

    <template #bottom>
      <template v-if="isLogin">
        Nemaš račun?

        <router-link
          to="/registracija"
          class="auth-link"
        >
          Registriraj se
        </router-link>
      </template>

      <template v-else-if="isRegister">
        Već imaš račun?

        <router-link
          to="/prijava"
          class="auth-link"
        >
          Prijavi se
        </router-link>
      </template>

      <router-link
        v-else
        to="/prijava"
        class="auth-link"
      >
        Povratak na prijavu
      </router-link>
    </template>
  </AuthLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import AuthLayout from '@/components/layout/AuthLayout.vue'
import TurnstileCheck from '@/components/auth/TurnstileCheck.vue'
import { useAuthStore } from '@/stores/authStore'
import { rules } from '@/utils/validation'

const props = defineProps({
  mode: {
    type: String,
    required: true,

    validator: value =>
      ['login', 'register', 'forgot'].includes(value),
  },
})

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const showPassword = ref(false)
const acceptedTerms = ref(false)
const completed = ref(false)
const submitting = ref(false)

const captchaToken = ref('')
const captchaKey = ref(0)

const isLogin = computed(
  () => props.mode === 'login'
)

const isRegister = computed(
  () => props.mode === 'register'
)

const isForgot = computed(
  () => props.mode === 'forgot'
)

const busy = computed(
  () => submitting.value || authStore.loading
)

const title = computed(() => {
  if (completed.value) return 'Još samo jedan korak.'
  if (isRegister.value) return 'Imaš dobro oko?'
  if (isForgot.value) return 'Zaboravio si lozinku?'

  return 'Dobro nam došao!'
})

const subtitle = computed(() => {
  if (completed.value) {
    return 'Provjeri svoju pristiglu poštu.'
  }

  if (isRegister.value) {
    return 'Kreiraj račun i pokaži koliko dobro procjenjuješ.'
  }

  if (isForgot.value) {
    return 'Nema veze! Pomoći ćemo ti obnoviti lozinku.'
  }

  return 'Prijavi se i nastavi tamo gdje si stao.'
})

const buttonText = computed(() => {
  if (isRegister.value) return 'KREIRAJ RAČUN'
  if (isForgot.value) return 'POŠALJI POVEZNICU'

  return 'PRIJAVI SE'
})

const completedMessage = computed(() =>
  isRegister.value
    ? 'Ako je registracija dostupna, primit ćeš poveznicu za potvrdu računa.'
    : 'Ako račun postoji, primit ćeš poveznicu za obnovu lozinke.'
)

authStore.clearError()

function resetCaptcha() {
  captchaToken.value = ''
  captchaKey.value += 1
}

async function submit(event) {
  if (busy.value) return

  submitting.value = true

  try {
    const { valid } = await event

    if (!valid || !captchaToken.value) return

    if (
      isRegister.value &&
      !acceptedTerms.value
    ) {
      return
    }

    const token = captchaToken.value

    captchaToken.value = ''

    let success = false

    if (isRegister.value) {
      success = await authStore.register(
        username.value,
        email.value,
        password.value,
        token
      )
    } else if (isForgot.value) {
      success = await authStore.forgotPassword(
        email.value,
        token
      )
    } else {
      success = await authStore.login(
        email.value,
        password.value,
        token
      )
    }

    if (!success) {
      resetCaptcha()
      return
    }

    password.value = ''
    confirmPassword.value = ''

    if (
      !isForgot.value &&
      authStore.isAuthenticated
    ) {
      await router.replace({ name: 'profile' })
      resetCaptcha()
      return
    }

    completed.value = true

  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.email-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  border: 2px solid #181818;
  border-radius: 50%;
  background: #facc15;

  display: flex;
  align-items: center;
  justify-content: center;
}

.registered-email {
  display: block;
  font-size: 16px;
  overflow-wrap: anywhere;
}

.terms-label {
  font-size: 13px;
  line-height: 1.5;
  color: #181818;
}

.terms-label a,
.privacy-notice a {
  color: #181818;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.privacy-notice {
  font-size: 12px;
  line-height: 1.7;
  color: #64635d;
}
</style>
