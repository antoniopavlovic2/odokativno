
<template>
  <section class="auth-page">
    <v-container>
      <div class="auth-container">

        <div class="auth-heading">
          <img
            :src="logo"
            alt="Odokativno"
            width="160"
            height="100"
            class="auth-logo"
          />

          <h1>{{ title }}</h1>

          <p>{{ subtitle }}</p>
        </div>

        <div class="auth-card">
          <slot />
        </div>

        <div class="auth-bottom">
          <slot name="bottom" />
        </div>

        <router-link to="/" class="back-link">
          <v-icon
            icon="mdi-arrow-left"
            size="18"
            aria-hidden="true"
          />
          Povratak na početnu stranicu
        </router-link>

      </div>
    </v-container>
  </section>
</template>

<script setup>
import logo from '@/assets/logo.svg'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.auth-page {
  background: #f8f6ed;
  color: #181818;
  padding: 40px 0 64px;
}

.auth-container {
  max-width: 440px;
  margin: 0 auto;
}

.auth-heading {
  text-align: center;
  margin-bottom: 28px;
}

.auth-logo {
  display: block;
  height: auto;
  margin: 0 auto 16px;
}

.auth-heading h1 {
  font-size: clamp(28px, 5vw, 36px);
  font-weight: 700;
  letter-spacing: -1.5px;
  line-height: 1.2;
}

.auth-heading p {
  margin-top: 12px;
  font-size: 15px;
  line-height: 1.6;
  color: #64635d;
}

.auth-card {
  background: #fffdf6;
  border: 1px solid #181818;
  border-radius: 20px;
  padding: 32px;
}

.auth-bottom {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
}

.back-link {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  color: #64635d;
  text-decoration: none;
  font-size: 13px;
}

.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 599px) {
  .auth-page {
    padding: 24px 0 40px;
  }

  .auth-card {
    padding: 24px 20px;
    border-radius: 16px;
  }
}
</style>
