
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

import { useAuthStore } from '@/stores/authStore'
import { getMyWallet } from '@/services/walletService'

export const useWalletStore = defineStore(
  'wallet',
  () => {

    const authStore = useAuthStore()

    const wallet = ref(null)
    const loading = ref(false)
    const errorMessage = ref('')

    let requestId = 0
    let accountVersion = 0

    const canLoad = computed(() =>

      authStore.initialized &&
      authStore.isAuthenticated &&
      !authStore.isRecovery &&
      !authStore.user?.is_anonymous

    )

    const balance = computed(() =>
      Number(wallet.value?.balance || 0)
    )

    const totalEarned = computed(() =>
      Number(wallet.value?.totalEarned || 0)
    )

    const totalSpent = computed(() =>
      Number(wallet.value?.totalSpent || 0)
    )

    const transactions = computed(() =>
      wallet.value?.transactions || []
    )

    const isReady = computed(() =>
      wallet.value !== null
    )

    // =====================================
    // DOHVAT NOVČANIKA
    // =====================================

    async function loadWallet(sessionId = null) {

      if (!canLoad.value) {
        return null
      }

      const request = ++requestId

      const version = accountVersion

      const userId = authStore.userId

      loading.value = true
      errorMessage.value = ''

      try {

        const data = await getMyWallet(
          sessionId
        )

        if (
          version !== accountVersion ||
          userId !== authStore.userId ||
          !canLoad.value
        ) {
          return null
        }

        if (request === requestId) {

          wallet.value = data || null

        }

        return data

      } catch (error) {

        if (
          version !== accountVersion ||
          userId !== authStore.userId ||
          !canLoad.value
        ) {
          return null
        }

        if (request === requestId) {

          errorMessage.value =
            'Dohvat novčanika nije uspio.'

        }

        console.error(
          '[Wallet]',
          error
        )

        throw error

      } finally {

        if (request === requestId) {

          loading.value = false

        }
      }
    }

    async function refresh() {

      try {

        return await loadWallet()

      } catch {

        return null

      }
    }

    // =====================================
    // PROMJENA KORISNIČKOG RAČUNA
    // =====================================

    function reset() {

      requestId++

      accountVersion++

      wallet.value = null
      loading.value = false
      errorMessage.value = ''

    }

    watch(
      [
        () => authStore.userId,
        () => canLoad.value,
      ],

      () => {

        reset()

        if (canLoad.value) {

          void refresh()

        }
      },

      { immediate: true }
    )

    return {

      wallet,
      loading,
      errorMessage,
      canLoad,
      isReady,

      balance,
      totalEarned,
      totalSpent,
      transactions,

      loadWallet,
      refresh,
      reset,

    }
  }
)
