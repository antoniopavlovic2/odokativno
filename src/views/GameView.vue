
<template>
  <div
    class="game-page"
    @pointerdown="settingsStore.unlockSound()"
    @keydown="settingsStore.unlockSound()"
  >
    <v-container class="game-container">

      <h1 class="sr-only">
        Odokativno – dnevni izazov
      </h1>

      <!-- AUTENTIFIKACIJA -->

      <div
        v-if="!authStore.initialized"
        class="loading-state"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="48"
        />

        <p>Učitavanje korisničke sesije...</p>
      </div>

      <!-- OBNOVA LOZINKE -->

      <section
        v-else-if="authStore.isRecovery"
        class="empty-state"
      >
        <v-icon
          icon="mdi-lock-reset"
          size="64"
          color="primary"
        />

        <h2>Postavi novu lozinku.</h2>

        <p>
          Prije nastavka igre dovrši obnovu lozinke.
        </p>

        <v-btn
          color="primary"
          to="/nova-lozinka"
        >
          Nova lozinka
        </v-btn>
      </section>

      <!-- PRIVREMENO: REGISTRIRANI IGRAČI -->

      <section
        v-else-if="!canPlay"
        class="empty-state"
      >

        <v-icon
          icon="mdi-trophy-outline"
          size="64"
          color="primary"
        />

        <h2>Zaigraj za svoje mjesto!</h2>

        <p>
          Prijavi se i osvoji svoje mjesto
          na globalnoj rang-listi.
        </p>

        <div class="auth-actions">

          <v-btn
            color="primary"
            size="large"
            to="/prijava"
          >
            Prijavi se
          </v-btn>

          <v-btn
            variant="outlined"
            size="large"
            to="/registracija"
          >
            Registriraj se
          </v-btn>

        </div>

        <v-btn
          variant="text"
          to="/rang-lista"
          prepend-icon="mdi-trophy-outline"
        >
          Pogledaj rang-listu
        </v-btn>

      </section>

      <!-- GREŠKA PRI POKRETANJU -->

      <section
        v-else-if="gameStore.error"
        class="empty-state"
      >

        <v-icon
          icon="mdi-calendar-alert"
          size="64"
          color="primary"
        />

        <h2>Izazov nije dostupan</h2>

        <p>{{ gameStore.error }}</p>

        <div class="auth-actions">

          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-refresh"
            :loading="gameStore.loading"
            @click="initializeGame"
          >
            Pokušaj ponovno
          </v-btn>

          <v-btn
            variant="outlined"
            to="/profil"
          >
            Moj profil
          </v-btn>

        </div>

        <v-btn
          variant="text"
          to="/"
        >
          Povratak na početnu
        </v-btn>

      </section>

      <!-- AKTIVNA IGRA -->

      <template
        v-else-if="
          gameStore.currentQuestion &&
          gameStore.belongsToCurrentUser
        "
      >

        <div class="game-top">

          <GameProgress
            :challenge-number="gameStore.challengeNumber"
            :current-question="gameStore.currentQuestionNumber"
            :total-questions="gameStore.totalQuestions"
            :score="gameStore.totalScore"
            :answers="gameStore.answers"
          />

          <GameTimer
            v-if="gameStore.isPlaying"
            :remaining-time="gameStore.remainingTime"
            :total-time="gameStore.timeLimit"
            class="question-timer"
          />

        </div>

        <!-- MREŽNA GREŠKA -->

        <v-alert
          v-if="gameStore.requestError"
          type="warning"
          variant="tonal"
          class="mb-4"
        >

          <strong>
            Komunikacija sa serverom nije uspjela.
          </strong>

          <p class="mt-2">
            {{ gameStore.requestError }}
          </p>

          <p class="mt-2">
            Provjeri internetsku vezu.
            Vrijeme odgovaranja nastavlja teći.
          </p>

          <v-btn
            variant="outlined"
            class="mt-3"
            prepend-icon="mdi-refresh"
            :loading="gameStore.loading"
            @click="gameStore.syncState()"
          >
            Uskladi stanje igre
          </v-btn>

        </v-alert>

        <!-- PITANJE I ODGOVOR -->

        <v-row align="start">

          <v-col cols="12" md="6">

            <QuestionCard
              :key="'question-' + gameStore.currentQuestion.id"
              :question="gameStore.currentQuestion"
            />

          </v-col>

          <v-col cols="12" md="6">

            <RangeSelector
              v-if="gameStore.isPlaying"
              :key="'range-' + gameStore.currentQuestion.id"
              :model-value="gameStore.selectedRange"
              :min="gameStore.currentQuestion.min"
              :max="gameStore.currentQuestion.max"
              :step="gameStore.currentQuestion.step"
              :unit="gameStore.currentQuestion.unit"
              :potential-points="gameStore.potentialPoints"
              :max-points="gameStore.maxPointsPerQuestion"
              :disabled="
                gameStore.isTimeExpired ||
                gameStore.loading
              "
              @update:model-value="gameStore.updateRange"
              @confirm="submitAnswer"
            />

            <AnswerFeedback
              v-else-if="
                gameStore.isAnswered &&
                gameStore.currentAnswer
              "
              :key="'feedback-' + gameStore.currentQuestion.id"
              :correct="gameStore.currentAnswer.correct"
              :timed-out="gameStore.currentAnswer.timedOut"
              :answer="gameStore.currentAnswer.correctAnswer"
              :range="gameStore.currentAnswer.range"
              :points="gameStore.currentAnswer.points"
              :unit="gameStore.currentQuestion.unit"
              :min="gameStore.currentQuestion.min"
              :max="gameStore.currentQuestion.max"
              :explanation="gameStore.currentAnswer.explanation || ''"
              :source="gameStore.currentAnswer.source || ''"
              :is-last-question="gameStore.isLastQuestion"
              @next="nextQuestion"
            />

            <!-- SPREMANJE ODGOVORA -->

            <div
              v-if="gameStore.loading"
              class="saving-state"
              role="status"
            >

              <v-progress-circular
                indeterminate
                color="primary"
                size="20"
                width="3"
              />

              <span>
                Usklađivanje sa serverom...
              </span>

            </div>

          </v-col>

        </v-row>

        <div class="game-bottom">

          <v-btn
            variant="text"
            prepend-icon="mdi-help-circle-outline"
            @click="emit('rules')"
          >
            Kako se igra?
          </v-btn>

          <span>
            Nemaš pojma? Nema veze.
          </span>

        </div>

      </template>

      <!-- UČITAVANJE -->

      <div
        v-else
        class="loading-state"
      >

        <v-progress-circular
          indeterminate
          color="primary"
          size="48"
        />

        <p>Učitavanje dnevnog izazova...</p>

      </div>

    </v-container>
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from 'vue'

