"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Timer as TimerIcon, Pause, Play, RotateCcw } from "lucide-react";

interface TimerProps {
  initialSeconds?: number;
  onTimeUp?: () => void;
  autoStart?: boolean;
}

export default function Timer({
  initialSeconds = 180,
  onTimeUp,
  autoStart = false,
}: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    if (!isRunning || seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, seconds, onTimeUp]);

  const reset = useCallback(() => {
    setSeconds(initialSeconds);
    setIsRunning(false);
  }, [initialSeconds]);

  const toggle = () => setIsRunning(!isRunning);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = seconds / initialSeconds;
  const isLow = seconds <= 30;

  return (
    <div className="flex items-center gap-3">
      <motion.div
        animate={isLow && isRunning ? { scale: [1, 1.05, 1] } : {}}
        transition={isLow ? { duration: 1, repeat: Infinity } : {}}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${
          isLow
            ? "bg-red-500/20 text-red-400 border border-red-500/30"
            : "bg-gray-800 text-gray-200 border border-gray-700"
        }`}
      >
        <TimerIcon className="w-4 h-4" />
        <span>
          {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
        {/* Mini progress bar */}
        <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isLow ? "bg-red-400" : "bg-purple-400"
            }`}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      <button
        onClick={toggle}
        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700"
      >
        {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <button
        onClick={reset}
        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}
