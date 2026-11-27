
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

import { useSettingsStore } from '@/stores/settingsStore'
import { useAuthStore } from '@/stores/authStore'

import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(vuetify)

// Autentifikacija
const authStore = useAuthStore(pinia)

authStore.initialize()

app.use(router)

// Zvučni efekti
const settingsStore = useSettingsStore(pinia)

window.addEventListener(
  'click',
  () => {
    if (settingsStore.soundEnabled) {
      settingsStore.unlockSound()
    }
  },
  { capture: true }
)

app.mount('#app')
