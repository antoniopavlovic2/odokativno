
<template>
  <div class="home-page">

    <!-- ========================================
         HERO SECTION
    ========================================= -->

    <section
      class="hero-section"
      aria-labelledby="hero-title"
    >
      <v-container class="content-container">
        <v-row align="center" class="hero-row">

          <!-- Lijeva strana -->
          <v-col cols="12" md="6">
            <div class="hero-content">

              <img
                :src="logo"
                alt="Odokativno – oko i mjerno ravnalo"
                class="hero-logo"
                width="240"
                height="150"
              />

              <h1 id="hero-title">
                ODOKATIVNO<span>.</span>
              </h1>

              <p class="hero-slogan">
                Nemaš pojma? Nema veze.
              </p>

              <p class="hero-description">
                7 pitanja. Tvoj osjećaj za brojke.
                Koliko blizu možeš doći?
              </p>

              <p class="hero-subtitle">
                Besplatni dnevni kviz procjenjivanja
                na hrvatskom jeziku.
              </p>

            </div>
          </v-col>

          <!-- Desna strana -->
          <v-col cols="12" md="6">
            <div class="challenge-wrapper">

              <section
                class="daily-challenge"
                aria-labelledby="challenge-title"
              >

                <div class="challenge-top">
                  <span
                    class="daily-indicator"
                    aria-hidden="true"
                  ></span>

                  DNEVNI IZAZOV #001
                </div>

                <v-icon
                  icon="mdi-target"
                  size="48"
                  color="primary"
                  class="challenge-icon"
                  aria-hidden="true"
                />

                <h2 id="challenge-title">
                  Koliko dobro<br />
                  procjenjuješ?
                </h2>

                <p class="challenge-description">
                  Ne moraš znati točan odgovor.
                  Dovoljno je da imaš dobar osjećaj.
                </p>

                <div class="challenge-info">

                  <span>
                    <v-icon
                      icon="mdi-help-circle-outline"
                      size="19"
                      aria-hidden="true"
                    />
                    7 pitanja
                  </span>

                  <span
                    class="info-divider"
                    aria-hidden="true"
                  ></span>

                  <span>
                    <v-icon
                      icon="mdi-clock-outline"
                      size="19"
                      aria-hidden="true"
                    />
                    3 minute
                  </span>

                </div>

              </section>

              <!-- Gumb za pokretanje igre -->
              <v-btn
                block
                color="primary"
                height="64"
                class="play-button"
                append-icon="mdi-arrow-right"
                @click="startGame"
              >
                ZAIGRAJ
              </v-btn>

              <!-- Pravila igre -->
              <v-btn
                block
                variant="text"
                class="help-button"
                prepend-icon="mdi-help-circle-outline"
                @click="emit('rules')"
              >
                Kako se igra?
              </v-btn>

              <p class="free-label">
                Besplatno. Bez obavezne registracije.
              </p>

            </div>
          </v-col>

        </v-row>
      </v-container>
    </section>

    <!-- ========================================
         ZNAČAJKE IGRE
    ========================================= -->

    <section
      class="features-section"
      aria-label="Značajke igre"
    >
      <v-container class="content-container">
        <v-row>

          <v-col
            v-for="feature in features"
            :key="feature.title"
            cols="12"
            sm="4"
          >
            <article class="feature-card">

              <div class="feature-icon">
                <v-icon
                  :icon="feature.icon"
                  size="28"
                  aria-hidden="true"
                />
              </div>

              <h2>{{ feature.title }}</h2>

              <p>{{ feature.description }}</p>

            </article>
          </v-col>

        </v-row>
      </v-container>
    </section>

    <!-- ========================================
         O IGRI / SEO SADRŽAJ
    ========================================= -->

    <section
      class="about-section"
      aria-labelledby="about-title"
    >
      <v-container class="content-container">

        <div class="about-content">

          <span class="section-label">
            MALO DRUGAČIJI KVIZ
          </span>

          <h2 id="about-title">
            Znanje je super.<br />
            Dobar osjećaj još bolji.
          </h2>

          <p>
            Odokativno je besplatni online kviz u kojem
            ne moraš znati točne odgovore. Umjesto toga,
            procijeni raspon u kojem se nalazi odgovor
            i testiraj svoj osjećaj za brojke.
          </p>

          <p>
            Od geografije i povijesti do znanosti,
            sporta i svakodnevnih zanimljivosti.
            Svaki dan čeka te novi izazov.
          </p>

          <v-btn
            variant="outlined"
            color="secondary"
            class="about-button"
            @click="emit('rules')"
          >
            Saznaj kako se igra
          </v-btn>

        </div>

      </v-container>
    </section>

    <!-- ========================================
         PRIVREMENA OBAVIJEST
    ========================================= -->

    <v-snackbar
      v-model="comingSoon"
      color="secondary"
      :timeout="3000"
    >
      Dnevni izazov stiže uskoro!

      <template #actions>
        <v-btn
          variant="text"
          icon="mdi-close"
          aria-label="Zatvori obavijest"
          @click="comingSoon = false"
        />
      </template>

    </v-snackbar>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import logo from '@/assets/logo.svg'

// Događaji koje šaljemo prema App.vue
const emit = defineEmits(['rules'])

// Lokalno stanje početne stranice
const comingSoon = ref(false)

// Značajke igre
const features = [
  {
    icon: 'mdi-calendar-today',
    title: 'Svaki dan novi izazov',
    description:
      'Nova pitanja svaki dan. Uvijek nova prilika za bolji rezultat.',
  },
  {
    icon: 'mdi-target',
    title: 'Testiraj svoj osjećaj',
    description:
      'Ne moraš znati sve. Ponekad je dobra procjena sasvim dovoljna.',
  },
  {
    icon: 'mdi-trophy-outline',
    title: 'Nadmaši prijatelje',
    description:
      'Usporedi rezultate i otkrij tko ima najbolje oko za brojke.',
  },
]

