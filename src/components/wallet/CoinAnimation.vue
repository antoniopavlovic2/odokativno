
<template>
  <div
    class="coin-animation"
    aria-hidden="true"
  >

    <span
      v-for="n in 12"
      :key="n"
      class="flying-coin"
      :style="{
        '--delay': n * 55 + 'ms',
        '--offset': (n % 5 - 2) * 24 + 'px',
        '--rotation': (n % 4 + 1) * 360 + 'deg'
      }"
    >

      <CoinIcon :size="28" />

    </span>

  </div>
</template>

<script setup>
import CoinIcon from './CoinIcon.vue'
</script>

<style scoped>
.coin-animation {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
  z-index: 5;
}

.flying-coin {
  position: absolute;
  left: 30%;
  top: 30%;
  opacity: 0;

  filter: drop-shadow(
    0 2px 5px rgba(161, 98, 7, 0.35)
  );

  animation:
    coin-flight 950ms
    cubic-bezier(0.2, 0.65, 0.35, 1)
    both;

  animation-delay: var(--delay);
}

@keyframes coin-flight {

  0% {
    opacity: 0;
    left: 30%;
    top: 30%;
    transform:
      translateX(var(--offset))
      scale(0.4);
  }

  20% {
    opacity: 1;
    top: 15%;
    transform:
      translateX(var(--offset))
      scale(1.2);
  }

  75% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    left: 85%;
    top: 80%;
    transform:
      rotateY(var(--rotation))
      scale(0.35);
  }
}

@media (prefers-reduced-motion: reduce) {

  .coin-animation {
    display: none;
  }
}
</style>
