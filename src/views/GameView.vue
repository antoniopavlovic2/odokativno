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

      <section
        v-if="gameStore.error"
        class="empty-state"
      >
        <v-icon
          icon="mdi-calendar-alert"
          size="64"
          color="primary"
        />

        <h2>Izazov nije dostupan</h2>
        <p>{{ gameStore.error }}</p>

        <v-btn color="primary" size="large" to="/">
          Povratak na početnu
        </v-btn>
      </section>

      <template v-else-if="gameStore.currentQuestion">
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
              :disabled="gameStore.isTimeExpired"
              @update:model-value="gameStore.updateRange"
              @confirm="submitAnswer"
            />

            <AnswerFeedback
              v-else-if="gameStore.isAnswered && gameStore.currentAnswer"
              :key="'feedback-' + gameStore.currentQuestion.id"
              :correct="gameStore.currentAnswer.correct"
              :timed-out="gameStore.currentAnswer.timedOut"
              :answer="gameStore.currentAnswer.correctAnswer"
              :range="gameStore.currentAnswer.range"
              :points="gameStore.currentAnswer.points"
              :unit="gameStore.currentQuestion.unit"
              :min="gameStore.currentQuestion.min"
              :max="gameStore.currentQuestion.max"
              :explanation="gameStore.currentQuestion.explanation"
              :source="gameStore.currentQuestion.source"
              :is-last-question="gameStore.isLastQuestion"
              @next="nextQuestion"
            />
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

          <span>Nemaš pojma? Nema veze.</span>
        </div>
      </template>

      <div v-else class="loading-state">
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
import { onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'

import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'

import { getTodayDate } from '@/utils/date'
import { soundService } from '@/services/soundService'

import GameProgress from '@/components/game/GameProgress.vue'
import GameTimer from '@/components/game/GameTimer.vue'
import QuestionCard from '@/components/game/QuestionCard.vue'
import RangeSelector from '@/components/game/RangeSelector.vue'
import AnswerFeedback from '@/components/game/AnswerFeedback.vue'

const emit = defineEmits(['rules'])

const router = useRouter()
const gameStore = useGameStore()
const settingsStore = useSettingsStore()

let timerInterval = null

// Inicijalizacija igre
onMounted(() => {
  if (typeof gameStore.updateTimer !== 'function') {
    gameStore.error =
      'Timer nije dostupan. Provjeri verziju gameStore.js.'

    return
  }

  initializeGame()

  if (gameStore.isFinished || gameStore.error) {
    return
  }

  gameStore.updateTimer()
  startTimerInterval()

  document.addEventListener(
    'visibilitychange',
    syncTimer
  )
})

onUnmounted(() => {
  stopTimerInterval()

  if (!gameStore.isFinished) {
    soundService.stopAll()
  }

  document.removeEventListener(
    'visibilitychange',
    syncTimer
  )
})

function initializeGame() {
  const today = getTodayDate()
  const isDevelopment =
    process.env.NODE_ENV === 'development'

  const hasActiveChallenge =
    gameStore.challenge &&
    (
      gameStore.challenge.date === today ||
      isDevelopment
    )

  if (hasActiveChallenge) {
    if (gameStore.isFinished) {
      router.replace({ name: 'results' })
      return
    }

    if (gameStore.isPlaying || gameStore.isAnswered) {
      preloadNextImage()
      return
    }
  }

  let started = gameStore.startGame(today)

  if (!started && isDevelopment) {
    started = gameStore.startTestGame()
  }

  if (started) {
    preloadNextImage()
  }
}

// Timer
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
    window.clearInterval(timerInterval)
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
}

// Zvučno odbrojavanje
watch(
  () => gameStore.remainingTime,
  (seconds, previousSeconds) => {
    if (!gameStore.isPlaying) return
    if (document.hidden) return
    if (seconds >= previousSeconds) return

    if (seconds >= 1 && seconds <= 5) {
      settingsStore.playSound('urgentTick')
    } else if (seconds >= 6 && seconds <= 10) {
      settingsStore.playSound('tick')
    }
  }
)

// Zvučni efekti odgovora
watch(
  () => gameStore.status,
  status => {
    if (status === 'playing') {
      soundService.stopAll()

      if (!document.hidden) {
        settingsStore.playSound('questionStart')
      }
    }

    if (status === 'answered') {
      soundService.stopAll()

      const answer = gameStore.currentAnswer

      if (answer && !document.hidden) {
        if (answer.timedOut) {
          settingsStore.playSound('timeout')
        } else if (answer.correct) {
          settingsStore.playSound('correct')
        } else {
          settingsStore.playSound('incorrect')
        }
      }

      focusElement('feedback-title')
    }
  },
  { flush: 'sync' }
)

function submitAnswer() {
  if (!gameStore.isPlaying) return

  gameStore.submitAnswer()
}

function nextQuestion() {
  const success = gameStore.nextQuestion()

  if (!success) return

  if (gameStore.isFinished) {
    stopTimerInterval()

    soundService.stopAll()
    settingsStore.playSound('finished')

    router.push({ name: 'results' })
    return
  }

  focusElement('question-title')
}

// Pristupačnost
async function focusElement(id) {
  await nextTick()

  const element = document.getElementById(id)

  if (!element) return

  element.setAttribute('tabindex', '-1')
  element.focus({ preventScroll: true })

  element.scrollIntoView({
    behavior: 'auto',
    block: 'nearest',
  })
}

// Predučitavanje fotografija
function preloadNextImage() {
  const nextIndex = gameStore.currentQuestionIndex + 1
  const nextQuestion = gameStore.questions[nextIndex]

  if (!nextQuestion?.image) return

  const image = new Image()
  image.src = nextQuestion.image
}

watch(
  () => gameStore.currentQuestionIndex,
  () => {
    preloadNextImage()
  }
)
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