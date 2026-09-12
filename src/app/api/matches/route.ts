import { NextRequest, NextResponse } from "next/server";
import { DEMO_USERS } from "@/lib/data";
import { findBestMatches, parseNaturalLanguageQuery, DEFAULT_MATCH_WEIGHTS } from "@/lib/matching";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || DEMO_USERS[0].id;
    const query = searchParams.get("q");

    const targetUser = DEMO_USERS.find((u) => u.id === userId) || DEMO_USERS[0];

    if (query) {
      const parsed = parseNaturalLanguageQuery(query);
      const matches = findBestMatches(targetUser, DEMO_USERS, DEFAULT_MATCH_WEIGHTS);
      
      // Filter or rank matches by parsed query criteria if present
      const filteredMatches = matches.filter((m) => {
        if (parsed.teachFilter && !m.targetUser.skillsTeach.some((s) => s.name.toLowerCase().includes(parsed.teachFilter!.toLowerCase()))) {
          return false;
        }
        if (parsed.categoryFilter && !m.targetUser.skillsTeach.some((s) => s.category === parsed.categoryFilter)) {
          return false;
        }
        return true;
      });

      return NextResponse.json({
        success: true,
        type: "natural_language",
        query,
        parsed,
        totalMatches: filteredMatches.length > 0 ? filteredMatches.length : matches.length,
        matches: filteredMatches.length > 0 ? filteredMatches : matches,
      });
    }

    const matches = findBestMatches(targetUser, DEMO_USERS, DEFAULT_MATCH_WEIGHTS);
    return NextResponse.json({
      success: true,
      type: "user_recommendation",
      user: { id: targetUser.id, name: targetUser.name },
      totalMatches: matches.length,
      matches,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to compute match compatibility", details: err instanceof Error ? err.message : undefined },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, user: customUser, pool: customPool, weights, query, teachSkill, learnSkill } = body;
    
    // Allow caller to supply dynamic user object or pool of registered users
    const candidatePool = Array.isArray(customPool) && customPool.length > 0 ? customPool : DEMO_USERS;
    const targetUser = customUser || candidatePool.find((u: { id: string }) => u.id === userId) || candidatePool[0] || DEMO_USERS[0];
    const matchWeights = weights || DEFAULT_MATCH_WEIGHTS;

    const matches = findBestMatches(targetUser, candidatePool, matchWeights);
    
    let filteredMatches = matches;
    if (query) {
      const parsed = parseNaturalLanguageQuery(query);
      filteredMatches = matches.filter((m) => {
        if (parsed.teachFilter && !m.targetUser.skillsTeach.some((s) => s.name.toLowerCase().includes(parsed.teachFilter!.toLowerCase()))) {
          return false;
        }
        if (parsed.categoryFilter && !m.targetUser.skillsTeach.some((s) => s.category === parsed.categoryFilter)) {
          return false;
        }
        return true;
      });
    }

    if (teachSkill) {
      filteredMatches = filteredMatches.filter((m) =>
        m.targetUser.skillsLearn.some((s) => s.name.toLowerCase().includes(teachSkill.toLowerCase()))
      );
    }
    if (learnSkill) {
      filteredMatches = filteredMatches.filter((m) =>
        m.targetUser.skillsTeach.some((s) => s.name.toLowerCase().includes(learnSkill.toLowerCase()))
      );
    }

    const finalMatches = filteredMatches.length > 0 ? filteredMatches : matches;

    return NextResponse.json({
      success: true,
      type: "match_query",
      totalMatches: finalMatches.length,
      matches: finalMatches,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to process match query", details: err instanceof Error ? err.message : undefined },
      { status: 500 }
    );
  }
}
