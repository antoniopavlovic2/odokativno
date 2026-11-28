
<template>
  <span
    class="level-badge"
    :class="[
      tier,
      'badge-' + size
    ]"
    :aria-label="'Level ' + level"
  >
    <v-icon
      v-if="level >= 100"
      size="14"
    >
      mdi-crown
    </v-icon>

    <span>LVL {{ level }}</span>

  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({

  level: {
    type: Number,
    default: 1,
  },

  size: {
    type: String,
    default: 'normal',
  },

})

const tier = computed(() => {

  if (props.level >= 100) {
    return 'tier-mythic'
  }

  if (props.level >= 50) {
    return 'tier-legendary'
  }

  if (props.level >= 40) {
    return 'tier-diamond'
  }

  if (props.level >= 30) {
    return 'tier-gold'
  }

  if (props.level >= 20) {
    return 'tier-silver'
  }

  if (props.level >= 10) {
    return 'tier-bronze'
  }

  return 'tier-basic'
})
</script>

<style scoped>
.level-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 5px 10px;
  border: 1px solid #181818;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.6px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  line-height: 1.5;
}

.badge-small {
  font-size: 10px;
  padding: 3px 6px;
}

.badge-large {
  font-size: 16px;
  padding: 7px 14px;
}

.tier-basic {
  background: #181818;
  color: #facc15;
}

.tier-bronze {
  background: #b87333;
  color: #fff;
}

.tier-silver {
  background: #d4d4d8;
  color: #181818;
}

.tier-gold {
  background: #facc15;
  color: #181818;
}

.tier-diamond {
  background: #38bdf8;
  color: #181818;
}

.tier-legendary {
  background: #7c3aed;
  color: #fff;
}

.tier-mythic {
  background: #181818;
  color: #facc15;
  border-color: #facc15;
  box-shadow: 0 0 8px rgba(250, 204, 21, 0.3);
}
</style>
