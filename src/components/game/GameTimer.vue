
<template>
  <section
    class="game-timer"
    :class="timerClass"
    aria-label="Vrijeme za odgovor"
  >

    <div class="timer-header">

      <div class="timer-label">
        <v-icon
          icon="mdi-timer-outline"
          size="24"
          aria-hidden="true"
        />

        <span>PREOSTALO VRIJEME</span>
      </div>

      <strong
        class="timer-value"
        role="timer"
      >
        {{ formattedTime }}
      </strong>

    </div>

    <div
      class="timer-track"
      role="progressbar"
      aria-label="Preostalo vrijeme"
      :aria-valuenow="remainingTime"
      :aria-valuemin="0"
      :aria-valuemax="totalTime"
    >
      <div
        class="timer-fill"
        :style="{ width: percentage + '%' }"
      />
    </div>

    <p
      v-if="remainingTime === 0"
      class="timer-message"
      role="status"
    >
      Vrijeme je isteklo!
    </p>

    <p
      v-else-if="remainingTime <= 5"
      class="timer-message"
    >
      Požuri, vrijeme istječe!
    </p>

  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  remainingTime: {
    type: Number,
    required: true,
  },

  totalTime: {
    type: Number,
    default: 20,
  },
})

const formattedTime = computed(() => {
  const minutes = Math.floor(
    props.remainingTime / 60
  )

  const seconds = props.remainingTime % 60

  return (
    String(minutes).padStart(2, '0') +
    ':' +
    String(seconds).padStart(2, '0')
  )
})

const percentage = computed(() => {
  if (props.totalTime <= 0) return 0

  return Math.max(
    0,
    Math.min(
      100,
      props.remainingTime / props.totalTime * 100
    )
  )
})

const timerClass = computed(() => {
  if (props.remainingTime === 0) {
    return 'timer-expired'
  }

  if (props.remainingTime <= 5) {
    return 'timer-danger'
  }

  if (props.remainingTime <= 10) {
    return 'timer-warning'
  }

  return 'timer-normal'
})
</script>

<style scoped>
.game-timer {
  --timer-color: #facc15;

  width: 100%;
  background: #fffdf6;
  color: #181818;
  border: 1px solid #181818;
  border-radius: 14px;
  padding: 16px 20px;
}

.timer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.timer-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
}

.timer-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
}

.timer-track {
  width: 100%;
  height: 8px;
  border-radius: 10px;
  background: #dedcd3;
  overflow: hidden;
}

.timer-fill {
  height: 100%;
  background: var(--timer-color);
  border-radius: 10px;
  transition:
    width 0.25s linear,
    background-color 0.2s ease;
}

.timer-warning {
  --timer-color: #d97706;
}

.timer-danger,
.timer-expired {
  --timer-color: #dc2626;
}

.timer-warning .timer-value,
.timer-danger .timer-value,
.timer-expired .timer-value {
  color: var(--timer-color);
}

.timer-danger .timer-label .v-icon,
.timer-expired .timer-label .v-icon {
  color: #dc2626;
}

.timer-message {
  margin-top: 10px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #dc2626;
}

@media (max-width: 599px) {
  .game-timer {
    padding: 14px 16px;
    border-radius: 12px;
  }

  .timer-label {
    font-size: 10px;
    letter-spacing: 0.5px;
  }

  .timer-value {
    font-size: 24px;
  }

  .timer-track {
    height: 6px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .timer-fill {
    transition: none;
  }
}
</style>