import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/authStore'
import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'

import { soundService } from '@/services/soundService'

import GameProgress from '@/components/game/GameProgress.vue'
import GameTimer from '@/components/game/GameTimer.vue'
import QuestionCard from '@/components/game/QuestionCard.vue'
import RangeSelector from '@/components/game/RangeSelector.vue'
import AnswerFeedback from '@/components/game/AnswerFeedback.vue'

const emit = defineEmits(['rules'])

const router = useRouter()

const authStore = useAuthStore()
const gameStore = useGameStore()
const settingsStore = useSettingsStore()

let timerInterval = null
let alive = true

const canPlay = computed(() =>
  authStore.isAuthenticated &&
  !authStore.isRecovery &&
  !authStore.user?.is_anonymous
)

// =========================================
// INICIJALIZACIJA
// =========================================

async function initializeGame() {

  if (
    !alive ||
    !authStore.initialized
  ) {
    return
  }

  if (!canPlay.value) {
    gameStore.resetGame()
    return
  }

  const success = await gameStore.startGame()

  if (!alive || !success) {
    return
  }

  if (gameStore.isFinished) {

    if (router.currentRoute.value.name === 'game') {
      router.replace({ name: 'results' })
    }

    return
  }

  gameStore.updateTimer()
}

// =========================================
// TIMER
// =========================================

function startTimerInterval() {

  stopTimerInterval()

  timerInterval = window.setInterval(() => {

    if (gameStore.isPlaying) {
      gameStore.updateTimer()
    }

  }, 100)
}

function stopTimerInterval() {

  if (timerInterval !== null) {

    window.clearInterval(
      timerInterval
    )

    timerInterval = null
  }
}

function syncTimer() {

  if (document.hidden) {
    soundService.stopAll()
  }

  if (gameStore.isPlaying) {
    gameStore.updateTimer()
  }

  // Pri povratku na karticu dohvaćamo
  // stvarno stanje sesije sa servera.

  if (
    !document.hidden &&
    gameStore.sessionId &&
    !gameStore.loading &&
    (
      gameStore.isPlaying ||
      gameStore.isAnswered
    )
  ) {
    void gameStore.syncState()
  }
}

// =========================================
// ZVUČNO ODBROJAVANJE
// =========================================

