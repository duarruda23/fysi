import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { nome, email, telefone, senha } = await request.json();

  if (!nome?.trim() || !email?.trim() || !senha?.trim()) {
    return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios." }, { status: 400 });
  }
  if (senha.length < 6) {
    return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
  }

  const supabase = await createClient();

  // Supabase Auth cria o usuário; o trigger handle_new_auth_user() insere na tabela clientes
  const { data, error } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password: senha,
    options: {
      data: { nome: nome.trim(), telefone: telefone?.trim() ?? "" },
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json({ error: "Erro ao criar conta." }, { status: 500 });
  }

  return NextResponse.json(
    {
      id: data.user.id,
      nome: nome.trim(),
      email: data.user.email,
      telefone: telefone?.trim() ?? "",
    },
    { status: 201 }
  );
}
