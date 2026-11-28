
<template>
  <header class="site-header">

    <v-container class="header-container">

      <!-- LOGOTIP -->

      <router-link
        to="/"
        class="brand"
        aria-label="Odokativno – početna stranica"
      >
        ODOKATIVNO<span>.</span>
      </router-link>

      <!-- DESKTOP NAVIGACIJA -->

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
          :to="{ name: 'leaderboard' }"
          active-class="nav-active"
        >
          Rang-lista
        </v-btn>

        <v-btn
          variant="text"
          prepend-icon="mdi-chart-bar"
          :to="{ name: 'statistics' }"
          active-class="nav-active"
        >
          Statistika
        </v-btn>

        <!-- NOVČANIK -->

        <WalletBalance />

        <!-- ZVUK -->

        <v-btn
          :icon="soundIcon"
          :aria-label="soundLabel"
          :title="soundLabel"
          :aria-pressed="settingsStore.soundEnabled"
          variant="text"
          @click="settingsStore.toggleSound()"
        />

        <v-divider
          vertical
          class="mx-2"
        />

        <!-- KORISNIČKI RAČUN -->

        <template v-if="authStore.initialized">

          <!-- ADMINISTRACIJA -->

          <AdminAccessButton />

          <!-- OBNOVA LOZINKE -->

          <v-btn
            v-if="authStore.isRecovery"
            to="/nova-lozinka"
            color="primary"
            elevation="0"
            class="auth-button"
          >
            Nova lozinka
          </v-btn>

          <!-- PRIJAVLJENI KORISNIK -->

          <v-btn
            v-else-if="isPermanentUser"
            to="/profil"
            color="primary"
            elevation="0"
            prepend-icon="mdi-account-circle-outline"
            class="auth-button font-weight-bold"
          >
            Moj profil
          </v-btn>

          <!-- NEPRIJAVLJENI KORISNIK -->

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

      <!-- MOBILNA I TABLET NAVIGACIJA -->

      <div class="mobile-nav d-flex d-lg-none">

        <!-- NOVČANIK -->

        <WalletBalance />

        <!-- ZVUK -->

        <v-btn
          :icon="soundIcon"
          :aria-label="soundLabel"
          :title="soundLabel"
          :aria-pressed="settingsStore.soundEnabled"
          variant="text"
          class="mobile-icon-button"
          @click="settingsStore.toggleSound()"
        />

        <!-- KORISNIČKI RAČUN -->

        <v-btn
          v-if="authStore.initialized"
          :to="accountRoute"
          :icon="accountIcon"
          :aria-label="accountLabel"
          :title="accountLabel"
          variant="text"
          class="mobile-icon-button"
        />

        <!-- HAMBURGER IZBORNIK -->

        <v-btn
          icon="mdi-menu"
          variant="text"
          class="mobile-icon-button"
          aria-label="Otvori izbornik"
          aria-controls="mobile-navigation"
          :aria-expanded="menu"
          @click="menu = true"
        />

      </div>

    </v-container>

  </header>

  <!-- MOBILNI IZBORNIK -->

  <v-navigation-drawer
    id="mobile-navigation"
    v-model="menu"
    temporary
    location="right"
    width="300"
  >

    <!-- ZAGLAVLJE IZBORNIKA -->

    <div class="drawer-header">

      <router-link
        to="/"
        class="brand"
        aria-label="Odokativno – početna stranica"
        @click="menu = false"
      >
        ODOKATIVNO<span>.</span>
      </router-link>

      <v-btn
        icon="mdi-close"
        variant="text"
        aria-label="Zatvori izbornik"
        @click="menu = false"
      />

    </div>

    <v-divider />

    <!-- MOBILNE POVEZNICE -->

    <nav aria-label="Mobilna navigacija">

      <v-list nav class="pa-3">

        <!-- POČETNA -->

        <v-list-item
          to="/"
          exact
          prepend-icon="mdi-home-outline"
          title="Početna"
          active-class="nav-active"
          @click="menu = false"
        />

        <!-- PRAVILA -->

        <v-list-item
          prepend-icon="mdi-help-circle-outline"
          title="Kako se igra?"
          @click="openRules"
        />

        <!-- RANG-LISTA -->

        <v-list-item
          :to="{ name: 'leaderboard' }"
          prepend-icon="mdi-trophy-outline"
          title="Rang-lista"
          active-class="nav-active"
          @click="menu = false"
        />

        <!-- STATISTIKA -->

        <v-list-item
          :to="{ name: 'statistics' }"
          prepend-icon="mdi-chart-bar"
          title="Moja statistika"
          active-class="nav-active"
          @click="menu = false"
        />

        <!-- MOJ PROFIL -->

        <v-list-item
          v-if="isPermanentUser && !authStore.isRecovery"
          to="/profil"
          prepend-icon="mdi-account-circle-outline"
          title="Moj profil"
          active-class="nav-active"
          @click="menu = false"
        />

        <!-- MOJ NOVČANIK -->

        <v-list-item
          v-if="isPermanentUser && !authStore.isRecovery"
          :to="{ name: 'wallet' }"
          prepend-icon="mdi-wallet-outline"
          title="Moj novčanik"
          active-class="nav-active"
          @click="menu = false"
        />

        <!-- ADMINISTRACIJA -->

        <v-list-item
          v-if="adminStore.isAdmin"
          :to="{ name: 'admin' }"
          prepend-icon="mdi-shield-account"
          title="Administracija"
          class="admin-menu-item"
          @click="menu = false"
        />

      </v-list>

    </nav>

    <v-divider />

    <!-- KORISNIČKI RAČUN -->

    <div
      v-if="authStore.initialized"
      class="pa-4"
    >

      <!-- OBNOVA LOZINKE -->

      <v-btn
        v-if="authStore.isRecovery"
        to="/nova-lozinka"
        block
        color="primary"
        elevation="0"
        height="46"
        @click="menu = false"
      >
        Nova lozinka
      </v-btn>

      <!-- PRIJAVLJENI KORISNIK -->

      <template v-else-if="isPermanentUser">

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
          prepend-icon="mdi-account-outline"
          @click="menu = false"
        >
          Moj profil
        </v-btn>

      </template>

      <!-- NEPRIJAVLJENI KORISNIK -->

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
import {
  ref,
  computed,
  watch,
} from 'vue'

