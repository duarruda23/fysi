import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PUT — atualiza banner
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await req.json();

  // Monta payload apenas com campos presentes (evita sobrescrever com undefined/null)
  const payload: Record<string, unknown> = {};
  if (body.titulo !== undefined)        payload.titulo = body.titulo;
  if (body.subtitulo !== undefined)     payload.subtitulo = body.subtitulo;
  if (body.eyebrow !== undefined)       payload.eyebrow = body.eyebrow;
  if (body.botaoTexto !== undefined)    payload.botao_texto = body.botaoTexto;
  if (body.botaoLink !== undefined)     payload.botao_link = body.botaoLink;
  if (body.imagemUrl !== undefined)     payload.imagem_url = body.imagemUrl;
  if (body.ativo !== undefined)         payload.ativo = body.ativo;
  if (body.ordem !== undefined)         payload.ordem = body.ordem;
  if (body.watermarkTexto !== undefined) payload.watermark_texto = body.watermarkTexto;
  if (body.layoutPos !== undefined)     payload.layout_pos = body.layoutPos;

  const { error } = await supabase
    .from("banners")
    .update(payload)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE — remove banner
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
