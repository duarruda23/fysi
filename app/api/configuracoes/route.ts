import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ConfiguracoesLoja } from "@/lib/types";

export const dynamic = "force-dynamic";

// Colunas que o site público precisa (IDs de pixel/GA são públicos por natureza, vão no HTML do navegador).
const COLUNAS_PUBLICAS =
  "google_analytics_id, meta_pixel_id, google_ads_id, tiktok_pixel_id, minimo_pecas_atacado, valor_minimo_atacado";

async function getAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, isAdmin: !!user?.user_metadata?.is_admin };
}

export async function GET() {
  const { supabase, isAdmin } = await getAdmin();

  // O token da API do TikTok só é lido e devolvido para o admin logado.
  const { data, error } = await supabase
    .from("configuracoes_loja")
    .select(isAdmin ? `${COLUNAS_PUBLICAS}, tiktok_api_token` : COLUNAS_PUBLICAS)
    .eq("id", 1)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Não foi possível carregar as configurações." }, { status: 500 });
  }

  const row = data as unknown as Record<string, any>;
  const config: ConfiguracoesLoja = {
    googleAnalyticsId: row.google_analytics_id,
    metaPixelId: row.meta_pixel_id,
    googleAdsId: row.google_ads_id,
    tiktokPixelId: row.tiktok_pixel_id ?? "",
    tiktokApiToken: isAdmin ? (row.tiktok_api_token ?? "") : "",
    minimoPecasAtacado: row.minimo_pecas_atacado,
    valorMinimoAtacado: Number(row.valor_minimo_atacado),
  };

  return NextResponse.json(config, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PUT(request: Request) {
  const { supabase, isAdmin } = await getAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body: Partial<ConfiguracoesLoja> = await request.json();

  const updatePayload: Record<string, unknown> = {};
  if (body.googleAnalyticsId !== undefined) updatePayload.google_analytics_id = body.googleAnalyticsId;
  if (body.metaPixelId !== undefined) updatePayload.meta_pixel_id = body.metaPixelId;
  if (body.googleAdsId !== undefined) updatePayload.google_ads_id = body.googleAdsId;
  if (body.tiktokPixelId !== undefined) updatePayload.tiktok_pixel_id = body.tiktokPixelId;
  if (body.tiktokApiToken !== undefined) updatePayload.tiktok_api_token = body.tiktokApiToken;
  if (body.minimoPecasAtacado !== undefined) updatePayload.minimo_pecas_atacado = body.minimoPecasAtacado;
  if (body.valorMinimoAtacado !== undefined) updatePayload.valor_minimo_atacado = body.valorMinimoAtacado;

  const { error } = await supabase
    .from("configuracoes_loja")
    .update(updatePayload)
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: "Não foi possível salvar as configurações." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
