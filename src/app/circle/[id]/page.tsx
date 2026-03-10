"use client";

import { useParams, useRouter } from "next/navigation";
import { useCircleStore } from "@/store/useCircleStore";
import { motion } from "framer-motion";
import { Copy, Check, Play, Users, MessageCircle, Crown, ArrowLeft } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function CircleLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const circleId = params.id as string;
  const { getCircle, currentUser, startGame } = useCircleStore();
  const circle = getCircle(circleId);
  const [copied, setCopied] = useState(false);

  if (!circle || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">ไม่พบวงสนทนา หรือคุณยังไม่ได้เข้าร่วม</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  const isHost = currentUser.id === circle.hostId;

  const handleCopy = () => {
    navigator.clipboard.writeText(circle.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = () => {
    if (!isHost) return;
    startGame(circleId);
    router.push(`/circle/${circleId}/talk`);
  };

  const handleGoToTalk = () => {
    router.push(`/circle/${circleId}/talk`);
  };

  if (circle.status === "playing") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">เกมกำลังดำเนินอยู่!</h2>
            <p className="text-gray-400 mb-6">วง &quot;{circle.name}&quot; เริ่มเล่นแล้ว</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoToTalk}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg shadow-lg shadow-purple-500/25"
            >
              เข้าร่วม Talk →
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{circle.name}</h1>
              <p className="text-sm text-gray-500 capitalize">
                {circle.customCategory || circle.category}
              </p>
            </div>
          </div>

          {/* Invite Code */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                  Invite Code
                </p>
                <p className="text-2xl font-mono font-bold text-purple-400 tracking-[0.2em]">
                  {circle.inviteCode}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="p-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Participants */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                คนในวง
              </p>
              <span className="text-xs text-gray-500">
                {circle.participants.length}/{circle.maxPeople}
              </span>
            </div>
            <div className="space-y-2">
              {circle.participants.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/30"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-200 font-medium flex-1">
                    {user.name}
                  </span>
                  {user.id === circle.hostId && (
                    <Crown className="w-4 h-4 text-yellow-400" />
                  )}
                  {user.id === currentUser.id && (
                    <span className="text-xs text-purple-400">(คุณ)</span>
                  )}
                </motion.div>
              ))}
              {/* Empty slots */}
              {Array.from({
                length: circle.maxPeople - circle.participants.length,
              }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-700/50"
                >
                  <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-600 text-sm">?</span>
                  </div>
                  <span className="text-gray-600 text-sm">รอเข้าร่วม...</span>
                </div>
              ))}
            </div>
          </div>

          {/* Start Button */}
          {isHost ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              disabled={circle.participants.length < 2}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              {circle.participants.length < 2
                ? "ต้องมีอย่างน้อย 2 คน"
                : "เริ่มเลย!"}
            </motion.button>
          ) : (
            <div className="text-center py-4">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-gray-400"
              >
                รอ host เริ่มเกม...
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
