import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "synapse_session";
const PKCE_COOKIE = "synapse_pkce";
const DEV_FALLBACK_SECRET = "synapselearn-local-dev-secret-not-for-production";

export function getGoogleConfig() {
  return {
    clientId: process.env.AUTH_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "",
    isConfigured: Boolean(
      (process.env.AUTH_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID) &&
        (process.env.AUTH_GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET)
    ),
  };
}

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function getSecret(): string {
  return process.env.AUTH_SECRET || DEV_FALLBACK_SECRET;
}

function b64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function fromB64url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function signToken(payload: Record<string, unknown>): string {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", getSecret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(fromB64url(body));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSessionCookie(user: {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}): string {
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? null,
    provider: "google",
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
  return signToken(payload);
}

export interface PkcePayload {
  v: string;
  next: string;
}

export function signPkceToken(payload: PkcePayload): string {
  return signToken({ ...payload, exp: Date.now() + 10 * 60 * 1000 });
}

export function verifyPkceToken(token: string): PkcePayload | null {
  const payload = verifyToken(token);
  if (!payload || typeof payload.v !== "string" || typeof payload.next !== "string") return null;
  return { v: payload.v, next: payload.next };
}

export const cookieNames = { SESSION_COOKIE, PKCE_COOKIE };