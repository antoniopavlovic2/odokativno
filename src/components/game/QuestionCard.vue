
<template>
  <article
    class="question-card"
    aria-labelledby="question-title"
  >

    <!-- Fotografija pitanja -->
    <div
      v-if="question.image && !imageError"
      class="question-image-wrapper"
    >
      <img
        :key="question.image"
        :src="question.image"
        :alt="question.imageAlt || ''"
        class="question-image"
        width="960"
        height="540"
        loading="eager"
        decoding="async"
        @error="imageError = true"
      />
    </div>

    <!-- Sadržaj pitanja -->
    <div class="question-content">

      <div class="question-category">
        <v-icon
          :icon="categoryIcon"
          size="17"
          aria-hidden="true"
        />

        {{ question.category }}
      </div>

      <h2 id="question-title">
        {{ question.question }}
      </h2>

      <p
        v-if="question.unitLabel || question.unit"
        class="question-unit"
      >
        Odgovor izrazi u jedinici:
        <strong>
          {{ question.unitLabel || question.unit }}
        </strong>
      </p>

    </div>

  </article>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
})

const imageError = ref(false)

watch(
  () => props.question.id,
  () => {
    imageError.value = false
  }
)

const categoryIcons = {
  Geografija: 'mdi-earth',
  Povijest: 'mdi-bank-outline',
  Znanost: 'mdi-flask-outline',
  Priroda: 'mdi-leaf',
  Sport: 'mdi-soccer',
  Svemir: 'mdi-rocket-launch-outline',
  Tehnologija: 'mdi-chip',
  Zanimljivosti: 'mdi-lightbulb-outline',
  Hrvatska: 'mdi-map-marker-outline',
  Hrana: 'mdi-food-apple-outline',
  Glazba: 'mdi-music',
  Film: 'mdi-movie-outline',
}

const categoryIcon = computed(() => {
  return categoryIcons[props.question.category]
    || 'mdi-help-circle-outline'
})
</script>

<style scoped>
.question-card {
  width: 100%;
  background: #181818;
  color: #fffdf6;
  border-radius: 24px;
  overflow: hidden;
}

.question-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #292929;
}

.question-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.question-content {
  padding: 32px 28px;
  text-align: center;
}

.question-category {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #facc15;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.8px;
  margin-bottom: 18px;
}

.question-content h2 {
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -1px;
}

.question-unit {
  color: #bdbdbd;
  font-size: 13px;
  line-height: 1.6;
  margin-top: 16px;
}

.question-unit strong {
  color: #fffdf6;
  font-weight: 600;
}

@media (max-width: 599px) {
  .question-card {
    border-radius: 18px;
  }

  .question-content {
    padding: 26px 20px;
  }

  .question-content h2 {
    font-size: 24px;
  }

  .question-category {
    font-size: 10px;
    margin-bottom: 12px;
  }
}
</style>
