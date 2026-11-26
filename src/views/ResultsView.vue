<template>
  <div class="results-page">
    <v-container
      v-if="gameStore.isFinished"
      class="results-container"
    >
      <section class="results-header">
        <p class="challenge-label">
          DNEVNI IZAZOV #{{ challengeNumber }} · ZAVRŠENO
        </p>

        <div class="trophy-icon">
          <v-icon icon="mdi-trophy-outline" size="44" />
        </div>

        <h1>{{ resultTitle }}</h1>

        <p class="result-subtitle">
          Današnji izazov je iza tebe.
        </p>
      </section>

      <section class="score-card" aria-label="Ukupan rezultat">
        <span class="score-label">
          TVOJ REZULTAT
        </span>

        <strong class="score-value">
          {{ gameStore.totalScore }}
        </strong>

        <p>
          od mogućih {{ gameStore.maxScore }} bodova
        </p>

        <v-progress-linear
          :model-value="gameStore.scorePercentage"
          color="primary"
          bg-color="#444444"
          height="8"
          rounded
          class="mt-6"
          aria-label="Postotak maksimalnog rezultata"
        />
      </section>

      <section class="statistics-grid" aria-label="Statistika igre">
        <article
          v-for="stat in statistics"
          :key="stat.label"
          class="stat-card"
        >
          <v-icon
            :icon="stat.icon"
            size="26"
            aria-hidden="true"
          />

          <strong>{{ stat.value }}</strong>
          <span>{{ stat.label }}</span>
        </article>
      </section>

      <section class="answers-section">
        <h2>TVOJI ODGOVORI</h2>

        <div
          class="answers-grid"
          :style="{
            gridTemplateColumns:
              `repeat(${gameStore.totalQuestions}, minmax(0, 1fr))`
          }"
        >
          <div
            v-for="(answer, index) in gameStore.answers"
            :key="answer.questionId"
            class="answer-tile"
            :class="
              answer.timedOut
                ? 'answer-timeout'
                : answer.correct
                  ? 'answer-correct'
                  : 'answer-incorrect'
            "
            :aria-label="`Pitanje ${index + 1}: ${answer.points} bodova`"
          >
            <span class="answer-index">
              {{ index + 1 }}
            </span>

            <v-icon
              :icon="
                answer.timedOut
                  ? 'mdi-timer-off-outline'
                  : answer.correct
                    ? 'mdi-check'
                    : 'mdi-close'
              "
            />

            <strong>{{ answer.points }}</strong>
          </div>
        </div>

        <v-expansion-panels
          variant="accordion"
          class="answer-details"
        >
          <v-expansion-panel
            v-for="(answer, index) in gameStore.answers"
            :key="answer.questionId"
            elevation="0"
          >
            <v-expansion-panel-title>
              <div class="detail-title">
                <v-icon
                  :icon="
                    answer.timedOut
                      ? 'mdi-timer-off-outline'
                      : answer.correct
                        ? 'mdi-check-circle'
                        : 'mdi-close-circle'
                  "
                  :color="
                    answer.timedOut
                      ? 'warning'
                      : answer.correct
                        ? 'success'
                        : 'error'
                  "
                />

                <span>
                  {{ gameStore.questions[index].question }}
                </span>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <div class="detail-content">
                <p v-if="answer.timedOut">
                  <strong>
                    Vrijeme je isteklo – procjena nije potvrđena.
                  </strong>
                </p>

                <p v-else>
                  Tvoj raspon:
                  <strong>
                    {{ formatNumber(answer.range[0]) }}
                    –
                    {{ formatNumber(answer.range[1]) }}
                    {{ gameStore.questions[index].unit }}
                  </strong>
                </p>

                <p>
                  Točan odgovor:
                  <strong>
                    {{ formatNumber(answer.correctAnswer) }}
                    {{ gameStore.questions[index].unit }}
                  </strong>
                </p>

                <p>
                  Osvojeni bodovi:
                  <strong>{{ answer.points }}</strong>
                </p>

                <p class="detail-explanation">
                  {{ gameStore.questions[index].explanation }}
                </p>

                <a
                  v-if="gameStore.questions[index].source"
                  :href="gameStore.questions[index].source"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Izvor podatka
                </a>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </section>

      <div class="results-actions">
        <v-btn
          block
          color="primary"
          height="60"
          elevation="0"
          prepend-icon="mdi-share-variant-outline"
          class="action-button"
          @click="shareResult"
        >
          PODIJELI REZULTAT
        </v-btn>

        <v-btn
          block
          variant="outlined"
          color="secondary"
          height="54"
          class="action-button"
          to="/"
        >
          POVRATAK NA POČETNU
        </v-btn>

        <v-btn
          v-if="isDevelopment"
          block
          variant="text"
          prepend-icon="mdi-replay"
          @click="replayTestGame"
        >
          Ponovi testni izazov
        </v-btn>
      </div>

      <section class="next-challenge">
        <v-icon
          icon="mdi-calendar-clock"
          size="34"
          aria-hidden="true"
        />

        <h2>Novi izazov stiže sutra!</h2>

        <p>
          Svaki dan nova prilika za bolji rezultat.
        </p>
      </section>
    </v-container>

    <v-snackbar
      v-model="snackbar"
      color="secondary"
      :timeout="3500"
    >
      {{ snackbarMessage }}

      <template #actions>
        <v-btn
          variant="text"
          @click="snackbar = false"
        >
          ZATVORI
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'

