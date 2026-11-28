
<template>
  <section
    v-if="
      progressionStore.canLoad &&
      gameStore.isFinished
    "
    class="rewards-section"
  >

    <div
      v-if="progressionStore.loading"
      class="reward-loading"
    >

      <v-progress-circular
        indeterminate
        color="primary"
        size="24"
        width="3"
      />

      <span>Učitavanje iskustva...</span>

    </div>

    <v-alert
      v-else-if="progressionStore.errorMessage"
      type="warning"
      variant="tonal"
    >

      {{ progressionStore.errorMessage }}

      <v-btn
        variant="text"
        class="mt-2"
        @click="loadRewards"
      >
        Pokušaj ponovno
      </v-btn>

    </v-alert>

    <div
      v-else-if="displayProgress"
      class="reward-card"
    >

      <div class="eyebrow">
        ODOKATIVNO. / NAPREDAK
      </div>

      <div class="reward-heading">

        <div class="reward-icon">

          <v-icon size="30">
            mdi-lightning-bolt
          </v-icon>

        </div>

        <div class="reward-details">

          <h3>
            {{
              reward
                ? 'Osvojeno iskustvo'
                : 'Tvoje iskustvo'
            }}
          </h3>

          <p>
            {{
              reward
                ? 'Napreduješ svakim izazovom.'
                : 'Nastavi igrati i napreduj.'
            }}
          </p>

        </div>

        <div
          v-if="reward"
          class="reward-xp"
        >

          +{{ reward.xpAwarded }}

          <span>XP</span>

        </div>

      </div>

      <XPProgressBar
        :level="displayProgress.level"
        :xp="displayProgress.xpIntoLevel"
        :xp-required="displayProgress.xpRequired"
        :animated="animateProgress"
      />

      <div class="reward-total">

        <span>Ukupno iskustvo</span>

        <strong>

          {{
            formatNumber(
              progressionStore.totalXp
            )
          }} XP

        </strong>

      </div>

      <LevelUpDialog
        v-if="reward"
        v-model="levelUpDialog"
        :previous-level="reward.before.level"
        :level="reward.after.level"
      />

    </div>

    <GameCoinRewards
      :ready="
        xpAnimationDone &&
        !levelUpDialog
      "
    />

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
import { useSettingsStore } from '@/stores/settingsStore'

import {
  useProgressionStore,
} from '@/stores/progressionStore'

import {
  playRewardSound,
} from '@/services/rewardSoundService'

import GameCoinRewards
  from '@/components/wallet/GameCoinRewards.vue'

import XPProgressBar from './XPProgressBar.vue'
import LevelUpDialog from './LevelUpDialog.vue'

const authStore = useAuthStore()

const gameStore = useGameStore()

const settingsStore = useSettingsStore()

const progressionStore =
  useProgressionStore()

const displayProgress = ref(null)

const reward = ref(null)

const animateProgress = ref(true)

const levelUpDialog = ref(false)

const xpAnimationDone = ref(false)

let animationTimer = null

let loadVersion = 0

// =========================================
// FORMATIRANJE
// =========================================

function formatNumber(value) {

  return new Intl.NumberFormat(
    'hr-HR'
  ).format(value)
}

// =========================================
// EVIDENCIJA PRIKAZANIH ANIMACIJA
// =========================================

function getRewardKey(data) {

  return (
    'odokativno-reward-seen:' +
    authStore.userId +
    ':' +
    data.sessionId
  )
}

function wasRewardSeen(data) {

  try {

    return localStorage.getItem(
      getRewardKey(data)
    ) === '1'

  } catch {

    return false

  }
}

function markRewardSeen(data) {

  try {

    localStorage.setItem(
      getRewardKey(data),
      '1'
    )

  } catch {

    // Animacija radi i bez localStoragea.

  }
}

// =========================================
// ANIMACIJE
// =========================================

function clearAnimation() {

  if (animationTimer !== null) {

    window.clearTimeout(
      animationTimer
    )

    animationTimer = null
  }
}

function isMilestone(before, after) {

  return [10, 25, 50, 75, 100].some(
    level =>
      before < level &&
      after >= level
  )
}

function finishRewardAnimation(data) {

  animateProgress.value = false

  displayProgress.value = {
    ...data.after,
  }

  const leveledUp =
    data.after.level >
    data.before.level

  if (leveledUp) {

    levelUpDialog.value = true

    playRewardSound(

      isMilestone(
        data.before.level,
        data.after.level
      )
        ? 'milestone'
        : 'levelUp',

      settingsStore.soundEnabled
    )
  }

  markRewardSeen(data)
  xpAnimationDone.value = true
}

