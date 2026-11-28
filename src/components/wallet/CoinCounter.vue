
<template>
  <span
    class="coin-counter"
    :aria-label="formatNumber(amount) + ' O-Coins'"
  >

    <CoinIcon :size="size" />

    <strong aria-hidden="true">
      {{ formatNumber(displayAmount) }}
    </strong>

  </span>
</template>

<script setup>
import {
  ref,
  watch,
  onBeforeUnmount,
} from 'vue'

import CoinIcon from './CoinIcon.vue'

const props = defineProps({

  amount: {
    type: Number,
    default: 0,
  },

  size: {
    type: Number,
    default: 24,
  },

  animated: {
    type: Boolean,
    default: true,
  },

})

const displayAmount = ref(props.amount)

let animationFrame = null

const formatter = new Intl.NumberFormat(
  'hr-HR'
)

function formatNumber(value) {

  return formatter.format(value)
}

function cancelAnimation() {

  if (animationFrame !== null) {

    window.cancelAnimationFrame(
      animationFrame
    )

    animationFrame = null

  }
}

function animateTo(target) {

  cancelAnimation()

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  if (
    !props.animated ||
    reducedMotion ||
    document.hidden
  ) {

    displayAmount.value = target

    return
  }

  const start = displayAmount.value

  if (start === target) return

  const startedAt = performance.now()

  const duration = 850

  function tick(now) {

    const progress = Math.min(

      (now - startedAt) / duration,

      1

    )

    const eased =
      1 - Math.pow(1 - progress, 3)

    displayAmount.value = Math.round(

      start + (target - start) * eased

    )

    if (progress < 1) {

      animationFrame =
        window.requestAnimationFrame(tick)

    } else {

      displayAmount.value = target

      animationFrame = null

    }
  }

  animationFrame =
    window.requestAnimationFrame(tick)
}

watch(
  () => props.amount,
  animateTo
)

watch(
  () => props.animated,
  animated => {

    if (!animated) {

      cancelAnimation()

      displayAmount.value = props.amount

    }
  }
)

onBeforeUnmount(cancelAnimation)
</script>

<style scoped>
.coin-counter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.coin-counter strong {
  font-weight: 700;
}
</style>