const router = useRouter()
const gameStore = useGameStore()
const settingsStore = useSettingsStore()

const snackbar = ref(false)
const snackbarMessage = ref('')

const isDevelopment =
  process.env.NODE_ENV === 'development'

onMounted(() => {
  if (!gameStore.isFinished) {
    router.replace({ name: 'home' })
  }
})

const challengeNumber = computed(() => {
  return String(gameStore.challengeNumber).padStart(3, '0')
})

const resultTitle = computed(() => {
  const percentage = gameStore.scorePercentage

  if (
    gameStore.maxScore > 0 &&
    gameStore.totalScore === gameStore.maxScore
  ) {
    return 'SAVRŠENA PROCJENA!'
  }

  if (percentage >= 90) {
    return 'NEVJEROJATNO OKO!'
  }

  if (percentage >= 70) {
    return 'IMAŠ DOBRO OKO!'
  }

  if (percentage >= 50) {
    return 'DOBAR OSJEĆAJ!'
  }

  if (percentage >= 25) {
    return 'NIJE LOŠE!'
  }

  return 'SUTRA JE NOVA PRILIKA!'
})

const formattedDuration = computed(() => {
  const duration = gameStore.answeringDuration
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

const statistics = computed(() => [
  {
    icon: 'mdi-target',
    value: `${gameStore.correctAnswers}/${gameStore.totalQuestions}`,
    label: 'Pogodaka',
  },
  {
    icon: 'mdi-percent-outline',
    value: `${gameStore.accuracy}%`,
    label: 'Točnost',
  },
  {
    icon: 'mdi-timer-off-outline',
    value: gameStore.timedOutAnswers,
    label: 'Istek vremena',
  },
  {
    icon: 'mdi-clock-outline',
    value: formattedDuration.value,
    label: 'Vrijeme odgovaranja',
  },
])

const numberFormatter = new Intl.NumberFormat('hr-HR', {
  maximumFractionDigits: 6,
})

function formatNumber(value) {
  return numberFormatter.format(value)
}

const shareText = computed(() => {
  const emojis = gameStore.answers
    .map(answer => {
      if (answer.timedOut) return '⏰'
      if (!answer.correct) return '🟥'
      if (answer.points >= 80) return '🟩'

      return '🟨'
    })
    .join('')

  return [
    `ODOKATIVNO. #${challengeNumber.value}`,
    '',
    emojis,
    '',
    `🎯 ${gameStore.totalScore}/${gameStore.maxScore} bodova`,
    `👁️ ${gameStore.correctAnswers}/${gameStore.totalQuestions} pogodaka`,
    `⏱️ ${formattedDuration.value}`,
    '',
    'Nemaš pojma? Nema veze.',
  ].join('\n')
})

async function shareResult() {
  const homeUrl = new URL(
    router.resolve({ name: 'home' }).href,
    window.location.origin
  ).href

  const text = `${shareText.value}\n${homeUrl}`

  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Odokativno – moj rezultat',
        text,
      })

      return
    }

    await navigator.clipboard.writeText(text)

    showMessage('Rezultat je kopiran!')
  } catch (error) {
    if (error.name === 'AbortError') return

    showMessage('Dijeljenje rezultata nije uspjelo.')
  }
}

