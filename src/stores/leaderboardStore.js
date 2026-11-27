
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { useAuthStore } from '@/stores/authStore'

import {
  getTodayChallenge,
  getDailyLeaderboard,
  getMyDailyPlacement,
} from '@/services/leaderboardService'

export const useLeaderboardStore = defineStore(
  'leaderboard',
  () => {

    const authStore = useAuthStore()

    const players = ref([])
    const challenge = ref(null)
    const myPlacement = ref(null)

    const loading = ref(false)
    const refreshing = ref(false)

    const errorMessage = ref('')
    const personalError = ref('')
    const refreshError = ref('')

    const lastUpdated = ref(null)

    const page = ref(0)
    const pageSize = 50
    const totalPlayers = ref(0)

    let requestId = 0

    // =====================================
    // GETTERI
    // =====================================

    const totalPages = computed(() =>
      Math.max(
        1,
        Math.ceil(
          totalPlayers.value / pageSize
        )
      )
    )

    const topPlayers = computed(() =>
      page.value === 0
        ? players.value.slice(0, 3)
        : []
    )

    const hasPlayers = computed(() =>
      players.value.length > 0
    )

    const hasPreviousPage = computed(() =>
      page.value > 0
    )

    const hasNextPage = computed(() =>
      page.value + 1 < totalPages.value
    )

    // =====================================
    // DOHVAT RANG-LISTE
    // =====================================

    async function loadLeaderboard(
      requestedPage = 0,
      silent = false
    ) {

      const request = ++requestId

      const targetPage = Math.max(
        0,
        Math.floor(
          Number(requestedPage) || 0
        )
      )

      const userId = authStore.userId

      const canLoadPersonal =
        authStore.isAuthenticated &&
        !authStore.isRecovery &&
        !authStore.user?.is_anonymous

      const silentRefresh =
        silent &&
        lastUpdated.value !== null &&
        !errorMessage.value

      loading.value = !silentRefresh
      refreshing.value = silentRefresh

      refreshError.value = ''

      if (!silentRefresh) {
        errorMessage.value = ''
        personalError.value = ''
        players.value = []
        myPlacement.value = null
      }

      try {

        const personalRequest =
          canLoadPersonal
            ? getMyDailyPlacement()
                .then(data => ({
                  data,
                  error: null,
                }))
                .catch(error => ({
                  data: null,
                  error,
                }))
            : Promise.resolve({
                data: null,
                error: null,
              })

        const [
          todayChallenge,
          dailyPlayers,
          personalResult,
        ] = await Promise.all([

          getTodayChallenge(),

          getDailyLeaderboard(
            pageSize,
            targetPage * pageSize
          ),

          personalRequest,

        ])

        if (
          request !== requestId ||
          userId !== authStore.userId
        ) {
          return
        }

        const challengeChanged =
          challenge.value?.id !==
          todayChallenge?.id

        if (
          targetPage > 0 &&
          (
            dailyPlayers.length === 0 ||
            challengeChanged
          )
        ) {
          return await loadLeaderboard(
            0,
            silentRefresh
          )
        }

        challenge.value = todayChallenge

        players.value = dailyPlayers

        totalPlayers.value = Number(
          dailyPlayers[0]?.total_players || 0
        )

        page.value = targetPage

        myPlacement.value =
          personalResult.data

        personalError.value =
          personalResult.error
            ? 'Dohvat vlastitog plasmana nije uspio.'
            : ''

        errorMessage.value = ''

        lastUpdated.value = Date.now()

      } catch (error) {

        if (request !== requestId) {
          return
        }

        if (silentRefresh) {

          // Zadržavamo prethodne rezultate
          // ako privremeno nestane internet.

          refreshError.value =
            'Osvježavanje nije uspjelo. Pokušavamo ponovno.'

        } else {

          challenge.value = null
          players.value = []
          myPlacement.value = null
          totalPlayers.value = 0

          errorMessage.value =
            'Dohvat rang-liste nije uspio. Pokušaj ponovno.'

        }

        console.error(
          'Leaderboard:',
          error
        )

      } finally {

        if (request === requestId) {
          loading.value = false
          refreshing.value = false
        }

      }
    }

    // =====================================
    // AUTOMATSKO OSVJEŽAVANJE
    // =====================================

    async function refresh() {

      if (
        loading.value ||
        refreshing.value
      ) {
        return
      }

      await loadLeaderboard(
        page.value,
        true
      )
    }

    // =====================================
    // STRANIČENJE
    // =====================================

    async function nextPage() {

      if (
        loading.value ||
        refreshing.value ||
        !hasNextPage.value
      ) {
        return
      }

      await loadLeaderboard(
        page.value + 1
      )
    }

    async function previousPage() {

      if (
        loading.value ||
        refreshing.value ||
        !hasPreviousPage.value
      ) {
        return
      }

      await loadLeaderboard(
        page.value - 1
      )
    }

    // =====================================
    // RESET
    // =====================================

    function reset() {

      requestId++

      players.value = []
      challenge.value = null
      myPlacement.value = null

      totalPlayers.value = 0
      page.value = 0

      loading.value = false
      refreshing.value = false

      errorMessage.value = ''
      personalError.value = ''
      refreshError.value = ''

      lastUpdated.value = null
    }

    return {
      players,
      challenge,
      myPlacement,

      loading,
      refreshing,

      errorMessage,
      personalError,
      refreshError,
      lastUpdated,

      page,
      pageSize,
      totalPages,
      totalPlayers,

      topPlayers,
      hasPlayers,
      hasPreviousPage,
      hasNextPage,

      loadLeaderboard,
      nextPage,
      previousPage,
      refresh,
      reset,
    }
  }
)
