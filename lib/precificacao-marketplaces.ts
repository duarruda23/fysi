/**
 * Estimativas de líquido recebido por canal de venda, pra apoiar decisão de
 * preço no cadastro de peça. Não substitui o valor real mostrado pelo painel
 * de cada marketplace — os números aqui são aproximações.
 */

// Confirmado via painel real do Mercado Livre em 08/09/2026 (R$10,49 de
// comissão sobre R$74,90 de preço, categoria Calças, anúncio Clássico).
// Ver "02 - Áreas/Fysi (Marca de Roupas)/mercado-livre-margem-preco-2026-09-08.md".
export const COMISSAO_MERCADO_LIVRE = 0.14005;

/**
 * Custo de frete grátis que o vendedor banca no Mercado Envios, por faixa de
 * peso. Só a faixa 301-500g tem dado real confirmado (peças de ~380g custaram
 * R$13,85-14,45); as demais faixas são extrapolação aproximada — confirmar no
 * painel real do Mercado Livre antes de publicar peça fora dessa faixa.
 */
export function estimarCustoFreteGratisML(pesoGramas: number): number {
  if (pesoGramas <= 300) return 12;
  if (pesoGramas <= 500) return 14.15; // faixa com dado real confirmado
  if (pesoGramas <= 1000) return 18;
  if (pesoGramas <= 2000) return 24;
  return 32;
}

export function estimarLiquidoMercadoLivre(preco: number, pesoGramas: number): number {
  const comissao = preco * COMISSAO_MERCADO_LIVRE;
  const frete = estimarCustoFreteGratisML(pesoGramas);
  return preco - comissao - frete;
}
