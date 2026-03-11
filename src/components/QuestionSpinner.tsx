"use client";

import { useState, useCallback } from "react";
import { Question } from "@/types";
import { defaultQuestions } from "@/data/questions";
import { getDifficultyLabel, getDifficultyColor } from "@/data/questions";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle } from "lucide-react";

interface QuestionSpinnerProps {
  questions?: Question[];
  onSelect: (question: Question) => void;
  maxDifficulty?: number;
}

export default function QuestionSpinner({
  questions = defaultQuestions,
  onSelect,
  maxDifficulty = 5,
}: QuestionSpinnerProps) {
  const [current, setCurrent] = useState<Question | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const pool = questions.filter((q) => q.difficulty <= maxDifficulty);

  const spin = useCallback(() => {
    if (isSpinning || pool.length === 0) return;
    setIsSpinning(true);

    let count = 0;
    const totalSpins = 15 + Math.floor(Math.random() * 10);
    const interval = setInterval(() => {
      const randomQ = pool[Math.floor(Math.random() * pool.length)];
      setCurrent(randomQ);
      count++;
      if (count >= totalSpins) {
        clearInterval(interval);
        setIsSpinning(false);
        const final = pool[Math.floor(Math.random() * pool.length)];
        setCurrent(final);
        onSelect(final);
      }
    }, 80 + count * 8);
  }, [isSpinning, pool, onSelect]);

  return (
    <div className="flex flex-col items-center gap-6">
      <AnimatePresence mode="wait">
        {current ? (
          <motion.div
            key={current.text + (isSpinning ? "-spin" : "")}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-6 text-center"
          >
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
              Deep Question
            </p>
            <p className="text-lg md:text-xl font-medium text-white leading-relaxed">
              &ldquo;{current.text}&rdquo;
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-1.5 h-1.5 rounded-full ${level <= current.difficulty
                        ? "bg-purple-400"
                        : "bg-gray-700"
                      }`}
                  />
                ))}
              </div>
              <span
                className={`text-xs ${getDifficultyColor(current.difficulty)}`}
              >
                {getDifficultyLabel(current.difficulty)}
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="w-full max-w-md bg-gray-900/50 border border-gray-700/30 border-dashed rounded-2xl p-6 text-center">
            <p className="text-gray-500">กดปุ่มเพื่อสุ่มคำถาม</p>
          </div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={spin}
        disabled={isSpinning}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${isSpinning
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25"
          }`}
      >
        <motion.div
          animate={isSpinning ? { rotate: 360 } : {}}
          transition={
            isSpinning ? { duration: 0.5, repeat: Infinity, ease: "linear" } : {}
          }
        >
          <Shuffle className="w-5 h-5" />
        </motion.div>
        {isSpinning ? "กำลังสุ่ม..." : "สุ่มคำถาม"}
      </motion.button>
    </div>
  );
}
