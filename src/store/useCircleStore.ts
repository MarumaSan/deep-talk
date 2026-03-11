"use client";

import { create } from "zustand";
import { Circle, User, Round, Question, MoodReaction } from "@/types";
import { supabase } from "@/lib/supabase";
import {
  getQuestionsByCategory,
  getDifficultyForRound,
  defaultQuestions,
} from "@/data/questions";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomValues = new Uint32Array(6);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(randomValues);
  } else {
    // Fallback for SSR
    for (let i = 0; i < 6; i++) {
      randomValues[i] = Math.floor(Math.random() * chars.length);
    }
  }
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(randomValues[i] % chars.length);
  }
  return code;
}

// Helper for Bangkok Time (+07:00)
const getBangkokISOString = (date = new Date()) => {
  return date.toLocaleString("sv-SE", { timeZone: "Asia/Bangkok" }).replace(" ", "T") + "+07:00";
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Local storage for user memory (so they remember who they are)
const USER_STORAGE_KEY = "deep-talk-user";

function loadUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(user: User) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch { }
}

interface CircleStore {
  // We only keep the CURRENT circle in memory now, loaded from DB
  currentCircle: Circle | null;
  currentUser: User | null;
  usedQuestionIds: string[];
  isSyncing: boolean;

  setCurrentUser: (user: User) => void;
  createCircle: (
    name: string,
    category: string,
    maxPeople: number,
    customCategory?: string
  ) => Promise<Circle | null>;
  joinCircle: (inviteCode: string, user: User) => Promise<Circle | null>;
  loadCircle: (id: string) => Promise<Circle | null>;
  subscribeToCircle: (id: string) => void;
  unsubscribeFromCircle: () => void;

  // Game Actions (these now update DB which triggers subscription)
  startGame: () => Promise<void>;
  startNewRound: (question: Question) => Promise<void>;
  finishAnswer: (userId: string) => Promise<void>;
  addReaction: (emoji: MoodReaction) => Promise<void>;
  skipUser: (userId: string) => Promise<void>;
  removeParticipant: (userId: string) => Promise<void>;
  getRandomQuestion: () => Question | null;
  endGame: () => Promise<void>;
}

// Helper to update the DB
async function updateCircleInDB(circle: Circle) {
  await supabase
    .from("rooms")
    .update({ state_data: circle, updated_at: getBangkokISOString() })
    .eq("invite_code", circle.id);
}

