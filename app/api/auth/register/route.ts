import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Cliente com anon key — para o signUp
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

// Cliente com service role — para confirmar email e inserir em clientes
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  .replace("https://", "")
  .split(".")[0];

function buildSessionCookie(session: any): string {
  const cookieName = `sb-${projectRef}-auth-token`;
  const sessionJson = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user,
  });
  const maxAge = session.expires_in ?? 3600;
  const isSecure = process.env.NODE_ENV === "production";
  return `${cookieName}=${encodeURIComponent(sessionJson)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isSecure ? "; Secure" : ""}`;
}

export async function POST(request: Request) {
  const { nome, email, telefone, senha } = await request.json();

  if (!nome?.trim() || !email?.trim() || !senha?.trim()) {
    return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios." }, { status: 400 });
  }
  if (senha.length < 6) {
    return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
  }

  const nomeTrimmed = nome.trim();
  const emailNorm = email.toLowerCase().trim();
  const telefoneTrimmed = telefone?.trim() ?? "";

  // 1. Criar usuário no Auth
  const { data, error } = await supabaseAnon.auth.signUp({
    email: emailNorm,
    password: senha,
    options: {
      data: { nome: nomeTrimmed, telefone: telefoneTrimmed },
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

  // 2. Confirmar email automaticamente via Admin API (service role)
  // Isso permite que o usuário faça login imediatamente sem confirmar email
  await supabaseService.auth.admin.updateUserById(data.user.id, {
    email_confirm: true,
  });

  // 3. Garantir que o cliente existe na tabela clientes
  await supabaseService
    .from("clientes")
    .upsert(
      {
        id: data.user.id,
        nome: nomeTrimmed,
        email: emailNorm,
        telefone: telefoneTrimmed,
        senha_hash: "",
        total_gasto: 0,
      },
      { onConflict: "id" }
    );

  // 4. Fazer login imediato para gerar sessão após confirmação
  const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
    email: emailNorm,
    password: senha,
  });

  const body = {
    id: data.user.id,
    nome: nomeTrimmed,
    email: emailNorm,
    telefone: telefoneTrimmed,
  };

  const response = NextResponse.json(body, { status: 201 });

  // 5. Gravar o cookie de sessão para o cliente já ficar logado
  if (signInData?.session && !signInError) {
    response.headers.set("Set-Cookie", buildSessionCookie(signInData.session));
  }

  return response;
}
