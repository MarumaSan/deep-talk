"use client";

import { Question, MoodReaction } from "@/types";
import { getDifficultyLabel, getDifficultyColor } from "@/data/questions";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const reactions: MoodReaction[] = ["😮", "❤️", "🤯", "😢", "🔥"];

interface QuestionCardProps {
  question: Question;
  onReaction?: (emoji: MoodReaction) => void;
  showReactions?: boolean;
  isSpinning?: boolean;
}

export default function QuestionCard({
  question,
  onReaction,
  showReactions = true,
  isSpinning = false,
}: QuestionCardProps) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  const handleReaction = (emoji: MoodReaction) => {
    setSelectedReaction(emoji);
    onReaction?.(emoji);
    setTimeout(() => setSelectedReaction(null), 1500);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: -90, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md mx-auto"
      >
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/10">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />

          {/* Difficulty badge */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
              Deep Question
            </span>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-2 h-2 rounded-full ${
                      level <= question.difficulty
                        ? "bg-purple-400"
                        : "bg-gray-700"
                    }`}
                  />
                ))}
              </div>
              <span
                className={`text-xs font-medium ${getDifficultyColor(
                  question.difficulty
                )}`}
              >
                {getDifficultyLabel(question.difficulty)}
              </span>
            </div>
          </div>

          {/* Question text */}
          <motion.p
            className="text-xl md:text-2xl font-medium text-white leading-relaxed text-center min-h-[80px] flex items-center justify-center"
            animate={isSpinning ? { opacity: [1, 0.3, 1] } : {}}
            transition={
              isSpinning ? { duration: 0.3, repeat: Infinity } : {}
            }
          >
            &ldquo;{question.text}&rdquo;
          </motion.p>

          {/* Category */}
          <div className="mt-6 text-center">
            <span className="inline-block px-3 py-1 text-xs rounded-full bg-gray-700/50 text-gray-400 capitalize">
              {question.category}
            </span>
          </div>

          {/* Reactions */}
          {showReactions && (
            <div className="flex items-center justify-center gap-3 mt-6">
              {reactions.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleReaction(emoji)}
                  className={`text-2xl transition-all ${
                    selectedReaction === emoji
                      ? "scale-125 drop-shadow-lg"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
