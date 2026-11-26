
<template>
  <footer class="site-footer">
    <v-container class="footer-container">

      <div class="footer-content">
        <div>
          <router-link to="/" class="brand">
            ODOKATIVNO<span>.</span>
          </router-link>

          <p class="footer-slogan">
            Nemaš pojma? Nema veze.
          </p>
        </div>

        <nav
          class="footer-links"
          aria-label="Navigacija u podnožju"
        >
          <button @click="$emit('rules')">
            Pravila igre
          </button>

          <button @click="$emit('leaderboard')">
            Rang-lista
          </button>

          <button @click="$emit('statistics')">
            Statistika
          </button>
        </nav>
      </div>

      <div class="footer-bottom">
        <p>
          © {{ currentYear }} Odokativno.
          Sva prava pridržana.
        </p>

        <p>Napravljeno za znatiželjne.</p>
      </div>

    </v-container>
  </footer>
</template>

<script setup>
defineEmits([
  'rules',
  'leaderboard',
  'statistics',
])

const currentYear = new Date().getFullYear()
</script>

<style scoped>
.site-footer {
  background: #f8f6ed;
  border-top: 1px solid rgba(24, 24, 24, 0.14);
  padding: 32px 0 12px;
}

.footer-container {
  max-width: 1200px;
  padding-left: 24px;
  padding-right: 24px;
}

.brand {
  color: #181818;
  text-decoration: none;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -1.2px;
}

.brand span {
  color: #a16207;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 24px;
}

.footer-slogan {
  font-size: 13px;
  color: #64635d;
  margin-top: 6px;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.footer-links button {
  font: inherit;
  font-size: 13px;
  color: #64635d;
  cursor: pointer;
}

.footer-links button:hover {
  color: #181818;
  text-decoration: underline;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid rgba(24, 24, 24, 0.14);
  font-size: 12px;
  color: #64635d;
}

@media (max-width: 599px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }

  .footer-links {
    justify-content: center;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}
</style>
