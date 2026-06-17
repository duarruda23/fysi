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

  const { error } = await supabase
    .from("banners")
    .update({
      titulo: body.titulo,
      subtitulo: body.subtitulo,
      eyebrow: body.eyebrow,
      botao_texto: body.botaoTexto,
      botao_link: body.botaoLink,
      imagem_url: body.imagemUrl,
      ativo: body.ativo,
      ordem: body.ordem,
    })
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
