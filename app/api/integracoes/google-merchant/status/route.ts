import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGoogleMerchantAccessToken, GOOGLE_MERCHANT_ACCOUNT_ID } from "@/lib/integracoes/google-merchant";

export const dynamic = "force-dynamic";

// GET /api/integracoes/google-merchant/status — checa (admin) se a
// credencial do service account autentica de verdade na Merchant API.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.user_metadata?.is_admin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const token = await getGoogleMerchantAccessToken();

    const res = await fetch(
      `https://merchantapi.googleapis.com/accounts/v1/accounts/${GOOGLE_MERCHANT_ACCOUNT_ID}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { conectado: false, error: "Token válido, mas a Merchant API recusou a chamada.", detalhe: data },
        { status: 502 }
      );
    }

    return NextResponse.json({ conectado: true, conta: data });
  } catch (err) {
    return NextResponse.json(
      { conectado: false, error: err instanceof Error ? err.message : "Erro desconhecido." },
      { status: 500 }
    );
  }
}
