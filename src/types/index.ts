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

export type Circle = {
  id: string;
  name: string;
  category: string;
  customCategory?: string;
  hostId: string;
  participants: User[];
  maxPeople: number;
  inviteCode: string;
  createdAt: Date;
  rounds: Round[];
  currentRoundIndex: number;
  status: "waiting" | "playing" | "finished";
};

export type MoodReaction = "😮" | "❤️" | "🤯" | "😢" | "🔥";
