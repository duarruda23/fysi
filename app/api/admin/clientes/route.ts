import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/admin/clientes — lista todos os clientes com total gasto (recalculado dos pedidos)
export async function GET() {
  try {
    const { data: clientes, error } = await supabase
      .from("clientes")
      .select("id, nome, email, telefone, total_gasto, criado_em")
      .order("criado_em", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Para cada cliente, buscar os pedidos aprovados e calcular total real
    const clientesComTotal = await Promise.all(
      (clientes || []).map(async (c: any) => {
        const { data: pedidos } = await supabase
          .from("pedidos")
          .select("total, status")
          .eq("cliente_id", c.id)
          .eq("status", "aprovado");

        const totalReal = (pedidos || []).reduce((sum: number, p: any) => sum + Number(p.total), 0);

        return {
          id: c.id,
          nome: c.nome,
          email: c.email,
          telefone: c.telefone,
          totalGasto: totalReal,
          criadoEm: c.criado_em,
        };
      })
    );

    return NextResponse.json(clientesComTotal);
  } catch (err) {
    console.error("[admin/clientes]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
