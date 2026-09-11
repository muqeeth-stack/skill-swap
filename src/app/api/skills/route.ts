import { NextRequest, NextResponse } from "next/server";
import { SKILL_CATALOG } from "@/lib/data";
import { SKILL_CATEGORIES_METADATA } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q")?.toLowerCase();

    let skills = SKILL_CATALOG;

    if (category && category !== "all") {
      skills = skills.filter((s) => s.category === category);
    }

    if (query) {
      skills = skills.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.subSkills.some((sub) => sub.toLowerCase().includes(query)) ||
          s.description.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      total: skills.length,
      categories: SKILL_CATEGORIES_METADATA,
      skills,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to retrieve skill taxonomy", details: err instanceof Error ? err.message : undefined },
      { status: 500 }
    );
  }
}
