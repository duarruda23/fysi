import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processarPedidoPagoML } from "@/lib/integracoes/mercado-livre-sync";

export const dynamic = "force-dynamic";

// POST /api/integracoes/mercado-livre/webhook/simular — roda a MESMA lógica
// do webhook real (criar pedido, descontar estoque, disparar webhook
// interno), mas com um pedido fabricado em vez de buscar da API do ML.
// Admin-only. Serve pra testar o fluxo sem precisar de uma venda de verdade
// (usuários de teste do ML só compram de anúncios de teste, não dos reais).
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.user_metadata?.is_admin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json();

  const resultado = await processarPedidoPagoML(body);
  return NextResponse.json(resultado);
}
