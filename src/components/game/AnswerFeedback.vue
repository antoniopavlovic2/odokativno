
<template>
  <section
    class="answer-feedback"
    aria-labelledby="feedback-title"
  >

    <!-- Pogodak ili promašaj -->
    
    <div
    class="feedback-header"
    aria-live="polite"
    >

    <div
        class="status-icon"
        :class="feedbackClass + '-icon'"
    >
        <v-icon
        :icon="feedbackIcon"
        size="36"
        aria-hidden="true"
        />
    </div>

    <h2
        id="feedback-title"
        :class="feedbackClass + '-text'"
    >
        {{ feedbackTitle }}
    </h2>

    <p class="feedback-message">
        {{ feedbackMessage }}
    </p>

    <span class="answer-label">
        TOČAN ODGOVOR
    </span>

    <strong class="answer-value">
        {{ formatNumber(answer) }} {{ unit }}
    </strong>

    </div>


    <!-- Rezultat procjene -->
    <div class="result-grid">

      <div class="result-box">
        <span>TVOJ RASPON</span>

        <strong v-if="!timedOut">
            {{ formatNumber(range[0]) }} –
            {{ formatNumber(range[1]) }} {{ unit }}
        </strong>

        <strong v-else>
            Nije potvrđen
        </strong>
    </div>

      <div class="result-box">
        <span>OSVOJENI BODOVI</span>

        <strong
          class="earned-points"
          :class="correct ? 'success-text' : 'error-text'"
        >
          +{{ points }}
        </strong>
      </div>

    </div>

    <!-- Vizualni prikaz odgovora -->
    <div v-if="!timedOut" class="answer-visualization">

      <div
        class="answer-track"
        role="img"
        :aria-label="visualizationLabel"
      >

        <div
          class="selected-range"
          :class="correct ? 'range-correct' : 'range-incorrect'"
          :style="rangeStyle"
        />

        <div
          class="answer-marker"
          :style="{ left: answerPosition + '%' }"
        />

      </div>

      <div class="track-labels">
        <span>{{ formatNumber(min) }} {{ unit }}</span>
        <span>{{ formatNumber(max) }} {{ unit }}</span>
      </div>

      <div class="visualization-legend">

        <span>
          <i
            class="legend-color"
            :class="correct ? 'range-correct' : 'range-incorrect'"
          />
          Tvoj raspon
        </span>

        <span>
          <i class="legend-marker" />
          Točan odgovor
        </span>

      </div>

    </div>

    <!-- Objašnjenje odgovora -->
    <aside
      v-if="explanation"
      class="explanation-box"
    >

      <div class="explanation-title">
        <v-icon
          icon="mdi-lightbulb-outline"
          size="22"
          aria-hidden="true"
        />

        <strong>JESI LI ZNAO?</strong>
      </div>

      <p>{{ explanation }}</p>

      <a
        v-if="source"
        :href="source"
        target="_blank"
        rel="noopener noreferrer"
        class="source-link"
      >
        Izvor podatka
        <v-icon
          icon="mdi-open-in-new"
          size="13"
          aria-hidden="true"
        />
      </a>

    </aside>

    <!-- Nastavak igre -->
    <v-btn
      color="primary"
      block
      height="58"
      elevation="0"
      class="next-button"
      :append-icon="
        isLastQuestion
          ? 'mdi-trophy-outline'
          : 'mdi-arrow-right'
      "
      @click="emit('next')"
    >
      {{
        isLastQuestion
          ? 'POGLEDAJ REZULTATE'
          : 'SLJEDEĆE PITANJE'
      }}
    </v-btn>

  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  correct: {
    type: Boolean,
    required: true,
  },

  answer: {
    type: Number,
    required: true,
  },

  range: {
    type: Array,
    required: true,
  },

  points: {
    type: Number,
    default: 0,
  },

  unit: {
    type: String,
    default: '',
  },

  min: {
    type: Number,
    required: true,
  },

  max: {
    type: Number,
    required: true,
  },

  explanation: {
    type: String,
    default: '',
  },

  source: {
    type: String,
    default: '',
  },

  isLastQuestion: {
    type: Boolean,
    default: false,
  },

  timedOut: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['next'])

const numberFormatter = new Intl.NumberFormat('hr-HR', {
  maximumFractionDigits: 6,
})

function formatNumber(value) {
  return numberFormatter.format(value)
}

function getPosition(value) {
  const total = props.max - props.min

  if (total <= 0) return 0

  return Math.min(
    100,
    Math.max(
      0,
      ((value - props.min) / total) * 100
    )
  )
}

