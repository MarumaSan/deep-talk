"use client";

import { useParams } from "next/navigation";
import { useCircleStore } from "@/store/useCircleStore";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageCircle,
  SkipForward,
  Sparkles,
  Wand2,
  Send,
  Trophy,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import QuestionCard from "@/components/QuestionCard";
import SpeakerSpotlight from "@/components/SpeakerSpotlight";
import { MoodReaction, Question, User } from "@/types";
import { getDifficultyForRound, getDifficultyLabel } from "@/data/questions";

type TalkPhase = "playing" | "round-end" | "create-question" | "finished";

const getLevelInfo = (count: number) => {
  if (count <= 2) return { level: 1, min: 0, max: 2 };
  if (count <= 5) return { level: 2, min: 2, max: 5 };
  if (count <= 9) return { level: 3, min: 5, max: 9 };
  if (count <= 14) return { level: 4, min: 9, max: 14 };
  if (count <= 20) return { level: 5, min: 14, max: 20 };
  if (count <= 27) return { level: 6, min: 20, max: 27 };
  if (count <= 35) return { level: 7, min: 27, max: 35 };
  if (count <= 44) return { level: 8, min: 35, max: 44 };
  if (count <= 54) return { level: 9, min: 44, max: 54 };
  return { level: 10, min: 54, max: 54 }; // MAX
};

