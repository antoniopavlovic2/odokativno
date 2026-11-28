
<template>
  <v-container class="statistics-page">

    <header class="page-heading">

      <div>

        <div class="eyebrow">
          ODOKATIVNO. / STATISTIKA
        </div>

        <h1>Moja statistika.</h1>

        <p>
          Prati svoje rezultate, uspješnost
          i tjedni napredak.
        </p>

      </div>

      <v-btn
        v-if="canAccess"
        variant="outlined"
        prepend-icon="mdi-account-outline"
        class="profile-button"
        :to="{ name: 'profile' }"
      >
        Moj profil
      </v-btn>

    </header>

    <!-- UČITAVANJE -->

    <div
      v-if="!authStore.initialized"
      class="loading-state"
    >

      <v-progress-circular
        indeterminate
        color="primary"
        size="42"
      />

      <p>Učitavanje statistike...</p>

    </div>

    <!-- NEPRIJAVLJENI KORISNIK -->

    <section
      v-else-if="!canAccess"
      class="access-card"
    >

      <div class="access-icon">

        <v-icon size="44">
          mdi-chart-bar
        </v-icon>

      </div>

      <h2>Upoznaj svoj napredak.</h2>

      <p>
        Prijavi se ili kreiraj račun kako bi
        mogao pratiti svoju statistiku,
        rezultate i tjedne streakove.
      </p>

      <v-btn
        block
        color="primary"
        elevation="0"
        height="50"
        class="action-button"
        :to="{
          name: authStore.isRecovery
            ? 'reset-password'
            : 'login'
        }"
      >
        {{
          authStore.isRecovery
            ? 'Postavi novu lozinku'
            : 'Prijavi se'
        }}
      </v-btn>

      <v-btn
        v-if="!authStore.isRecovery"
        block
        variant="outlined"
        height="48"
        :to="{ name: 'register' }"
      >
        Registriraj se
      </v-btn>

    </section>

    <template v-else>

        <PlayerStatistics />

        <StatisticsAnalytics />

    </template>

  </v-container>
</template>

<script setup>
import { computed } from 'vue'

import { useAuthStore } from '@/stores/authStore'

import PlayerStatistics
  from '@/components/statistics/PlayerStatistics.vue'

import StatisticsAnalytics
  from '@/components/statistics/StatisticsAnalytics.vue'

const authStore = useAuthStore()

const canAccess = computed(() =>

  authStore.initialized &&
  authStore.isAuthenticated &&
  !authStore.isRecovery &&
  !authStore.user?.is_anonymous

)
</script>

<style scoped>
.statistics-page {
  max-width: 1100px;
  padding: 48px 24px 64px;
  color: #181818;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
}

.eyebrow {
  font-size: 11px;
  font-weight: 700;
  color: #66645d;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}

.page-heading h1 {
  font-size: clamp(36px, 6vw, 58px);
  font-weight: 700;
  letter-spacing: -2px;
  line-height: 1.1;
}

.page-heading p {
  margin-top: 12px;
  color: #66645d;
  font-size: 14px;
  line-height: 1.6;
}

.profile-button {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  border-radius: 9px;
  flex-shrink: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 20px;
  color: #66645d;
}

.access-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  max-width: 460px;
  padding: 32px;
  margin: 40px auto;
  background: #fffdf6;
  border: 1px solid #d8d5ca;
  border-radius: 16px;
  text-align: center;
}

.access-icon {
  display: grid;
  place-items: center;
  width: 80px;
  height: 80px;
  background: #facc15;
  border-radius: 18px;
}

.access-card h2 {
  font-size: 26px;
  font-weight: 700;
}

.access-card p {
  color: #66645d;
  font-size: 14px;
  line-height: 1.7;
}

.action-button {
  font-weight: 700;
  border-radius: 9px;
}

@media (max-width: 850px) {

  .statistics-page {
    max-width: 620px;
  }

}

@media (max-width: 600px) {

  .statistics-page {
    padding: 28px 16px 40px;
  }

  .page-heading {
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 24px;
  }

  .page-heading h1 {
    font-size: 36px;
    letter-spacing: -1.5px;
  }

  .page-heading p {
    font-size: 13px;
  }

  .profile-button {
    font-size: 12px;
  }

  .access-card {
    padding: 24px;
  }

}
</style>
