
import { supabase } from '@/services/supabase'

export async function getMyWallet(sessionId = null) {

  if (!supabase) {
    throw new Error(
      'Veza sa Supabaseom nije konfigurirana.'
    )
  }

  const { data, error } = await supabase.rpc(
    'get_my_wallet',
    {
      p_session_id: sessionId,
    }
  )

  if (error) throw error

  return data
}
