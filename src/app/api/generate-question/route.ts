import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    const difficultyLabel =
      difficulty <= 2
        ? "casual, warm up, and light"
        : difficulty <= 4
          ? "ice breaker and getting personal"
          : difficulty <= 6
            ? "going deeper and reflective"
            : difficulty <= 8
              ? "vulnerable and intimate"
              : "dangerous, very deep, raw, and potentially uncomfortable";

    const prompt = `Generate a single deep conversation question in Thai language.

Category: ${category}
Depth Level: ${difficulty}/10 (${difficultyLabel})

Rules:
- The question should be ${difficultyLabel}
- It should encourage genuine, honest answers
- It should be open-ended (not yes/no)
- Write ONLY the question text in Thai, nothing else
- Do not include quotation marks
- Do not include numbering or bullets
- Always end the question with a question mark (?)`;

    const result = await model.generateContent(prompt);
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
