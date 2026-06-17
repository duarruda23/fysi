import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/banners — retorna o banner principal
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return NextResponse.json(
      {
        titulo: "Clean luxury para o seu dia a dia.",
        subtitulo: "Descubra peças de linho, cetim e alfaiataria esculpidas para durar.",
        eyebrow: "Coleção Essenciais 2026",
        botaoTexto: "Explorar Catálogo",
        botaoLink: "/produtos",
        imagemUrl: "/brand/perfil-5.png",
        ativo: true,
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    titulo: data.titulo,
    subtitulo: data.subtitulo,
    eyebrow: data.eyebrow,
    botaoTexto: data.botao_texto,
    botaoLink: data.botao_link,
    imagemUrl: data.imagem_url,
    ativo: data.ativo,
  });
}

// PUT /api/banners — atualiza o banner principal
export async function PUT(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { error } = await supabase
    .from("banners")
    .upsert({
      id: 1,
      titulo: body.titulo,
      subtitulo: body.subtitulo,
      eyebrow: body.eyebrow,
      botao_texto: body.botaoTexto,
      botao_link: body.botaoLink,
      imagem_url: body.imagemUrl,
      ativo: body.ativo,
      atualizado_em: new Date().toISOString(),
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
