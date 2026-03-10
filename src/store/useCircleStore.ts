"use client";

import { create } from "zustand";
import { Circle, User, Round, Question, MoodReaction } from "@/types";
import { v4 as uuidv4 } from "uuid";
import {
  getQuestionsByCategory,
  getDifficultyForRound,
  defaultQuestions,
} from "@/data/questions";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface CircleStore {
  circles: Record<string, Circle>;
  currentUser: User | null;
  currentCircleId: string | null;
  usedQuestionIds: string[];

  setCurrentUser: (user: User) => void;
  createCircle: (name: string, category: string, customCategory: string, maxPeople: number) => Circle;
  joinCircle: (inviteCode: string, user: User) => Circle | null;
  getCircle: (id: string) => Circle | null;
  getCircleByCode: (code: string) => Circle | null;
  setCurrentCircle: (id: string) => void;
  startGame: (circleId: string) => void;
  startNewRound: (circleId: string, question: Question) => void;
  finishAnswer: (circleId: string, userId: string) => void;
  addReaction: (circleId: string, roundIndex: number, emoji: MoodReaction) => void;
  skipUser: (circleId: string, userId: string) => void;
  removeParticipant: (circleId: string, userId: string) => void;
  getRandomQuestion: (circleId: string) => Question | null;
  endGame: (circleId: string) => void;
}

export const useCircleStore = create<CircleStore>((set, get) => ({
  circles: {},
  currentUser: null,
  currentCircleId: null,
  usedQuestionIds: [],

  setCurrentUser: (user) => set({ currentUser: user }),

  createCircle: (name, category, customCategory, maxPeople) => {
    const state = get();
    const circle: Circle = {
      id: uuidv4(),
      name,
      category,
      customCategory: category === "other" ? customCategory : undefined,
      hostId: state.currentUser?.id || "",
      participants: state.currentUser ? [state.currentUser] : [],
      maxPeople,
      inviteCode: generateInviteCode(),
      createdAt: new Date(),
      rounds: [],
      currentRoundIndex: -1,
      status: "waiting",
    };
    set((s) => ({
      circles: { ...s.circles, [circle.id]: circle },
      currentCircleId: circle.id,
    }));
    return circle;
  },

  joinCircle: (inviteCode, user) => {
    const state = get();
    const circle = Object.values(state.circles).find(
      (c) => c.inviteCode === inviteCode.toUpperCase()
    );
    if (!circle) return null;
    if (circle.participants.length >= circle.maxPeople) return null;
    if (circle.participants.find((p) => p.id === user.id)) {
      set({ currentCircleId: circle.id, currentUser: user });
      return circle;
    }

    const updated = {
      ...circle,
      participants: [...circle.participants, user],
    };
    set((s) => ({
      circles: { ...s.circles, [circle.id]: updated },
      currentCircleId: circle.id,
      currentUser: user,
    }));
    return updated;
  },

  getCircle: (id) => get().circles[id] || null,

  getCircleByCode: (code) => {
    return (
      Object.values(get().circles).find(
        (c) => c.inviteCode === code.toUpperCase()
      ) || null
    );
  },

  setCurrentCircle: (id) => set({ currentCircleId: id }),

  startGame: (circleId) => {
    const circle = get().circles[circleId];
    if (!circle) return;

    const question = get().getRandomQuestion(circleId);
    if (!question) return;

    const answerOrder = shuffleArray(circle.participants.map((p) => p.id));
    const round: Round = {
      id: uuidv4(),
      question,
      answerOrder,
      answeredUsers: [],
      roundNumber: 1,
      reactions: {},
    };

    set((s) => ({
      circles: {
        ...s.circles,
        [circleId]: {
          ...circle,
          status: "playing",
          rounds: [round],
          currentRoundIndex: 0,
        },
      },
      usedQuestionIds: [...s.usedQuestionIds, question.id],
    }));
  },

  startNewRound: (circleId, question) => {
    const circle = get().circles[circleId];
    if (!circle) return;

    const answerOrder = shuffleArray(circle.participants.map((p) => p.id));
    const roundNumber = circle.rounds.length + 1;
    const round: Round = {
      id: uuidv4(),
      question,
      answerOrder,
      answeredUsers: [],
      roundNumber,
      reactions: {},
    };

    set((s) => ({
      circles: {
        ...s.circles,
        [circleId]: {
          ...circle,
          rounds: [...circle.rounds, round],
          currentRoundIndex: circle.rounds.length,
        },
      },
      usedQuestionIds: [...s.usedQuestionIds, question.id],
    }));
  },

  finishAnswer: (circleId, userId) => {
    const circle = get().circles[circleId];
    if (!circle) return;
    const round = circle.rounds[circle.currentRoundIndex];
    if (!round) return;
    if (round.answeredUsers.includes(userId)) return;

    const updatedRound = {
      ...round,
      answeredUsers: [...round.answeredUsers, userId],
    };
    const updatedRounds = [...circle.rounds];
    updatedRounds[circle.currentRoundIndex] = updatedRound;

    set((s) => ({
      circles: {
        ...s.circles,
        [circleId]: { ...circle, rounds: updatedRounds },
      },
    }));
  },

  addReaction: (circleId, roundIndex, emoji) => {
    const circle = get().circles[circleId];
    if (!circle) return;
    const round = circle.rounds[roundIndex];
    if (!round) return;

    const qId = round.question.id;
    const existing = round.reactions[qId] || [];
    const updatedRound = {
      ...round,
      reactions: { ...round.reactions, [qId]: [...existing, emoji] },
    };
    const updatedRounds = [...circle.rounds];
    updatedRounds[roundIndex] = updatedRound;

    set((s) => ({
      circles: {
        ...s.circles,
        [circleId]: { ...circle, rounds: updatedRounds },
      },
    }));
  },

  skipUser: (circleId, userId) => {
    get().finishAnswer(circleId, userId);
  },

  removeParticipant: (circleId, userId) => {
    const circle = get().circles[circleId];
    if (!circle) return;

    const updatedParticipants = circle.participants.filter(
      (p) => p.id !== userId
    );
    const updatedRounds = circle.rounds.map((round) => ({
      ...round,
      answerOrder: round.answerOrder.filter((id) => id !== userId),
    }));

    set((s) => ({
      circles: {
        ...s.circles,
        [circleId]: {
          ...circle,
          participants: updatedParticipants,
          rounds: updatedRounds,
        },
      },
    }));
  },

  getRandomQuestion: (circleId) => {
    const circle = get().circles[circleId];
    if (!circle) return null;
    const usedIds = get().usedQuestionIds;
    const roundNum = circle.rounds.length + 1;
    const maxDiff = getDifficultyForRound(roundNum);

    let pool = getQuestionsByCategory(circle.category).filter(
      (q) => !usedIds.includes(q.id) && q.difficulty <= maxDiff
    );

    if (pool.length === 0) {
      pool = defaultQuestions.filter(
        (q) => !usedIds.includes(q.id) && q.difficulty <= maxDiff
      );
    }
    if (pool.length === 0) {
      pool = defaultQuestions.filter((q) => !usedIds.includes(q.id));
    }
    if (pool.length === 0) {
      set({ usedQuestionIds: [] });
      pool = defaultQuestions;
    }

    return pool[Math.floor(Math.random() * pool.length)];
  },

  endGame: (circleId) => {
    const circle = get().circles[circleId];
    if (!circle) return;
    set((s) => ({
      circles: {
        ...s.circles,
        [circleId]: { ...circle, status: "finished" },
      },
    }));
  },
}));
