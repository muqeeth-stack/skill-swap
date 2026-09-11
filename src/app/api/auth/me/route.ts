import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, cookieNames } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieNames.SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ user: null });

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      avatar: payload.avatar ?? null,
      provider: "google",
    },
  });
}