watch(
  () => gameStore.remainingTime,

  (seconds, previousSeconds) => {

    if (!gameStore.isPlaying) return
    if (document.hidden) return
    if (seconds >= previousSeconds) return

    if (seconds >= 1 && seconds <= 5) {

      settingsStore.playSound(
        'urgentTick'
      )

    } else if (
      seconds >= 6 &&
      seconds <= 10
    ) {

      settingsStore.playSound(
        'tick'
      )
    }
  }
)

// =========================================
// ZVUČNI EFEKTI I STATUS IGRE
// =========================================

watch(
  () => gameStore.status,

  (status, previousStatus) => {

    if (!alive) return
    if (!gameStore.belongsToCurrentUser) return

    if (status === 'playing') {

      soundService.stopAll()

      if (!document.hidden) {
        settingsStore.playSound(
          'questionStart'
        )
      }

      focusElement('question-title')
    }

    if (status === 'answered') {

      soundService.stopAll()

      const answer =
        gameStore.currentAnswer

      if (answer && !document.hidden) {

        if (answer.timedOut) {

          settingsStore.playSound(
            'timeout'
          )

        } else if (answer.correct) {

          settingsStore.playSound(
            'correct'
          )

        } else {

          settingsStore.playSound(
            'incorrect'
          )
        }
      }

      focusElement('feedback-title')
    }

    if (status === 'finished') {

      stopTimerInterval()
      soundService.stopAll()

      if (
        previousStatus === 'answered' &&
        !document.hidden
      ) {
        settingsStore.playSound(
          'finished'
        )
      }

      if (router.currentRoute.value.name === 'game') {
        router.replace({ name: 'results' })
      }
    }
  },

  { flush: 'sync' }
)

// =========================================
// ODGOVARANJE
// =========================================

async function submitAnswer() {

  if (
    !gameStore.isPlaying ||
    gameStore.loading
  ) {
    return
  }

  await gameStore.submitAnswer()
}

// =========================================
// SLJEDEĆE PITANJE
// =========================================

async function nextQuestion() {

  if (
    !gameStore.isAnswered ||
    gameStore.loading
  ) {
    return
  }

  const success =
    await gameStore.nextQuestion()

  if (
    !alive ||
    !success ||
    gameStore.isFinished
  ) {
    return
  }

  focusElement('question-title')
}

// =========================================
// PRISTUPAČNOST
// =========================================

async function focusElement(id) {

  await nextTick()

  if (!alive) return

  const element =
    document.getElementById(id)

  if (!element) return

  element.setAttribute(
    'tabindex',
    '-1'
  )

  element.focus({
    preventScroll: true,
  })

  element.scrollIntoView({
    behavior: 'auto',
    block: 'nearest',
  })
}

// =========================================
// PRAĆENJE KORISNIČKE SESIJE
// =========================================

watch(
  [
    () => authStore.initialized,
    () => authStore.userId,
    () => authStore.isRecovery,
    canPlay,
  ],

  () => {

    if (!authStore.initialized) {
      return
    }

    if (
      !canPlay.value ||
      (
        gameStore.ownerId &&
        gameStore.ownerId !== authStore.userId
      )
    ) {
      gameStore.resetGame()
    }

    if (canPlay.value) {
      void initializeGame()
    }
  },

  { immediate: true }
)

// =========================================
// LIFECYCLE
// =========================================

onMounted(() => {

  startTimerInterval()

  document.addEventListener(
    'visibilitychange',
    syncTimer
  )
})

onUnmounted(() => {

  alive = false

  stopTimerInterval()

  if (!gameStore.isFinished) {
    soundService.stopAll()
  }

  document.removeEventListener(
    'visibilitychange',
    syncTimer
  )
})
</script>

<style scoped>
.game-page {
  min-height: 70vh;
  background: #f8f6ed;
  color: #181818;
}

.game-container {
  max-width: 1080px;
  padding: 48px 24px 64px;
}

.game-top {
  margin-bottom: 28px;
}

.question-timer {
  margin-top: 20px;
}

.game-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
}

.game-bottom span {
  font-size: 13px;
  color: #64635d;
}

.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  gap: 20px;
}

.empty-state h2 {
  font-size: 28px;
  font-weight: 700;
}

.empty-state p,
.loading-state p {
  color: #64635d;
}

.auth-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.saving-state {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 10px;
  padding: 14px;
  margin-top: 16px;
  color: #64635d;
  font-size: 13px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 959px) {

  .game-container {
    max-width: 600px;
  }
}

@media (max-width: 599px) {

  .game-container {
    padding: 24px 16px 40px;
  }

  .game-top {
    margin-bottom: 20px;
  }

  .question-timer {
    margin-top: 16px;
  }

  .game-bottom {
    flex-direction: column;
    gap: 8px;
    margin-top: 20px;
  }
}
</style>
