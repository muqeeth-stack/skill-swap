import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { getGoogleConfig, getBaseUrl, signPkceToken, cookieNames } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const config = getGoogleConfig();
  if (!config.isConfigured) {
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Google Sign-In Not Configured</title>
<meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;background:#0f1117;color:#e5e7eb;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
<div style="max-width:520px;padding:32px;background:#1a1d27;border-radius:16px">
<h1 style="font-size:20px;margin:0 0 12px">Google Sign-In is not configured</h1>
<p style="font-size:14px;line-height:1.6;color:#9ca3af">To enable real Google authentication, set these environment variables and redeploy:</p>
<pre style="font-size:12px;background:#0b0d12;padding:16px;border-radius:8px;overflow:auto;line-height:1.5">AUTH_GOOGLE_CLIENT_ID=...
AUTH_GOOGLE_CLIENT_SECRET=...
AUTH_SECRET=$(openssl rand -base64 32)</pre>
<p style="font-size:14px;line-height:1.6;color:#9ca3af">Add the redirect URI below to your Google OAuth Client:</p>
<pre style="font-size:12px;background:#0b0d12;padding:16px;border-radius:8px;overflow:auto">${getBaseUrl()}/api/auth/google/callback</pre>
<a href="/login" style="display:inline-block;margin-top:12px;padding:10px 18px;background:#4f46e5;color:#fff;border-radius:10px;text-decoration:none;font-size:13px">← Back to Sign In</a>
</div></body></html>`;
    return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  const baseUrl = getBaseUrl();
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  const next = req.nextUrl.searchParams.get("next") || "/dashboard";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const stateToken = signPkceToken({ v: verifier, next: safeNext });

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    code_challenge: challenge,
    code_challenge_method: "S256",
    state: stateToken,
    prompt: "select_account",
    access_type: "online",
  });

  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  res.cookies.set({
    name: cookieNames.PKCE_COOKIE,
    value: stateToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}