export default function TalkModePage() {
  const params = useParams();
  const circleId = params.id as string;

  const {
    currentCircle,
    currentUser,
    loadCircle,
    finishAnswer,
    skipUser,
    addReaction,
    startNewRound,
    getRandomQuestion,
    endGame,
  } = useCircleStore();

  const [userQuestion, setUserQuestion] = useState("");
  const [questionSource, setQuestionSource] = useState<"user" | "ai" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      if (circleId && currentCircle?.id !== circleId) {
        await loadCircle(circleId);
      }
      setIsLoading(false);
    }
    init();
  }, [circleId, currentCircle?.id, loadCircle]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-gray-400 animate-pulse">กำลังโหลดข้อมูลเกม...</div>
      </div>
    );
  }

  // Not found / not joined guard
  if (!currentCircle || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">ไม่พบวงสนทนา</p>
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

  const currentRound = currentCircle.currentRound;

  // Decide phase based on global state
  let derivedPhase: TalkPhase = "playing";
  let isRoundComplete = false;

  if (currentCircle.status === "finished") {
    derivedPhase = "finished";
  } else if (!currentRound) {
    if (currentCircle.status === "playing") derivedPhase = "create-question";
  } else {
    isRoundComplete = currentRound.answeredUsers.length >= currentCircle.participants.length;
    if (isRoundComplete) derivedPhase = "create-question";
  }

  const phase = derivedPhase;

  const {
    question,
    answerOrder,
    answeredUsers,
    roundNumber,
  } = currentRound || { answerOrder: [], answeredUsers: [], roundNumber: 0, question: null };

  const currentSpeakerIndex = answeredUsers.length;
  const currentSpeakerId = answerOrder[currentSpeakerIndex];
  const currentSpeaker = currentCircle.participants.find((p: User) => p.id === currentSpeakerId);

  // The creator is the first answerer of the current round. If no round exists, it's the host.
  const questionCreatorId = currentRound && currentRound.answerOrder.length > 0
    ? currentRound.answerOrder[0]
    : currentCircle.hostId;
  const questionCreator = currentCircle.participants.find((p: User) => p.id === questionCreatorId);
  const isQuestionCreator = currentUser.id === questionCreatorId;

  // Check if current user is the active speaker
  const isCurrentSpeaker = currentUser.id === currentSpeakerId;

  const handleFinishAnswer = async () => {
    if (!currentSpeakerId) return;
    await finishAnswer(currentSpeakerId);
  };

  const handleSkip = async () => {
    if (!currentSpeakerId) return;
    await skipUser(currentSpeakerId);
  };

  const handleReaction = async (emoji: MoodReaction) => {
    await addReaction(emoji);
  };

  const handleSubmitUserQuestion = async () => {
    if (!userQuestion.trim()) return;
    let text = userQuestion.trim();
    if (!text.endsWith("?")) text += "?";

    const newQuestion: Question = {
      text,
      category: currentCircle.category,
      difficulty: getDifficultyForRound(roundNumber + 1),
      createdBy: "user",
    };
    await startNewRound(newQuestion);
    setUserQuestion("");
    setQuestionSource(null);
  };

  const handleAIQuestion = async () => {
    try {
      const difficulty = getDifficultyForRound(roundNumber + 1);
      const res = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: currentCircle.customCategory || currentCircle.category,
          difficulty,
        }),
      });
      const data = await res.json();
      if (data.question) {
        const newQuestion: Question = {
          text: data.question,
          category: currentCircle.category,
          difficulty,
          createdBy: "ai",
        };
        await startNewRound(newQuestion);
      } else {
        // Fallback to random
        await handleRandomQuestion();
      }
    } catch {
      // Fallback to random question from pool
      await handleRandomQuestion();
    } finally {
      setQuestionSource(null);
    }
  };

  const handleRandomQuestion = async () => {
    const q = getRandomQuestion();
    if (q) {
      await startNewRound(q);
    }
    setQuestionSource(null);
  };

  const handleEndGame = async () => {
    await endGame();
  };

  // ========== RENDER ==========

  // Finished state
  if (phase === "finished" || currentCircle.status === "finished") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center"
        >
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">จบเกม!</h2>
            <p className="text-gray-400 mb-6">
              วง &quot;{currentCircle.name}&quot; เล่นทั้งหมด {currentCircle.roundCount} รอบ
            </p>

            {/* Summary */}
            <div className="bg-gray-800/50 rounded-xl p-5 mb-6 text-left">
              <h3 className="text-sm font-medium text-gray-400 mb-3">สรุป</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">จำนวนรอบ</span>
                  <span className="text-white font-medium">{currentCircle.roundCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ผู้เข้าร่วม</span>
                  <span className="text-white font-medium">{currentCircle.participants.length} คน</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">หัวข้อ</span>
                  <span className="text-white font-medium capitalize">
                    {currentCircle.customCategory || currentCircle.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Reflection prompt */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5 mb-6 text-left">
              <h3 className="text-sm font-semibold text-purple-400 mb-2">
                💭 Reflection
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                คำถามไหนที่ทำให้คุณคิดมากที่สุด? คุณได้เรียนรู้อะไรใหม่เกี่ยวกับคนในวงบ้าง?
                ลองใช้เวลาสักครู่เพื่อย้อนคิดถึงสิ่งที่ได้แบ่งปันกันวันนี้
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/create" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25"
                >
                  สร้างวงใหม่
                </motion.button>
              </Link>
              <Link href="/" className="flex-1">
                <button className="w-full py-4 rounded-xl bg-gray-800 text-gray-300 font-medium border border-gray-700 hover:bg-gray-700 transition-colors">
                  หน้าหลัก
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Create question phase
  if (phase === "create-question" || isRoundComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10 relative">
        {currentUser.id === currentCircle.hostId && (
          <div className="absolute top-6 right-6 z-20">
            <button
              onClick={handleEndGame}
              className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 font-medium border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm"
            >
              จบเกม
            </button>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white">
                {questionCreator?.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                {isQuestionCreator
                  ? "คุณเป็นคนตั้งคำถามถัดไป!"
                  : `${questionCreator?.name} กำลังตั้งคำถาม...`}
              </h2>
              <p className="text-sm text-gray-500">
                Round {roundNumber + 1} • {getDifficultyLabel(getDifficultyForRound(roundNumber + 1))}
              </p>
            </div>

            {isQuestionCreator ? (
              <>
                {!questionSource ? (
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setQuestionSource("user")}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-purple-500/50 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Send className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">พิมพ์คำถามเอง</p>
                        <p className="text-xs text-gray-500">ตั้งคำถามจากใจคุณ</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setQuestionSource("ai");
                        handleAIQuestion();
                      }}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-pink-500/50 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                        <Wand2 className="w-5 h-5 text-pink-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">ให้ AI ตั้งคำถาม</p>
                        <p className="text-xs text-gray-500">AI จะสร้างคำถามลึกๆ ให้</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRandomQuestion}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-blue-500/50 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">สุ่มจากคลัง</p>
                        <p className="text-xs text-gray-500">สุ่มคำถามจากคลังคำถาม</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
                    </motion.button>
                  </div>
                ) : questionSource === "user" ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <textarea
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      placeholder="พิมพ์คำถามของคุณ..."
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none mb-4"
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => setQuestionSource(null)}
                        className="px-4 py-3 rounded-xl bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 transition-colors"
                      >
                        ← กลับ
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmitUserQuestion}
                        disabled={!userQuestion.trim()}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ส่งคำถาม
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 mx-auto mb-4 border-2 border-purple-500 border-t-transparent rounded-full"
                    />
                    <p className="text-gray-400">AI กำลังคิดคำถาม...</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-gray-400"
                >
                  รอ {questionCreator?.name} ตั้งคำถาม...
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }



  // ========== MAIN PLAYING PHASE ==========
  const questionCount = currentCircle?.roundCount || 0;
  const { level, min, max } = getLevelInfo(questionCount);
  const progressPercent = level === 10 ? 100 : Math.max(0, Math.min(100, ((questionCount - min) / (max - min)) * 100));

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 relative">
      {currentUser.id === currentCircle.hostId && (
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={handleEndGame}
            className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 font-medium border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm"
          >
            จบเกม
          </button>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between mb-6 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{currentCircle.name}</p>
            <p className="text-xs text-gray-500">
              Round {roundNumber} •{" "}
              {answeredUsers.length}/{currentCircle.participants.length} ตอบแล้ว
            </p>
          </div>
        </div>
        <div className="flex flex-col flex-1 items-end ml-4">
          <div className="flex items-center justify-between w-full max-w-[120px] mb-1">
            <span className="text-sm font-bold text-white">Level {level}</span>
            <span className="text-xs text-purple-400 font-medium">
              {level === 10 ? 'MAX' : `${questionCount}/${max}`}
            </span>
          </div>
          <div className="w-full max-w-[120px] h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full relative z-10 gap-8">
        {/* Question Card */}
        <QuestionCard
          key={question!.text}
          question={question!}
          onReaction={handleReaction}
          showReactions={true}
          reactionsList={currentRound?.reactions || []}
        />

        {/* Speaker Spotlight */}
        {currentSpeaker && (
          <SpeakerSpotlight
            speaker={currentSpeaker}
            allParticipants={currentCircle.participants}
            answeredUserIds={answeredUsers}
            answerOrder={answerOrder}
          />
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full max-w-sm">
          {isCurrentSpeaker ? (
            <>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFinishAnswer}
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-lg shadow-lg shadow-green-500/25 flex items-center justify-center gap-2"
              >
                ✓ ตอบเสร็จแล้ว
              </motion.button>
              <button
                onClick={handleSkip}
                className="p-4 rounded-xl bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 hover:text-gray-300 transition-all"
                title="ข้ามคนนี้"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="w-full py-4 rounded-xl bg-gray-800/50 border border-gray-700/50 text-center">
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-gray-400"
              >
                รอ {currentSpeaker?.name} ตอบ...
              </motion.p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
