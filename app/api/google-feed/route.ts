import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { VariacaoPeca } from "@/lib/types";

// Escapa caracteres especiais para XML
function xmlEscape(str: string): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(request: Request) {
  const supabase = await createClient();

  // Lê o domínio da requisição para montar as URLs dos produtos
  const { origin } = new URL(request.url);
  const BASE_URL = origin;
  const BRAND = "Fysi";

  // Frete para todos os países configurados no Merchant Center
  // Preço 0 = frete calculado no checkout (aceito pelo Google)
  const SHIPPING = `
      <g:shipping>
        <g:country>BR</g:country>
        <g:service>Padrão</g:service>
        <g:price>0.00 BRL</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 USD</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>PT</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 EUR</g:price>
      </g:shipping>`;

  // Atributos obrigatórios para vestuário adulto (categoria 1604)
  const APPAREL_ATTRS = `
      <g:gender>unisex</g:gender>
      <g:age_group>adult</g:age_group>
      <g:shipping_weight>0.5 kg</g:shipping_weight>`;

  // Exclui listagens locais (sem loja física) para remover o aviso do Merchant Center
  const EXCLUDED_DESTINATIONS = `
      <g:excluded_destination>free_local_listings</g:excluded_destination>
      <g:excluded_destination>local_inventory_ads</g:excluded_destination>`;

  const { data: pecasRows, error: pecasError } = await supabase
    .from("pecas")
    .select("*")
    .eq("ativo", true)
    .order("criado_em", { ascending: false });

  if (pecasError) {
    return NextResponse.json({ error: pecasError.message }, { status: 500 });
  }

  const { data: variacoesRows } = await supabase
    .from("variacoes_peca")
    .select("*");

  const pecasIds = (pecasRows ?? []).map((p) => p.id);

  let items = "";

  for (const peca of pecasRows ?? []) {
    const variacoes: VariacaoPeca[] = (variacoesRows ?? [])
      .filter((v) => v.peca_id === peca.id)
      .map((v) => ({
        id: v.id,
        cor: v.cor,
        corHex: v.cor_hex ?? undefined,
        tamanho: v.tamanho,
        quantidadeEstoque: v.quantidade_estoque,
      }));

    const imageUrl = peca.fotos?.[0] ?? "";
    const additionalImages = (peca.fotos ?? [])
      .slice(1, 10)
      .map((url: string) => `<g:additional_image_link>${xmlEscape(url)}</g:additional_image_link>`)
      .join("\n        ");

    const totalEstoque = variacoes.reduce((s, v) => s + (v.quantidadeEstoque ?? 0), 0);
    const availability = totalEstoque > 0 ? "in_stock" : "out_of_stock";

    const priceFormatted = `${Number(peca.preco).toFixed(2)} BRL`;
    const productUrl = `${BASE_URL}/produtos/${peca.id}`;
    const description = xmlEscape(peca.descricao || peca.nome);

    // Se não tiver variações, exporta como produto simples
    if (variacoes.length === 0) {
      items += `
    <item>
      <g:id>${xmlEscape(peca.id)}</g:id>
      <g:title>${xmlEscape(peca.nome)}</g:title>
      <g:description>${description}</g:description>
      <g:link>${xmlEscape(productUrl)}</g:link>
      <g:image_link>${xmlEscape(imageUrl)}</g:image_link>
      ${additionalImages}
      <g:availability>${availability}</g:availability>
      <g:price>${priceFormatted}</g:price>
      <g:brand>${BRAND}</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${xmlEscape(peca.categoria)}</g:product_type>
      <g:google_product_category>1604</g:google_product_category>${APPAREL_ATTRS}${SHIPPING}${EXCLUDED_DESTINATIONS}
    </item>`;
      continue;
    }

    // Com variações: item_group_id para agrupar no Google
    for (const v of variacoes) {
      const varId = `${peca.id}-${v.id}`;
      const varAvailability = (v.quantidadeEstoque ?? 0) > 0 ? "in_stock" : "out_of_stock";
      const varTitle = `${xmlEscape(peca.nome)} - ${xmlEscape(v.cor)} ${xmlEscape(v.tamanho)}`;

      items += `
    <item>
      <g:id>${xmlEscape(varId)}</g:id>
      <g:item_group_id>${xmlEscape(peca.id)}</g:item_group_id>
      <g:title>${varTitle}</g:title>
      <g:description>${description}</g:description>
      <g:link>${xmlEscape(productUrl)}</g:link>
      <g:image_link>${xmlEscape(imageUrl)}</g:image_link>
      ${additionalImages}
      <g:availability>${varAvailability}</g:availability>
      <g:price>${priceFormatted}</g:price>
      <g:brand>${BRAND}</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${xmlEscape(peca.categoria)}</g:product_type>
      <g:google_product_category>1604</g:google_product_category>
      <g:color>${xmlEscape(v.cor)}</g:color>
      <g:size>${xmlEscape(v.tamanho)}</g:size>${APPAREL_ATTRS}${SHIPPING}${EXCLUDED_DESTINATIONS}
    </item>`;
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Fysi — Catálogo de Produtos</title>
    <link>${BASE_URL}</link>
    <description>Feed de produtos Fysi para Google Merchant Center</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Cache de 1 hora no CDN, revalida em background
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
