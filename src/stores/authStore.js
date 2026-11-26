
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: state => !!state.user,

    username: state => state.user?.username || null,
  },

  actions: {
    clearError() {
      this.error = null
    },

    async login() {
      this.clearError()

      this.error =
        'Prijava još nije povezana sa Supabase servisom.'

      return false
    },

    async register() {
      this.clearError()

      this.error =
        'Registracija još nije povezana sa Supabase servisom.'

      return false
    },

    async forgotPassword() {
      this.clearError()

      this.error =
        'Slanje e-mail poruka još nije omogućeno.'

      return false
    },

    async resetPassword() {
      this.clearError()

      this.error =
        'Postavljanje nove lozinke još nije omogućeno.'

      return false
    },

    async logout() {
      this.user = null
      this.clearError()
    },
  },
})
