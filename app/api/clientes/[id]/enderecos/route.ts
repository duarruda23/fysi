import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getClienteFromCookie } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/clientes/[id]/enderecos — lista endereços do cliente
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getClienteFromCookie();
  if (!session || session.id !== id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("enderecos_cliente")
    .select("*")
    .eq("cliente_id", id)
    .order("principal", { ascending: false })
    .order("criado_em", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    data.map((e: any) => ({
      id: e.id,
      clienteId: e.cliente_id,
      apelido: e.apelido,
      cep: e.cep,
      rua: e.rua,
      numero: e.numero,
      complemento: e.complemento,
      bairro: e.bairro,
      cidade: e.cidade,
      estado: e.estado,
      principal: e.principal,
      criadoEm: e.criado_em,
    }))
  );
}

// POST /api/clientes/[id]/enderecos — adiciona endereço
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getClienteFromCookie();
  if (!session || session.id !== id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const body = await req.json();

  // Se for marcado como principal, desmarcar os demais
  if (body.principal) {
    await supabase
      .from("enderecos_cliente")
      .update({ principal: false })
      .eq("cliente_id", id);
  }

  const { data, error } = await supabase
    .from("enderecos_cliente")
    .insert({
      id: crypto.randomUUID(),
      cliente_id: id,
      apelido: body.apelido || "Casa",
      cep: body.cep || "",
      rua: body.rua || "",
      numero: body.numero || "",
      complemento: body.complemento || "",
      bairro: body.bairro || "",
      cidade: body.cidade || "",
      estado: body.estado || "",
      principal: body.principal ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
