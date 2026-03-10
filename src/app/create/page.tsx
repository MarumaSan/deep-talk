"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Users, Copy, Check } from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { useCircleStore } from "@/store/useCircleStore";
import { categories } from "@/data/questions";

export default function CreateCirclePage() {
  const router = useRouter();
  const { setCurrentUser, createCircle } = useCircleStore();

  const [step, setStep] = useState<"form" | "result">("form");
  const [circleName, setCircleName] = useState("");
  const [category, setCategory] = useState("random-deep");
  const [customCategory, setCustomCategory] = useState("");
  const [maxPeople, setMaxPeople] = useState(4);
  const [hostName, setHostName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [circleId, setCircleId] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    if (!circleName.trim() || !hostName.trim()) return;

    const user = { id: uuidv4(), name: hostName.trim() };
    setCurrentUser(user);
    const circle = createCircle(
      circleName.trim(),
      category,
      customCategory.trim(),
      maxPeople
    );
    setInviteCode(circle.inviteCode);
    setCircleId(circle.id);
    setStep("result");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToLobby = () => {
    router.push(`/circle/${circleId}`);
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

        {step === "form" ? (
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Create Circle</h1>
                <p className="text-sm text-gray-500">สร้างวงสนทนาใหม่</p>
              </div>
            </div>

            {/* Host Name */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ชื่อของคุณ
              </label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="ใส่ชื่อที่จะใช้ในวง..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Circle Name */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Circle Name
              </label>
              <input
                type="text"
                value={circleName}
                onChange={(e) => setCircleName(e.target.value)}
                placeholder="เช่น Midnight Talk, Deep Night..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Topic / Category */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Topic
              </label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      category === cat.value
                        ? "bg-purple-500/20 border border-purple-500/50 text-purple-300"
                        : "bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {category === "other" && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="พิมพ์หัวข้อเอง..."
                  className="w-full mt-3 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              )}
            </div>

            {/* Max People */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                จำนวนคนสูงสุด
              </label>
              <div className="flex items-center gap-3">
                {[2, 3, 4, 5, 6, 8].map((num) => (
                  <button
                    key={num}
                    onClick={() => setMaxPeople(num)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                      maxPeople === num
                        ? "bg-purple-500 text-white"
                        : "bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              disabled={!circleName.trim() || !hostName.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Create Circle
            </motion.button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              วงสนทนาพร้อมแล้ว!
            </h2>
            <p className="text-gray-400 mb-6">
              แชร์ invite code ให้เพื่อนๆ เพื่อเข้าร่วม
            </p>

            {/* Invite Code */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
                Invite Code
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl font-mono font-bold text-purple-400 tracking-[0.3em]">
                  {inviteCode}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoToLobby}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg shadow-lg shadow-purple-500/25"
            >
              เข้าห้องรอ →
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
