
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
          :icon="soundIcon"
          :aria-label="soundLabel"
          :title="soundLabel"
          variant="text"
          @click="settingsStore.toggleSound()"
        />

        <v-divider vertical class="mx-2" />

        <template v-if="authStore.initialized">

          <!-- Administratorski pristup -->
          <AdminAccessButton />

          <v-btn
            v-if="authStore.isRecovery"
            to="/nova-lozinka"
            color="primary"
          >
            Nova lozinka
          </v-btn>

          <v-btn
            v-else-if="authStore.isAuthenticated"
            to="/profil"
            color="primary"
            elevation="0"
            prepend-icon="mdi-account-circle-outline"
            class="auth-button font-weight-bold"
          >
            Moj profil
          </v-btn>

          <template v-else>
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
          </template>
        </template>
      </nav>

      <!-- Mobilna navigacija -->
      <div class="d-flex d-lg-none">
        <v-btn
          :icon="soundIcon"
          :aria-label="soundLabel"
          :title="soundLabel"
          variant="text"
          @click="settingsStore.toggleSound()"
        />

        <v-btn
          v-if="authStore.initialized"
          :to="accountRoute"
          :icon="accountIcon"
          :aria-label="accountLabel"
          variant="text"
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
      <span class="brand">
        ODOKATIVNO<span>.</span>
      </span>

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

      <v-list-item
        v-if="
          authStore.initialized &&
          authStore.isAuthenticated &&
          !authStore.isRecovery
        "
        to="/profil"
        prepend-icon="mdi-account-circle-outline"
        title="Moj profil"
        @click="menu = false"
      />

      <!-- Administracija u mobilnom izborniku -->
      <v-list-item
        v-if="adminStore.isAdmin"
        :to="{ name: 'admin' }"
        prepend-icon="mdi-shield-account"
        title="Administracija"
        class="admin-menu-item"
        @click="menu = false"
      />
    </v-list>

    <v-divider />

    <div
      v-if="authStore.initialized"
      class="pa-4"
    >
      <v-btn
        v-if="authStore.isRecovery"
        to="/nova-lozinka"
        block
        color="primary"
        height="46"
        @click="menu = false"
      >
        Nova lozinka
      </v-btn>

      <template v-else-if="authStore.isAuthenticated">
        <div class="drawer-account mb-4">
          <v-icon
            icon="mdi-account-circle-outline"
            size="30"
          />

          <div class="account-details">
            <strong>Prijavljen si</strong>
            <span>{{ authStore.email }}</span>

            <div
              v-if="adminStore.isAdmin"
              class="admin-account-badge"
            >
              <v-icon size="14">
                mdi-shield-check
              </v-icon>

              Administrator
            </div>
          </div>
        </div>

        <v-btn
          block
          color="primary"
          elevation="0"
          height="46"
          to="/profil"
          @click="menu = false"
        >
          Moj profil
        </v-btn>
      </template>

      <template v-else>
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
      </template>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useSettingsStore } from '@/stores/settingsStore'
import { useAuthStore } from '@/stores/authStore'
import { useAdminStore } from '@/stores/adminStore'

import AdminAccessButton from '@/components/admin/AdminAccessButton.vue'

const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const adminStore = useAdminStore()

const route = useRoute()

const menu = ref(false)

const emit = defineEmits([
  'rules',
  'leaderboard',
  'statistics',
])

const soundIcon = computed(() =>
  settingsStore.soundEnabled
    ? 'mdi-volume-high'
    : 'mdi-volume-off'
)

const soundLabel = computed(() =>
  settingsStore.soundEnabled
    ? 'Isključi zvuk'
    : 'Uključi zvuk'
)

const accountRoute = computed(() => {
  if (authStore.isRecovery) {
    return '/nova-lozinka'
  }

  return authStore.isAuthenticated
    ? '/profil'
    : '/prijava'
})

const accountIcon = computed(() => {
  if (authStore.isRecovery) {
    return 'mdi-lock-outline'
  }

  return authStore.isAuthenticated
    ? 'mdi-account-circle'
    : 'mdi-account-outline'
})

const accountLabel = computed(() => {
  if (authStore.isRecovery) {
    return 'Nova lozinka'
  }

  return authStore.isAuthenticated
    ? 'Moj profil'
    : 'Prijava'
})

// Zatvaranje mobilnog izbornika
// prilikom promjene stranice.

watch(
  () => route.path,
  () => {
    menu.value = false
  }
)

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
  gap: 16px;
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
  flex-shrink: 0;
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

/* Mobilni izbornik */

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.drawer-header .brand {
  font-size: 18px;
}

.drawer-account {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f6ed;
  border: 1px solid rgba(24, 24, 24, 0.15);
  border-radius: 12px;
  padding: 14px;
}

.account-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.account-details strong {
  font-size: 14px;
}

.account-details span {
  font-size: 12px;
  color: #64635d;
  overflow-wrap: anywhere;
}

/* Administratorske oznake */

.admin-menu-item {
  background: #181818;
  color: #facc15 !important;
  border-radius: 8px;
  margin-top: 8px;
}

.admin-menu-item :deep(.v-icon) {
  color: #facc15;
}

.admin-account-badge {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 5px;
  background: #facc15;
  color: #181818;
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
  margin-top: 8px;
}

/* Responsive */

@media (min-width: 1280px) and (max-width: 1439px) {
  .desktop-nav {
    gap: 4px;
  }

  .desktop-nav :deep(.v-btn) {
    padding-left: 10px;
    padding-right: 10px;
  }
}

@media (max-width: 599px) {
  .header-container {
    min-height: 64px;
    padding-left: 20px;
    padding-right: 12px;
    gap: 8px;
  }

  .brand {
    font-size: 20px;
  }
}
</style>
