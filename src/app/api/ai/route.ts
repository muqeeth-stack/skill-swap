import { NextRequest, NextResponse } from "next/server";
import { aiDiscoverSkills, aiNormalizeCustomSkill, aiGenerateStudyPlan } from "@/lib/ai-assistant";
import { callGeminiJson, isGeminiConfigured } from "@/lib/gemini";
import { DEMO_USERS } from "@/lib/data";
import { SkillCategory } from "@/types";

const VALID_CATEGORIES: SkillCategory[] = [
  "technology",
  "creative",
  "business",
  "academics",
  "languages",
  "sports",
  "life_skills",
  "hobbies",
];

type AiEngine = "gemini" | "local";

// Simple in-memory rate limit to discourage API abuse (per IP, sliding window).
// Adequate for a demo deployment; swap for a durable store (Upstash/Vercel KV) for multi-instance use.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimitExceeded(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, 1000) : undefined;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string").slice(0, 6);
}

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (rateLimitExceeded(clientIp)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please slow down and try again shortly." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

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
          return NextResponse.json({ error: "Query string is required for discover action" }, { status: 400 });
        }

        if (isGeminiConfigured()) {
          const gemini = await callGeminiJson(
            "You are SynapseLearn's AI skill-discovery assistant. Respond ONLY with valid JSON matching this schema: {\"primarySkills\": string[3], \"relatedSkills\": string[2], \"explanation\": string, \"followUpQuestion\": string, \"suggestedMentors\": {\"name\": string, \"skill\": string}[3]}. Suggest concrete, real marketable skills tailored to the learner's phrasing, goals and context.",
            `Learner said: "${query}". Recommend skills to learn and skills to teach that create a 2-way exchange opportunity.`
          );
          if (gemini && typeof gemini === "object") {
            const g = gemini as Record<string, unknown>;
            const primarySkills = asStringArray(g.primarySkills);
            const suggestedMentorsRaw = Array.isArray(g.suggestedMentors) ? g.suggestedMentors : [];
            const suggestedMentors = suggestedMentorsRaw
              .map((m) => {
                const mm = m as Record<string, unknown>;
                const skill = asString(mm.skill);
                const name = asString(mm.name);
                if (!skill) return null;
                const user =
                  DEMO_USERS.find(
                    (u) =>
                      u.skillsTeach.some((s) => s.name.toLowerCase() === skill.toLowerCase()) ||
                      u.name.toLowerCase() === (name || "").toLowerCase()
                  ) || DEMO_USERS.find((u) => u.skillsTeach.some((s) => skill.toLowerCase().includes(s.name.toLowerCase())));
                return user
                  ? { id: user.id, name: user.name, avatar: user.avatar, skill: user.skillsTeach[0].name }
                  : null;
              })
              .filter(Boolean)
              .slice(0, 3) as { id: string; name: string; avatar: string; skill: string }[];

            if (primarySkills.length >= 1) {
              return NextResponse.json({
                success: true,
                engine: "gemini",
                data: {
                  primarySkills,
                  relatedSkills: asStringArray(g.relatedSkills),
                  explanation: asString(g.explanation) || "Tailored skill suggestions from SynapseLearn AI.",
                  followUpQuestion: asString(g.followUpQuestion) || "What is your current experience level?",
                  suggestedMentors,
                },
              });
            }
          }
        }

        const result = aiDiscoverSkills(query);
        return NextResponse.json({ success: true, engine: "local", data: result });
      }

      case "normalize": {
        if (!name || typeof name !== "string") {
          return NextResponse.json({ error: "Skill name is required for normalize action" }, { status: 400 });
        }

        if (isGeminiConfigured()) {
          const gemini = await callGeminiJson(
            `You categorize a skill for our catalog. Respond ONLY with JSON matching: {"name": string, "category": one of ${VALID_CATEGORIES.join(",")}, "subSkills": string[3], "description": string}. Do not invent sub-skills unrelated to the skill.`,
            `Skill: "${name}". ${description ? `Context: "${description}".` : ""} Categorize it.`
          );
          if (gemini && typeof gemini === "object") {
            const g = gemini as Record<string, unknown>;
            const validCategory = VALID_CATEGORIES.find((c) => c === asString(g.category)) as SkillCategory | undefined;
            const normalizedName = asString(g.name) || name.trim();
            const subSkills = asStringArray(g.subSkills);
            if (subSkills.length >= 1) {
              return NextResponse.json({
                success: true,
                engine: "gemini",
                data: {
                  id: `custom-${Date.now()}`,
                  name: normalizedName,
                  category: validCategory || "life_skills",
                  subSkills,
                  description: asString(g.description) || `Custom user-defined skill categorized under ${validCategory || "life_skills"}.`,
                  isPopular: false,
                  icon: "sparkles",
                },
              });
            }
          }
        }

        const normalized = aiNormalizeCustomSkill(name, description);
        return NextResponse.json({ success: true, engine: "local", data: normalized });
      }

      case "study-plan": {
        if (!query || typeof query !== "string") {
          return NextResponse.json({ error: "Topic/skill is required for study-plan action" }, { status: 400 });
        }
        const hours = Number(hoursPerWeek) || 5;

        if (isGeminiConfigured()) {
          const gemini = await callGeminiJson(
            `You are SynapseLearn's study-plan coach. Respond ONLY with JSON: {"title": string, "weeks": [{"week": number, "focus": string, "tasks": string[3]}] for 4 weeks}. Tasks must be concrete weekly actions achievable in ~${Math.round(hours / 4)} hours/week.`,
            `Create a 4-week accelerated study plan to learn "${query}" at ${hours} hours per week.`
          );
          if (gemini && typeof gemini === "object") {
            const g = gemini as Record<string, unknown>;
            const weeks = Array.isArray(g.weeks)
              ? g.weeks
                  .map((w) => {
                    const ww = w as Record<string, unknown>;
                    const weekNum = Number(ww.week);
                    const focus = asString(ww.focus);
                    const tasks = asStringArray(ww.tasks);
                    if (!focus || tasks.length === 0) return null;
                    return { week: Number.isFinite(weekNum) ? weekNum : 0, focus, tasks: tasks.slice(0, 3) };
                  })
                  .filter(Boolean)
                  .slice(0, 6)
              : [];
            if (weeks.length >= 1) {
              return NextResponse.json({
                success: true,
                engine: "gemini",
                data: {
                  title: asString(g.title) || `SynapseLearn Accelerated Study Plan: ${query}`,
                  weeks,
                },
              });
            }
          }
        }

        const plan = aiGenerateStudyPlan(query, hours);
        return NextResponse.json({ success: true, engine: "local", data: plan });
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
      { error: "Internal server error processing AI request" },
      { status: 500 }
    );
  }
}

export type { AiEngine };