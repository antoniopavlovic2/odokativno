
import { supabase } from '@/services/supabase'

// =========================================
// KOMUNIKACIJA SA SERVEROM
// =========================================

async function requestGame(action, params = {}) {
  if (!supabase) {
    throw new Error(
      'Veza sa Supabaseom nije konfigurirana.'
    )
  }

  const { data, error } = await supabase.rpc(
    'play_game',
    {
      p_action: action,
      ...params,
    }
  )

  if (error) {
    throw error
  }

  return data
}

// =========================================
// DANAŠNJI IZAZOV
// =========================================

export async function getTodayChallenge() {
  if (!supabase) {
    throw new Error(
      'Veza sa Supabaseom nije konfigurirana.'
    )
  }

  const { data, error } = await supabase.rpc(
    'get_today_challenge'
  )

  if (error) {
    throw error
  }

  return data?.[0] || null
}

// =========================================
// POKRETANJE IGRE
// =========================================

export async function startGame() {
  return requestGame('start')
}

// =========================================
// NASTAVAK IGRE
// =========================================

export async function getGameState(sessionId) {
  return requestGame('state', {
    p_session_id: sessionId,
  })
}

// =========================================
// POTVRDA ODGOVORA
// =========================================

export async function submitAnswer(
  sessionId,
  position,
  lower,
  upper
) {
  return requestGame('answer', {
    p_session_id: sessionId,
    p_position: position,
    p_lower: lower,
    p_upper: upper,
  })
}

// =========================================
// SLJEDEĆE PITANJE
// =========================================

export async function nextQuestion(
  sessionId,
  position
) {
  return requestGame('next', {
    p_session_id: sessionId,
    p_position: position,
  })
}
