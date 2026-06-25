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
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  // Verificar metadado is_admin
  if (!data.user.user_metadata?.is_admin) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  }

  return NextResponse.json({ ok: true, email: data.user.email });
}
