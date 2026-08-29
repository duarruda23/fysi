import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGoogleMerchantAccessToken, GOOGLE_MERCHANT_ACCOUNT_ID } from "@/lib/integracoes/google-merchant";

export const dynamic = "force-dynamic";

// POST /api/integracoes/google-merchant/registrar — vincula o projeto do
// Google Cloud à conta Merchant Center (registro único, exigido antes de
// qualquer outra chamada da Merchant API funcionar). body: { developerEmail }
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.user_metadata?.is_admin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const developerEmail = body.developerEmail as string | undefined;

  if (!developerEmail) {
    return NextResponse.json({ error: "developerEmail é obrigatório." }, { status: 400 });
  }

  try {
    const token = await getGoogleMerchantAccessToken();

    const res = await fetch(
      `https://merchantapi.googleapis.com/accounts/v1/accounts/${GOOGLE_MERCHANT_ACCOUNT_ID}/developerRegistration:registerGcp`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ developerEmail }),
      }
    );
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ ok: false, detalhe: data }, { status: 502 });
    }

    return NextResponse.json({ ok: true, registro: data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." },
      { status: 500 }
    );
  }
}