export const useCircleStore = create<CircleStore>((set, get) => {
  let subscription: ReturnType<typeof supabase.channel> | null = null;

  return {
    currentCircle: null,
    currentUser: loadUser(),
    usedQuestionIds: [],
    isSyncing: false,

    setCurrentUser: (user) => {
      saveUser(user);
      set({ currentUser: user });
    },

    createCircle: async (
      name,
      category,
      maxPeople,
      customCategory
    ) => {
      const state = get();
      if (!state.currentUser) throw new Error("No user");

      // Auto-cleanup: delete rooms older than 10 minutes
      try {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        await supabase.from("rooms").delete().lt("updated_at", getBangkokISOString(tenMinutesAgo));
      } catch (err) {
        console.error("Failed to cleanup old rooms:", err);
      }

      // 1. Insert minimal row to get the sequential ID from Supabase
      const inviteCode = generateInviteCode();
      const { data, error } = await supabase.from("rooms").insert({
        invite_code: inviteCode,
        state_data: {}
      }).select().single();

      if (error || !data) {
        console.error("Error creating room in Supabase:", error);
        throw new Error("Failed to create room in database");
      }

      const roomId = inviteCode;

      // 2. Set user ID to "1" for the host
      const hostUser = { ...state.currentUser, id: "1" };
      saveUser(hostUser);
      set({ currentUser: hostUser });

      // 3. Create full circle object
      const circle: Circle = {
        id: roomId,
        name,
        category,
        customCategory: category === "other" ? customCategory : undefined,
        hostId: hostUser.id,
        participants: [hostUser],
        maxPeople,
        inviteCode,
        createdAt: getBangkokISOString() as unknown as Date,
        currentRound: null,
        roundCount: 0,
        status: "waiting",
      };

      // 4. Update the row with the actual state_data
      await updateCircleInDB(circle);

      set({ currentCircle: circle });
      get().subscribeToCircle(circle.id);
      return circle;
    },

    joinCircle: async (inviteCode, user) => {
      // 1. Find room by code
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("invite_code", inviteCode.toUpperCase())
        .single();

      if (error || !data) {
        console.error("Error finding room to join:", error);
        return null;
      }

      const circle = data.state_data as Circle;

      if (circle.participants.length >= circle.maxPeople) return null;

      // 2. Add user if not already in, assigning sequential ID
      if (!circle.participants.find((p) => p.id === user.id)) {
        const newJoinedUser = { ...user, id: String(circle.participants.length + 1) };
        circle.participants.push(newJoinedUser);
        await updateCircleInDB(circle);

        saveUser(newJoinedUser);
        set({ currentUser: newJoinedUser, currentCircle: circle });
      } else {
        saveUser(user);
        set({ currentUser: user, currentCircle: circle });
      }

      get().subscribeToCircle(circle.id);
      return circle;
    },

    loadCircle: async (id) => {
      const { data, error } = await supabase
        .from("rooms")
        .select("state_data")
        .eq("invite_code", id)
        .single();

      if (error || !data) return null;

      const circle = data.state_data as Circle;
      set({ currentCircle: circle });


      // Setup realtime if not already setup
      get().subscribeToCircle(id);
      return circle;
    },

    subscribeToCircle: (id) => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }

      subscription = supabase
        .channel(`room:${id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "rooms",
            filter: `invite_code=eq.${id}`,
          },
          (payload) => {
            const updatedCircle = payload.new.state_data as Circle;
            set({ currentCircle: updatedCircle });
          }
        )
        .subscribe();
    },

    unsubscribeFromCircle: () => {
      if (subscription) {
        supabase.removeChannel(subscription);
        subscription = null;
      }
      set({ currentCircle: null });
    },

    startGame: async () => {
      const circle = get().currentCircle;
      if (!circle) return;

      const updatedCircle = {
        ...circle,
        status: "playing" as const,
      };

      set({ currentCircle: updatedCircle });
      await updateCircleInDB(updatedCircle);
    },

    startNewRound: async (question) => {
      const circle = get().currentCircle;
      if (!circle) return;

      const previousRound = circle.currentRound;
      const previousFirstId = previousRound ? previousRound.answerOrder[0] : null;

      const answerOrder = shuffleArray(circle.participants.map((p) => p.id));

      // Subsequent rounds: MUST NOT be the same as previous round's first person
      if (answerOrder.length > 1 && answerOrder[0] === previousFirstId) {
        const first = answerOrder.shift();
        answerOrder.push(first!);
      }
      const roundNumber = circle.roundCount + 1;
      const round: Round = {
        id: `r-${roundNumber}`,
        question,
        answerOrder,
        answeredUsers: [],
        roundNumber,
        reactions: {},
      };

      const updatedCircle = {
        ...circle,
        currentRound: round,
        roundCount: circle.roundCount + 1,
      };

      set((s) => ({
        currentCircle: updatedCircle,
        usedQuestionIds: [...s.usedQuestionIds, question.id],
      }));

      await updateCircleInDB(updatedCircle);
    },

    finishAnswer: async (userId) => {
      const circle = get().currentCircle;
      if (!circle) return;
      const round = circle.currentRound;
      if (!round) return;
      if (round.answeredUsers.includes(userId)) return;

      const updatedRound = {
        ...round,
        answeredUsers: [...round.answeredUsers, userId],
      };

      const updatedCircle = { ...circle, currentRound: updatedRound };

      set({ currentCircle: updatedCircle });
      await updateCircleInDB(updatedCircle);
    },

    addReaction: async (emoji) => {
      const circle = get().currentCircle;
      if (!circle) return;
      const round = circle.currentRound;
      if (!round) return;

      const qId = round.question.id;
      const existing = round.reactions[qId] || [];
      const updatedRound = {
        ...round,
        reactions: { ...round.reactions, [qId]: [...existing, emoji] },
      };

      const updatedCircle = { ...circle, currentRound: updatedRound };
      set({ currentCircle: updatedCircle });
      await updateCircleInDB(updatedCircle);
    },

    skipUser: async (userId) => {
      await get().finishAnswer(userId);
    },

    removeParticipant: async (userId) => {
      const circle = get().currentCircle;
      if (!circle) return;

      const updatedParticipants = circle.participants.filter(
        (p) => p.id !== userId
      );

      const updatedRound = circle.currentRound ? {
        ...circle.currentRound,
        answerOrder: circle.currentRound.answerOrder.filter((id) => id !== userId),
      } : null;

      const updatedCircle = {
        ...circle,
        participants: updatedParticipants,
        currentRound: updatedRound,
      };

      set({ currentCircle: updatedCircle });
      await updateCircleInDB(updatedCircle);
    },

    getRandomQuestion: () => {
      const circle = get().currentCircle;
      if (!circle) return null;
      const usedIds = get().usedQuestionIds;
      const roundNum = circle.roundCount + 1;
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

    endGame: async () => {
      const circle = get().currentCircle;
      if (!circle) return;

      const updatedCircle = { ...circle, status: "finished" as const };

      set({ currentCircle: updatedCircle });
      await updateCircleInDB(updatedCircle);
    },
  };
});


