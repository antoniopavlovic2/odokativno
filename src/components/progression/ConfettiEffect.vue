
<template>
  <div
    class="confetti-container"
    aria-hidden="true"
  >

    <span
      v-for="particle in particles"
      :key="particle.id"
      class="confetti-particle"
      :style="particle.style"
    ></span>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({

  count: {
    type: Number,
    default: 48,
  },

})

const colors = [
  '#facc15',
  '#fde047',
  '#fffdf6',
  '#eab308',
  '#ffffff',
  '#16a34a',
]

const particles = computed(() => {

  const count = Math.max(
    0,
    Math.min(props.count, 100)
  )

  return Array.from(
    { length: count },
    (_, index) => {

      const angle =
        (index / count) *
        Math.PI * 2

      const distance =
        100 + (index % 7) * 28

      return {

        id: index,

        style: {

          '--particle-x':
            Math.cos(angle) * distance + 'px',

          '--particle-y':
            Math.sin(angle) * distance + 'px',

          '--particle-spin':
            180 + (index % 5) * 90 + 'deg',

          '--particle-color':
            colors[index % colors.length],

          '--particle-delay':
            (index % 10) * 25 + 'ms',

          '--particle-size':
            5 + (index % 5) + 'px',

        },
      }
    }
  )
})
</script>

<style scoped>
.confetti-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 2;
}

.confetti-particle {
  position: absolute;
  top: 42%;
  left: 50%;
  width: var(--particle-size);
  height: calc(var(--particle-size) * 1.5);
  background: var(--particle-color);
  border-radius: 2px;
  opacity: 0;
  animation: confetti-burst 1800ms ease-out both;
  animation-delay: var(--particle-delay);
}

@keyframes confetti-burst {

  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0);
  }

  15% {
    opacity: 1;
  }

  70% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform:
      translate(
        var(--particle-x),
        var(--particle-y)
      )
      rotate(var(--particle-spin));
  }
}

@media (prefers-reduced-motion: reduce) {

  .confetti-container {
    display: none;
  }
}
</style>
