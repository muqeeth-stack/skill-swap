import { NextResponse } from "next/server";
import { getGoogleConfig } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const config = getGoogleConfig();
  return NextResponse.json({
    googleConfigured: config.isConfigured,
    providers: config.isConfigured ? ["google"] : [],
    v: 1,
  });
}