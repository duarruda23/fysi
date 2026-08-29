import { createClient } from "@supabase/supabase-js";

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Margem de segurança: renova antes de expirar de verdade, evitando corrida
// entre "token válido" e "token expira no meio da chamada".
const MARGEM_RENOVACAO_MS = 5 * 60 * 1000;

interface IntegracaoRow {
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
}

/**
 * Retorna um access_token válido do Mercado Livre, renovando via refresh_token
 * automaticamente quando estiver perto de expirar. Lança erro se a integração
 * nunca foi conectada (sem linha salva) ou não tiver refresh_token.
 */
export async function getValidMercadoLivreToken(): Promise<string> {
  const { data, error } = await supabaseService
    .from("integracoes_marketplace")
    .select("access_token, refresh_token, expires_at")
    .eq("canal", "mercado_livre")
    .maybeSingle<IntegracaoRow>();

  if (error) throw new Error(`Erro ao ler integração do Mercado Livre: ${error.message}`);
  if (!data) throw new Error("Mercado Livre ainda não foi conectado (sem token salvo).");

  const expiraEm = data.expires_at ? new Date(data.expires_at).getTime() : 0;
  const aindaValido = Date.now() < expiraEm - MARGEM_RENOVACAO_MS;

  if (aindaValido) {
    return data.access_token;
  }

  if (!data.refresh_token) {
    throw new Error(
      "Token do Mercado Livre expirado e sem refresh_token salvo — é preciso reautorizar manualmente."
    );
  }

  const clientId = process.env.MERCADO_LIVRE_CLIENT_ID;
  const clientSecret = process.env.MERCADO_LIVRE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("MERCADO_LIVRE_CLIENT_ID/SECRET não configurados no servidor.");
  }

  const tokenRes = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: data.refresh_token,
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    throw new Error(
      `Falha ao renovar token do Mercado Livre: ${tokenData.error ?? tokenRes.status} — ${tokenData.error_description ?? ""}`
    );
  }

  const novoExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

  // O ML rotaciona o refresh_token a cada renovação — sempre salvar o novo,
  // mantendo o antigo só como fallback se por algum motivo não vier um novo.
  const { error: dbError } = await supabaseService
    .from("integracoes_marketplace")
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? data.refresh_token,
      expires_at: novoExpiresAt,
      atualizado_em: new Date().toISOString(),
    })
    .eq("canal", "mercado_livre");

  if (dbError) throw new Error(`Token renovado, mas falhou ao salvar: ${dbError.message}`);

  return tokenData.access_token;
}
