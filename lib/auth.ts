import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fysi-jwt-secret-2026-change-in-production"
);

export interface ClienteJWT {
  id: string;
  nome: string;
  email: string;
  telefone: string;
}

export async function signToken(payload: ClienteJWT): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<ClienteJWT | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as ClienteJWT;
  } catch {
    return null;
  }
}

export async function getClienteFromCookie(): Promise<ClienteJWT | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("fysi_cliente_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function setClienteCookie(token: string) {
  return {
    name: "fysi_cliente_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: "/",
  };
}
