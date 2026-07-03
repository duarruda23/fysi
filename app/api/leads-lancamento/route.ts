import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { nome, telefone, email } = await req.json();

    if (!nome?.trim() || !telefone?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("leads_lancamento").insert({
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email.trim().toLowerCase(),
      origem: "lan-jul26-calca",
    });

    if (error) throw error;

    // Dispara webhook em background — não bloqueia a resposta ao usuário
    fetch("https://webhook.trafegodeloja.com.br/webhook/lancamento-jul26-calca", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim().toLowerCase(),
        origem: "lan-jul26-calca",
        criado_em: new Date().toISOString(),
      }),
    }).catch(() => {
      // falha silenciosa — lead já salvo no banco
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar. Tente novamente." }, { status: 500 });
  }
}
