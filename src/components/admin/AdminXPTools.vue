
<template>
  <section
    v-if="adminStore.isAdmin"
    class="admin-xp-card"
  >

    <div class="admin-heading">

      <div class="admin-icon">
        <v-icon size="26">
          mdi-tools
        </v-icon>
      </div>

      <div class="admin-title">

        <h3>Admin XP Tools.</h3>

        <p>Testiranje stvarnog napretka.</p>

      </div>

      <span class="admin-label">
        ADMIN
      </span>

    </div>

    <div
      v-if="progressionStore.progress"
      class="current-progress"
    >

      <LevelBadge
        :level="progressionStore.level"
      />

      <strong>
        {{ progressionStore.totalXp }} XP
      </strong>

    </div>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      {{ errorMessage }}
    </v-alert>

    <v-alert
      v-if="successMessage"
      type="success"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      {{ successMessage }}
    </v-alert>

    <v-btn
      block
      height="52"
      elevation="0"
      color="#facc15"
      prepend-icon="mdi-lightning-bolt"
      class="xp-button"
      :loading="loading"
      :disabled="loading || levelUpDialog"
      @click="addXp"
    >
      Dodaj +50 XP
    </v-btn>

    <p class="admin-note">

      <v-icon size="16">
        mdi-information-outline
      </v-icon>

      XP i Level Up bonusi trajno se
      spremaju na tvoj račun.

    </p>

    <LevelUpDialog
      v-if="reward"
      v-model="levelUpDialog"
      :previous-level="reward.before.level"
      :level="reward.after.level"
    />

  </section>
</template>

<script setup>
import {
  ref,
  watch,
  onBeforeUnmount,
} from 'vue'

import { supabase } from '@/services/supabase'

import { useAuthStore } from '@/stores/authStore'
import { useAdminStore } from '@/stores/adminStore'
import { useWalletStore } from '@/stores/walletStore'
import { useSettingsStore } from '@/stores/settingsStore'

import {
  useProgressionStore,
} from '@/stores/progressionStore'

import {
  unlockRewardSound,
  playRewardSound,
} from '@/services/rewardSoundService'

import LevelBadge
  from '@/components/progression/LevelBadge.vue'

import LevelUpDialog
  from '@/components/progression/LevelUpDialog.vue'

const authStore = useAuthStore()
const adminStore = useAdminStore()
const walletStore = useWalletStore()
const settingsStore = useSettingsStore()
const progressionStore = useProgressionStore()

const loading = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

const reward = ref(null)

const levelUpDialog = ref(false)

let requestVersion = 0

let pendingRequestId = null

let alive = true

// =========================================
// PROVJERA AKTIVNOG ZAHTJEVA
// =========================================

function isCurrent(version, userId) {

  return (

    alive &&

    requestVersion === version &&

    authStore.userId === userId &&

    adminStore.isAdmin &&

    !authStore.isRecovery

  )
}

// =========================================
// PROVJERA JUBILARNOG LEVELA
// =========================================

function isMilestone(before, after) {

  return [10, 25, 50, 75, 100].some(
    level =>
      before < level &&
      after >= level
  )
}

// =========================================
// DODAVANJE XP-a
// =========================================

