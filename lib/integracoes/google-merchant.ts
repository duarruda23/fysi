import { SignJWT, importPKCS8 } from "jose";

const ESCOPO_MERCHANT_API = "https://www.googleapis.com/auth/content";
const TOKEN_URI = "https://oauth2.googleapis.com/token";

export const GOOGLE_MERCHANT_ACCOUNT_ID = "5820482310";

interface ServiceAccountJSON {
  client_email: string;
  private_key: string;
  project_id: string;
}

function lerServiceAccount(): ServiceAccountJSON {
  const raw = process.env.GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error("GOOGLE_MERCHANT_SERVICE_ACCOUNT_JSON não configurada no servidor.");
  }
  return JSON.parse(raw) as ServiceAccountJSON;
}

/**
 * Gera um access_token novo pra Merchant API via fluxo de service account
 * (JWT assinado trocado por token no endpoint OAuth do Google). Válido por
 * 1h — diferente do Mercado Livre, não existe refresh_token aqui: cada
 * chamada gera um JWT novo, é barato e sem estado pra persistir.
 */
export async function getGoogleMerchantAccessToken(): Promise<string> {
  const sa = lerServiceAccount();
  const privateKey = await importPKCS8(sa.private_key, "RS256");

  const jwt = await new SignJWT({ scope: ESCOPO_MERCHANT_API })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(sa.client_email)
    .setSubject(sa.client_email)
    .setAudience(TOKEN_URI)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

  const tokenRes = await fetch(TOKEN_URI, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    throw new Error(
      `Falha ao autenticar service account do Google Merchant: ${tokenData.error} — ${tokenData.error_description ?? ""}`
    );
  }

  return tokenData.access_token as string;
}
