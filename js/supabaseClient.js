import { createClient } from '@supabase/supabase-js';

// As chaves devem vir das variáveis de ambiente gerenciadas pelo Vite (.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '');
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ── Heartbeat / Keep-Alive para evitar que o Supabase fique inativo (pausado após 7 dias) ──

export async function pingSupabase() {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase não configurado (.env ausente)' };
  }

  try {
    const startTime = performance.now();
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    const latency = Math.round(performance.now() - startTime);

    if (response.ok || response.status === 200) {
      localStorage.setItem('qfh_last_supabase_ping', new Date().toISOString());
      return { success: true, status: response.status, latency, timestamp: new Date().toISOString() };
    }
    return { success: false, status: response.status, message: 'Resposta não esperada' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Auto-ping silencioso se o último ping foi há mais de 24 horas
export function autoPingSupabaseIfOlderThan24h() {
  if (!isSupabaseConfigured()) return;

  const lastPing = localStorage.getItem('qfh_last_supabase_ping');
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  if (!lastPing || (now - new Date(lastPing).getTime() > dayMs)) {
    pingSupabase();
  }
}
