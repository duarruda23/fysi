import { put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Formato inválido. Use JPG, PNG ou WebP." }, { status: 400 });
    }

    const MAX_MB = 5;
    if (file.size > MAX_MB * 1024 * 1024) {
      return NextResponse.json({ error: `Arquivo muito grande. Máximo ${MAX_MB}MB.` }, { status: 400 });
    }

    // Gera nome único para evitar colisões
    const ext = file.name.split(".").pop();
    const filename = `fysi-uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const blob = await put(filename, file, { access: "public" });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[Upload] Erro:", error);
    return NextResponse.json({ error: "Falha no upload. Tente novamente." }, { status: 500 });
  }
}
