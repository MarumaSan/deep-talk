"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, LogIn, AlertCircle } from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { useCircleStore } from "@/store/useCircleStore";
import { supabase } from "@/lib/supabase";
import { Circle, User } from "@/types";

export default function JoinCirclePage() {
  const router = useRouter();
  const { joinCircle, setCurrentUser } = useCircleStore();

  const [inviteCode, setInviteCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"code" | "name">("code");
  const [circleName, setCircleName] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckCode = async () => {
    if (!inviteCode.trim()) return;
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("state_data")
        .eq("invite_code", inviteCode.trim().toUpperCase())
        .single();

      if (error || !data) {
        setError("ไม่พบวงสนทนานี้ กรุณาตรวจสอบ code อีกครั้ง");
        setIsLoading(false);
        return;
      }

      const circle = data.state_data as Circle;

      if (circle.participants.length >= circle.maxPeople) {
        setError("วงสนทนานี้เต็มแล้ว");
        setIsLoading(false);
        return;
      }

      setCircleName(circle.name);
      setParticipants(circle.participants.map((p: User) => p.name));
      setStep("name");
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการตรวจสอบ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim()) return;
    setIsLoading(true);
    setError("");

    const user = { id: uuidv4(), name: playerName.trim() };
    setCurrentUser(user);

    const circle = await joinCircle(inviteCode.trim(), user);
    if (!circle) {
      setError("ไม่สามารถเข้าร่วมได้");
      setIsLoading(false);
      return;
    }

    router.push(`/circle/${circle.id}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าหลัก
        </Link>

        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Join Circle</h1>
              <p className="text-sm text-gray-500">เข้าร่วมวงสนทนา</p>
            </div>
          </div>

          {step === "code" ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value);
                    setError("");
                  }}
                  placeholder="กรอก 6 หลัก เช่น ABC123"
                  maxLength={6}
                  className="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-center text-2xl font-mono tracking-[0.3em] placeholder-gray-600 placeholder:text-base placeholder:tracking-normal focus:outline-none focus:border-purple-500 transition-colors uppercase"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckCode}
                disabled={inviteCode.length < 6 || isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? "กำลังตรวจสอบ..." : "ตรวจสอบ Code"}
              </motion.button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Circle info preview */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Circle</p>
                <p className="text-lg font-semibold text-white mb-3">
                  {circleName}
                </p>
                <p className="text-sm text-gray-500 mb-2">People in circle:</p>
                <div className="flex flex-wrap gap-2">
                  {participants.map((name, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-700/50 text-sm text-gray-300"
                    >
                      👤 {name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ชื่อของคุณ
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="ใส่ชื่อที่จะใช้ในวง..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  autoFocus
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("code")}
                  className="px-6 py-4 rounded-xl bg-gray-800 text-gray-300 font-medium border border-gray-700 hover:bg-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  ← กลับ
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoin}
                  disabled={!playerName.trim() || isLoading}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading ? "กำลังเข้าร่วม..." : "Join"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
