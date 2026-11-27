
<template>
  <AuthLayout
    :title="registrationComplete
      ? 'Provjeri svoj e-mail!'
      : 'Imaš dobro oko?'"
    :subtitle="registrationComplete
      ? 'Još samo jedan korak.'
      : 'Kreiraj račun i pokaži koliko dobro procjenjuješ.'"
  >
    <div
      v-if="registrationComplete"
      class="text-center"
    >
      <div class="email-icon">
        <v-icon
          icon="mdi-email-check-outline"
          size="40"
        />
      </div>

      <h2 class="mb-4">
        Potvrdi svoj račun
      </h2>

      <p class="text-body-2 mb-3">
        Provjeri pristiglu poštu na adresi:
      </p>

      <strong class="registered-email">
        {{ email }}
      </strong>

      <p class="text-body-2 my-5">
        Otvori poveznicu iz e-maila.
        Nakon potvrde prijavi se ili
        otvori Moj profil.
      </p>

      <p class="text-caption mb-5">
        Ako ne vidiš poruku,
        provjeri neželjenu poštu.
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

    <v-form
      v-else
      @submit.prevent="submitRegister"
    >
      <v-text-field
        v-model.trim="username"
        label="Korisničko ime"
        autocomplete="username"
        prepend-inner-icon="mdi-account-outline"
        variant="outlined"
        :rules="[rules.required, rules.username]"
        hint="Dostupnost imena potvrđujemo nakon potvrde e-maila."
        class="mb-2"
      />

      <v-text-field
        v-model.trim="email"
        label="E-mail adresa"
        type="email"
        autocomplete="email"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
        :rules="[rules.required, rules.email]"
        class="mb-2"
      />

      <v-text-field
        v-model="password"
        label="Lozinka"
        autocomplete="new-password"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-outline"
        variant="outlined"
        :rules="[rules.required, rules.password]"
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
        v-model="confirmPassword"
        label="Ponovi lozinku"
        autocomplete="new-password"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-check-outline"
        variant="outlined"
        :rules="[
          rules.required,
          value =>
            value === password ||
            'Lozinke se ne podudaraju.'
        ]"
        class="mb-2"
      />

      <v-checkbox
        v-model="acceptedTerms"
        color="secondary"
        density="compact"
        hide-details
        class="terms-checkbox"
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

      <p class="privacy-notice mb-5">
        Informacije o obradi tvojih osobnih
        podataka dostupne su u našoj
        <router-link
          to="/politika-privatnosti"
          target="_blank"
          rel="noopener noreferrer"
        >
          politici privatnosti.
        </router-link>
      </p>

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
        :loading="authStore.loading"
        :disabled="!acceptedTerms"
      >
        KREIRAJ RAČUN
      </v-btn>
    </v-form>

    <template #bottom>
      Već imaš račun?

      <router-link
        to="/prijava"
        class="auth-link"
      >
        Prijavi se
      </router-link>
    </template>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import AuthLayout from '@/components/layout/AuthLayout.vue'
import { useAuthStore } from '@/stores/authStore'
import { rules } from '@/utils/validation'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const showPassword = ref(false)
const acceptedTerms = ref(false)
const registrationComplete = ref(false)

authStore.clearError()

async function submitRegister(event) {
  const { valid } = await event

  if (
    !valid ||
    !acceptedTerms.value ||
    authStore.loading
  ) {
    return
  }

  const success = await authStore.register(
    username.value,
    email.value,
    password.value
  )

  if (!success) return

  password.value = ''
  confirmPassword.value = ''

  if (authStore.isAuthenticated) {
    router.replace({ name: 'profile' })
    return
  }

  registrationComplete.value = true
}
</script>

<style scoped>
.email-icon {
  width: 80px;
  height: 80px;
  background: #facc15;
  border: 2px solid #181818;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.registered-email {
  display: block;
  overflow-wrap: anywhere;
  font-size: 16px;
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
  color: #64635d;
  line-height: 1.7;
}
</style>
