import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, senha } = await request.json();

  if (!email || !senha) {
    return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password: senha,
  });

  if (error || !data.user) {
    return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  }

  // Bloquear acesso de admin por esta rota
  if (data.user.user_metadata?.is_admin) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Use o portal de administração." }, { status: 403 });
  }

  // Buscar dados completos do cliente na tabela clientes
  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nome, email, telefone")
    .eq("id", data.user.id)
    .maybeSingle();

  return NextResponse.json(
    cliente ?? {
      id: data.user.id,
      nome: data.user.user_metadata?.nome ?? data.user.email?.split("@")[0] ?? "",
      email: data.user.email,
      telefone: data.user.user_metadata?.telefone ?? "",
    }
  );
}
