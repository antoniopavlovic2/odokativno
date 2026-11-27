
import { supabase } from '@/services/supabase'

async function rpc(name, params = {}) {
  if (!supabase) {
    throw new Error(
      'Veza sa Supabaseom nije konfigurirana.'
    )
  }

  const { data, error } = await supabase.rpc(
    name,
    params
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
  const data = await rpc(
    'get_today_challenge'
  )

  return data?.[0] || null
}

// =========================================
// DNEVNA RANG-LISTA
// =========================================

export async function getDailyLeaderboard(
  limit = 50,
  offset = 0
) {
  const data = await rpc(
    'get_daily_leaderboard',
    {
      p_limit: limit,
      p_offset: offset,
    }
  )

  return data || []
}

// =========================================
// VLASTITI PLASMAN
// =========================================

export async function getMyDailyPlacement() {
  const data = await rpc(
    'get_my_daily_placement'
  )

  return data?.[0] || null
}
