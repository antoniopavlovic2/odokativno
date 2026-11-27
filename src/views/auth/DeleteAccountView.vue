
<template>
  <AuthLayout
    :title="completed
      ? 'Račun je obrisan.'
      : 'Brisanje računa'"
    :subtitle="completed
      ? 'Hvala što si igrao ODOKATIVNO.'
      : 'Ovu radnju nije moguće poništiti.'"
  >
    <div v-if="completed" class="text-center">
      <div class="status-icon success-icon">
        <v-icon icon="mdi-check" size="42" />
      </div>

      <p class="mb-5">
        Tvoj korisnički račun i profil
        uspješno su obrisani.
        I dalje možeš igrati kao gost.
      </p>

      <v-alert
        v-if="logoutWarning"
        type="warning"
        class="mb-4"
      >
        Račun je obrisan, ali lokalna odjava
        nije potvrđena. Osvježi stranicu ili
        ukloni podatke stranice iz preglednika.
      </v-alert>

      <v-btn
        block
        color="primary"
        height="52"
        to="/"
        class="font-weight-bold"
      >
        POVRATAK NA POČETNU
      </v-btn>
    </div>

    <div
      v-else-if="!authStore.initialized"
      class="text-center py-8"
    >
      <v-progress-circular
        indeterminate
        color="primary"
      />
    </div>

    <div
      v-else-if="
        !authStore.isAuthenticated ||
        authStore.isRecovery
      "
      class="text-center"
    >
      <p class="mb-4">
        Za brisanje računa potrebna je
        valjana prijava.
      </p>

      <v-btn
        block
        color="primary"
        :to="authStore.isRecovery
          ? '/nova-lozinka'
          : '/prijava'"
      >
        NASTAVI
      </v-btn>
    </div>

    <template v-else>
      <div class="status-icon danger-icon">
        <v-icon
          icon="mdi-trash-can-outline"
          size="40"
        />
      </div>

      <h2 class="text-center mb-4">
        Želiš nas napustiti?
      </h2>

      <p class="text-body-2 mb-3">
        Tvoj korisnički račun i profil
        bit će trajno obrisani.
      </p>

      <p class="account-email mb-5">
        {{ authStore.email }}
      </p>

      <v-form @submit.prevent="deleteAccount">
        <v-text-field
          v-model="password"
          label="Trenutna lozinka"
          autocomplete="current-password"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          :rules="[rules.required]"
          :disabled="loading"
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
          v-model="confirmation"
          label="Upiši OBRIŠI"
          variant="outlined"
          autocomplete="off"
          :disabled="loading"
          :rules="[
            value => value === 'OBRIŠI' ||
              'Za potvrdu upiši OBRIŠI.'
          ]"
        />

        <TurnstileCheck
          :key="captchaKey"
          v-model="captchaToken"
        />

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ errorMessage }}
        </v-alert>

        <v-btn
          type="submit"
          block
          color="error"
          height="52"
          elevation="0"
          :loading="loading"
          :disabled="
            loading ||
            confirmation !== 'OBRIŠI' ||
            !captchaToken
          "
          class="font-weight-bold mb-3"
        >
          TRAJNO OBRIŠI RAČUN
        </v-btn>

        <v-btn
          block
          variant="outlined"
          color="secondary"
          height="48"
          to="/profil"
          :disabled="loading"
        >
          Odustani
        </v-btn>
      </v-form>
    </template>

    <template #bottom>
      <router-link
        to="/politika-privatnosti"
        class="auth-link"
      >
        Politika privatnosti
      </router-link>
    </template>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'

import AuthLayout from '@/components/layout/AuthLayout.vue'
import TurnstileCheck from '@/components/auth/TurnstileCheck.vue'

import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/services/supabase'
import { rules } from '@/utils/validation'

const authStore = useAuthStore()

const password = ref('')
const confirmation = ref('')
const showPassword = ref(false)

const loading = ref(false)
const completed = ref(false)
const logoutWarning = ref(false)
const errorMessage = ref('')

const captchaToken = ref('')
const captchaKey = ref(0)

const messages = {
  unauthorized:
    'Sesija je istekla. Prijavi se ponovno.',

  invalid_password:
    'Trenutna lozinka nije ispravna.',

  rate_limit:
    'Previše pokušaja. Pokušaj kasnije.',

  captcha_failed:
    'Sigurnosna provjera nije uspjela.',

  delete_failed:
    'Račun nije obrisan. Pokušaj ponovno.',
}

function resetCaptcha() {
  captchaToken.value = ''
  captchaKey.value += 1
}

async function deleteAccount(event) {
  if (loading.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const { valid } = await event

    if (
      !valid ||
      !supabase ||
      !authStore.isAuthenticated ||
      authStore.isRecovery ||
      !captchaToken.value ||
      confirmation.value !== 'OBRIŠI'
    ) {
      return
    }

    const token = captchaToken.value
    captchaToken.value = ''

    const { data, error } =
      await supabase.functions.invoke(
        'delete-account',
        {
          body: {
            password: password.value,
            confirmation: confirmation.value,
            captchaToken: token,
          },
        }
      )

    if (error) {
      let errorCode = ''

      try {
        const details = await error.context?.json()
        errorCode = details?.error
      } catch {
        // Odgovor ne sadrži JSON.
      }

      errorMessage.value =
        messages[errorCode] ||
        'Brisanje nije potvrđeno. Provjeri status računa.'

      resetCaptcha()
      return
    }

    if (!data?.success) {
      errorMessage.value =
        'Brisanje računa nije potvrđeno.'

      resetCaptcha()
      return
    }

    password.value = ''
    confirmation.value = ''
    completed.value = true

    const signedOut = await authStore.logout()

    if (!signedOut) {
      logoutWarning.value = true
      authStore.setSession(null)
      authStore.isRecovery = false
    }

  } catch {
    if (completed.value) {
      logoutWarning.value = true
    } else {
      errorMessage.value =
        'Dogodila se greška. Provjeri status računa.'

      resetCaptcha()
    }

  } finally {
    password.value = ''
    loading.value = false
  }
}
</script>

<style scoped>
.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 82px;
  height: 82px;
  margin: 0 auto 24px;
  border: 2px solid;
  border-radius: 50%;
}

.danger-icon {
  color: #dc2626;
  background: #fee2e2;
}

.success-icon {
  color: #15803d;
  background: #dcfce7;
}

.account-email {
  background: #f8f6ed;
  border-radius: 10px;
  padding: 12px;
  text-align: center;
  font-weight: 600;
  overflow-wrap: anywhere;
}
</style>
