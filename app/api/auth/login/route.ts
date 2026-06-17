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
    const { email, senha } = await req.json();

    if (!email?.trim() || !senha?.trim()) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
    }

    const { data: cliente, error } = await supabase
      .from("clientes")
      .select("id, nome, email, telefone, senha_hash")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (error || !cliente) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }

    const senhaOk = await bcrypt.compare(senha, cliente.senha_hash);
    if (!senhaOk) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
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
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
