
<template>
  <footer class="site-footer">
    <v-container class="footer-container">
      <div class="footer-top">
        <div class="footer-brand">
          <router-link
            to="/"
            class="brand"
            aria-label="Odokativno – početna stranica"
          >
            ODOKATIVNO<span>.</span>
          </router-link>

          <p>Nemaš pojma? Nema veze.</p>
        </div>

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
            @click="emit('leaderboard')"
          >
            Rang-lista
          </v-btn>

          <v-btn
            variant="text"
            @click="emit('statistics')"
          >
            Statistika
          </v-btn>
        </nav>
      </div>

      <div class="footer-bottom">
        <div class="legal-links">
          <router-link to="/politika-privatnosti">
            Politika privatnosti
          </router-link>

          <router-link to="/uvjeti-koristenja">
            Uvjeti korištenja
          </router-link>

          <router-link to="/brisanje-racuna">
            Brisanje računa
          </router-link>
        </div>

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

const emit = defineEmits([
  'rules',
  'leaderboard',
  'statistics',
])
</script>

<style scoped>
.site-footer {
  background: #f8f6ed;
  border-top: 1px solid rgba(24, 24, 24, 0.14);
  color: #181818;
}

.footer-container {
  max-width: 1200px;
  padding: 28px 24px;
}

.footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.brand {
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

.footer-navigation {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.footer-navigation .v-btn {
  font-size: 13px;
  text-transform: none;
  letter-spacing: 0;
}

.footer-bottom {
  border-top: 1px solid rgba(24, 24, 24, 0.14);
  margin-top: 24px;
  padding-top: 20px;
}

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
}

.legal-links a:hover {
  color: #181818;
  text-decoration: underline;
}

.copyright {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
  color: #64635d;
  margin-top: 24px;
}

@media (max-width: 599px) {
  .footer-container {
    padding: 24px 16px;
  }

  .footer-top {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .footer-navigation {
    justify-content: center;
  }

  .footer-bottom {
    margin-top: 16px;
  }

  .copyright {
    flex-direction: column;
    text-align: center;
    gap: 5px;
  }
}
</style>
