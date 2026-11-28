
<template>
  <section
    v-if="
      walletStore.canLoad &&
      gameStore.isFinished
    "
    class="coin-rewards"
  >

    <div
      v-if="loading"
      class="coin-loading"
    >

      <v-progress-circular
        indeterminate
        size="22"
        width="3"
        color="primary"
      />

      <span>Učitavanje O-Coinsa...</span>

    </div>

    <v-alert
      v-else-if="errorMessage"
      type="warning"
      variant="tonal"
    >

      {{ errorMessage }}

      <v-btn
        variant="text"
        @click="loadRewards"
      >
        Pokušaj ponovno
      </v-btn>

    </v-alert>

    <div
      v-else-if="reward"
      class="coin-reward-card"
    >

      <CoinAnimation v-if="showAnimation" />

      <div class="eyebrow">
        ODOKATIVNO. / O-COINS
      </div>

      <div class="reward-heading">

        <CoinIcon :size="54" />

        <div class="reward-description">

          <h3>Osvojeni O-Coinsi</h3>

          <p>Nagrada za današnji izazov.</p>

        </div>

        <div class="earned-coins">

          +<CoinCounter
            :amount="displayEarned"
            :size="22"
          />

        </div>

      </div>

      <div class="reward-breakdown">

        <div class="breakdown-row">

          <span>Dnevna nagrada</span>

          <strong>
            +{{ reward.dailyCoins }}
          </strong>

        </div>

        <div
          v-if="reward.levelUpCoins > 0"
          class="breakdown-row level-bonus"
        >

          <span>

            <v-icon size="18">
              mdi-lightning-bolt
            </v-icon>

            Level Up bonus

          </span>

          <strong>
            +{{ reward.levelUpCoins }}
          </strong>

        </div>

      </div>

      <div class="wallet-total">

        <div class="wallet-title">

          <v-icon size="22">
            mdi-wallet-outline
          </v-icon>

          Tvoj novčanik

        </div>

        <CoinCounter
          :amount="walletStore.balance"
          :size="30"
        />

      </div>

    </div>

  </section>
</template>

<script setup>
import {
  ref,
  watch,
  onBeforeUnmount,
} from 'vue'

import { useAuthStore } from '@/stores/authStore'
import { useGameStore } from '@/stores/gameStore'
import { useWalletStore } from '@/stores/walletStore'
import { useSettingsStore } from '@/stores/settingsStore'

import {
  playRewardSound,
} from '@/services/rewardSoundService'

import CoinIcon from './CoinIcon.vue'
import CoinCounter from './CoinCounter.vue'
import CoinAnimation from './CoinAnimation.vue'

const props = defineProps({

  ready: {
    type: Boolean,
    default: true,
  },

})

const authStore = useAuthStore()

const gameStore = useGameStore()

const walletStore = useWalletStore()

const settingsStore = useSettingsStore()

const reward = ref(null)

const loading = ref(false)
const errorMessage = ref('')

const displayEarned = ref(0)

const showAnimation = ref(false)
const played = ref(false)

let loadVersion = 0

let animationTimer = null

// =========================================
// EVIDENCIJA PRIKAZANIH NAGRADA
// =========================================

function rewardKey(data) {

  return (
    'odokativno-coins-seen:' +
    authStore.userId +
    ':' +
    data.sessionId
  )
}

function wasSeen(data) {

  try {

    return localStorage.getItem(
      rewardKey(data)
    ) === '1'

  } catch {

    return false
  }
}

function markSeen(data) {

  try {

    localStorage.setItem(
      rewardKey(data),
      '1'
    )

  } catch {

    // Novčanik radi i bez localStoragea.

  }
}

// =========================================
// ANIMACIJA COINSA
// =========================================

function clearAnimation() {

  if (animationTimer !== null) {

    window.clearTimeout(
      animationTimer
    )

    animationTimer = null

  }

  showAnimation.value = false
}

