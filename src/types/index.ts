export type User = {
  id: string;
  name: string;
  avatar?: string;
};

export type Category =
  | "relationships"
  | "life"
  | "philosophy"
  | "childhood"
  | "fear"
  | "dreams"
  | "love"
  | "random-deep"
  | "other";

export type Question = {
  id: string;
  text: string;
  category: string;
  difficulty: number; // 1-5
  createdBy: "user" | "ai";
};

export type Round = {
  id: string;
  question: Question;
  answerOrder: string[]; // user ids
  answeredUsers: string[]; // user ids who finished
  roundNumber: number;
  reactions: Record<string, string[]>; // questionId -> emoji[]
};

export interface Circle {
  id: string; // Auto-incremented ID from Supabase
  name: string;
  category: string;
  customCategory?: string;
  hostId: string;
  participants: User[];
  maxPeople: number;
  inviteCode: string; // 6-digit code
  createdAt: Date;
  rounds: Round[];
  currentRoundIndex: number;
  status: "waiting" | "playing" | "finished";
  timerSeconds: number; // Duration per speaker in seconds
};

export type MoodReaction = "😮" | "❤️" | "🤯" | "😢" | "🔥" | "🤣" | "😭" | "🤔" | "🥵";
