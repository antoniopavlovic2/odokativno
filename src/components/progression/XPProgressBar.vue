
<template>
  <div class="xp-progress">

    <div class="xp-heading">

      <LevelBadge :level="level" />

      <span class="next-level">
        LVL {{ level + 1 }}
      </span>

    </div>

    <div
      class="xp-track"
      role="progressbar"
      aria-label="Napredak iskustva"
      :aria-valuemin="0"
      :aria-valuemax="xpRequired"
      :aria-valuenow="safeXp"
    >

      <div
        class="xp-fill"
        :class="{ 'no-animation': !animated }"
        :style="{ width: percent + '%' }"
      ></div>

    </div>

    <div class="xp-footer">

      <strong>
        {{ formatNumber(safeXp) }}
        /
        {{ formatNumber(xpRequired) }} XP
      </strong>

      <span>
        {{ formatNumber(xpRemaining) }} XP do novog levela
      </span>

    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

import LevelBadge from './LevelBadge.vue'

const props = defineProps({

  level: {
    type: Number,
    default: 1,
  },

  xp: {
    type: Number,
    default: 0,
  },

  xpRequired: {
    type: Number,
    default: 200,
  },

  animated: {
    type: Boolean,
    default: true,
  },

})

const safeXp = computed(() =>
  Math.max(
    0,
    Math.min(
      props.xp,
      props.xpRequired
    )
  )
)

const percent = computed(() => {

  if (props.xpRequired <= 0) {
    return 0
  }

  return (
    safeXp.value /
    props.xpRequired
  ) * 100
})

const xpRemaining = computed(() =>
  Math.max(
    0,
    props.xpRequired - safeXp.value
  )
)

function formatNumber(value) {

  return new Intl.NumberFormat(
    'hr-HR'
  ).format(value)
}
</script>

<style scoped>
.xp-progress {
  width: 100%;
}

.xp-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.next-level {
  color: #66645d;
  font-size: 12px;
  font-weight: 700;
}

.xp-track {
  height: 16px;
  background: #e5e2d8;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #d8d5ca;
}

.xp-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    #eab308,
    #facc15,
    #fde047
  );
  border-radius: 5px;
  transition: width 800ms cubic-bezier(
    0.22, 1, 0.36, 1
  );
}

.no-animation {
  transition: none;
}

.xp-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
  font-size: 12px;
}

.xp-footer span {
  color: #66645d;
}

@media (prefers-reduced-motion: reduce) {

  .xp-fill {
    transition: none;
  }
}
</style>
