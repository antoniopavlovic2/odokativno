
<template>
  <section
    v-if="adminStore.isAdmin"
    class="developer-card"
  >

    <div class="developer-heading">

      <div class="developer-icon">

        <v-icon size="30">
          mdi-tools
        </v-icon>

      </div>

      <div class="developer-title">

        <div class="eyebrow">
          ODOKATIVNO. / TESTIRANJE
        </div>

        <h2>Developer Tools.</h2>

      </div>

      <span class="admin-label">
        ADMIN
      </span>

    </div>

    <p class="developer-description">
      Testiraj animacije, levele i zvučne efekte
      bez mijenjanja stvarnih rezultata igrača.
    </p>

    <v-divider class="my-5" />

    <!-- LEVEL UP TEST -->

    <div class="test-section">

      <h3>
        <v-icon size="22">
          mdi-lightning-bolt
        </v-icon>

        Level Up animacija
      </h3>

      <p class="test-description">
        Odaberi level i pokreni simulaciju.
      </p>

      <v-select
        v-model="testLevel"
        :items="availableLevels"
        item-title="title"
        item-value="value"
        label="Level za testiranje"
        variant="outlined"
        density="comfortable"
        hide-details
        class="mb-3"
      />

      <v-btn
        block
        height="48"
        color="primary"
        elevation="0"
        prepend-icon="mdi-lightning-bolt"
        class="test-button"
        @click="testLevelUp"
      >
        Testiraj Level Up
      </v-btn>

    </div>

    <!-- TESTIRANJE ZVUKOVA -->

    <v-divider class="my-5" />

    <div class="test-section">

      <h3>
        <v-icon size="22">
          mdi-volume-high
        </v-icon>

        Zvučni efekti
      </h3>

      <p class="test-description">
        Poslušaj pojedinačne zvukove nagrađivanja.
      </p>

      <v-alert
        v-if="!settingsStore.soundEnabled"
        type="warning"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        Zvuk je trenutno isključen.
        Uključi ga u zaglavlju aplikacije.
      </v-alert>

      <div class="sound-grid">

        <v-btn
          v-for="sound in sounds"
          :key="sound.value"
          variant="outlined"
          prepend-icon="mdi-play"
          :disabled="!settingsStore.soundEnabled"
          @click="testSound(sound.value)"
        >
          {{ sound.title }}
        </v-btn>

      </div>

    </div>

    <AdminCoinPreview />

    <!-- SIGURNOSNA NAPOMENA -->

    <div class="safe-test-info">

      <v-icon size="20">
        mdi-shield-check-outline
      </v-icon>

      <span>
        Testni način rada. XP, leveli, coinsi
        i rezultati u bazi ostaju nepromijenjeni.
      </span>

    </div>

    <!-- LEVEL UP DIJALOG -->

    <LevelUpDialog
      v-model="levelUpDialog"
      :previous-level="previewLevel - 1"
      :level="previewLevel"
    />

  </section>
</template>

<script setup>
import {
  ref
} from 'vue'

import { useAdminStore } from '@/stores/adminStore'

import {
  useSettingsStore,
} from '@/stores/settingsStore'

import {
  unlockRewardSound,
  playRewardSound,
} from '@/services/rewardSoundService'

import LevelUpDialog
  from '@/components/progression/LevelUpDialog.vue'

import AdminCoinPreview
  from '@/components/admin/AdminCoinPreview.vue'

const adminStore = useAdminStore()

const settingsStore = useSettingsStore()

const testLevel = ref(2)

const previewLevel = ref(2)

const levelUpDialog = ref(false)

const availableLevels = [

  {
    title: 'Level 2 — Običan level',
    value: 2,
  },

  {
    title: 'Level 5 — Pogađač',
    value: 5,
  },

  {
    title: 'Level 10 — Procjenitelj',
    value: 10,
  },

  {
    title: 'Level 25 — Jubilarni level',
    value: 25,
  },

  {
    title: 'Level 50 — Legenda',
    value: 50,
  },

  {
    title: 'Level 75 — Fenomen',
    value: 75,
  },

  {
    title: 'Level 100 — Kralj odokativnog',
    value: 100,
  },

]

const sounds = [

  {
    title: 'XP',
    value: 'xp',
  },

  {
    title: 'Level Up',
    value: 'levelUp',
  },

  {
    title: 'Jubilarni Level',
    value: 'milestone',
  },

  {
    title: 'Coins',
    value: 'coins',
  },

  {
    title: 'Otključavanje',
    value: 'unlock',
  },

  {
    title: 'Kupovina',
    value: 'purchase',
  },

]

// =========================================
// TESTIRANJE ZVUKOVA
// =========================================

async function testSound(sound) {

  if (
    !adminStore.isAdmin ||
    !settingsStore.soundEnabled
  ) {
    return
  }

  const ready = await unlockRewardSound()

  if (!ready) {

    console.warn(
      '[DeveloperTools] Zvuk nije aktiviran.'
    )

    return
  }

  if (
    !adminStore.isAdmin ||
    !settingsStore.soundEnabled
  ) {
    return
  }

  playRewardSound(
    sound,
    settingsStore.soundEnabled
  )
}


// =========================================
// TESTIRANJE LEVEL UP ANIMACIJE
// =========================================

function testLevelUp() {

  if (!adminStore.isAdmin) {
    return
  }

  previewLevel.value = testLevel.value

  levelUpDialog.value = true

  const milestone = [

    10,
    25,
    50,
    75,
    100,

  ].includes(previewLevel.value)

  testSound(
    milestone
      ? 'milestone'
      : 'levelUp'
  )
}

// =========================================
// CLEANUP
// =========================================

</script>

<style scoped>
.developer-card {
  background: #fffdf6;
  border: 2px dashed #bdb9ad;
  border-radius: 16px;
  padding: 24px;
  margin: 32px 0;
  color: #181818;
}

.developer-heading {
  display: flex;
  align-items: center;
  gap: 14px;
}

.developer-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #facc15;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  flex-shrink: 0;
}

.developer-title {
  flex: 1;
}

.developer-title h2 {
  font-size: 25px;
  font-weight: 700;
  letter-spacing: -0.8px;
}

.eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #66645d;
  margin-bottom: 5px;
}

.admin-label {
  background: #181818;
  color: #facc15;
  font-size: 10px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 6px;
  letter-spacing: 1px;
}

.developer-description {
  margin-top: 16px;
  color: #66645d;
  font-size: 14px;
  line-height: 1.6;
}

.test-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
}

.test-description {
  color: #66645d;
  font-size: 13px;
  margin: 8px 0 16px;
}

.test-button {
  font-weight: 700;
  letter-spacing: 0.6px;
}

.sound-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.sound-grid .v-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
}

.safe-test-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
  background: #dcfce7;
  color: #15803d;
  padding: 14px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.5;
}

.safe-test-info .v-icon {
  flex-shrink: 0;
}

@media (max-width: 600px) {

  .developer-card {
    padding: 16px;
  }

  .developer-heading {
    gap: 10px;
  }

  .developer-title h2 {
    font-size: 20px;
  }

  .developer-icon {
    width: 42px;
    height: 42px;
  }

  .sound-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .admin-label {
    font-size: 9px;
    padding: 5px 7px;
  }
}
</style>
