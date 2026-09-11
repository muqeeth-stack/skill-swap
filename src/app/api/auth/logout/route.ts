import { NextResponse } from "next/server";
import { cookieNames } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieNames.SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}