function playAnimation() {

  if (
    !props.ready ||
    !reward.value ||
    played.value ||
    !walletStore.canLoad ||
    !gameStore.isFinished
  ) {
    return
  }

  played.value = true

  const data = reward.value

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  const alreadySeen = wasSeen(data)

  displayEarned.value =
    Number(data.totalCoins)

  if (alreadySeen) {
    return
  }

  markSeen(data)

  if (document.hidden) {
    return
  }

  playRewardSound(
    'coins',
    settingsStore.soundEnabled
  )

  if (reducedMotion) {
    return
  }

  showAnimation.value = true

  animationTimer = window.setTimeout(() => {

    showAnimation.value = false

    animationTimer = null

  }, 1800)
}

// =========================================
// DOHVAT NAGRADE
// =========================================

async function loadRewards() {

  const version = ++loadVersion

  clearAnimation()

  reward.value = null

  displayEarned.value = 0

  played.value = false

  loading.value = false

  errorMessage.value = ''

  if (
    !walletStore.canLoad ||
    !gameStore.isFinished ||
    !gameStore.sessionId
  ) {
    return
  }

  const sessionId = gameStore.sessionId

  const userId = authStore.userId

  loading.value = true

  try {

    const data = await walletStore.loadWallet(
      sessionId
    )

    if (
      version !== loadVersion ||
      userId !== authStore.userId ||
      sessionId !== gameStore.sessionId ||
      !walletStore.canLoad ||
      !gameStore.isFinished
    ) {
      return
    }

    reward.value = data?.reward || null

    if (reward.value && wasSeen(reward.value)) {

      displayEarned.value =
        Number(reward.value.totalCoins)

      played.value = true

    }

  } catch {

    if (version === loadVersion) {

      errorMessage.value =
        'Dohvat O-Coins nagrade nije uspio.'

    }

  } finally {

    if (version === loadVersion) {

      loading.value = false

    }
  }
}

// =========================================
// INICIJALIZACIJA
// =========================================

watch(
  [
    () => authStore.userId,
    () => walletStore.canLoad,
    () => gameStore.sessionId,
    () => gameStore.isFinished,
  ],

  () => {

    void loadRewards()

  },

  { immediate: true }
)

watch(
  [
    () => props.ready,
    reward,
    loading,
  ],

  () => {

    if (!loading.value) {

      playAnimation()

    }
  },

  { flush: 'post' }
)

onBeforeUnmount(() => {

  loadVersion++

  clearAnimation()

})
</script>

<style scoped>
.coin-rewards {
  margin-top: 18px;
}

.coin-reward-card {
  position: relative;
  overflow: hidden;
  padding: 24px;
  border: 1px solid #d8d5ca;
  border-radius: 16px;
  background: #fffdf6;
  color: #181818;
}

.eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.4px;
  color: #66645d;
  margin-bottom: 18px;
}

.reward-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reward-description {
  flex: 1;
  min-width: 0;
}

.reward-description h3 {
  font-size: 19px;
  font-weight: 700;
  line-height: 1.3;
}

.reward-description p {
  font-size: 12px;
  color: #66645d;
  margin-top: 4px;
}

.earned-coins {
  display: flex;
  align-items: center;
  color: #15803d;
  font-size: 27px;
  font-weight: 700;
  white-space: nowrap;
}

.reward-breakdown {
  margin: 24px 0 18px;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  font-size: 14px;
}

.breakdown-row span {
  color: #66645d;
}

.level-bonus {
  background: #fef3c7;
  color: #92400e;
  padding: 12px;
  border-radius: 8px;
}

.level-bonus span {
  color: #92400e;
}

.wallet-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #181818;
  color: #facc15;
  padding: 16px;
  border-radius: 10px;
  font-size: 24px;
}

.wallet-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fffdf6;
  font-size: 14px;
}

.coin-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 18px;
  font-size: 13px;
}

@media (max-width: 600px) {

  .coin-reward-card {
    padding: 16px;
  }

  .reward-heading {
    gap: 8px;
  }

  .reward-description h3 {
    font-size: 16px;
  }

  .reward-description p {
    font-size: 11px;
  }

  .earned-coins {
    font-size: 22px;
  }

  .wallet-total {
    font-size: 21px;
  }

  .wallet-title {
    font-size: 12px;
  }
}
</style>
