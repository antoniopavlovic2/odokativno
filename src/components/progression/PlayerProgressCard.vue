
<template>
  <section
    v-if="progressionStore.canLoad"
    class="player-card"
    :class="{ 'compact-card': compact }"
  >

    <!-- BANNER -->

    <div
      v-if="!compact"
      class="profile-banner"
    >

      <div class="banner-brand">
        ODOKATIVNO.
      </div>

      <div class="banner-slogan">
        Nemaš pojma? Nema veze.
      </div>

      <span
        class="banner-symbol"
        aria-hidden="true"
      >
        ?
      </span>

    </div>

    <div class="card-content">

      <!-- INFORMACIJE O IGRAČU -->

      <div
        v-if="!compact"
        class="player-identity"
      >

        <div class="player-avatar">

          {{ avatarInitial }}

        </div>

        <div class="player-info">

          <h2>{{ username || 'Moj profil' }}</h2>

          <p v-if="progressionStore.progress">
            {{ playerTitle }}
          </p>

          <LevelBadge
            v-if="progressionStore.progress"
            :level="progressionStore.level"
          />

        </div>

      </div>

      <!-- KOMPAKTNI NASLOV -->

      <div
        v-else
        class="compact-heading"
      >

        <div class="progress-icon">

          <v-icon size="26">
            mdi-lightning-bolt
          </v-icon>

        </div>

        <div>

          <h3>Tvoj napredak.</h3>

          <p>Svaki izazov se računa.</p>

        </div>

      </div>

      <!-- UČITAVANJE -->

      <div
        v-if="
          progressionStore.loading &&
          !progressionStore.progress
        "
        class="loading-state"
      >

        <v-progress-circular
          indeterminate
          size="24"
          width="3"
          color="primary"
        />

        <span>Učitavanje napretka...</span>

      </div>

      <!-- GREŠKA -->

      <v-alert
        v-else-if="progressionStore.errorMessage"
        type="warning"
        variant="tonal"
      >

        {{ progressionStore.errorMessage }}

        <v-btn
          variant="text"
          @click="loadData"
        >
          Pokušaj ponovno
        </v-btn>

      </v-alert>

      <!-- XP NAPREDAK -->

      <template v-else-if="progressionStore.progress">

        <div class="progress-container">

          <XPProgressBar
            :level="progressionStore.level"
            :xp="progressionStore.xpIntoLevel"
            :xp-required="progressionStore.xpRequired"
          />

        </div>

        <div class="total-experience">

          <span>Ukupno iskustvo</span>

          <strong>

            {{
              formatNumber(
                progressionStore.totalXp
              )
            }} XP

          </strong>

        </div>

      </template>

      <!-- PROFIL JOŠ NIJE KREIRAN -->

      <p
        v-else
        class="empty-progress"
      >
        Kreiraj korisnički profil
        kako bi mogao pratiti svoj napredak.
      </p>

      <!-- NOVČANIK -->

      <router-link
        v-if="
          !compact &&
          walletStore.isReady
        "
        :to="{ name: 'wallet' }"
        class="wallet-link"
      >

        <CoinIcon :size="38" />

        <div class="wallet-info">

          <strong>

            {{
              formatNumber(
                walletStore.balance
              )
            }} O-Coins

          </strong>

          <span>Moj novčanik</span>

        </div>

        <v-icon>
          mdi-chevron-right
        </v-icon>

      </router-link>

      <!-- OTVARANJE PROFILA -->

      <v-btn
        v-if="compact"
        block
        height="42"
        variant="outlined"
        class="profile-button"
        :to="{ name: 'profile' }"
        append-icon="mdi-arrow-right"
      >
        Moj profil
      </v-btn>

    </div>

  </section>
</template>

<script setup>
import {
  computed,
  watch,
} from 'vue'

import { useAuthStore } from '@/stores/authStore'

import {
  useProgressionStore,
} from '@/stores/progressionStore'

import {
  useWalletStore,
} from '@/stores/walletStore'

import LevelBadge from './LevelBadge.vue'

import XPProgressBar from './XPProgressBar.vue'

import CoinIcon
  from '@/components/wallet/CoinIcon.vue'

const props = defineProps({

  username: {
    type: String,
    default: '',
  },

  compact: {
    type: Boolean,
    default: false,
  },

})

const authStore = useAuthStore()

const progressionStore =
  useProgressionStore()

const walletStore =
  useWalletStore()

const avatarInitial = computed(() => {

  return (
    props.username.trim().charAt(0) || 'O'
  ).toUpperCase()

})

// =========================================
// TITULE PREMA LEVELU
// =========================================

