import { Question } from "@/types";

export const defaultQuestions: Question[] = [
  // Life
  { text: "ช่วงเวลาไหนในชีวิตที่เปลี่ยนตัวคุณมากที่สุด?", category: "life", difficulty: 1, createdBy: "user" },
  { text: "ถ้าย้อนเวลากลับไปได้ คุณจะบอกอะไรกับตัวเองตอนอายุ 15?", category: "life", difficulty: 2, createdBy: "user" },
  { text: "อะไรคือสิ่งที่คุณยังไม่เคยทำ แต่อยากทำก่อนตาย?", category: "life", difficulty: 1, createdBy: "user" },
  { text: "คุณเคยรู้สึกหลงทางในชีวิตไหม? ตอนนั้นเป็นยังไง?", category: "life", difficulty: 3, createdBy: "user" },
  { text: "ความสำเร็จที่คุณภูมิใจที่สุด แต่ไม่เคยบอกใคร?", category: "life", difficulty: 2, createdBy: "user" },

  // Love / Relationships
  { text: "คุณเคยมีความรักที่แท้จริงไหม?", category: "love", difficulty: 1, createdBy: "user" },
  { text: "อะไรคือสิ่งที่คุณเรียนรู้จากความรักที่ผิดหวัง?", category: "love", difficulty: 3, createdBy: "user" },
  { text: "ความรักแบบไหนที่คุณกลัวที่สุด?", category: "love", difficulty: 4, createdBy: "user" },
  { text: "คุณเชื่อในเนื้อคู่ไหม? ทำไม?", category: "relationships", difficulty: 2, createdBy: "user" },
  { text: "ความสัมพันธ์ไหนที่เจ็บปวดที่สุดในชีวิตคุณ?", category: "relationships", difficulty: 4, createdBy: "user" },
  { text: "คุณเคยเสียใจที่ปล่อยใครบางคนไปไหม?", category: "relationships", difficulty: 3, createdBy: "user" },

  // Fear
  { text: "ความกลัวอะไรที่ควบคุมชีวิตคุณอยู่?", category: "fear", difficulty: 3, createdBy: "user" },
  { text: "คุณกลัวอะไรมากที่สุดเกี่ยวกับอนาคต?", category: "fear", difficulty: 2, createdBy: "user" },
  { text: "สิ่งที่คุณกลัวที่สุดแต่ไม่เคยบอกใคร?", category: "fear", difficulty: 5, createdBy: "user" },
  { text: "ถ้าไม่กลัวอะไรเลย คุณจะทำอะไรเป็นอย่างแรก?", category: "fear", difficulty: 1, createdBy: "user" },

  // Childhood
  { text: "ความทรงจำที่ชัดที่สุดจากวัยเด็กคืออะไร?", category: "childhood", difficulty: 1, createdBy: "user" },
  { text: "มีอะไรจากวัยเด็กที่ยังส่งผลกับคุณถึงทุกวันนี้?", category: "childhood", difficulty: 3, createdBy: "user" },
  { text: "ตอนเด็กคุณฝันอยากเป็นอะไร? แล้วทำไมถึงเปลี่ยนไป?", category: "childhood", difficulty: 2, createdBy: "user" },
  { text: "คุณรู้สึกว่าพ่อแม่เข้าใจคุณจริงๆ ไหม?", category: "childhood", difficulty: 4, createdBy: "user" },

  // Dreams
  { text: "ถ้าเงินไม่ใช่ปัญหา คุณจะใช้ชีวิตยังไง?", category: "dreams", difficulty: 1, createdBy: "user" },
  { text: "ความฝันอะไรที่คุณยอมแพ้ไปแล้ว?", category: "dreams", difficulty: 3, createdBy: "user" },
  { text: "คุณอยากให้คนจดจำคุณในฐานะอะไร?", category: "dreams", difficulty: 2, createdBy: "user" },
  { text: "ถ้ามีชีวิตอีกชาติ คุณอยากเกิดเป็นอะไร?", category: "dreams", difficulty: 1, createdBy: "user" },

  // Philosophy
  { text: "คุณเชื่อว่าคนเราเลือกชะตาชีวิตของตัวเองได้ไหม?", category: "philosophy", difficulty: 2, createdBy: "user" },
  { text: "ความตายทำให้ชีวิตมีค่ามากขึ้นหรือเปล่า?", category: "philosophy", difficulty: 4, createdBy: "user" },
  { text: "อะไรคือความจริงที่คนส่วนใหญ่ไม่กล้ายอมรับ?", category: "philosophy", difficulty: 3, createdBy: "user" },
  { text: "คุณคิดว่า 'ความสุขที่แท้จริง' คืออะไร?", category: "philosophy", difficulty: 2, createdBy: "user" },

  // Random Deep
  { text: "สิ่งที่คุณไม่เคยบอกใครเลย?", category: "random-deep", difficulty: 5, createdBy: "user" },
  { text: "ถ้าต้องเลือกระหว่างความจริงกับความสุข คุณเลือกอะไร?", category: "random-deep", difficulty: 3, createdBy: "user" },
  { text: "คุณเคยโกหกตัวเองเรื่องอะไร?", category: "random-deep", difficulty: 4, createdBy: "user" },
  { text: "ใครคือคนที่มีอิทธิพลต่อชีวิตคุณมากที่สุด? ทำไม?", category: "random-deep", difficulty: 2, createdBy: "user" },
  { text: "คุณรู้สึกว่าตัวเองเป็นคนดีไหม? จริงๆ แล้ว?", category: "random-deep", difficulty: 4, createdBy: "user" },
  { text: "ถ้าวันนี้เป็นวันสุดท้ายของชีวิต คุณจะทำอะไร?", category: "random-deep", difficulty: 3, createdBy: "user" },
];

