
<template>
  <section
    class="game-progress"
    aria-label="Napredak dnevnog izazova"
  >
    <div class="progress-header">

      <span class="challenge-label">
        DNEVNI IZAZOV #{{ formattedChallenge }}
      </span>

      <div class="score">
        <v-icon
          icon="mdi-trophy-outline"
          size="20"
          aria-hidden="true"
        />

        <span>{{ score }} BODOVA</span>
      </div>

    </div>

    <div class="progress-track">
      <div
        v-for="index in totalQuestions"
        :key="index"
        class="progress-segment"
        :class="getSegmentClass(index)"
        :aria-label="getSegmentLabel(index)"
        role="img"
      />
    </div>

    <p class="question-counter">
      PITANJE {{ currentQuestion }} OD {{ totalQuestions }}
    </p>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  challengeNumber: {
    type: Number,
    default: 1,
  },

  currentQuestion: {
    type: Number,
    default: 1,
  },

  totalQuestions: {
    type: Number,
    default: 7,
  },

  score: {
    type: Number,
    default: 0,
  },

  answers: {
    type: Array,
    default: () => [],
  },
})

const formattedChallenge = computed(() => {
  return String(props.challengeNumber).padStart(3, '0')
})

function getSegmentClass(index) {
  const answer = props.answers[index - 1]

  if (answer) {
    if (answer.timedOut) {
      return 'timeout'
    }

    return answer.correct
      ? 'correct'
      : 'incorrect'
  }

  if (index === props.currentQuestion) {
    return 'active'
  }

  return 'pending'
}

function getSegmentLabel(index) {
  const status = getSegmentClass(index)

  const labels = {
    correct: 'Pogodak',
    incorrect: 'Promašaj',
    timeout: 'Istek vremena',
    active: 'Trenutno pitanje',
    pending: 'Neodgovoreno',
  }

  return `Pitanje ${index}: ${labels[status]}`
}
</script>

<style scoped>
.timeout {
  background: #d97706;
}

.game-progress {
  width: 100%;
  color: #181818;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.challenge-label {
  color: #64635d;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
}

.score {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
}

.progress-track {
  display: flex;
  gap: 6px;
}

.progress-segment {
  flex: 1;
  height: 7px;
  border-radius: 10px;
  transition: background-color 0.2s ease;
}

.pending {
  background: #dedcd3;
}

.active {
  background: #facc15;
}

.correct {
  background: #16a34a;
}

.incorrect {
  background: #dc2626;
}

.question-counter {
  text-align: center;
  margin-top: 14px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #64635d;
}

@media (max-width: 599px) {
  .challenge-label {
    font-size: 10px;
  }

  .score {
    font-size: 12px;
  }

  .progress-segment {
    height: 6px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .progress-segment {
    transition: none;
  }
}
</style>
