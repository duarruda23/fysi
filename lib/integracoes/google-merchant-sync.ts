import { createClient } from "@supabase/supabase-js";
import { getGoogleMerchantAccessToken, GOOGLE_MERCHANT_ACCOUNT_ID } from "./google-merchant";

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const CONTENT_LANGUAGE = "pt";
const FEED_LABEL = "BR";

// Fonte de dados primária criada uma única vez (accounts/{id}/dataSources/{DATASOURCE_ID})
// via /api/integracoes/google-merchant/criar-fonte — necessária pra inserir produtos pela API.
export const GOOGLE_MERCHANT_DATASOURCE = process.env.GOOGLE_MERCHANT_DATASOURCE_NAME ?? "";

/** Cria a fonte de dados primária da conta (passo único de setup). */
export async function criarFontePrimariaGoogleMerchant(): Promise<{ name: string }> {
  const token = await getGoogleMerchantAccessToken();

  const res = await fetch(
    `https://merchantapi.googleapis.com/products/v1/accounts/${GOOGLE_MERCHANT_ACCOUNT_ID}/dataSources`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName: "Fysi — Catálogo (API)",
        primaryProductDataSource: { countries: ["BR"] },
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Falha ao criar fonte de dados: ${JSON.stringify(data)}`);
  }
  return data;
}

function offerId(referencia: string, cor: string, tamanho: string): string {
  return `${referencia}-${cor}-${tamanho}`.replace(/\s+/g, "");
}

/**
 * Publica (ou atualiza — o insert é um upsert por offerId) todas as
 * variações de uma peça no Google Merchant Center. Fire-and-forget por
 * natureza — chamado nos mesmos pontos do sync do Mercado Livre.
 */
export async function sincronizarPecaGoogleMerchant(pecaId: string): Promise<void> {
  try {
    if (!GOOGLE_MERCHANT_DATASOURCE) {
      console.error("[google-merchant-sync] GOOGLE_MERCHANT_DATASOURCE_NAME não configurada.");
      return;
    }

    const { data: pecaRow } = await supabaseService
      .from("pecas")
      .select("*")
      .eq("id", pecaId)
      .single();
    if (!pecaRow) return;

    const { data: variacoesRows } = await supabaseService
      .from("variacoes_peca")
      .select("*")
      .eq("peca_id", pecaId);
    if (!variacoesRows || variacoesRows.length === 0) return;

    const fotos = (pecaRow.fotos as string[]) ?? [];
    if (fotos.length === 0) return;

    const token = await getGoogleMerchantAccessToken();
    const link = `https://www.fysiatacado.com.br/produtos/${pecaId}`;
    const precoMicros = Math.round(Number(pecaRow.preco) * 1_000_000).toString();

    for (const v of variacoesRows) {
      const cor = v.cor as string;
      const tamanho = String(v.tamanho);
      const disponivel = (v.quantidade_estoque as number) > 0;

      const productInput = {
        offerId: offerId(pecaRow.referencia as string, cor, tamanho),
        contentLanguage: CONTENT_LANGUAGE,
        feedLabel: FEED_LABEL,
        productAttributes: {
          title: `${pecaRow.nome} - ${cor} ${tamanho}`,
          description: pecaRow.descricao || pecaRow.nome,
          link,
          imageLink: fotos[0],
          availability: disponivel ? "IN_STOCK" : "OUT_OF_STOCK",
          price: { amountMicros: precoMicros, currencyCode: "BRL" },
          condition: "NEW",
          itemGroupId: pecaId,
          color: cor,
          sizes: [tamanho],
          gender: "male",
          ageGroup: "adult",
          brand: "Fysi",
        },
      };

      const res = await fetch(
        `https://merchantapi.googleapis.com/products/v1/accounts/${GOOGLE_MERCHANT_ACCOUNT_ID}/productInputs:insert?dataSource=${encodeURIComponent(GOOGLE_MERCHANT_DATASOURCE)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productInput),
        }
      );

      if (!res.ok) {
        const detalhe = await res.json().catch(() => null);
        console.error(
          `[google-merchant-sync] Falha ao publicar ${productInput.offerId}:`,
          JSON.stringify(detalhe)
        );
      }
    }
  } catch (err) {
    console.error("[google-merchant-sync] Erro ao sincronizar peça:", err);
  }
}