function startRewardAnimation(data) {

  clearAnimation()

  const leveledUp =
    data.after.level >
    data.before.level

  const reducedMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

  displayProgress.value = {
    ...data.before,
  }

  animateProgress.value = !reducedMotion

  if (reducedMotion) {

    if (!leveledUp) {

      playRewardSound(
        'xp',
        settingsStore.soundEnabled
      )
    }

    finishRewardAnimation(data)

    return
  }

  animationTimer = window.setTimeout(() => {

    animationTimer = null

    playRewardSound(
      'xp',
      settingsStore.soundEnabled
    )

    if (leveledUp) {

      // Prvo popunjavamo postojeći level.

      displayProgress.value = {

        ...data.before,

        xpIntoLevel:
          data.before.xpRequired,

        progressPercent: 100,

      }

    } else {

      displayProgress.value = {
        ...data.after,
      }

    }

    animationTimer = window.setTimeout(() => {

      animationTimer = null

      // Nakon punjenja trake
      // prikazujemo novi level.

      finishRewardAnimation(data)

    }, 900)

  }, 200)
}

// =========================================
// DOHVAT NAGRADE
// =========================================

async function loadRewards() {

  const version = ++loadVersion
  xpAnimationDone.value = false

  clearAnimation()

  levelUpDialog.value = false

  displayProgress.value = null

  reward.value = null

  if (
    !progressionStore.canLoad ||
    !gameStore.isFinished ||
    !gameStore.sessionId
  ) {
    return
  }

  const sessionId = gameStore.sessionId

  const userId = authStore.userId

  const data =
    await progressionStore.loadProgress(
      sessionId
    )

  if (
    version !== loadVersion ||
    !progressionStore.canLoad ||
    !gameStore.isFinished ||
    gameStore.sessionId !== sessionId ||
    authStore.userId !== userId
  ) {
    return
  }

  if (!data?.progress) {

  xpAnimationDone.value = true

  return
  }

  reward.value = data.reward || null

  if (!data.reward) {

    displayProgress.value = {
        ...data.progress,
    }

    xpAnimationDone.value = true

    return
  }   

  if (wasRewardSeen(data.reward)) {

  animateProgress.value = false

  displayProgress.value = {
    ...data.reward.after,
  }

  xpAnimationDone.value = true

  return
}

  startRewardAnimation(data.reward)
}

// =========================================
// INICIJALIZACIJA
// =========================================

watch(

  [
    () => gameStore.sessionId,
    () => gameStore.isFinished,
    () => authStore.userId,
    () => progressionStore.canLoad,
  ],

  () => {

    void loadRewards()

  },

  { immediate: true }
)

onBeforeUnmount(() => {

  loadVersion++

  clearAnimation()

})
</script>

<style scoped>
.rewards-section {
  margin: 24px 0;
}

.reward-card {
  padding: 24px;
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 16px;
}

.eyebrow {
  color: #66645d;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.4px;
  margin-bottom: 18px;
}

.reward-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 26px;
}

.reward-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  background: #fef3c7;
  border-radius: 12px;
  color: #a16207;
  flex-shrink: 0;
}

.reward-details {
  flex: 1;
  min-width: 0;
}

.reward-details h3 {
  font-size: 19px;
  font-weight: 700;
  color: #181818;
  line-height: 1.3;
}

.reward-details p {
  color: #66645d;
  font-size: 12px;
  margin-top: 4px;
}

.reward-xp {
  color: #15803d;
  font-size: 32px;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
  animation: xp-appear 450ms ease-out both;
}

.reward-xp span {
  font-size: 13px;
  letter-spacing: 0;
}

.reward-total {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e2d8;
  font-size: 13px;
  color: #66645d;
}

.reward-total strong {
  color: #181818;
}

.reward-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  font-size: 13px;
  color: #66645d;
}

@keyframes xp-appear {

  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {

  .reward-card {
    padding: 18px;
  }

  .reward-heading {
    gap: 10px;
  }

  .reward-icon {
    width: 42px;
    height: 42px;
  }

  .reward-details h3 {
    font-size: 16px;
  }

  .reward-details p {
    font-size: 11px;
  }

  .reward-xp {
    font-size: 25px;
  }
}

@media (prefers-reduced-motion: reduce) {

  .reward-xp {
    animation: none;
  }
}
</style>