async function addXp() {

  if (
    loading.value ||
    levelUpDialog.value ||
    !adminStore.isAdmin ||
    !authStore.userId ||
    authStore.isRecovery
  ) {
    return
  }

  const version = ++requestVersion

  const userId = authStore.userId

  loading.value = true

  errorMessage.value = ''
  successMessage.value = ''

  reward.value = null

  // Aktivacija zvuka tijekom klika

  const audioReady =
    settingsStore.soundEnabled
      ? unlockRewardSound()
      : Promise.resolve(false)

  try {

    if (!supabase) {

      throw new Error(
        'Supabase nije konfiguriran.'
      )

    }

    // Kod ponovnog pokušaja zadržavamo
    // isti ID kako ne bismo duplicirali XP.

    if (!pendingRequestId) {

      pendingRequestId = crypto.randomUUID()

    }

    const { data, error } = await supabase.rpc(

      'admin_add_my_xp',

      {
        p_request_id: pendingRequestId,
      }

    )

    if (!isCurrent(version, userId)) {
      return
    }

    if (error) throw error

    if (!data?.before || !data?.after) {

      throw new Error(
        'Neispravan odgovor servera.'
      )

    }

    pendingRequestId = null

    // =====================================
    // VEĆ OBRAĐEN ZAHTJEV
    // =====================================

    if (data.duplicate) {

      successMessage.value =
        'Prethodna XP nagrada već je spremljena.'

      await Promise.all([

        progressionStore.loadProgress(),

        walletStore.refresh(),

      ])

      return
    }

    // =====================================
    // NOVA NAGRADA
    // =====================================

    reward.value = data

    const leveledUp =

      data.after.level >
      data.before.level

    let sound = 'xp'

    if (leveledUp) {

      levelUpDialog.value = true

      successMessage.value =

        'LEVEL UP! Dosegnut level ' +
        data.after.level +
        '. +' +
        data.xpAwarded +
        ' XP i +' +
        data.coinsAwarded +
        ' O-Coins.'

      sound = isMilestone(

        data.before.level,

        data.after.level

      )
        ? 'milestone'
        : 'levelUp'

    } else {

      successMessage.value =

        '+' +
        data.xpAwarded +
        ' XP uspješno dodijeljeno.'

    }

    // =====================================
    // ZVUČNI EFEKT
    // =====================================

    void audioReady.then(async ready => {

  console.log('[ADMIN XP] Audio ready:', ready)
  console.log('[ADMIN XP] Sound enabled:', settingsStore.soundEnabled)
  console.log('[ADMIN XP] Sound:', sound)

  if (
    !isCurrent(version, userId) ||
    !settingsStore.soundEnabled
  ) {
    return
  }

  const activated = await unlockRewardSound()

  if (!isCurrent(version, userId)) return

  if (activated) {

    const played = playRewardSound(
      sound,
      settingsStore.soundEnabled
    )

    console.log('[ADMIN XP] Sound played:', played)

  } else {

    console.warn('[ADMIN XP] Audio nije aktiviran.')

  }

})

    // =====================================
    // OSVJEŽAVANJE PROFILA I NOVČANIKA
    // =====================================

    await Promise.all([

      progressionStore.loadProgress(),

      walletStore.refresh(),

    ])

  } catch (error) {

    if (!isCurrent(version, userId)) {
      return
    }

    console.error('[ADMIN XP]', error)

    errorMessage.value =
      'Dodjela nije potvrđena. Pokušaj ponovno.'

  } finally {

    if (isCurrent(version, userId)) {

      loading.value = false

    }
  }
}

// =========================================
// PROMJENA KORISNIČKOG RAČUNA
// =========================================

watch(

  [
    () => authStore.userId,
    () => adminStore.isAdmin,
    () => authStore.isRecovery,
  ],

  () => {

    requestVersion++

    pendingRequestId = null

    loading.value = false

    reward.value = null

    levelUpDialog.value = false

    errorMessage.value = ''
    successMessage.value = ''

  },

  { flush: 'sync' }

)

onBeforeUnmount(() => {

  alive = false

  requestVersion++

})
</script>

<style scoped>
.admin-xp-card {
  background: #fffdf6;
  border: 2px dashed #bdb9ad;
  border-radius: 14px;
  padding: 20px;
  color: #181818;
}

.admin-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.admin-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  background: #facc15;
  border-radius: 10px;
  flex-shrink: 0;
}

.admin-title {
  flex: 1;
  min-width: 0;
}

.admin-title h3 {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.admin-title p {
  font-size: 12px;
  color: #66645d;
  margin-top: 3px;
}

.admin-label {
  background: #181818;
  color: #facc15;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 6px 9px;
  border-radius: 6px;
}

.current-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  margin-bottom: 16px;
  border-radius: 9px;
  background: #f0ede3;
}

.current-progress strong {
  font-size: 18px;
  font-variant-numeric: tabular-nums;
}

.xp-button {
  color: #181818 !important;
  font-weight: 700;
  letter-spacing: 0.6px;
  border-radius: 9px;
}

.admin-note {
  margin-top: 12px;
  font-size: 11px;
  color: #66645d;
  line-height: 1.6;
}

@media (max-width: 600px) {

  .admin-xp-card {
    padding: 16px;
  }

  .admin-title h3 {
    font-size: 17px;
  }

  .admin-icon {
    width: 38px;
    height: 38px;
  }
}
</style>
