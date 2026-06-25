import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Banner } from "@/lib/types";

function mapRow(row: Record<string, unknown>): Banner {
  return {
    id: row.id as string,
    titulo: (row.titulo as string) ?? "",
    subtitulo: (row.subtitulo as string) ?? "",
    eyebrow: (row.eyebrow as string) ?? "",
    botaoTexto: (row.botao_texto as string) ?? "",
    botaoLink: (row.botao_link as string) ?? "/produtos",
    imagemUrl: (row.imagem_url as string) ?? "",
    ativo: (row.ativo as boolean) ?? true,
    ordem: (row.ordem as number) ?? 0,
    criadoEm: (row.criado_em as string) ?? new Date().toISOString(),
    watermarkTexto: (row.watermark_texto as string) ?? "",
    layoutPos: ((row.layout_pos as string) ?? "esquerda") as "esquerda" | "direita",
  };
}

// GET — lista todos os banners ordenados
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("ordem", { ascending: true })
    .order("criado_em", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(mapRow));
}

// POST — cria novo banner
export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  const { data: last } = await supabase
    .from("banners")
    .select("ordem")
    .order("ordem", { ascending: false })
    .limit(1)
    .single();
  const nextOrdem = last ? (last.ordem as number) + 1 : 0;

  const { data, error } = await supabase
    .from("banners")
    .insert({
      titulo: body.titulo ?? "",
      subtitulo: body.subtitulo ?? "",
      eyebrow: body.eyebrow ?? "",
      botao_texto: body.botaoTexto ?? "",
      botao_link: body.botaoLink ?? "/produtos",
      imagem_url: body.imagemUrl ?? "",
      ativo: body.ativo ?? true,
      ordem: nextOrdem,
      watermark_texto: body.watermarkTexto ?? "",
      layout_pos: body.layoutPos ?? "esquerda",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapRow(data));
}
