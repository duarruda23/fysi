import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { signToken, setClienteCookie } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { nome, email, telefone, senha } = await req.json();

    if (!nome?.trim() || !email?.trim() || !senha?.trim()) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios." }, { status: 400 });
    }

    if (senha.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
    }

    // Verificar se email já existe
    const { data: existing } = await supabase
      .from("clientes")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const { data: cliente, error } = await supabase
      .from("clientes")
      .insert({
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        telefone: telefone?.trim() || "",
        senha_hash: senhaHash,
      })
      .select("id, nome, email, telefone")
      .single();

    if (error || !cliente) {
      return NextResponse.json({ error: "Erro ao criar conta." }, { status: 500 });
    }

    const token = await signToken({
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
    });

    const res = NextResponse.json({
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
    });

    res.cookies.set(setClienteCookie(token));
    return res;
  } catch (err) {
    console.error("[auth/register]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
