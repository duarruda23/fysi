import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGoogleMerchantAccessToken, GOOGLE_MERCHANT_ACCOUNT_ID } from "@/lib/integracoes/google-merchant";

export const dynamic = "force-dynamic";

// GET /api/integracoes/google-merchant/produto?offerId=FYS-077-Bege-38 —
// consulta um produto direto na Merchant API (diagnóstico/admin).
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.user_metadata?.is_admin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const offerId = request.nextUrl.searchParams.get("offerId");
  if (!offerId) {
    return NextResponse.json({ error: "offerId é obrigatório." }, { status: 400 });
  }

  const productName = `pt~BR~${offerId}`;
  const token = await getGoogleMerchantAccessToken();

  const res = await fetch(
    `https://merchantapi.googleapis.com/products/v1/accounts/${GOOGLE_MERCHANT_ACCOUNT_ID}/products/${productName}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const texto = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(texto);
  } catch {
    data = texto;
  }

  return NextResponse.json(data, { status: res.status });
}
