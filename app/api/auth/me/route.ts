import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Service role para sincronizar clientes que faltam
const supabaseService = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Não expor sessão de admin nesta rota
  if (user.user_metadata?.is_admin) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let { data: cliente } = await supabase
    .from("clientes")
    .select("id, nome, email, telefone")
    .eq("id", user.id)
    .maybeSingle();

  // Se o cliente não existe na tabela (trigger pode ter falhado), garante upsert
  if (!cliente) {
    const fallback = {
      id: user.id,
      nome: user.user_metadata?.nome ?? user.email?.split("@")[0] ?? "",
      email: user.email ?? "",
      telefone: user.user_metadata?.telefone ?? "",
      senha_hash: "",
      total_gasto: 0,
    };
    await supabaseService.from("clientes").upsert(fallback, { onConflict: "id" });
    cliente = { id: fallback.id, nome: fallback.nome, email: fallback.email, telefone: fallback.telefone };
  }

  return NextResponse.json(cliente);
}
