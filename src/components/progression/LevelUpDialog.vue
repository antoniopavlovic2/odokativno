
<template>
  <v-dialog
    :model-value="modelValue"
    max-width="480"
    @update:model-value="
      $emit('update:modelValue', $event)
    "
  >

    <v-card
      class="level-up-card"
      :class="{ milestone: isMilestone }"
    >

      <div class="level-rays"></div>

      <ConfettiEffect
        v-if="modelValue"
        :count="isMilestone ? 90 : 48"
      />

      <div class="level-up-content">

        <div class="eyebrow">

          {{
            isMilestone
              ? 'VELIKO POSTIGNUĆE'
              : 'ČESTITAMO!'
          }}

        </div>

        <h2>LEVEL UP!</h2>

        <div class="medal-container">

          <div class="level-medal">

            <span>{{ level }}</span>

          </div>

        </div>

        <h3>{{ levelTitle }}</h3>

        <p>
          Dosegnuo si novi level.
          Samo tako nastavi!
        </p>

        <div class="level-comparison">

          <span class="previous-level">
            LEVEL {{ previousLevel }}
          </span>

          <v-icon color="#facc15">
            mdi-arrow-right
          </v-icon>

          <strong>LEVEL {{ level }}</strong>

        </div>

        <v-btn
          block
          height="52"
          color="#facc15"
          elevation="0"
          class="continue-button"
          @click="$emit('update:modelValue', false)"
        >
          Nastavi
        </v-btn>

      </div>

    </v-card>

  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'
import ConfettiEffect from './ConfettiEffect.vue'

const props = defineProps({

  modelValue: {
    type: Boolean,
    default: false,
  },

  previousLevel: {
    type: Number,
    default: 1,
  },

  level: {
    type: Number,
    default: 2,
  },

})

defineEmits(['update:modelValue'])

const isMilestone = computed(() =>

  [10, 25, 50, 75, 100].some(
    milestone =>
      props.previousLevel < milestone &&
      props.level >= milestone
  )
)

const levelTitle = computed(() => {

  if (props.level >= 100) {
    return 'Kralj odokativnog'
  }

  if (props.level >= 75) {
    return 'Fenomen'
  }

  if (props.level >= 50) {
    return 'Legenda'
  }

  if (props.level >= 40) {
    return 'Brojčani genij'
  }

  if (props.level >= 30) {
    return 'Ekspert'
  }

  if (props.level >= 20) {
    return 'Majstor procjene'
  }

  if (props.level >= 15) {
    return 'Odokativac'
  }

  if (props.level >= 10) {
    return 'Procjenitelj'
  }

  if (props.level >= 5) {
    return 'Pogađač'
  }

  return 'Početnik'
})
</script>

<style scoped>
.level-up-card {
  position: relative;
  overflow: hidden;
  background: #181818;
  color: #fffdf6;
  text-align: center;
  border: 2px solid #facc15;
  border-radius: 20px !important;
}

.level-rays {
  position: absolute;
  width: 800px;
  height: 800px;
  left: 50%;
  top: 42%;
  margin-left: -400px;
  margin-top: -400px;
  pointer-events: none;
  background: repeating-conic-gradient(
    transparent 0deg 16deg,
    rgba(250, 204, 21, 0.07) 16deg 28deg
  );
  animation: rotate-rays 28s linear infinite;
}

.level-up-content {
  position: relative;
  z-index: 3;
  padding: 36px 24px 24px;
  animation: content-appear 500ms ease-out both;
}

.eyebrow {
  color: #facc15;
  font-size: 11px;
  letter-spacing: 4px;
  font-weight: 700;
}

h2 {
  color: #facc15;
  font-size: clamp(38px, 9vw, 54px);
  font-weight: 700;
  letter-spacing: -2px;
  line-height: 1.1;
  margin-top: 10px;
}

.medal-container {
  margin: 24px auto;
  width: 132px;
  animation: medal-appear 850ms ease-out both;
  filter: drop-shadow(
    0 0 20px rgba(250, 204, 21, 0.35)
  );
}

.level-medal {
  width: 132px;
  height: 144px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    #fef3c7,
    #facc15,
    #ca8a04
  );
  clip-path: polygon(
    50% 0%,
    100% 25%,
    100% 75%,
    50% 100%,
    0% 75%,
    0% 25%
  );
  color: #181818;
  font-size: 64px;
  font-weight: 700;
}

.level-up-card h3 {
  font-size: 26px;
  font-weight: 700;
}

.level-up-card p {
  margin-top: 10px;
  color: #d4d4d4;
  font-size: 14px;
}

.level-comparison {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin: 26px 0 20px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 10px;
}

.previous-level {
  font-size: 13px;
  color: #aaa;
  font-weight: 700;
}

.level-comparison strong {
  color: #facc15;
  font-size: 20px;
}

.continue-button {
  color: #181818 !important;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 8px;
}

.milestone {
  box-shadow: 0 0 45px rgba(250, 204, 21, 0.35);
}

.milestone .level-rays {
  animation-duration: 12s;
}

@keyframes rotate-rays {

  to {
    transform: rotate(360deg);
  }
}

@keyframes content-appear {

  from {
    opacity: 0;
    transform: scale(0.85);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes medal-appear {

  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-20deg);
  }

  65% {
    opacity: 1;
    transform: scale(1.15) rotate(5deg);
  }

  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

@media (prefers-reduced-motion: reduce) {

  .level-rays,
  .medal-container,
  .level-up-content {
    animation: none;
  }
}
</style>
