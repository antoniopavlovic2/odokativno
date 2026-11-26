
import { defineStore } from 'pinia'
import { soundService } from '@/services/soundService'

const STORAGE_KEY = 'odokativno-sound'

function readSoundSetting() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'false'
  } catch {
    return true
  }
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    soundEnabled: readSoundSetting(),
  }),

  actions: {
    async unlockSound() {
      soundService.setEnabled(this.soundEnabled)

      if (!this.soundEnabled) {
        return false
      }

      return soundService.unlock()
    },

    async toggleSound() {
      this.soundEnabled = !this.soundEnabled

      soundService.setEnabled(this.soundEnabled)

      try {
        localStorage.setItem(
          STORAGE_KEY,
          String(this.soundEnabled)
        )
      } catch {
        // LocalStorage nije dostupan.
      }

      console.log(
        '[AUDIO] Zvuk:',
        this.soundEnabled ? 'UKLJUČEN' : 'ISKLJUČEN'
      )

      if (this.soundEnabled) {
        const activated = await this.unlockSound()

        if (activated) {
          soundService.test()
        } else {
          console.warn(
            '[AUDIO] Aktivacija zvuka nije uspjela.'
          )
        }
      }
    },

    playSound(name) {
      if (!this.soundEnabled) return

      if (typeof soundService[name] === 'function') {
        soundService[name]()
      }
    },
  },
})
