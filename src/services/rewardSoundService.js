
let audioContext = null

// =========================================
// AKTIVACIJA ZVUKA
// =========================================

export async function unlockRewardSound() {

  try {

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext

    if (!AudioContextClass) {

      console.warn(
        '[RewardSound] Web Audio nije podržan.'
      )

      return false
    }

    if (
      !audioContext ||
      audioContext.state === 'closed'
    ) {

      audioContext = new AudioContextClass()

    }

    if (audioContext.state !== 'running') {

      await audioContext.resume()

    }

    return audioContext.state === 'running'

  } catch (error) {

    console.error(
      '[RewardSound] Aktivacija nije uspjela:',
      error
    )

    return false
  }
}

// =========================================
// GENERIRANJE TONA
// =========================================

function playNote(
  frequency,
  start,
  duration = 0.2,
  volume = 0.16,
  type = 'triangle'
) {

  const oscillator =
    audioContext.createOscillator()

  const gain =
    audioContext.createGain()

  oscillator.type = type

  oscillator.frequency.setValueAtTime(
    frequency,
    start
  )

  gain.gain.setValueAtTime(
    0.0001,
    start
  )

  gain.gain.exponentialRampToValueAtTime(
    volume,
    start + 0.015
  )

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + duration
  )

  oscillator.connect(gain)

  gain.connect(audioContext.destination)

  oscillator.start(start)

  oscillator.stop(
    start + duration + 0.03
  )

  oscillator.onended = () => {

    oscillator.disconnect()

    gain.disconnect()

  }
}

// =========================================
// REPRODUKCIJA MELODIJE
// =========================================

function playSequence(
  notes,
  spacing,
  duration,
  volume = 0.16
) {

  const now =
    audioContext.currentTime + 0.03

  notes.forEach((frequency, index) => {

    playNote(
      frequency,
      now + index * spacing,
      duration,
      volume
    )

  })
}

// =========================================
// ZVUČNI EFEKTI
// =========================================

export function playRewardSound(
  sound,
  enabled = true
) {

  if (!enabled) {

    console.info(
      '[RewardSound] Zvuk je isključen.'
    )

    return false
  }

  if (
    !audioContext ||
    audioContext.state !== 'running'
  ) {

    console.warn(
      '[RewardSound] AudioContext nije aktivan:',
      audioContext?.state
    )

    return false
  }

  try {

    switch (sound) {

      // XP

      case 'xp':

        playSequence(
          [523.25, 659.25, 783.99],
          0.09,
          0.20
        )

        break

      // LEVEL UP

      case 'levelUp':

        playSequence(
          [
            392,
            523.25,
            659.25,
            783.99,
            1046.5,
          ],
          0.13,
          0.35
        )

        break

      // JUBILARNI LEVEL

      case 'milestone':

        playSequence(
          [
            392,
            493.88,
            587.33,
            783.99,
            987.77,
            1174.66,
            1567.98,
          ],
          0.15,
          0.45,
          0.12
        )

        break

      // COINS

      case 'coins':

        playSequence(
          [
            1046.5,
            1567.98,
            1318.51,
          ],
          0.075,
          0.17
        )

        break

      // OTKLJUČAVANJE NAGRADE

      case 'unlock':

        playSequence(
          [
            440,
            554.37,
            659.25,
            880,
          ],
          0.11,
          0.3
        )

        break

      // KUPOVINA

      case 'purchase':

        playSequence(
          [783.99, 1046.5],
          0.1,
          0.22
        )

        break

      default:

        console.warn(
          '[RewardSound] Nepoznat efekt:',
          sound
        )

        return false
    }

    console.info(
      '[RewardSound] Reprodukcija:',
      sound
    )

    return true

  } catch (error) {

    console.error(
      '[RewardSound] Greška reprodukcije:',
      error
    )

    return false
  }
}