export const categories = [
  { value: "relationships", label: "💑 Relationships" },
  { value: "life", label: "🌱 Life" },
  { value: "love", label: "❤️ Love" },
  { value: "fear", label: "😨 Fear" },
  { value: "childhood", label: "🧒 Childhood" },
  { value: "dreams", label: "✨ Dreams" },
  { value: "philosophy", label: "🧠 Philosophy" },
  { value: "random-deep", label: "🎲 Random Deep" },
  { value: "other", label: "📝 Other" },
];

export function getQuestionsByCategory(category: string): Question[] {
  if (category === "random-deep" || category === "other") {
    return defaultQuestions;
  }
  return defaultQuestions.filter((q) => q.category === category);
}

export function getQuestionsByDifficulty(questions: Question[], maxDifficulty: number): Question[] {
  return questions.filter((q) => q.difficulty <= maxDifficulty);
}

export function getDifficultyForRound(roundNumber: number): number {
  if (roundNumber <= 2) return 1;
  if (roundNumber <= 4) return 2;
  if (roundNumber <= 6) return 3;
  if (roundNumber <= 8) return 4;
  if (roundNumber <= 10) return 5;
  if (roundNumber <= 12) return 6;
  if (roundNumber <= 15) return 7;
  if (roundNumber <= 18) return 8;
  if (roundNumber <= 22) return 9;
  return 10;
}

export function getDifficultyLabel(difficulty: number): string {
  switch (difficulty) {
    case 1: return "Level 1: Casual";
    case 2: return "Level 2: Warm Up";
    case 3: return "Level 3: Ice Breaker";
    case 4: return "Level 4: Getting Deep";
    case 5: return "Level 5: Going Deeper";
    case 6: return "Level 6: Reflective";
    case 7: return "Level 7: Vulnerable";
    case 8: return "Level 8: Intimate";
    case 9: return "Level 9: Dangerous";
    case 10: return "Level 10: Soul Bare";
    default: return `Level ${difficulty}`;
  }
}

export function getDifficultyColor(difficulty: number): string {
  if (difficulty >= 10) return "text-fuchsia-400";
  if (difficulty >= 9) return "text-red-500";
  if (difficulty >= 7) return "text-orange-400";
  if (difficulty >= 5) return "text-yellow-400";
  if (difficulty >= 3) return "text-blue-400";
  return "text-green-400";
}
