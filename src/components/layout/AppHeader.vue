<template>
  <header class="site-header">
    <v-container class="header-container">
      <router-link
        to="/"
        class="brand"
        aria-label="Odokativno – početna stranica"
      >
        ODOKATIVNO<span>.</span>
      </router-link>

      <!-- Desktop navigacija -->
      <nav
        class="desktop-nav d-none d-lg-flex"
        aria-label="Glavna navigacija"
      >
        <v-btn
          variant="text"
          @click="emit('rules')"
        >
          Kako se igra?
        </v-btn>

        <v-btn
          variant="text"
          prepend-icon="mdi-trophy-outline"
          @click="emit('leaderboard')"
        >
          Rang-lista
        </v-btn>

        <v-btn
          variant="text"
          prepend-icon="mdi-chart-bar"
          @click="emit('statistics')"
        >
          Statistika
        </v-btn>

        <v-btn
          :icon="
            settingsStore.soundEnabled
              ? 'mdi-volume-high'
              : 'mdi-volume-off'
          "
          :aria-label="
            settingsStore.soundEnabled
              ? 'Isključi zvuk'
              : 'Uključi zvuk'
          "
          :title="
            settingsStore.soundEnabled
              ? 'Isključi zvuk'
              : 'Uključi zvuk'
          "
          variant="text"
          @click="settingsStore.toggleSound()"
        />

        <v-divider vertical class="mx-2" />

        <v-btn
          to="/prijava"
          variant="outlined"
          class="auth-button"
        >
          Prijava
        </v-btn>

        <v-btn
          to="/registracija"
          color="primary"
          elevation="0"
          class="auth-button font-weight-bold"
        >
          Registracija
        </v-btn>
      </nav>

      <!-- Mobilna navigacija -->
      <div class="d-flex d-lg-none">
        <v-btn
          :icon="
            settingsStore.soundEnabled
              ? 'mdi-volume-high'
              : 'mdi-volume-off'
          "
          :aria-label="
            settingsStore.soundEnabled
              ? 'Isključi zvuk'
              : 'Uključi zvuk'
          "
          :title="
            settingsStore.soundEnabled
              ? 'Isključi zvuk'
              : 'Uključi zvuk'
          "
          variant="text"
          @click="settingsStore.toggleSound()"
        />

        <v-btn
          to="/prijava"
          icon="mdi-account-outline"
          variant="text"
          aria-label="Prijava"
        />

        <v-btn
          icon="mdi-menu"
          variant="text"
          aria-label="Otvori izbornik"
          @click="menu = true"
        />
      </div>
    </v-container>
  </header>

  <!-- Mobilni izbornik -->
  <v-navigation-drawer
    v-model="menu"
    temporary
    location="right"
    width="300"
  >
    <div class="drawer-header">
      <span class="brand">ODOKATIVNO.</span>

      <v-btn
        icon="mdi-close"
        variant="text"
        aria-label="Zatvori izbornik"
        @click="menu = false"
      />
    </div>

    <v-divider />

    <v-list nav class="pa-3">
      <v-list-item
        to="/"
        prepend-icon="mdi-home-outline"
        title="Početna"
        @click="menu = false"
      />

      <v-list-item
        prepend-icon="mdi-help-circle-outline"
        title="Kako se igra?"
        @click="openDialog('rules')"
      />

      <v-list-item
        prepend-icon="mdi-trophy-outline"
        title="Rang-lista"
        @click="openDialog('leaderboard')"
      />

      <v-list-item
        prepend-icon="mdi-chart-bar"
        title="Moja statistika"
        @click="openDialog('statistics')"
      />
    </v-list>

    <v-divider />

    <div class="pa-4">
      <v-btn
        to="/prijava"
        block
        variant="outlined"
        height="46"
        class="mb-3"
        @click="menu = false"
      >
        Prijava
      </v-btn>

      <v-btn
        to="/registracija"
        block
        color="primary"
        elevation="0"
        height="46"
        @click="menu = false"
      >
        Registracija
      </v-btn>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'

const settingsStore = useSettingsStore()

const menu = ref(false)

const emit = defineEmits([
  'rules',
  'leaderboard',
  'statistics',
])

function openDialog(dialog) {
  menu.value = false
  emit(dialog)
}
</script>

<style scoped>
.site-header {
  background: #f8f6ed;
  border-bottom: 1px solid rgba(24, 24, 24, 0.14);
}

.header-container {
  max-width: 1200px;
  min-height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 24px;
  padding-right: 24px;
}

.brand {
  color: #181818;
  text-decoration: none;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -1.2px;
  white-space: nowrap;
}

.brand span {
  color: #a16207;
}

.desktop-nav {
  align-items: center;
  gap: 8px;
}

.desktop-nav .v-btn {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
}

.auth-button {
  border-radius: 8px;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.drawer-header .brand {
  font-size: 18px;
}

@media (max-width: 599px) {
  .header-container {
    min-height: 64px;
    padding-left: 20px;
    padding-right: 12px;
  }

  .brand {
    font-size: 20px;
  }
}
</style>