import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

// Service role para confirmar email de usuários que precisam
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  .replace("https://", "")
  .split(".")[0];

export async function POST(request: NextRequest) {
  const { email, senha } = await request.json();

  if (!email || !senha) {
    return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
  }

  const emailNorm = email.toLowerCase().trim();

  // Tentativa inicial de login
  let { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email: emailNorm,
    password: senha,
  });

  // Se falhou por email não confirmado, confirma e tenta novamente
  if (error?.message?.toLowerCase().includes("email not confirmed")) {
    const { data: userData } = await supabaseService.auth.admin.getUserByEmail(emailNorm);
    if (userData?.user) {
      await supabaseService.auth.admin.updateUserById(userData.user.id, { email_confirm: true });
      const retry = await supabaseAdmin.auth.signInWithPassword({ email: emailNorm, password: senha });
      data = retry.data;
      error = retry.error;
    }
  }

  if (error || !data.user || !data.session) {
    return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  }

  // Bloquear acesso de admin por esta rota
  if (data.user.user_metadata?.is_admin) {
    return NextResponse.json({ error: "Use o portal de administração." }, { status: 403 });
  }

  // Buscar dados completos do cliente na tabela clientes
  const { data: cliente } = await supabaseAdmin
    .from("clientes")
    .select("id, nome, email, telefone")
    .eq("id", data.user.id)
    .maybeSingle();

  const body = cliente ?? {
    id: data.user.id,
    nome: data.user.user_metadata?.nome ?? data.user.email?.split("@")[0] ?? "",
    email: data.user.email,
    telefone: data.user.user_metadata?.telefone ?? "",
  };

  // Gravar cookies de sessão do Supabase no formato esperado pelo @supabase/ssr
  const cookieName = `sb-${projectRef}-auth-token`;
  const sessionJson = JSON.stringify({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    expires_in: data.session.expires_in,
    token_type: data.session.token_type,
    user: data.session.user,
  });

  const response = NextResponse.json(body);
  const isSecure = process.env.NODE_ENV === "production";
  const maxAge = data.session.expires_in ?? 3600;

  response.headers.set(
    "Set-Cookie",
    `${cookieName}=${encodeURIComponent(sessionJson)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isSecure ? "; Secure" : ""}`
  );

  return response;
}