const playerTitle = computed(() => {

  const level = progressionStore.level

  if (level >= 100) {
    return 'Kralj odokativnog'
  }

  if (level >= 75) {
    return 'Fenomen'
  }

  if (level >= 50) {
    return 'Legenda'
  }

  if (level >= 40) {
    return 'Brojčani genij'
  }

  if (level >= 30) {
    return 'Ekspert'
  }

  if (level >= 20) {
    return 'Majstor procjene'
  }

  if (level >= 15) {
    return 'Odokativac'
  }

  if (level >= 10) {
    return 'Procjenitelj'
  }

  if (level >= 5) {
    return 'Pogađač'
  }

  return 'Početnik'

})

// =========================================
// FORMATIRANJE
// =========================================

function formatNumber(value) {

  return new Intl.NumberFormat(
    'hr-HR'
  ).format(value)

}

// =========================================
// DOHVAT PODATAKA
// =========================================

async function loadData() {

  if (!progressionStore.canLoad) {
    return
  }

  await Promise.all([

    progressionStore.loadProgress(),

    props.compact
      ? Promise.resolve()
      : walletStore.refresh(),

  ])
}

watch(

  [
    () => authStore.userId,
    () => progressionStore.canLoad,
    () => props.username,
  ],

  () => {

    void loadData()

  },

  { immediate: true }
)
</script>

<style scoped>
.player-card {
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 16px;
  overflow: hidden;
  color: #181818;
  margin: 24px 0;
}

/* BANNER */

.profile-banner {
  position: relative;
  height: 150px;
  padding: 24px;
  overflow: hidden;
  color: #facc15;
  background:
    repeating-linear-gradient(
      135deg,
      transparent 0px,
      transparent 26px,
      rgba(250, 204, 21, 0.06) 26px,
      rgba(250, 204, 21, 0.06) 48px
    ),
    #181818;
}

.banner-brand {
  position: relative;
  z-index: 1;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 3px;
}

.banner-slogan {
  position: relative;
  z-index: 1;
  font-size: 12px;
  color: #fffdf6;
  margin-top: 6px;
}

.banner-symbol {
  position: absolute;
  bottom: -58px;
  right: 20px;
  color: rgba(250, 204, 21, 0.17);
  font-size: 230px;
  font-weight: 700;
  line-height: 1;
}

/* PROFIL */

.card-content {
  padding: 24px;
}

.player-identity {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 28px;
}

.player-avatar {
  width: 84px;
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #181818;
  color: #facc15;
  border: 4px solid #facc15;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #181818;
  font-size: 40px;
  font-weight: 700;
  flex-shrink: 0;
}

.player-info {
  flex: 1;
  min-width: 0;
}

.player-info h2 {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -1px;
  overflow-wrap: anywhere;
}

.player-info p {
  font-size: 13px;
  color: #66645d;
  margin: 6px 0 10px;
}

/* XP */

.progress-container {
  background: #f8f6ed;
  padding: 18px;
  border-radius: 10px;
  border: 1px solid #e5e2d8;
}

.total-experience {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 0;
  font-size: 13px;
  color: #66645d;
}

.total-experience strong {
  color: #181818;
  font-variant-numeric: tabular-nums;
}

/* NOVČANIK */

.wallet-link {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fef3c7;
  border: 1px solid #e6c465;
  color: #181818;
  text-decoration: none;
  padding: 14px;
  border-radius: 10px;
  transition: background 150ms ease;
}

.wallet-link:hover {
  background: #fde68a;
}

.wallet-info {
  flex: 1;
}

.wallet-info strong {
  display: block;
  font-size: 18px;
  font-weight: 700;
}

.wallet-info span {
  display: block;
  font-size: 12px;
  color: #785414;
}

/* KOMPAKTNA VERZIJA */

.compact-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.compact-heading h3 {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.compact-heading p {
  font-size: 12px;
  color: #66645d;
}

.progress-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  background: #facc15;
  border-radius: 10px;
  color: #181818;
  flex-shrink: 0;
}

.profile-button {
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0;
  border-radius: 8px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  color: #66645d;
  font-size: 13px;
}

.empty-progress {
  font-size: 13px;
  color: #66645d;
  padding: 16px 0;
}

@media (max-width: 600px) {

  .card-content {
    padding: 16px;
  }

  .profile-banner {
    height: 120px;
    padding: 18px;
  }

  .player-avatar {
    width: 68px;
    height: 68px;
    font-size: 32px;
  }

  .player-identity {
    gap: 14px;
  }

  .player-info h2 {
    font-size: 23px;
  }

  .progress-container {
    padding: 14px;
  }
}
</style>
