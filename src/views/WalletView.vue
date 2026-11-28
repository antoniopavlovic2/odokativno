
<template>
  <v-container class="wallet-page">

    <div class="page-heading">

      <div class="eyebrow">
        ODOKATIVNO. / O-COINS
      </div>

      <h1>Moj novčanik.</h1>

      <p>
        Tvoja zarada, nagrade i potrošnja
        na jednom mjestu.
      </p>

    </div>

    <!-- UČITAVANJE AUTENTIFIKACIJE -->

    <div
      v-if="!authStore.initialized"
      class="loading-state"
    >

      <v-progress-circular
        indeterminate
        color="primary"
        size="40"
      />

      <p>Učitavanje novčanika...</p>

    </div>

    <!-- POTREBNA PRIJAVA -->

    <div
      v-else-if="!canAccessWallet"
      class="access-card"
    >

      <CoinIcon :size="80" />

      <h2>Tvoj novčanik te čeka.</h2>

      <p>
        Prijavi se ili kreiraj račun kako bi
        mogao skupljati O-Coinse i pratiti
        svoje nagrade.
      </p>

      <v-btn
        block
        color="primary"
        height="48"
        elevation="0"
        :to="{
          name: authStore.isRecovery
            ? 'reset-password'
            : 'login'
        }"
      >
        {{
          authStore.isRecovery
            ? 'Postavi novu lozinku'
            : 'Prijavi se'
        }}
      </v-btn>

      <v-btn
        v-if="!authStore.isRecovery"
        block
        variant="outlined"
        height="48"
        to="/registracija"
      >
        Registriraj se
      </v-btn>

    </div>

    <!-- NOVČANIK -->

    <template v-else>

      <WalletHistory />

      <div class="information-card">

        <div class="information-heading">

          <CoinIcon :size="38" />

          <h2>Kako zaraditi O-Coinse?</h2>

        </div>

        <div
          v-for="item in earningRules"
          :key="item.title"
          class="earning-row"
        >

          <div class="earning-icon">

            <v-icon size="22">
              {{ item.icon }}
            </v-icon>

          </div>

          <span>{{ item.title }}</span>

          <div class="earning-amount">

            +{{ item.amount }}

            <CoinIcon :size="20" />

          </div>

        </div>

        <p class="information-note">

          O-Coinsi su virtualna valuta namijenjena
          kozmetičkim dodacima unutar aplikacije.
          Nemaju stvarnu novčanu vrijednost i
          ne utječu na rezultat igre.

        </p>

      </div>

      <v-btn
        block
        height="52"
        color="#181818"
        elevation="0"
        prepend-icon="mdi-gamepad-variant-outline"
        class="play-button"
        to="/igra"
      >
        Dnevni izazov
      </v-btn>

    </template>

    <v-btn
      block
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="back-button"
      to="/"
    >
      Povratak na početnu
    </v-btn>

  </v-container>
</template>

<script setup>
import { computed } from 'vue'

import { useAuthStore } from '@/stores/authStore'

import WalletHistory
  from '@/components/wallet/WalletHistory.vue'

import CoinIcon
  from '@/components/wallet/CoinIcon.vue'

const authStore = useAuthStore()

const canAccessWallet = computed(() =>

  authStore.initialized &&
  authStore.isAuthenticated &&
  !authStore.isRecovery &&
  !authStore.user?.is_anonymous

)

const earningRules = [

  {
    title: 'Završen dnevni izazov',
    amount: 20,
    icon: 'mdi-gamepad-variant-outline',
  },

  {
    title: 'Svaki točan odgovor',
    amount: 2,
    icon: 'mdi-check-circle-outline',
  },

  {
    title: 'Svih sedam točnih odgovora',
    amount: 15,
    icon: 'mdi-trophy-outline',
  },

  {
    title: 'Svaki novi level',
    amount: 25,
    icon: 'mdi-lightning-bolt',
  },

]
</script>

<style scoped>
.wallet-page {
  max-width: 820px;
  padding: 56px 24px;
  color: #181818;
}

.page-heading {
  margin-bottom: 32px;
}

.eyebrow {
  font-size: 12px;
  font-weight: 700;
  color: #66645d;
  letter-spacing: 1.4px;
  margin-bottom: 10px;
}

.page-heading h1 {
  font-size: clamp(38px, 7vw, 64px);
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -2px;
}

.page-heading p {
  font-size: 16px;
  color: #66645d;
  margin-top: 14px;
  line-height: 1.6;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 20px;
  color: #66645d;
}

.access-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 32px;
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 16px;
  text-align: center;
}

.access-card h2 {
  font-size: 26px;
  font-weight: 700;
}

.access-card p {
  color: #66645d;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 8px;
}

.information-card {
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 14px;
  padding: 24px;
  margin: 28px 0;
}

.information-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.information-heading h2 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.earning-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #e5e2d8;
  font-size: 14px;
}

.earning-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  background: #f0ede3;
  border-radius: 8px;
  flex-shrink: 0;
}

.earning-row > span {
  flex: 1;
}

.earning-amount {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: #15803d;
  white-space: nowrap;
}

.information-note {
  color: #66645d;
  font-size: 12px;
  line-height: 1.7;
  margin-top: 20px;
}

.play-button {
  color: #facc15 !important;
  font-weight: 700;
  letter-spacing: 0.8px;
  border-radius: 10px;
}

.back-button {
  margin-top: 18px;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}

@media (max-width: 600px) {

  .wallet-page {
    padding: 32px 16px;
  }

  .page-heading h1 {
    letter-spacing: -1.5px;
  }

  .page-heading p {
    font-size: 14px;
  }

  .information-card {
    padding: 16px;
  }

  .information-heading h2 {
    font-size: 18px;
  }

  .earning-row {
    gap: 8px;
    font-size: 12px;
  }
}
</style>
