/* ============================================
   QUITANDAS FARM HOUSE - SUPABASE KEEP-ALIVE
   Script Node.js para manter o banco Supabase ativo
   ============================================ */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

async function pingSupabaseServer() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('⚠️ VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas no ambiente.');
    process.exit(0);
  }

  try {
    const start = Date.now();
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    const latency = Date.now() - start;
    if (response.ok) {
      console.log(`🟢 [SUCCESS] Supabase respondeu em ${latency}ms (Status ${response.status}). Projeto mantido ativo 24/7!`);
    } else {
      console.log(`⚠️ [WARNING] Supabase retornou status ${response.status}`);
    }
  } catch (error) {
    console.error('🔴 [ERROR] Falha ao enviar requisição para o Supabase:', error.message);
  }
}

pingSupabaseServer();
