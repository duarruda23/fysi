import { createClient } from "@supabase/supabase-js";
import { getValidMercadoLivreToken } from "./mercado-livre";

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const CATEGORIA_CALCAS_ML = "MLB188065";

// Mapeamento das cores da Fysi pro vocabulário fechado do atributo COLOR do ML
// (categoria Calças). Cores sem equivalente exato usam o tom mais próximo.
const MAPA_COR_ML: Record<string, string> = {
  "bege": "Bege",
  "bege claro": "Bege",
  "marrom": "Marrom",
  "nude": "Nude",
  "preta": "Preto",
  "preto": "Preto",
  "caramelo": "Marrom-claro",
  "areia": "Palha",
};

function mapearCorML(corFysi: string): string {
  const chave = corFysi.trim().toLowerCase();
  return MAPA_COR_ML[chave] ?? corFysi;
}

interface ResultadoPublicacao {
  ok: boolean;
  itemId?: string;
  erro?: string;
  detalhe?: unknown;
}

export async function publicarPecaNoMercadoLivre(pecaId: string): Promise<ResultadoPublicacao> {
  const { data: pecaRow, error: pecaError } = await supabaseService
    .from("pecas")
    .select("*")
    .eq("id", pecaId)
    .single();

  if (pecaError || !pecaRow) {
    return { ok: false, erro: "Peça não encontrada." };
  }

  const { data: variacoesRows, error: varError } = await supabaseService
    .from("variacoes_peca")
    .select("*")
    .eq("peca_id", pecaId);

  if (varError) return { ok: false, erro: `Erro ao buscar variações: ${varError.message}` };
  if (!variacoesRows || variacoesRows.length === 0) {
    return { ok: false, erro: "Peça sem variações cadastradas — nada pra publicar." };
  }

  const materialPrincipal = pecaRow.material_principal as string | null;
  const tipoCalca = pecaRow.tipo_calca as string | null;
  if (!materialPrincipal || !tipoCalca) {
    return {
      ok: false,
      erro: "Faltam atributos obrigatórios (Material Principal e/ou Tipo de Calça) — preencha no admin antes de publicar.",
    };
  }

  const fotos = (pecaRow.fotos as string[]) ?? [];
  if (fotos.length === 0) {
    return { ok: false, erro: "Peça sem foto — o Mercado Livre exige pelo menos uma imagem." };
  }

  const token = await getValidMercadoLivreToken();

  const variations = variacoesRows.map((v) => ({
    attribute_combinations: [
      { id: "COLOR", value_name: mapearCorML(v.cor as string) },
      { id: "SIZE", value_name: String(v.tamanho) },
    ],
    price: Number(pecaRow.preco),
    available_quantity: v.quantidade_estoque as number,
    seller_custom_field: `${pecaRow.referencia}-${v.cor}-${v.tamanho}`,
  }));

  const payload = {
    title: (pecaRow.nome as string).slice(0, 60),
    category_id: CATEGORIA_CALCAS_ML,
    price: Number(pecaRow.preco),
    currency_id: "BRL",
    buying_mode: "buy_it_now",
    listing_type_id: "gold_special",
    condition: "new",
    pictures: fotos.map((url) => ({ source: url })),
    attributes: [
      { id: "BRAND", value_name: "Fysi" },
      { id: "MODEL", value_name: pecaRow.referencia },
      { id: "GENDER", value_name: "Masculino" },
      { id: "MAIN_MATERIAL", value_name: materialPrincipal },
      { id: "PANT_TYPE", value_name: tipoCalca },
    ],
    shipping: {
      mode: "me2",
      local_pick_up: false,
      free_shipping: false,
    },
    variations,
  };

  const itemRes = await fetch("https://api.mercadolibre.com/items", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const itemData = await itemRes.json();

  if (!itemRes.ok) {
    await supabaseService.from("publicacoes_marketplace").upsert(
      {
        peca_id: pecaId,
        canal: "mercado_livre",
        status: "erro",
        erro_detalhe: JSON.stringify(itemData),
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "peca_id,canal" }
    );
    return { ok: false, erro: "Mercado Livre recusou a publicação.", detalhe: itemData };
  }

  const itemId = itemData.id as string;

  // Descrição em texto plano — chamada separada, não bloqueia a publicação se falhar
  const descricaoTexto = [pecaRow.descricao, pecaRow.detalhe_texto].filter(Boolean).join("\n\n");
  if (descricaoTexto.trim()) {
    await fetch(`https://api.mercadolibre.com/items/${itemId}/description`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plain_text: descricaoTexto.slice(0, 50000) }),
    }).catch(() => {
      // Não falha a publicação por causa da descrição — item já está no ar.
    });
  }

  await supabaseService.from("publicacoes_marketplace").upsert(
    {
      peca_id: pecaId,
      canal: "mercado_livre",
      item_id_externo: itemId,
      status: "publicado",
      erro_detalhe: null,
      publicado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: "peca_id,canal" }
  );

  return { ok: true, itemId };
}
