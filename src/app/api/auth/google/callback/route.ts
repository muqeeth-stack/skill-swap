import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getGoogleConfig, getBaseUrl, createSessionCookie, verifyPkceToken, cookieNames } from "@/lib/auth";

export const runtime = "nodejs";

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
}

export async function GET(req: NextRequest) {
  const config = getGoogleConfig();
  const error = req.nextUrl.searchParams.get("error");
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get(cookieNames.PKCE_COOKIE)?.value;

  const failRedirect = (reason: string) =>
    NextResponse.redirect(`${getBaseUrl()}/login?error=${encodeURIComponent(reason)}`);

  if (error || !code || !state || !storedState) {
    return failRedirect(error || "oauth_cancelled");
  }

  const pkce = verifyPkceToken(storedState);
  if (!pkce || pkce.v.length < 32 || state !== storedState) {
    return failRedirect("state_mismatch");
  }

  const tokenUrl = "https://oauth2.googleapis.com/token";
  let tokenRes: Response;
  try {
    tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: `${getBaseUrl()}/api/auth/google/callback`,
        grant_type: "authorization_code",
        code_verifier: pkce.v,
      }),
    });
  } catch {
    return failRedirect("token_exchange_failed");
  }
  if (!tokenRes.ok) {
    const text = await tokenRes.text().catch(() => "");
    console.error("Google token exchange failed:", tokenRes.status, text.slice(0, 500));
    return failRedirect("token_exchange_failed");
  }
  const tokenData = (await tokenRes.json()) as { access_token: string };

  let userInfo: GoogleUserInfo;
  try {
    const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!infoRes.ok) return failRedirect("userinfo_failed");
    userInfo = (await infoRes.json()) as GoogleUserInfo;
  } catch {
    return failRedirect("userinfo_failed");
  }

  if (!userInfo?.sub || !userInfo?.email) {
    return failRedirect("userinfo_invalid");
  }

  const sessionCookie = createSessionCookie({
    id: `google-${userInfo.sub}`,
    name: userInfo.name || userInfo.email.split("@")[0],
    email: userInfo.email,
    avatar: userInfo.picture || null,
  });

  const baseUrl = getBaseUrl();
  const res = NextResponse.redirect(`${baseUrl}${pkce.next}`);
  res.cookies.set({
    name: cookieNames.SESSION_COOKIE,
    value: sessionCookie,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  res.cookies.set(cookieNames.PKCE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}