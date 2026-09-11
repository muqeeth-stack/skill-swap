import { NextRequest, NextResponse } from "next/server";
import { aiDiscoverSkills, aiNormalizeCustomSkill, aiGenerateStudyPlan } from "@/lib/ai-assistant";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, query, name, description, hoursPerWeek } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Missing required 'action' parameter (discover, normalize, study-plan)" },
        { status: 400 }
      );
    }

    switch (action) {
      case "discover": {
        if (!query || typeof query !== "string") {
          return NextResponse.json(
            { error: "Query string is required for discover action" },
            { status: 400 }
          );
        }
        const result = aiDiscoverSkills(query);
        return NextResponse.json({ success: true, data: result });
      }

      case "normalize": {
        if (!name || typeof name !== "string") {
          return NextResponse.json(
            { error: "Skill name is required for normalize action" },
            { status: 400 }
          );
        }
        const normalized = aiNormalizeCustomSkill(name, description);
        return NextResponse.json({ success: true, data: normalized });
      }

      case "study-plan": {
        if (!query || typeof query !== "string") {
          return NextResponse.json(
            { error: "Topic/skill is required for study-plan action" },
            { status: 400 }
          );
        }
        const plan = aiGenerateStudyPlan(query, Number(hoursPerWeek) || 5);
        return NextResponse.json({ success: true, data: plan });
      }

      default:
        return NextResponse.json(
          { error: `Unsupported action: ${action}. Supported: discover, normalize, study-plan` },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error("AI API Error:", err);
    return NextResponse.json(
      { error: "Internal server error processing AI request", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