// Pokretanje dnevnog izazova
function startGame() {
  comingSoon.value = true
}
</script>

<style scoped>
/* ========================================
   GLOBAL
======================================== */

.home-page {
  --ink: #181818;
  --yellow: #facc15;
  --cream: #f8f6ed;
  --paper: #fffdf6;
  --muted: #64635d;
  --line: rgba(24, 24, 24, 0.14);

  background: var(--cream);
  color: var(--ink);
}

.content-container {
  max-width: 1200px;
  padding-left: 24px;
  padding-right: 24px;
}

/* ========================================
   HERO SECTION
======================================== */

.hero-section {
  padding: 80px 0;
}

.hero-row {
  min-height: 440px;
}

.hero-content {
  text-align: center;
}

.hero-logo {
  display: block;
  width: 280px;
  max-width: 100%;
  height: auto;
  margin: 0 auto 24px;
}

.hero-content h1 {
  font-size: clamp(36px, 4.8vw, 64px);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -3px;
}

.hero-content h1 span {
  color: #a16207;
}

.hero-slogan {
  font-size: clamp(19px, 2vw, 26px);
  font-weight: 600;
  margin-top: 16px;
}

.hero-description {
  max-width: 390px;
  margin: 16px auto 0;
  font-size: 18px;
  line-height: 1.7;
  color: var(--muted);
}

.hero-subtitle {
  margin-top: 12px;
  font-size: 13px;
  color: var(--muted);
}

/* ========================================
   DAILY CHALLENGE
======================================== */

.challenge-wrapper {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
}

.daily-challenge {
  position: relative;
  background: var(--ink);
  color: var(--paper);
  border-radius: 24px;
  padding: 36px 28px;
  text-align: center;
}

.challenge-top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 2px;
  color: #c4c4c4;
}

.daily-indicator {
  width: 8px;
  height: 8px;
  background: var(--yellow);
  border-radius: 50%;
}

.challenge-icon {
  margin-top: 28px;
  margin-bottom: 16px;
}

.daily-challenge h2 {
  font-size: clamp(28px, 3vw, 36px);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -1px;
}

.challenge-description {
  max-width: 280px;
  margin: 16px auto 24px;
  color: #bdbdbd;
  font-size: 15px;
  line-height: 1.6;
}

.challenge-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--yellow);
  font-size: 14px;
  font-weight: 500;
}

.challenge-info span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-divider {
  width: 1px;
  height: 18px;
  background: #555;
}

/* ========================================
   BUTTONS
======================================== */

.play-button {
  margin-top: 16px;
  border-radius: 16px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--ink);
  transition: transform 0.2s ease;
}

.play-button:hover {
  transform: translateY(-3px);
}

.play-button:active {
  transform: translateY(0);
}

.help-button {
  margin-top: 8px;
  text-transform: none;
  letter-spacing: 0;
}

.free-label {
  text-align: center;
  font-size: 12px;
  color: var(--muted);
  margin-top: 4px;
}

/* ========================================
   FEATURES SECTION
======================================== */

.features-section {
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding: 36px 0;
}

.feature-card {
  height: 100%;
  text-align: center;
  padding: 16px 20px;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  background: var(--yellow);
  border: 1px solid var(--ink);
  border-radius: 16px;
  margin: 0 auto 18px;
}

.feature-card h2 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.feature-card p {
  max-width: 280px;
  margin: 0 auto;
  font-size: 14px;
  line-height: 1.6;
  color: var(--muted);
}

/* ========================================
   ABOUT SECTION
======================================== */

.about-section {
  padding: 80px 0;
}

.about-content {
  max-width: 650px;
  margin: 0 auto;
  text-align: center;
}

.section-label {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  background: var(--yellow);
  padding: 6px 12px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.about-content h2 {
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -1.5px;
  margin-bottom: 24px;
}

.about-content p {
  font-size: 16px;
  line-height: 1.8;
  color: var(--muted);
  margin-bottom: 16px;
}

.about-button {
  margin-top: 12px;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
}

/* ========================================
   TABLET
======================================== */

@media (max-width: 959px) {
  .hero-section {
    padding: 40px 0;
  }

  .hero-content {
    margin-bottom: 16px;
  }

  .hero-logo {
    width: 240px;
  }

  .hero-content h1 {
    letter-spacing: -2px;
  }

  .about-section {
    padding: 56px 0;
  }
}

/* ========================================
   MOBILE
======================================== */

@media (max-width: 599px) {
  .content-container {
    padding-left: 20px;
    padding-right: 20px;
  }

  .hero-section {
    padding: 28px 0 36px;
  }

  .hero-logo {
    width: 210px;
    margin-bottom: 16px;
  }

  .hero-content h1 {
    font-size: clamp(30px, 10vw, 42px);
  }

  .hero-slogan {
    font-size: 19px;
    margin-top: 12px;
  }

  .hero-description {
    font-size: 16px;
    margin-top: 12px;
  }

  .hero-subtitle {
    font-size: 12px;
  }

  .daily-challenge {
    padding: 28px 20px;
    border-radius: 18px;
  }

  .challenge-icon {
    margin-top: 20px;
    margin-bottom: 12px;
  }

  .daily-challenge h2 {
    font-size: 28px;
  }

  .features-section {
    padding: 20px 0;
  }

  .feature-card {
    padding: 20px 12px;
  }
}

/* ========================================
   ACCESSIBILITY
======================================== */

@media (prefers-reduced-motion: reduce) {
  .play-button {
    transition: none;
  }

  .play-button:hover {
    transform: none;
  }
}
</style>
