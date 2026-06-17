import { NextResponse } from "next/server";
import { getClienteFromCookie } from "@/lib/auth";

export async function GET() {
  const cliente = await getClienteFromCookie();
  if (!cliente) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  return NextResponse.json(cliente);
}
