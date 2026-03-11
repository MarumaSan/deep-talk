"use client";

import { motion } from "framer-motion";
import { MessageCircle, Users, Sparkles, ArrowRight, Shuffle, Brain } from "lucide-react";
import Link from "next/link";
import { defaultQuestions } from "@/data/questions";
import { useState, useEffect } from "react";

function HeroSection() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const sampleQuestions = defaultQuestions.slice(0, 8);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuestionIndex((prev) => (prev + 1) % sampleQuestions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sampleQuestions.length]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mx-auto relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Deep Talk
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 mb-4"
        >
          คำถามที่ทำให้คุณ<span className="text-purple-400 font-semibold">รู้จักกันจริงๆ</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-500 mb-10 max-w-lg mx-auto"
        >
          สร้างวงสนทนา เปิดคำถามลึกๆ แล้วคุยกันอย่างจริงใจ
        </motion.p>

        {/* Rotating question preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-10"
        >
          <div className="inline-block px-6 py-4 rounded-2xl bg-gray-900/80 border border-gray-700/50 glow-pulse">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
              ตัวอย่างคำถาม
            </p>
            <motion.p
              key={questionIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg text-gray-200 font-medium"
            >
              &ldquo;{sampleQuestions[questionIndex]?.text}&rdquo;
            </motion.p>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/create">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
            >
              <Sparkles className="w-5 h-5" />
              Start a Circle
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <Link href="/join">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gray-800 text-gray-200 font-semibold text-lg border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              <Users className="w-5 h-5" />
              Join Circle
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: <Users className="w-7 h-7" />,
      title: "สร้างวงสนทนา",
      desc: "เชิญเพื่อนเข้าวงด้วย invite code",
      color: "from-purple-500 to-blue-500",
    },
    {
      icon: <Shuffle className="w-7 h-7" />,
      title: "สุ่มคำถาม",
      desc: "ระบบสุ่มคำถามลึกๆ ให้อัตโนมัติ",
      color: "from-pink-500 to-purple-500",
    },
    {
      icon: <MessageCircle className="w-7 h-7" />,
      title: "ผลัดกันตอบ",
      desc: "ทุกคนในวงตอบทีละคน อย่างจริงใจ",
      color: "from-orange-500 to-pink-500",
    },
    {
      icon: <Brain className="w-7 h-7" />,
      title: "ลึกขึ้นเรื่อยๆ",
      desc: "คำถามจะลึกขึ้นตามจำนวนรอบ",
      color: "from-green-500 to-teal-500",
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center text-white mb-12"
        >
          มันทำงานยังไง?
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative bg-gray-900/50 border border-gray-800 rounded-2xl p-6 text-center hover:border-gray-700 transition-colors group"
            >
              <div
                className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}
              >
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-400">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 text-gray-600">
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DeepQuestionPreview() {
  const previewQuestions = defaultQuestions.slice(0, 6);

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center text-white mb-4"
        >
          คำถามที่รอคุณอยู่
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-gray-500 text-center mb-12"
        >
          ตั้งแต่ casual ไปจนถึง dangerous
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {previewQuestions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 hover:border-purple-500/30 transition-all cursor-default"
            >
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-1.5 h-1.5 rounded-full ${level <= q.difficulty ? "bg-purple-400" : "bg-gray-700"
                      }`}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-2 capitalize">
                  {q.category}
                </span>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed">
                &ldquo;{q.text}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <HowItWorks />
      <DeepQuestionPreview />

      {/* Footer */}
      <footer className="py-10 text-center text-gray-600 text-sm border-t border-gray-800/50">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MessageCircle className="w-4 h-4" />
          <span className="font-semibold text-gray-400">Deep Talk By Maruma</span>
        </div>
        <p>คำถามที่ทำให้คุณรู้จักกันจริงๆ</p>
      </footer>
    </main>
  );
}
