
import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'

let authSubscription = null

function translateError(error) {
  const messages = {
    invalid_credentials:
      'E-mail adresa ili lozinka nisu ispravni.',

    email_not_confirmed:
      'Prvo potvrdi svoju e-mail adresu.',

    user_already_exists:
      'Račun s tom e-mail adresom već postoji.',

    weak_password:
      'Odabrana lozinka nije dovoljno sigurna.',

    same_password:
      'Nova lozinka mora se razlikovati od stare.',

    captcha_failed:
      'Sigurnosna provjera nije uspjela. Pokušaj ponovno.',

    over_email_send_rate_limit:
      'Poslano je previše e-mailova. Pokušaj kasnije.',

    over_request_rate_limit:
      'Previše pokušaja. Pokušaj kasnije.',

    email_address_not_authorized:
      'Slanje poruka na ovu adresu nije omogućeno.',

    session_not_found:
      'Tvoja sesija je istekla. Prijavi se ponovno.',

    otp_expired:
      'Poveznica je istekla. Zatraži novu.',
  }

  return (
    messages[error?.code] ||
    'Dogodila se greška. Pokušaj ponovno.'
  )
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,

    loading: false,
    initialized: false,
    isRecovery: false,

    errorMessage: null,
    successMessage: null,
  }),

  getters: {
    isAuthenticated: state => !!state.session,

    username: state =>
      state.user?.user_metadata?.username || null,

    email: state =>
      state.user?.email || null,

    userId: state =>
      state.user?.id || null,

    error: state =>
      state.errorMessage || state.successMessage,
  },

  actions: {
    clearError() {
      this.errorMessage = null
      this.successMessage = null
    },

    setSession(session) {
      this.session = session || null
      this.user = session?.user || null
    },

    checkConnection() {
      if (!supabase) {
        this.errorMessage =
          'Prijava trenutno nije dostupna.'

        return false
      }

      return true
    },

    checkCaptcha(captchaToken) {
      if (!captchaToken) {
        this.errorMessage =
          'Dovrši sigurnosnu provjeru.'

        return false
      }

      return true
    },

    initialize() {
      if (authSubscription) return

      if (!supabase) {
        this.initialized = true
        return
      }

      const { data } =
        supabase.auth.onAuthStateChange(
          (event, session) => {
            this.setSession(session)

            if (event === 'PASSWORD_RECOVERY') {
              this.isRecovery = true
            }

            if (event === 'SIGNED_OUT') {
              this.isRecovery = false
            }

            this.initialized = true
          }
        )

      authSubscription = data.subscription
    },

    // REGISTRACIJA

    async register(
      username,
      email,
      password,
      captchaToken
    ) {
      if (this.loading) return false

      this.clearError()

      if (!this.checkConnection()) return false
      if (!this.checkCaptcha(captchaToken)) return false

      this.loading = true

      try {
        const { data, error } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,

            options: {
              captchaToken,

              data: {
                username: username.trim(),
              },

              emailRedirectTo:
                `${window.location.origin}/`,
            },
          })

        if (error) throw error

        this.setSession(data.session)

        this.successMessage = data.session
          ? 'Uspješno si kreirao račun!'
          : 'Provjeri svoj e-mail za potvrdu računa.'

        return true

      } catch (error) {
        this.errorMessage = translateError(error)
        return false

      } finally {
        this.loading = false
      }
    },

    // PRIJAVA

    async login(email, password, captchaToken) {
      if (this.loading) return false

      this.clearError()

      if (!this.checkConnection()) return false
      if (!this.checkCaptcha(captchaToken)) return false

      this.loading = true

      try {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,

            options: {
              captchaToken,
            },
          })

        if (error) throw error

        this.setSession(data.session)

        this.isRecovery = false

        this.successMessage =
          'Uspješno si se prijavio!'

        return true

      } catch (error) {
        this.errorMessage = translateError(error)
        return false

      } finally {
        this.loading = false
      }
    },

    // ZABORAVLJENA LOZINKA

    async forgotPassword(email, captchaToken) {
      if (this.loading) return false

      this.clearError()

      if (!this.checkConnection()) return false
      if (!this.checkCaptcha(captchaToken)) return false

      this.loading = true

      try {
        const { error } =
          await supabase.auth.resetPasswordForEmail(
            email.trim(),
            {
              captchaToken,

              redirectTo:
                `${window.location.origin}/nova-lozinka`,
            }
          )

        if (error) throw error

        this.successMessage =
          'Ako račun postoji, primit ćeš e-mail s poveznicom za obnovu lozinke.'

        return true

      } catch (error) {
        this.errorMessage = translateError(error)
        return false

      } finally {
        this.loading = false
      }
    },

    // NOVA LOZINKA

    async resetPassword(password) {
      if (this.loading) return false

      this.clearError()

      if (!this.checkConnection()) return false

      if (!this.isAuthenticated || !this.isRecovery) {
        this.errorMessage =
          'Otvori valjanu poveznicu za obnovu lozinke iz e-maila.'

        return false
      }

      this.loading = true

      try {
        const { data, error } =
          await supabase.auth.updateUser({
            password,
          })

        if (error) throw error

        this.user = data.user
        this.isRecovery = false

        this.successMessage =
          'Lozinka je uspješno promijenjena!'

        return true

      } catch (error) {
        this.errorMessage = translateError(error)
        return false

      } finally {
        this.loading = false
      }
    },

    // ODJAVA

    async logout() {
      if (this.loading) return false

      this.clearError()

      if (!this.checkConnection()) return false

      this.loading = true

      try {
        const { error } =
          await supabase.auth.signOut({
            scope: 'local',
          })

        if (error) throw error

        this.setSession(null)
        this.isRecovery = false

        return true

      } catch (error) {
        this.errorMessage = translateError(error)
        return false

      } finally {
        this.loading = false
      }
    },
  },
})
