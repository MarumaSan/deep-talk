import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { category, difficulty } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const difficultyLabel =
      difficulty <= 1
        ? "casual and light"
        : difficulty <= 2
        ? "warm and personal"
        : difficulty <= 3
        ? "deep and thought-provoking"
        : difficulty <= 4
        ? "vulnerable and emotional"
        : "very deep, raw, and potentially uncomfortable";

    const prompt = `Generate a single deep conversation question in Thai language.

Category: ${category}
Depth Level: ${difficulty}/5 (${difficultyLabel})

Rules:
- The question should be ${difficultyLabel}
- It should encourage genuine, honest answers
- It should be open-ended (not yes/no)
- Write ONLY the question text in Thai, nothing else
- Do not include quotation marks
- Do not include numbering or bullets`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return NextResponse.json({ question: text });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
