
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

import { useAuthStore } from '@/stores/authStore'
import { getMyProgress } from '@/services/progressionService'

export const useProgressionStore = defineStore(
  'progression',
  () => {

    const authStore = useAuthStore()

    const progress = ref(null)
    const reward = ref(null)

    const loading = ref(false)
    const errorMessage = ref('')

    let requestId = 0

    const canLoad = computed(() =>
      authStore.initialized &&
      authStore.isAuthenticated &&
      !authStore.isRecovery &&
      !authStore.user?.is_anonymous
    )

    const level = computed(() =>
      progress.value?.level || 1
    )

    const totalXp = computed(() =>
      progress.value?.totalXp || 0
    )

    const xpIntoLevel = computed(() =>
      progress.value?.xpIntoLevel || 0
    )

    const xpRequired = computed(() =>
      progress.value?.xpRequired || 200
    )

    const xpToNextLevel = computed(() =>
      progress.value?.xpToNextLevel ?? 200
    )

    const progressPercent = computed(() =>
      progress.value?.progressPercent || 0
    )

    const xpAwarded = computed(() =>
      reward.value?.xpAwarded || 0
    )

    const hasLeveledUp = computed(() => {

      if (!reward.value) {
        return false
      }

      return (
        reward.value.after.level >
        reward.value.before.level
      )
    })

    async function loadProgress(sessionId = null) {

      if (!canLoad.value) {

        reset()

        return null
      }

      const request = ++requestId
      const userId = authStore.userId

      loading.value = true
      errorMessage.value = ''
      reward.value = null

      try {

        const data = await getMyProgress(
          sessionId
        )

        if (
          request !== requestId ||
          authStore.userId !== userId ||
          !canLoad.value
        ) {
          return null
        }

        progress.value = data?.progress || null

        reward.value = data?.reward || null

        return data

      } catch (error) {

        if (request === requestId) {

          errorMessage.value =
            'Dohvat iskustva nije uspio.'

          console.error(
            'Progression:',
            error
          )
        }

        return null

      } finally {

        if (request === requestId) {

          loading.value = false

        }
      }
    }

    function reset() {

      requestId++

      progress.value = null
      reward.value = null

      loading.value = false
      errorMessage.value = ''
    }

    watch(
      [
        () => authStore.userId,
        () => authStore.isRecovery,
        () => authStore.isAuthenticated,
        () => authStore.user?.is_anonymous,
      ],
      () => reset(),
      { flush: 'sync' }
    )

    return {

      progress,
      reward,

      loading,
      errorMessage,
      canLoad,

      level,
      totalXp,
      xpIntoLevel,
      xpRequired,
      xpToNextLevel,
      progressPercent,

      xpAwarded,
      hasLeveledUp,

      loadProgress,
      reset,
    }
  }
)
