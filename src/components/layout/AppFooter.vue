
<template>
  <footer class="site-footer">

    <v-container class="footer-container">

      <div class="footer-top">

        <!-- LOGOTIP I SLOGAN -->

        <div class="footer-brand">

          <router-link
            to="/"
            class="brand"
            aria-label="Odokativno – početna stranica"
          >
            ODOKATIVNO<span>.</span>
          </router-link>

          <p>Nemaš pojma? Nema veze.</p>

          <p class="brand-description">
            Besplatni dnevni kviz procjene
            na hrvatskom jeziku.
          </p>

        </div>

        <!-- GLAVNA NAVIGACIJA -->

        <nav
          class="footer-navigation"
          aria-label="Navigacija u podnožju"
        >

          <v-btn
            variant="text"
            @click="emit('rules')"
          >
            Kako se igra?
          </v-btn>

          <v-btn
            variant="text"
            :to="{ name: 'leaderboard' }"
            active-class="footer-active"
          >
            Rang-lista
          </v-btn>

          <v-btn
            variant="text"
            :to="{ name: 'statistics' }"
            active-class="footer-active"
          >
            Statistika
          </v-btn>

        </nav>

      </div>

      <!-- DONJI DIO FOOTERA -->

      <div class="footer-bottom">

        <!-- PRAVNE POVEZNICE -->

        <nav
          class="legal-links"
          aria-label="Pravne informacije"
        >

          <router-link to="/politika-privatnosti">
            Politika privatnosti
          </router-link>

          <router-link to="/uvjeti-koristenja">
            Uvjeti korištenja
          </router-link>

          <router-link to="/brisanje-racuna">
            Brisanje računa
          </router-link>

        </nav>

        <!-- AUTORSKA PRAVA -->

        <div class="copyright">

          <span>
            © {{ currentYear }} ODOKATIVNO.
            Sva prava pridržana.
          </span>

          <span>
            Napravljeno za znatiželjne.
          </span>

        </div>

      </div>

    </v-container>

  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()

// Samo pravila igre otvaraju dijalog.
// Ostale poveznice izravno otvaraju rute.

const emit = defineEmits([
  'rules',
])
</script>

<style scoped>
/* =========================================
   FOOTER
========================================= */

.site-footer {
  background: #f8f6ed;
  border-top: 1px solid rgba(24, 24, 24, 0.14);
  color: #181818;
}

.footer-container {
  max-width: 1320px;
  padding: 32px 24px;
}

/* =========================================
   GORNJI DIO
========================================= */

.footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

/* =========================================
   LOGOTIP
========================================= */

.brand {
  display: inline-block;
  color: #181818;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -1.2px;
  text-decoration: none;
}

.brand span {
  color: #a16207;
}

.footer-brand p {
  font-size: 13px;
  color: #64635d;
  margin-top: 6px;
}

.footer-brand .brand-description {
  font-size: 12px;
  color: #64635d;
  line-height: 1.6;
  margin-top: 10px;
  max-width: 300px;
}

/* =========================================
   NAVIGACIJA
========================================= */

.footer-navigation {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 4px;
}

.footer-navigation .v-btn {
  font-size: 13px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  border-radius: 8px;
}

/* AKTIVNA STRANICA */

.footer-active {
  background: #fef3c7 !important;
  color: #181818 !important;
  font-weight: 700 !important;
}

/* =========================================
   DONJI DIO
========================================= */

.footer-bottom {
  border-top: 1px solid rgba(24, 24, 24, 0.14);
  margin-top: 24px;
  padding-top: 20px;
}

/* =========================================
   PRAVNE POVEZNICE
========================================= */

.legal-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 24px;
}

.legal-links a {
  color: #64635d;
  font-size: 12px;
  text-decoration: none;
  transition: color 150ms ease;
}

.legal-links a:hover {
  color: #181818;
  text-decoration: underline;
}

.legal-links a.router-link-exact-active {
  color: #181818;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* =========================================
   AUTORSKA PRAVA
========================================= */

.copyright {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
  color: #64635d;
  margin-top: 24px;
}

/* =========================================
   PRISTUPAČNOST
========================================= */

.brand:focus-visible,
.legal-links a:focus-visible,
.footer-navigation .v-btn:focus-visible {
  outline: 2px solid #a16207;
  outline-offset: 4px;
  border-radius: 4px;
}

/* =========================================
   TABLETI
========================================= */

@media (max-width: 959px) {

  .footer-top {
    gap: 16px;
  }

  .footer-navigation {
    gap: 0;
  }

}

/* =========================================
   MOBITELI
========================================= */

@media (max-width: 599px) {

  .footer-container {
    padding: 28px 16px;
  }

  .footer-top {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .footer-brand .brand-description {
    margin-left: auto;
    margin-right: auto;
  }

  .footer-navigation {
    justify-content: center;
  }

  .footer-navigation .v-btn {
    min-height: 44px;
    padding-left: 10px;
    padding-right: 10px;
    font-size: 12px;
  }

  .footer-bottom {
    margin-top: 20px;
    padding-top: 20px;
  }

  .legal-links {
    gap: 14px 18px;
  }

  .copyright {
    flex-direction: column;
    text-align: center;
    gap: 6px;
    margin-top: 20px;
  }

}

@media (prefers-reduced-motion: reduce) {

  .legal-links a {
    transition: none;
  }

}
</style>
