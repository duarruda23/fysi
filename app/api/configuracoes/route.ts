import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ConfiguracoesLoja } from "@/lib/types";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("configuracoes_loja")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const config: ConfiguracoesLoja = {
    googleAnalyticsId: data.google_analytics_id,
    metaPixelId: data.meta_pixel_id,
    googleAdsId: data.google_ads_id,
    minimoPecasAtacado: data.minimo_pecas_atacado,
    valorMinimoAtacado: Number(data.valor_minimo_atacado),
  };

  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const body: Partial<ConfiguracoesLoja> = await request.json();

  const updatePayload: Record<string, unknown> = {};
  if (body.googleAnalyticsId !== undefined) updatePayload.google_analytics_id = body.googleAnalyticsId;
  if (body.metaPixelId !== undefined) updatePayload.meta_pixel_id = body.metaPixelId;
  if (body.googleAdsId !== undefined) updatePayload.google_ads_id = body.googleAdsId;
  if (body.minimoPecasAtacado !== undefined) updatePayload.minimo_pecas_atacado = body.minimoPecasAtacado;
  if (body.valorMinimoAtacado !== undefined) updatePayload.valor_minimo_atacado = body.valorMinimoAtacado;

  const { error } = await supabase
    .from("configuracoes_loja")
    .update(updatePayload)
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
