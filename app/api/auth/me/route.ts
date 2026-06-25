import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nome, email, telefone")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json(
    cliente ?? {
      id: user.id,
      nome: user.user_metadata?.nome ?? user.email?.split("@")[0] ?? "",
      email: user.email,
      telefone: user.user_metadata?.telefone ?? "",
    }
  );
}
