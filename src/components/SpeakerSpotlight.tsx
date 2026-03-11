"use client";

import { User } from "@/types";
import { motion } from "framer-motion";
import React from "react";
import { Mic } from "lucide-react";

interface SpeakerSpotlightProps {
  speaker: User;
  allParticipants: User[];
  answeredUserIds: string[];
  answerOrder: string[];
}

export default React.memo(function SpeakerSpotlight({
  speaker,
  allParticipants,
  answeredUserIds,
  answerOrder,
}: SpeakerSpotlightProps) {
  return (
    <div className="w-full">
      {/* Current Speaker */}
      <div className="flex flex-col items-center mb-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-500/30">
            {speaker.name.charAt(0).toUpperCase()}
          </div>
          <motion.div
            className="absolute -inset-2 rounded-full border-2 border-purple-400/50"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1.5">
            <Mic className="w-3 h-3 text-white" />
          </div>
        </motion.div>
        <p className="mt-3 text-lg font-semibold text-white">{speaker.name}</p>
        <p className="text-sm text-purple-400">กำลังตอบ...</p>
      </div>

      {/* All participants in order */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {answerOrder.map((userId, index) => {
          const user = allParticipants.find((p) => p.id === userId);
          if (!user) return null;
          const hasAnswered = answeredUserIds.includes(userId);
          const isCurrent = userId === speaker.id;

          return (
            <motion.div
              key={userId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${isCurrent
                ? "bg-purple-500/20 border border-purple-500/40 text-purple-300"
                : hasAnswered
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-gray-800/50 border border-gray-700/50 text-gray-500"
                }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isCurrent
                  ? "bg-purple-500 text-white"
                  : hasAnswered
                    ? "bg-green-500/30 text-green-300"
                    : "bg-gray-700 text-gray-400"
                  }`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{user.name}</span>
              {hasAnswered && <span className="text-green-400">✓</span>}
              {isCurrent && (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🎤
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
);