function showMessage(message) {
  snackbarMessage.value = message
  snackbar.value = true
}

function replayTestGame() {
  if (!isDevelopment) return

  settingsStore.unlockSound()
  gameStore.resetGame()

  router.push({ name: 'game' })
}
</script>

<style scoped>
.results-page {
  min-height: 75vh;
  background: #f8f6ed;
  color: #181818;
}

.results-container {
  max-width: 640px;
  padding: 48px 24px 64px;
}

.results-header {
  text-align: center;
  margin-bottom: 28px;
}

.challenge-label {
  font-size: 11px;
  letter-spacing: 1.5px;
  font-weight: 600;
  color: #64635d;
}

.trophy-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  margin: 24px auto 20px;
  background: #facc15;
  border: 2px solid #181818;
  border-radius: 50%;
}

.results-header h1 {
  font-size: clamp(26px, 5vw, 38px);
  font-weight: 700;
  letter-spacing: -1.5px;
  line-height: 1.2;
}

.result-subtitle {
  color: #64635d;
  font-size: 14px;
  margin-top: 10px;
}

.score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #181818;
  color: #fffdf6;
  border-radius: 24px;
  padding: 32px;
  text-align: center;
}

.score-label {
  color: #facc15;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
}

.score-value {
  font-size: 88px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -5px;
  color: #facc15;
  font-variant-numeric: tabular-nums;
}

.score-card p {
  font-size: 14px;
  color: #d1d1d1;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: #fffdf6;
  border: 1px solid #181818;
  border-radius: 16px;
  padding: 20px 8px;
}

.stat-card strong {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -1px;
}

.stat-card span {
  font-size: 12px;
  color: #64635d;
}

.answers-section {
  margin-top: 32px;
}

.answers-section h2 {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  margin-bottom: 16px;
}

.answers-grid {
  display: grid;
  gap: 8px;
}

.answer-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 12px 4px;
  border-radius: 12px;
}

.answer-correct {
  background: #dcfce7;
  color: #15803d;
}

.answer-incorrect {
  background: #fee2e2;
  color: #dc2626;
}

.answer-timeout {
  background: #fef3c7;
  color: #b45309;
}

.answer-index {
  font-size: 11px;
  opacity: 0.8;
}

.answer-tile strong {
  font-size: 16px;
  font-weight: 700;
}

.answer-details {
  margin-top: 24px;
  border: 1px solid rgba(24, 24, 24, 0.15);
  border-radius: 14px;
  overflow: hidden;
}

.answer-details :deep(.v-expansion-panel) {
  background: #fffdf6;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  line-height: 1.5;
  font-weight: 600;
}

.detail-content {
  font-size: 13px;
  line-height: 1.8;
}

.detail-content p {
  margin-bottom: 8px;
}

.detail-explanation {
  color: #64635d;
  margin-top: 16px;
}

.detail-content a {
  color: #181818;
  text-underline-offset: 3px;
}

.results-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 28px;
}

.action-button {
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.next-challenge {
  margin-top: 32px;
  padding-top: 28px;
  text-align: center;
  border-top: 1px solid rgba(24, 24, 24, 0.15);
}

.next-challenge h2 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-top: 12px;
}

.next-challenge p {
  color: #64635d;
  font-size: 13px;
  margin-top: 8px;
}

@media (max-width: 599px) {
  .results-container {
    padding: 28px 16px 40px;
  }

  .score-card {
    padding: 24px;
    border-radius: 18px;
  }

  .score-value {
    font-size: 72px;
  }

  .statistics-grid {
    gap: 8px;
  }

  .stat-card {
    padding: 16px 4px;
  }

  .stat-card strong {
    font-size: 22px;
  }

  .stat-card span {
    font-size: 11px;
  }

  .answers-grid {
    gap: 5px;
  }

  .answer-tile strong {
    font-size: 13px;
  }

  .answer-tile {
    border-radius: 8px;
  }

  .action-button {
    font-size: 12px;
  }
}
</style>