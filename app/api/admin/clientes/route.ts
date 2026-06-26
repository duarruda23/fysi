import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Busca clientes com colunas novas
    const { data: clientes, error } = await supabase
      .from("clientes")
      .select("id, nome, email, telefone, total_gasto, criado_em, carrinho_abandonado, ultimo_acesso")
      .order("criado_em", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Busca todos os pedidos de uma vez (mais eficiente que N+1)
    const { data: pedidos } = await supabase
      .from("pedidos")
      .select("cliente_id, total, status, criado_em");

    const pedidosPorCliente: Record<string, typeof pedidos> = {};
    for (const p of pedidos || []) {
      if (!pedidosPorCliente[p.cliente_id]) pedidosPorCliente[p.cliente_id] = [];
      pedidosPorCliente[p.cliente_id]!.push(p);
    }

    const clientesEnriquecidos = (clientes || []).map((c: any) => {
      const todosPedidos = pedidosPorCliente[c.id] || [];
      const pedidosAprovados = todosPedidos.filter((p: any) => p.status === "aprovado");
      const totalReal = pedidosAprovados.reduce((sum: number, p: any) => sum + Number(p.total), 0);
      const ultimoPedido = todosPedidos.sort((a: any, b: any) =>
        new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
      )[0];

      const carrinho: any[] = Array.isArray(c.carrinho_abandonado) ? c.carrinho_abandonado : [];

      return {
        id: c.id,
        nome: c.nome,
        email: c.email,
        telefone: c.telefone,
        totalGasto: totalReal,
        totalPedidos: todosPedidos.length,
        pedidosAprovados: pedidosAprovados.length,
        ultimoPedidoEm: ultimoPedido?.criado_em ?? null,
        carrinhoAbandonado: carrinho,
        temCarrinhoAbandonado: carrinho.length > 0,
        ultimoAcesso: c.ultimo_acesso,
        criadoEm: c.criado_em,
      };
    });

    return NextResponse.json(clientesEnriquecidos);
  } catch (err) {
    console.error("[admin/clientes]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
