// Optional LLM adjudication of ambiguous ingredient→product matches, via Google
// Gemini (AI Studio free tier). This is the ONLY non-deterministic step and it
// is fully skippable: with no GEMINI_API_KEY the pipeline never calls it and the
// caller falls back to the top-scored candidate / manual review.

import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

import type { Candidate } from "./types";

// Primary model: cheap, stable, ample for pre-filtered candidate selection.
// Escalation model is opt-in (GEMINI_ESCALATE=1) for brand-nuance edge cases.
const MODEL = "gemini-3.1-flash-lite";
const ESCALATION_MODEL = "gemini-3.5-flash";

// Conservative spacing for the free tier; the resolution cache keeps real call
// volume tiny (only ambiguous, cache-missing ingredients ever reach here).
const INTERVAL_MS = 4_000;
let lastCall = 0;

const apiKey = process.env.GEMINI_API_KEY;
const escalate = process.env.GEMINI_ESCALATE === "1";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export function isLLMEnabled(): boolean {
  return ai !== null;
}

export interface AdjudicationInput {
  ingredient: string;
  quantity: number;
  unit: string;
  candidates: Candidate[];
}

export interface AdjudicationResult {
  choiceId: string | null;
  confidence: number;
  reason: string;
  needsReview: boolean;
}

// Zod is the source of truth for the parsed shape; the Gemini responseSchema
// below mirrors it (the SDK wants its own Type-based schema object).
const ResultSchema = z.object({
  choice_id: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
  needs_review: z.boolean(),
});

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    choice_id: {
      type: Type.STRING,
      nullable: true,
      description: "The `id` of the chosen candidate, or null if none fit.",
    },
    confidence: { type: Type.NUMBER, description: "0..1 confidence." },
    reason: { type: Type.STRING },
    needs_review: { type: Type.BOOLEAN },
  },
  required: ["choice_id", "confidence", "reason", "needs_review"],
} as const;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function buildPrompt(input: AdjudicationInput): string {
  const lines = input.candidates.map((c, i) => {
    const p = c.per100g;
    return (
      `${i + 1}. id=${c.id} [${c.source}] "${c.displayName}" — ` +
      `${p.calories}kcal, P${p.protein_g} C${p.carbs_g} F${p.fat_g} per 100g` +
      ` (match score ${c.score.toFixed(2)})`
    );
  });
  return [
    "You are matching a recipe ingredient to the correct food/product record.",
    "",
    `Ingredient line: "${input.quantity} ${input.unit} ${input.ingredient}".`,
    "",
    "Candidates:",
    ...lines,
    "",
    "Pick the candidate whose food/brand/variant best matches how this",
    "ingredient is used in a recipe. Prefer the specific branded product when the",
    "ingredient names a brand; prefer the plain whole food otherwise. If none are",
    "a credible match, return choice_id=null and needs_review=true. Set",
    "needs_review=true whenever confidence is below ~0.8.",
  ].join("\n");
}

/**
 * Ask Gemini to choose among candidates. Returns null when the LLM is disabled
 * (no key) or the call/parse fails — callers must handle null deterministically.
 */
export async function adjudicate(
  input: AdjudicationInput,
): Promise<AdjudicationResult | null> {
  if (!ai || input.candidates.length === 0) return null;

  const wait = lastCall + INTERVAL_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();

  try {
    const res = await ai.models.generateContent({
      model: escalate ? ESCALATION_MODEL : MODEL,
      contents: buildPrompt(input),
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0,
      },
    });
    const text = res.text;
    if (!text) return null;
    const parsed = ResultSchema.parse(JSON.parse(text));

    // Guard against a hallucinated id that isn't actually a candidate.
    const valid =
      parsed.choice_id === null ||
      input.candidates.some((c) => c.id === parsed.choice_id);

    return {
      choiceId: valid ? parsed.choice_id : null,
      confidence: parsed.confidence,
      reason: parsed.reason,
      needsReview: parsed.needs_review || !valid || parsed.confidence < 0.8,
    };
  } catch (err) {
    console.warn(`  LLM adjudication failed (${String(err)}); falling back.`);
    return null;
  }
}
