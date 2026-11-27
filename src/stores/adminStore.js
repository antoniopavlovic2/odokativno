
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'

export const useAdminStore = defineStore('admin', () => {
  const authStore = useAuthStore()

  const status = ref('idle')
  const checkedUserId = ref(null)
  const errorMessage = ref('')

  let requestId = 0

  const isAdmin = computed(() => {
    return (
      authStore.initialized &&
      authStore.isAuthenticated &&
      !authStore.isRecovery &&
      checkedUserId.value === authStore.userId &&
      status.value === 'authorized'
    )
  })

  const loading = computed(() => {
    return status.value === 'checking'
  })

  async function checkAccess() {
    const currentRequest = ++requestId

    checkedUserId.value = null
    errorMessage.value = ''

    if (!authStore.initialized) {
      status.value = 'idle'
      return false
    }

    if (
      !authStore.isAuthenticated ||
      !authStore.userId
    ) {
      status.value = 'guest'
      return false
    }

    if (authStore.isRecovery) {
      status.value = 'recovery'
      return false
    }

    if (!supabase) {
      status.value = 'error'
      errorMessage.value =
        'Veza sa Supabaseom nije konfigurirana.'

      return false
    }

    const userId = authStore.userId

    status.value = 'checking'

    try {
      const { data, error } = await supabase.rpc(
        'is_admin'
      )

      if (
        currentRequest !== requestId ||
        authStore.userId !== userId ||
        !authStore.isAuthenticated ||
        authStore.isRecovery
      ) {
        return false
      }

      if (error) {
        throw error
      }

      checkedUserId.value = userId

      status.value = data === true
        ? 'authorized'
        : 'denied'

      return data === true
    } catch (error) {
      if (
        currentRequest !== requestId ||
        authStore.userId !== userId
      ) {
        return false
      }

      status.value = 'error'

      errorMessage.value =
        'Provjera administratorskih ovlasti nije uspjela.'

      console.error(
        'Admin access check:',
        error
      )

      return false
    }
  }

  watch(
    [
      () => authStore.initialized,
      () => authStore.isAuthenticated,
      () => authStore.userId,
      () => authStore.isRecovery
    ],
    () => {
      checkAccess()
    },
    {
      immediate: true
    }
  )

  return {
    status,
    isAdmin,
    loading,
    errorMessage,
    checkAccess
  }
})
