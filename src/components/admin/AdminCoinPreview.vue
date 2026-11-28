
<template>
  <div
    v-if="adminStore.isAdmin"
    class="coin-preview"
  >

    <v-divider class="my-5" />

    <h3>O-Coins animacija</h3>

    <p class="description">
      Simuliraj dnevnu nagradu i Level Up bonus.
    </p>

    <div class="preview-card">

      <CoinAnimation v-if="animating" />

      <div class="preview-label">
        TESTNI NOVČANIK
      </div>

      <div class="preview-balance">

        <CoinCounter
          :key="run"
          :amount="balance"
          :size="38"
        />

      </div>

      <p>
        Nagrada: +30 O-Coins
        <br>
        Level Up bonus: +25 O-Coins
      </p>

    </div>

    <v-btn
      block
      color="primary"
      elevation="0"
      height="48"
      prepend-icon="mdi-cash-plus"
      :disabled="animating"
      @click="testCoins"
    >
      Testiraj +55 O-Coins
    </v-btn>

    <p class="safe-note">
      Simulacija ne mijenja stvarni novčanik.
    </p>

  </div>
</template>

<script setup>
import {
  ref,
  onBeforeUnmount,
} from 'vue'

import { useAdminStore } from '@/stores/adminStore'
import { useSettingsStore } from '@/stores/settingsStore'

import {
  unlockRewardSound,
  playRewardSound,
} from '@/services/rewardSoundService'

import CoinCounter
  from '@/components/wallet/CoinCounter.vue'

import CoinAnimation
  from '@/components/wallet/CoinAnimation.vue'

const adminStore = useAdminStore()

const settingsStore = useSettingsStore()

const balance = ref(100)

const animating = ref(false)

const run = ref(0)

let timer = null

let finishTimer = null

let alive = true

function testCoins() {

  if (
    !adminStore.isAdmin ||
    animating.value
  ) {
    return
  }

  run.value++

  const currentRun = run.value

  balance.value = 100

  animating.value = true

  if (settingsStore.soundEnabled) {

    void unlockRewardSound().then(ready => {

      if (
        ready &&
        alive &&
        adminStore.isAdmin &&
        animating.value &&
        currentRun === run.value
      ) {

        playRewardSound(
          'coins',
          settingsStore.soundEnabled
        )

      }
    })
  }

  timer = window.setTimeout(() => {

    timer = null

    balance.value = 155

  }, 250)

  finishTimer = window.setTimeout(() => {

    finishTimer = null

    animating.value = false

  }, 1800)
}

onBeforeUnmount(() => {

  alive = false

  if (timer !== null) {

    window.clearTimeout(timer)

  }

  if (finishTimer !== null) {

    window.clearTimeout(finishTimer)

  }
})
</script>

<style scoped>
.coin-preview h3 {
  font-size: 18px;
  font-weight: 700;
}

.description {
  color: #66645d;
  font-size: 13px;
  margin: 8px 0 16px;
}

.preview-card {
  position: relative;
  overflow: hidden;
  padding: 24px;
  margin-bottom: 16px;
  background: #181818;
  color: #facc15;
  border-radius: 12px;
  text-align: center;
}

.preview-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
}

.preview-balance {
  font-size: 40px;
  margin: 12px 0;
}

.preview-card p {
  color: #fffdf6;
  font-size: 13px;
  line-height: 1.8;
}

.safe-note {
  color: #66645d;
  font-size: 12px;
  margin-top: 12px;
}
</style>
