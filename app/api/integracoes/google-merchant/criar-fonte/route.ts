import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { criarFontePrimariaGoogleMerchant } from "@/lib/integracoes/google-merchant-sync";

export const dynamic = "force-dynamic";

// POST /api/integracoes/google-merchant/criar-fonte — cria a fonte de dados
// primária da conta (setup único, admin). O `name` retornado deve ser salvo
// como env var GOOGLE_MERCHANT_DATASOURCE_NAME.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.user_metadata?.is_admin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const fonte = await criarFontePrimariaGoogleMerchant();
    return NextResponse.json({ ok: true, fonte });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." },
      { status: 500 }
    );
  }
}
