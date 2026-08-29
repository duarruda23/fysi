import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publicarPecaNoMercadoLivre } from "@/lib/integracoes/mercado-livre-publicar";

export const dynamic = "force-dynamic";

// POST /api/integracoes/mercado-livre/publicar — publica uma peça como anúncio (admin)
// body: { pecaId: string }
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.user_metadata?.is_admin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const pecaId = body.pecaId as string | undefined;

  if (!pecaId) {
    return NextResponse.json({ error: "pecaId é obrigatório." }, { status: 400 });
  }

  const resultado = await publicarPecaNoMercadoLivre(pecaId);

  if (!resultado.ok) {
    return NextResponse.json(
      { error: resultado.erro, detalhe: resultado.detalhe },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, itemId: resultado.itemId });
}
