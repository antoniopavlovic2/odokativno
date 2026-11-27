<template>
  <v-app>
    <AppHeader
      @rules="rules = true"
      @statistics="statistics = true"
      @leaderboard="$router.push({ name: 'leaderboard' })"
    />

    <v-main>
      <router-view v-slot="{ Component }">
        <component
          v-if="Component"
          :is="Component"
          @rules="rules = true"
        />
      </router-view>
    </v-main>

    <AppFooter
      @rules="rules = true"
      @statistics="statistics = true"
      @leaderboard="leaderboard = true"
    />

    <!-- Pravila igre -->
    <v-dialog v-model="rules" max-width="480">
      <v-card class="dialog-card pa-6">
        <div class="dialog-heading">
          <h2>Kako se igra?</h2>

          <v-btn
            icon="mdi-close"
            variant="text"
            aria-label="Zatvori pravila"
            @click="rules = false"
          />
        </div>

        <div
          v-for="(rule, index) in gameRules"
          :key="index"
          class="rule-item"
        >
          <span class="rule-number">
            {{ index + 1 }}
          </span>

          <p>{{ rule }}</p>
        </div>

        <v-btn
          color="primary"
          block
          height="48"
          class="mt-6 font-weight-bold"
          @click="rules = false"
        >
          JASNO!
        </v-btn>
      </v-card>
    </v-dialog>

    <!-- Statistika -->
    <v-dialog v-model="statistics" max-width="420">
      <v-card class="dialog-card pa-6 text-center">
        <v-icon
          icon="mdi-chart-bar"
          size="48"
          class="mb-4"
        />

        <h2>Moja statistika</h2>

        <p class="mt-3">
          Tvoja osobna statistika bit će dostupna
          nakon implementacije igre.
        </p>

        <v-btn
          color="primary"
          block
          class="mt-6"
          @click="statistics = false"
        >
          Zatvori
        </v-btn>
      </v-card>
    </v-dialog>

    <!-- Rang-lista -->
    <v-dialog v-model="leaderboard" max-width="420">
      <v-card class="dialog-card pa-6 text-center">
        <v-icon
          icon="mdi-trophy-outline"
          size="48"
          class="mb-4"
        />

        <h2>Tko ima najbolje oko?</h2>

        <p class="mt-3">
          Dnevna rang-lista stiže uskoro.
        </p>

        <v-btn
          color="primary"
          block
          class="mt-6"
          @click="leaderboard = false"
        >
          Zatvori
        </v-btn>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const rules = ref(false)
const statistics = ref(false)
const leaderboard = ref(false)

const gameRules = [
  'Svaki dan čeka te 7 novih pitanja.',
  'Odaberi raspon u kojem misliš da se nalazi točan odgovor.',
  'Što je raspon uži, više bodova možeš osvojiti.',
  'Ako je odgovor izvan tvog raspona, ne osvajaš bodove.',
  'Za svako pitanje imaš 20 sekundi. Ako ne potvrdiš procjenu na vrijeme, osvajaš 0 bodova.',
]
</script>

<style>
html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: #f8f6ed;
}

.v-application {
  font-family: 'Space Grotesk', sans-serif !important;
  background: #f8f6ed !important;
}

::selection {
  background: #facc15;
  color: #181818;
}

.auth-link {
  color: #181818;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.auth-link:hover {
  color: #a16207;
}

.dialog-card {
  background: #fffdf6;
  border-radius: 20px !important;
}

.dialog-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 18px;
}

.rule-number {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: #facc15;
  color: #181818;
  border-radius: 8px;
  font-weight: 700;
}

.rule-item p {
  font-size: 15px;
  line-height: 1.6;
  padding-top: 3px;
}

a:focus-visible,
button:focus-visible {
  outline: 3px solid #a16207;
  outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
</style>