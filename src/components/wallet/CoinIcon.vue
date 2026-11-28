
<template>
  <svg
    class="coin-icon"
    viewBox="0 0 100 100"
    :width="size"
    :height="size"
    aria-hidden="true"
    focusable="false"
  >

    <circle
      cx="50"
      cy="53"
      r="44"
      fill="#a16207"
    />

    <circle
      cx="50"
      cy="47"
      r="44"
      fill="#facc15"
      stroke="#a16207"
      stroke-width="2"
    />

    <circle
      cx="50"
      cy="47"
      r="35"
      fill="#fde047"
      stroke="#ca8a04"
      stroke-width="2"
    />

    <circle
      cx="50"
      cy="47"
      r="30"
      fill="none"
      stroke="#ca8a04"
      stroke-dasharray="3 4"
      stroke-width="2"
    />

    <text
      x="50"
      y="61"
      font-size="43"
      font-weight="900"
      text-anchor="middle"
      fill="#181818"
    >
      O.
    </text>

  </svg>
</template>

<script setup>
defineProps({

  size: {
    type: [Number, String],
    default: 28,
  },

})
</script>

<style scoped>
.coin-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  font-family: 'Space Grotesk', sans-serif;
}
</style>
