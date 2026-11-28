
import { supabase } from './supabase'

// =========================================
// OSOBNA STATISTIKA I TJEDNI STREAK
// =========================================

export async function getMyStatistics() {

  if (!supabase) {

    throw new Error(
      'Supabase nije konfiguriran.'
    )

  }

  const { data, error } = await supabase.rpc(
    'get_my_statistics'
  )

  if (error) throw error

  return data
}

// =========================================
// NAPREDNA ANALITIKA
// =========================================

export async function getMyStatisticsAnalytics(
  days = 30
) {

  if (!supabase) {

    throw new Error(
      'Supabase nije konfiguriran.'
    )

  }

  if (![7, 30, 90].includes(days)) {

    throw new Error(
      'Neispravno razdoblje statistike.'
    )

  }

  const { data, error } = await supabase.rpc(

    'get_my_statistics_analytics',

    {
      p_days: days,
    }

  )

  if (error) throw error

  return data
}
