import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const REDIRECT_URI = "https://www.fysiatacado.com.br/api/integracoes/mercado-livre/callback";

// Rota consome um `code` de uso único — nunca deve ficar em cache.
export const dynamic = "force-dynamic";

// GET /api/integracoes/mercado-livre/callback — recebe o retorno do OAuth do
// Mercado Livre, troca o `code` por access_token/refresh_token e salva no banco.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      new URL(
        `/admin?integracao=mercado_livre&status=erro&motivo=${encodeURIComponent(errorParam)}`,
        request.url
      )
    );
  }

  if (!code) {
    return NextResponse.json({ error: "Código de autorização ausente." }, { status: 400 });
  }

  const clientId = process.env.MERCADO_LIVRE_CLIENT_ID;
  const clientSecret = process.env.MERCADO_LIVRE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("[mercado-livre/callback] MERCADO_LIVRE_CLIENT_ID/SECRET não configurados.");
    return NextResponse.json(
      { error: "Integração ainda não configurada no servidor (faltam as credenciais)." },
      { status: 500 }
    );
  }

  const tokenRes = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    console.error("[mercado-livre/callback] Erro ao trocar code por token:", tokenData);
    return NextResponse.json(
      { error: "Falha ao trocar código por token.", detalhe: tokenData },
      { status: 502 }
    );
  }

  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

  const { error: dbError } = await supabaseService
    .from("integracoes_marketplace")
    .upsert(
      {
        canal: "mercado_livre",
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type,
        expires_at: expiresAt,
        user_id_externo: String(tokenData.user_id),
        scope: tokenData.scope,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "canal" }
    );

  if (dbError) {
    console.error("[mercado-livre/callback] Token obtido, mas falhou ao salvar:", dbError);
    return NextResponse.json({ error: "Token obtido, mas falhou ao salvar." }, { status: 500 });
  }

  return NextResponse.redirect(
    new URL("/admin?integracao=mercado_livre&status=conectado", request.url)
  );
}
