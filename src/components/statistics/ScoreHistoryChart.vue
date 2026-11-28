
<template>
  <div class="chart-container">

    <div
      v-if="!playedPoints.length"
      class="chart-empty"
    >

      <v-icon size="48">
        mdi-chart-line
      </v-icon>

      <strong>Još nema rezultata.</strong>

      <p>
        Završi dnevni izazov i ovdje ćeš
        moći pratiti svoj napredak.
      </p>

    </div>

    <template v-else>

      <div class="chart-scroll">

        <svg
          class="score-chart"
          viewBox="0 0 680 230"
          role="img"
          :aria-label="
            'Grafikon rezultata za ' +
            series.length +
            ' dana. Odigrano izazova: ' +
            playedPoints.length
          "
        >

          <!-- HORIZONTALNE LINIJE -->

          <g
            v-for="tick in ticks"
            :key="tick"
          >

            <line
              x1="48"
              x2="656"
              :y1="getY(tick)"
              :y2="getY(tick)"
              stroke="#d8d5ca"
              stroke-dasharray="4 4"
            />

            <text
              x="38"
              :y="getY(tick) + 4"
              text-anchor="end"
              class="axis-label"
            >
              {{ tick }}
            </text>

          </g>

          <!-- LINIJE IZMEĐU ODIGRANIH DANA -->

          <polyline
            v-for="(segment, index) in segments"
            :key="'segment-' + index"
            :points="segment"
            fill="none"
            stroke="#ca8a04"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- TOČKE REZULTATA -->

          <circle
            v-for="point in playedPoints"
            :key="point.date"
            :cx="point.x"
            :cy="point.y"
            :r="series.length > 30 ? 3 : 4.5"
            fill="#facc15"
            stroke="#181818"
            stroke-width="1.2"
            class="score-point"
          >

            <title>
              {{ formatDate(point.date) }}:
              {{ point.score }} PTS
            </title>

          </circle>

          <!-- DATUMI -->

          <text
            v-for="label in dateLabels"
            :key="label.date"
            :x="label.x"
            y="216"
            text-anchor="middle"
            class="axis-label"
          >
            {{ formatDate(label.date) }}
          </text>

        </svg>

      </div>

      <div class="chart-legend">

        <span class="legend-dot" />

        Rezultat dnevnog izazova

      </div>

      <p class="chart-note">
        Prekidi linije označavaju dane
        bez završenog izazova.
        Maksimalni rezultat je 700 PTS.
      </p>

    </template>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({

  series: {
    type: Array,
    default: () => [],
  },

})

const ticks = [
  0, 175, 350, 525, 700,
]

// =========================================
// KOORDINATE GRAFIKONA
// =========================================

function getX(index) {

  const count = props.series.length

  if (count <= 1) return 352

  return 48 + index / (count - 1) * 608

}

function getY(score) {

  const value = Math.max(
    0,
    Math.min(700, Number(score))
  )

  return 190 - value / 700 * 174
}

// =========================================
// STVARNI REZULTATI
// =========================================

const playedPoints = computed(() =>

  props.series

    .map((day, index) => ({

      ...day,

      x: getX(index),

      y: getY(day.score),

    }))

    .filter(day =>

      day.played &&
      day.score !== null

    )

)

// =========================================
// LINIJE GRAFIKONA
// NE SPAJAMO PROPUŠTENE DANE
// =========================================

const segments = computed(() => {

  const result = []

  let current = []

  function finishSegment() {

    if (current.length > 1) {

      result.push(
        current.join(' ')
      )

    }

    current = []
  }

  props.series.forEach((day, index) => {

    if (
      !day.played ||
      day.score === null
    ) {

      finishSegment()

      return

    }

    current.push(

      getX(index) +
      ',' +
      getY(day.score)

    )

  })

  finishSegment()

  return result

})

// =========================================
// DATUMI NA X OSI
// =========================================

const dateLabels = computed(() => {

  const count = props.series.length

  if (!count) return []

  const step = count <= 7

    ? 1

    : Math.ceil((count - 1) / 4)

  const indices = []

  for (
    let index = 0;
    index < count - 1;
    index += step
  ) {

    indices.push(index)

  }

  // Izbjegavamo preklapanje zadnjih oznaka.

  const lastIndex = count - 1

  if (

    step > 1 &&

    indices.length > 1 &&

    lastIndex - indices[indices.length - 1]
      < step / 2

  ) {

    indices.pop()

  }

  indices.push(lastIndex)

  return indices.map(index => ({

    date: props.series[index].date,

    x: getX(index),

  }))

})

const dateFormatter = new Intl.DateTimeFormat(
  'hr-HR',
  {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Europe/Zagreb',
  }
)

function formatDate(date) {

  return dateFormatter.format(
    new Date(date + 'T12:00:00Z')
  )

}
</script>

<style scoped>
.chart-container {
  width: 100%;
  min-width: 0;
}

.chart-scroll {
  width: 100%;
  overflow-x: auto;
}

.score-chart {
  display: block;
  width: 100%;
  min-width: 460px;
  height: auto;
}

.axis-label {
  font-family: inherit;
  font-size: 12px;
  fill: #66645d;
}

.score-point {
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 150ms ease;
}

.score-point:hover {
  transform: scale(1.5);
}

.chart-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 12px;
  color: #66645d;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #facc15;
  border: 1px solid #181818;
}

.chart-note {
  font-size: 11px;
  color: #66645d;
  text-align: center;
  line-height: 1.6;
  margin-top: 10px;
}

.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 42px 18px;
  text-align: center;
  color: #66645d;
}

.chart-empty strong {
  color: #181818;
  font-size: 17px;
}

.chart-empty p {
  font-size: 13px;
  line-height: 1.6;
  max-width: 260px;
}

@media (prefers-reduced-motion: reduce) {

  .score-point {
    transition: none;
  }

}
</style>
