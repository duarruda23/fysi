import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware mínimo: apenas propaga cookies do Supabase sem chamar a API
 * de auth a cada request (o app não usa Supabase Auth para login de cliente/admin).
 */
export function middleware(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    /*
     * Ignora arquivos estáticos, imagens e rotas internas do Next.js.
     * Aplica apenas a rotas de página e API.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