import { useRoute } from 'vue-router'

import {
  useSettingsStore,
} from '@/stores/settingsStore'

import { useAuthStore } from '@/stores/authStore'
import { useAdminStore } from '@/stores/adminStore'

import AdminAccessButton
  from '@/components/admin/AdminAccessButton.vue'

import WalletBalance
  from '@/components/wallet/WalletBalance.vue'

// =========================================
// STOREOVI
// =========================================

const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const adminStore = useAdminStore()

const route = useRoute()

const menu = ref(false)

// Samo pravila igre ostaju dijalog.
// Rang-lista i statistika sada su rute.

const emit = defineEmits([
  'rules',
])

// =========================================
// KORISNIČKI RAČUN
// =========================================

const isPermanentUser = computed(() =>

  authStore.initialized &&
  authStore.isAuthenticated &&
  !authStore.user?.is_anonymous

)

// =========================================
// ZVUK
// =========================================

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

// =========================================
// MOBILNI KORISNIČKI RAČUN
// =========================================

const accountRoute = computed(() => {

  if (authStore.isRecovery) {

    return '/nova-lozinka'

  }

  return isPermanentUser.value
    ? '/profil'
    : '/prijava'

})

const accountIcon = computed(() => {

  if (authStore.isRecovery) {

    return 'mdi-lock-outline'

  }

  return isPermanentUser.value
    ? 'mdi-account-circle'
    : 'mdi-account-outline'

})

const accountLabel = computed(() => {

  if (authStore.isRecovery) {

    return 'Nova lozinka'

  }

  return isPermanentUser.value
    ? 'Moj profil'
    : 'Prijava'

})

// =========================================
// PRAVILA IGRE
// =========================================

function openRules() {

  menu.value = false

  emit('rules')

}

// =========================================
// ZATVARANJE MOBILNOG IZBORNIKA
// =========================================

watch(

  () => route.path,

  () => {

    menu.value = false

  }

)
</script>

<style scoped>
/* =========================================
   ZAGLAVLJE
========================================= */

.site-header {
  background: #f8f6ed;
  border-bottom: 1px solid rgba(24, 24, 24, 0.14);
}

.header-container {
  max-width: 1320px;
  min-height: 76px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 16px;

  padding-left: 24px;
  padding-right: 24px;
}

/* =========================================
   LOGOTIP
========================================= */

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

/* =========================================
   DESKTOP NAVIGACIJA
========================================= */

.desktop-nav {
  align-items: center;
  gap: 8px;
}

.desktop-nav .v-btn {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
  white-space: nowrap;
}

.auth-button {
  border-radius: 8px;
}

/* =========================================
   AKTIVNA STRANICA
========================================= */

.nav-active {
  background: #fef3c7 !important;
  color: #181818 !important;
  border-radius: 8px;
  font-weight: 700 !important;
}

.nav-active :deep(.v-icon) {
  color: #a16207;
}

/* =========================================
   MOBILNA NAVIGACIJA
========================================= */

.mobile-nav {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  gap: 2px;
  min-width: 0;
  flex-wrap: wrap;
}

.mobile-icon-button {
  flex-shrink: 0;
}

/* =========================================
   MOBILNI IZBORNIK
========================================= */

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

/* =========================================
   ADMINISTRATORSKE OZNAKE
========================================= */

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

/* =========================================
   PRISTUPAČNOST
========================================= */

.brand:focus-visible,
.v-btn:focus-visible,
.v-list-item:focus-visible {
  outline: 2px solid #a16207;
  outline-offset: 3px;
}

/* =========================================
   MANJI DESKTOP EKRANI
========================================= */

@media (min-width: 1280px) and (max-width: 1439px) {

  .desktop-nav {
    gap: 4px;
  }

  .desktop-nav :deep(.v-btn) {
    padding-left: 10px;
    padding-right: 10px;
    font-size: 13px;
  }

  .header-container {
    gap: 12px;
  }

}

/* =========================================
   TABLETI
========================================= */

@media (min-width: 600px) and (max-width: 1279px) {

  .header-container {
    min-height: 70px;
  }

  .mobile-nav {
    gap: 6px;
  }

}

/* =========================================
   MOBITELI
========================================= */

@media (max-width: 599px) {

  .header-container {
    min-height: 64px;

    padding-left: 14px;
    padding-right: 10px;

    gap: 6px;
    flex-wrap: wrap;
  }

  .brand {
    font-size: 19px;
    letter-spacing: -1px;
  }

  .mobile-nav {
    gap: 0;
    margin-left: auto;
  }

  .mobile-nav .mobile-icon-button {
    width: 38px !important;
    height: 44px !important;
    min-width: 38px !important;
  }

}

/* =========================================
   VRLO USKI MOBITELI
========================================= */

@media (max-width: 360px) {

  .header-container {
    padding-left: 10px;
    padding-right: 8px;
  }

  .brand {
    font-size: 17px;
  }

  .mobile-nav .mobile-icon-button {
    width: 34px !important;
    min-width: 34px !important;
  }

}
</style>
