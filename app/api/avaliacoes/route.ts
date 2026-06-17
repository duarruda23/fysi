import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/avaliacoes?peca_id=xxx — retorna avaliações aprovadas de uma peça
export async function GET(req: NextRequest) {
  const pecaId = req.nextUrl.searchParams.get("peca_id");
  if (!pecaId) {
    return NextResponse.json({ error: "peca_id obrigatório" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("avaliacoes")
    .select("*")
    .eq("peca_id", pecaId)
    .eq("aprovado", true)
    .order("criado_em", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const avaliacoes = (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id,
    pecaId: r.peca_id,
    autorNome: r.autor_nome,
    nota: r.nota,
    comentario: r.comentario,
    aprovado: r.aprovado,
    criadoEm: r.criado_em,
  }));

  return NextResponse.json(avaliacoes);
}

// POST /api/avaliacoes — cria nova avaliação (pendente de aprovação)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pecaId, autorNome, nota, comentario } = body;

  if (!pecaId || !autorNome || !nota) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
  }
  if (nota < 1 || nota > 5) {
    return NextResponse.json({ error: "Nota deve ser entre 1 e 5" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("avaliacoes")
    .insert({
      peca_id: pecaId,
      autor_nome: autorNome.trim(),
      nota: Number(nota),
      comentario: comentario?.trim() ?? "",
      aprovado: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
