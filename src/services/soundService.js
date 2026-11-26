
let audioContext = null
let masterGain = null
let enabled = true

const activeOscillators = new Set()

function getAudioContext() {
  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext

  if (!AudioContext) {
    throw new Error('Web Audio API nije podržan.')
  }

  if (
    !audioContext ||
    audioContext.state === 'closed'
  ) {
    audioContext = new AudioContext()

    masterGain = audioContext.createGain()
    masterGain.gain.value = enabled ? 0.8 : 0

    masterGain.connect(audioContext.destination)

    audioContext.onstatechange = () => {
      console.log(
        '[AUDIO] Stanje:',
        audioContext.state
      )
    }
  }

  return audioContext
}

// Aktiviranje zvuka nakon korisničke interakcije
async function unlock() {
  if (!enabled) return false

  try {
    const context = getAudioContext()

    if (context.state !== 'running') {
      console.log('[AUDIO] Aktiviranje zvuka...')

      await context.resume()

      console.log(
        '[AUDIO] Stanje nakon aktivacije:',
        context.state
      )
    }

    return context.state === 'running'
  } catch (error) {
    console.warn('[AUDIO] Aktivacija nije uspjela:', error)
    return false
  }
}

function getState() {
  return audioContext?.state || 'not-initialized'
}

function setEnabled(value) {
  enabled = Boolean(value)

  if (masterGain) {
    masterGain.gain.value = enabled ? 0.8 : 0
  }

  if (!enabled) {
    stopAll()
  }
}

function stopAll() {
  activeOscillators.forEach(oscillator => {
    try {
      oscillator.stop()
    } catch {
      // Oscilator je već zaustavljen.
    }
  })

  activeOscillators.clear()
}

function playTone(
  frequency,
  duration = 0.15,
  volume = 0.18,
  type = 'sine',
  delay = 0
) {
  if (!enabled) return

  if (
    !audioContext ||
    audioContext.state !== 'running'
  ) {
    console.warn(
      '[AUDIO] Zvuk nije aktivan:',
      getState()
    )

    return
  }

  try {
    const oscillator =
      audioContext.createOscillator()

    const gain =
      audioContext.createGain()

    const start =
      audioContext.currentTime + delay

    const end = start + duration

    oscillator.type = type

    oscillator.frequency.setValueAtTime(
      frequency,
      start
    )

    gain.gain.setValueAtTime(
      0.001,
      start
    )

    gain.gain.exponentialRampToValueAtTime(
      volume,
      start + 0.01
    )

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      end
    )

    oscillator.connect(gain)
    gain.connect(masterGain)

    activeOscillators.add(oscillator)

    oscillator.onended = () => {
      activeOscillators.delete(oscillator)

      oscillator.disconnect()
      gain.disconnect()
    }

    oscillator.start(start)
    oscillator.stop(end)
  } catch (error) {
    console.warn('[AUDIO] Greška reprodukcije:', error)
  }
}

export const soundService = {
  unlock,
  setEnabled,
  stopAll,
  getState,

  // Testni zvuk
  test() {
    playTone(660, 0.15, 0.25)
    playTone(880, 0.25, 0.25, 'sine', 0.15)
  },

  // Početak pitanja
  questionStart() {
    playTone(440, 0.1, 0.18)
    playTone(660, 0.15, 0.18, 'sine', 0.1)
  },

  // Od 10. do 6. sekunde
  tick() {
    playTone(600, 0.1, 0.15, 'triangle')
  },

  // Posljednjih 5 sekundi
  urgentTick() {
    playTone(950, 0.13, 0.22, 'triangle')
  },

  // Istek vremena
  timeout() {
    playTone(220, 0.25, 0.18, 'sawtooth')
    playTone(140, 0.35, 0.2, 'triangle', 0.25)
  },

  // Točan odgovor
  correct() {
    playTone(523.25, 0.15, 0.2)
    playTone(659.25, 0.15, 0.2, 'sine', 0.12)
    playTone(783.99, 0.25, 0.2, 'sine', 0.24)
  },

  // Netočan odgovor
  incorrect() {
    playTone(330, 0.18, 0.18, 'triangle')
    playTone(220, 0.3, 0.18, 'triangle', 0.15)
  },

  // Završetak igre
  finished() {
    const notes = [
      523.25,
      659.25,
      783.99,
      1046.5,
    ]

    notes.forEach((note, index) => {
      playTone(
        note,
        0.35,
        0.2,
        'triangle',
        index * 0.16
      )
    })
  },
}
