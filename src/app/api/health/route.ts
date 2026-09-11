import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    platform: "SynapseLearn",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptimeSeconds: Math.floor(process.uptime()),
    features: {
      aiAssistant: true,
      matchingEngine: true,
      skillTaxonomy: true,
      sportsModule: true,
      twoWayBarter: true,
    },
  });
}
