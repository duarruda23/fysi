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

    // Envia webhook aguardando a resposta com timeout de 8s
    // Em serverless o processo encerra junto com o return — sem await o webhook nunca chega
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      await fetch("https://webhook.trafegodeloja.com.br/webhook/lancamento-jul26-calca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          nome: nome.trim(),
          telefone: telefone.trim(),
          email: email.trim().toLowerCase(),
          origem: "lan-jul26-calca",
          criado_em: new Date().toISOString(),
        }),
      });
      clearTimeout(timeoutId);
    } catch {
      // falha silenciosa — lead já salvo no banco, webhook pode ser reprocessado pelo n8n
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar. Tente novamente." }, { status: 500 });
  }
}
