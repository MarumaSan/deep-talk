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
  text: string;
  category: string;
  difficulty: number; // 1-5
  createdBy: "user" | "ai";
};

export type Round = {
  question: Question;
  answerOrder: string[]; // user ids
  answeredUsers: string[]; // user ids who finished
  roundNumber: number;
  reactions: string[]; // List of emojis for this round
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
  currentRound: Round | null;
  roundCount: number;
  status: "waiting" | "playing" | "finished";
};

export type MoodReaction = "😮" | "❤️" | "🤯" | "😢" | "🔥";
