import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidMercadoLivreToken } from "@/lib/integracoes/mercado-livre";

export const dynamic = "force-dynamic";

// GET /api/integracoes/mercado-livre/status — checa (admin) se a integração
// está viva: renova o token se preciso e confirma com a própria API do ML.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.user_metadata?.is_admin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const token = await getValidMercadoLivreToken();

    const meRes = await fetch("https://api.mercadolibre.com/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const me = await meRes.json();

    if (!meRes.ok) {
      return NextResponse.json(
        { conectado: false, error: "Token válido, mas a API do ML recusou a chamada.", detalhe: me },
        { status: 502 }
      );
    }

    return NextResponse.json({
      conectado: true,
      userId: me.id,
      nickname: me.nickname,
      siteId: me.site_id,
      tipoConta: me.user_type,
    });
  } catch (err) {
    return NextResponse.json(
      { conectado: false, error: err instanceof Error ? err.message : "Erro desconhecido." },
      { status: 500 }
    );
  }
}