const feedbackTitle = computed(() => {
  if (props.timedOut) {
    return 'VRIJEME JE ISTEKLO!'
  }

  return props.correct
    ? 'POGODAK!'
    : 'PROMAŠAJ!'
})

const feedbackMessage = computed(() => {
  if (props.timedOut) {
    return 'Nisi stigao potvrditi svoju procjenu.'
  }

  return props.correct
    ? 'Imaš dobro oko!'
    : 'Više sreće kod sljedećeg pitanja.'
})

const feedbackIcon = computed(() => {
  if (props.timedOut) {
    return 'mdi-timer-off-outline'
  }

  return props.correct
    ? 'mdi-check'
    : 'mdi-close'
})

const feedbackClass = computed(() => {
  if (props.timedOut) return 'timeout'
  return props.correct ? 'success' : 'error'
})

const answerPosition = computed(() => {
  return getPosition(props.answer)
})

const rangeStyle = computed(() => {
  const start = getPosition(props.range[0])
  const end = getPosition(props.range[1])

  return {
    left: `${start}%`,
    width: `${Math.max(0, end - start)}%`,
  }
})

const visualizationLabel = computed(() => {
  return `Tvoj raspon je od ${props.range[0]} do ${
    props.range[1]
  }. Točan odgovor je ${props.answer} ${props.unit}.`
})


</script>

<style scoped>
.answer-feedback {
  background: #fffdf6;
  color: #181818;
  border: 1px solid #181818;
  border-radius: 24px;
  padding: 28px;
}

.feedback-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin-bottom: 16px;
}

.success-icon {
  background: #dcfce7;
  color: #16a34a;
}

.error-icon {
  background: #fee2e2;
  color: #dc2626;
}

.success-text {
  color: #15803d;
}

.error-text {
  color: #dc2626;
}

.feedback-header h2 {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -1px;
}

.feedback-message {
  color: #64635d;
  font-size: 14px;
  margin-top: 6px;
}

.answer-label {
  font-size: 11px;
  color: #64635d;
  letter-spacing: 2px;
  margin-top: 26px;
}

.answer-value {
  font-size: clamp(32px, 6vw, 46px);
  font-weight: 700;
  letter-spacing: -2px;
  line-height: 1.3;
  margin-top: 6px;
  overflow-wrap: anywhere;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 24px;
}

.result-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  background: #f8f6ed;
  border-radius: 12px;
  padding: 18px 10px;
}

.result-box span {
  color: #64635d;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
}

.result-box strong {
  font-size: 18px;
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
}

.result-box .earned-points {
  font-size: 26px;
}

.answer-visualization {
  padding: 24px 8px;
  margin-top: 12px;
}

.answer-track {
  position: relative;
  height: 10px;
  border-radius: 8px;
  background: #dedcd3;
}

.selected-range {
  position: absolute;
  height: 100%;
  min-width: 2px;
  border-radius: 6px;
}

.range-correct {
  background: #16a34a;
}

.range-incorrect {
  background: #dc2626;
}

.answer-marker {
  position: absolute;
  top: -7px;
  width: 4px;
  height: 24px;
  background: #181818;
  border-radius: 3px;
  transform: translateX(-50%);
  z-index: 2;
}

.track-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #64635d;
  margin-top: 14px;
}

.visualization-legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 20px;
}

.visualization-legend span {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64635d;
}

.legend-color {
  display: inline-block;
  width: 14px;
  height: 7px;
  border-radius: 3px;
}

.legend-marker {
  display: inline-block;
  width: 3px;
  height: 14px;
  background: #181818;
  border-radius: 2px;
}

.explanation-box {
  background: #f8f6ed;
  border-left: 4px solid #facc15;
  border-radius: 8px;
  padding: 20px;
}

.explanation-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  letter-spacing: 1px;
  margin-bottom: 10px;
}

.explanation-title .v-icon {
  color: #a16207;
}

.explanation-box p {
  font-size: 14px;
  line-height: 1.7;
  color: #64635d;
}

.source-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #181818;
  font-size: 12px;
  margin-top: 14px;
  text-underline-offset: 3px;
}

.next-button {
  margin-top: 24px;
  color: #181818;
  font-size: 14px;
  letter-spacing: 0.5px;
  font-weight: 700;
  border-radius: 14px;
}

@media (max-width: 599px) {
  .answer-feedback {
    padding: 20px;
    border-radius: 18px;
  }

  .result-box strong {
    font-size: 15px;
  }

  .feedback-header h2 {
    font-size: 26px;
  }

  .explanation-box {
    padding: 16px;
  }

  .next-button {
    font-size: 12px;
  }
}
.timeout-icon {
  background: #fef3c7;
  color: #b45309;
}

.timeout-text {
  color: #b45309;
}
</style>
