
import { supabase } from '@/services/supabase'

export async function getMyProgress(sessionId = null) {
  if (!supabase) {
    throw new Error(
      'Veza sa Supabaseom nije konfigurirana.'
    )
  }

  const { data, error } = await supabase.rpc(
    'get_my_progress',
    {
      p_session_id: sessionId,
    }
  )

  if (error) throw error

  return data
}
