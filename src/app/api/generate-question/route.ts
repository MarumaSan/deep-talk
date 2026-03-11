import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 30; // Allow longer execution time on Vercel

// Initialize globally to reuse across requests (Serverless optimization)
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;

export async function POST(req: NextRequest) {
  try {
    const { category, difficulty } = await req.json();

    if (!model) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set or invalid" },
        { status: 500 }
      );
    }

    // const difficultyLabel =
    //   difficulty <= 2
    //     ? "casual, warm up, and light"
    //     : difficulty <= 4
    //       ? "ice breaker and getting personal"
    //       : difficulty <= 6
    //         ? "going deeper and reflective"
    //         : difficulty <= 8
    //           ? "vulnerable and intimate"
    //           : "dangerous, very deep, raw, and potentially uncomfortable";

    const getDifficultyTone = (level: number) => {
      switch (level) {
        case 1: return "very casual, safe, and light warm-up";
        case 2: return "casual and friendly icebreaker";
        case 3: return "personal but still comfortable";
        case 4: return "getting personal and reflective";
        case 5: return "moderately deep and introspective";
        case 6: return "deep personal reflection";
        case 7: return "vulnerable and emotionally honest";
        case 8: return "very vulnerable and intimate";
        case 9: return "raw emotional and uncomfortable truth";
        case 10: return "extremely deep, confronting, and psychologically intense";
        default: return "deep personal reflection";
      }
    };

    const difficultyLabel = getDifficultyTone(difficulty);

    const prompt = `Generate a single deep conversation question in Thai language.

Category: ${category}
Difficulty Level: ${difficulty}/10 
Tone: ${difficultyLabel}

Rules:
- The question should be ${difficultyLabel}
- It should encourage genuine, honest answers
- It should be open-ended (not yes/no)
- Write ONLY the question text in Thai, nothing else
- The question should be concise and not too long
- Do not include quotation marks
- Do not include numbering or bullets
- The question should be answerable in conversation.
- Always end the question with a question mark (?)

Depth guideline:

1 = extremely light and safe
2 = friendly icebreaker
3 = slightly personal
4 = reflective but comfortable
5 = moderately deep
6 = deep introspection
7 = vulnerable emotional sharing
8 = intimate and revealing
9 = uncomfortable truth
10 = confronting, raw, and psychologically deep`;

    // Implement logic to bail out if Gemini takes longer than 30 seconds
    function generateWithTimeout() {
      return Promise.race([
        model!.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("AI generation timed out (30s)")), 30000)
        ) as Promise<never>
      ]);
    }

    const result = await generateWithTimeout();
    let text = result.response.text().trim();

    // Ensure it ends with ?
    if (text && !text.endsWith("?")) {
      text += "?";
    }

    return NextResponse.json({ question: text });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
