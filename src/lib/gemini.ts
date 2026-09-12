const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function extractJson(text: string): unknown {
  let clean = text.trim();
  // Strip markdown code fence markers if present
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  try {
    return JSON.parse(clean);
  } catch {
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(clean.slice(start, end + 1));
      } catch {
        // Attempt fixing simple trailing commas if any
        try {
          const sanitized = clean.slice(start, end + 1).replace(/,\s*([}\]])/g, "$1");
          return JSON.parse(sanitized);
        } catch {
          return null;
        }
      }
    }
    return null;
  }
}

export async function callGeminiJson(systemInstruction: string, userPrompt: string): Promise<unknown | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.4, maxOutputTokens: 1600 },
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Gemini API error:", res.status, errText.slice(0, 300));
      return null;
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return extractJson(text);
  } catch (err) {
    console.error("Gemini request failed:", err);
    return null;
  }
}