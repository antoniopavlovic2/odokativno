import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'


const odokativnoTheme = {
  dark: false,
  colors: {
    background: '#F8F6ED',
    surface: '#FFFDF6',
    primary: '#FACC15',
    secondary: '#181818',
    success: '#16A34A',
    error: '#DC2626',
    warning: '#F59E0B',
    'on-primary': '#181818',
    'on-background': '#181818',
    'on-surface': '#181818',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'odokativnoTheme',
    themes: {
      odokativnoTheme,
    },
  },
  defaults: {
    global: {
      style: {
        fontFamily: '"Space Grotesk", sans-serif'
      }
    },
    VBtn: {
      rounded: 'lg',
      elevation: 0,
    },
    VCard: {
      rounded: 'lg',
      elevation: 0,
    },
  },
})