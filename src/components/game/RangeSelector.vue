
<template>
  <section
    class="range-selector"
    aria-labelledby="range-title"
  >

    <h2 id="range-title" class="range-title">
      Odaberi svoj raspon
    </h2>

    <!-- Odabrane vrijednosti -->
    <div class="range-values">

      <div class="value-box">
        <span class="value-label">OD</span>

        <strong class="value-number">
          {{ formatNumber(modelValue[0]) }}
        </strong>

        <span class="value-unit">
          {{ unit }}
        </span>
      </div>

      <div class="value-box">
        <span class="value-label">DO</span>

        <strong class="value-number">
          {{ formatNumber(modelValue[1]) }}
        </strong>

        <span class="value-unit">
          {{ unit }}
        </span>
      </div>

    </div>

    <!-- Glavni klizač -->
    <div class="slider-wrapper">

      <v-range-slider
        :model-value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        color="primary"
        thumb-color="#181818"
        track-color="#dedcd3"
        track-fill-color="#facc15"
        :thumb-size="24"
        :track-size="8"
        aria-label="Odaberi donju i gornju granicu"
        hide-details
        strict
        @update:model-value="updateRange"
      />

      <div class="slider-limits">
        <span>{{ formatNumber(min) }} {{ unit }}</span>
        <span>{{ formatNumber(max) }} {{ unit }}</span>
      </div>

    </div>

    <v-divider class="my-6" />

    <!-- Potencijalni bodovi -->
    <div class="potential-score">

      <div class="range-width">
        <span>ŠIRINA RASPONA</span>

        <strong>
          {{ formatNumber(rangeWidth) }} {{ unit }}
        </strong>
      </div>

      <span class="potential-label">
        POTENCIJALNI BODOVI
      </span>

      <strong class="potential-value">
        {{ potentialPoints }}
      </strong>

      <span class="potential-max">
        od maksimalnih {{ maxPoints }}
      </span>

      <v-progress-linear
        :model-value="scorePercentage"
        color="primary"
        bg-color="#dedcd3"
        height="7"
        rounded
        class="mt-4"
        aria-label="Potencijalni bodovi"
      />

    </div>

    <p class="range-hint">
      <v-icon
        icon="mdi-lightbulb-outline"
        size="17"
        aria-hidden="true"
      />

      Uži raspon. Veći rizik. Više bodova.
    </p>

    <v-btn
      v-if="!disabled"
      color="primary"
      block
      height="58"
      elevation="0"
      class="confirm-button"
      append-icon="mdi-check"
      @click="emit('confirm')"
    >
      POTVRDI PROCJENU
    </v-btn>

  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },

  min: {
    type: Number,
    required: true,
  },

  max: {
    type: Number,
    required: true,
  },

  step: {
    type: Number,
    default: 1,
  },

  unit: {
    type: String,
    default: '',
  },

  potentialPoints: {
    type: Number,
    default: 0,
  },

  maxPoints: {
    type: Number,
    default: 100,
  },

  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update:modelValue',
  'confirm',
])

const numberFormatter = new Intl.NumberFormat('hr-HR', {
  maximumFractionDigits: 6,
})

function formatNumber(value) {
  return numberFormatter.format(value)
}

const rangeWidth = computed(() => {
  return props.modelValue[1] - props.modelValue[0]
})

const scorePercentage = computed(() => {
  if (props.maxPoints <= 0) return 0

  return Math.min(
    100,
    Math.max(
      0,
      (props.potentialPoints / props.maxPoints) * 100
    )
  )
})

function updateRange(value) {
  if (props.disabled) return

  emit('update:modelValue', [...value])
}
</script>

<style scoped>
.range-selector {
  width: 100%;
  background: #fffdf6;
  color: #181818;
  border: 1px solid #181818;
  border-radius: 24px;
  padding: 28px;
}

.range-title {
  text-align: center;
  font-size: 19px;
  font-weight: 700;
  margin-bottom: 24px;
}

.range-values {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.value-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 110px;
  padding: 16px 8px;
  border: 1px solid rgba(24, 24, 24, 0.2);
  border-radius: 14px;
  background: #f8f6ed;
}

.value-label {
  color: #64635d;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
}

.value-number {
  font-size: clamp(24px, 5vw, 36px);
  font-weight: 700;
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
  margin: 4px 0;
  overflow-wrap: anywhere;
  text-align: center;
}

.value-unit {
  color: #64635d;
  font-size: 12px;
}

.slider-wrapper {
  margin-top: 24px;
}

.slider-limits {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  color: #64635d;
}

.potential-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8f6ed;
  border-radius: 16px;
  padding: 22px;
}

.range-width {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 18px;
  gap: 4px;
}

.range-width span {
  font-size: 10px;
  letter-spacing: 1.5px;
  color: #64635d;
}

.range-width strong {
  font-size: 16px;
}

.potential-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  color: #64635d;
}

.potential-value {
  font-size: 52px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -3px;
  font-variant-numeric: tabular-nums;
}

.potential-max {
  font-size: 12px;
  color: #64635d;
}

.range-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
  color: #64635d;
  font-size: 12px;
  margin-top: 20px;
}

.confirm-button {
  margin-top: 24px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #181818;
}

@media (max-width: 599px) {
  .range-selector {
    padding: 20px;
    border-radius: 18px;
  }

  .range-values {
    gap: 10px;
  }

  .value-box {
    min-height: 90px;
  }

  .potential-value {
    font-size: 44px;
  }

  .confirm-button {
    font-size: 13px;
  }
}
</style>
