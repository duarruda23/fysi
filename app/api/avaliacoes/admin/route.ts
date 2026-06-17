import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/avaliacoes/admin — retorna TODAS as avaliações (admin)
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("avaliacoes")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id,
      pecaId: r.peca_id,
      autorNome: r.autor_nome,
      nota: r.nota,
      comentario: r.comentario,
      aprovado: r.aprovado,
      criadoEm: r.criado_em,
    }))
  );
}

// PATCH /api/avaliacoes/admin — aprovar ou reprovar (toggle)
export async function PATCH(req: NextRequest) {
  const { id, aprovado } = await req.json();
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase
    .from("avaliacoes")
    .update({ aprovado })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/avaliacoes/admin — excluir avaliação
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase.from("avaliacoes").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
