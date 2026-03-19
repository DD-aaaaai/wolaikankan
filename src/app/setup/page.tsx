"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { key: "personality", icon: "🎭", question: "你是个什么样的人？", sub: "性格、喜好、你的独特之处", placeholder: "例如：好奇心旺盛，喜欢哲学和深度阅读，讨厌浮夸..." },
  { key: "occupation", icon: "💼", question: "你的职业方向？", sub: "行业、专业、关注领域", placeholder: "例如：产品经理，互联网行业，关注 AI 和用户体验..." },
  { key: "goal", icon: "🎯", question: "你想实现什么目标？", sub: "近期或长远的愿望都可以", placeholder: "例如：希望在三年内做出一款有影响力的产品..." },
  { key: "story", icon: "📖", question: "说说你的故事", sub: "什么经历塑造了现在的你", placeholder: "例如：从小在农村长大，靠自学进入互联网行业..." },
  { key: "slogan", icon: "✨", question: "你的 Slogan 是什么？", sub: "一句话定义你自己", placeholder: "例如：在混沌中寻找秩序，在秩序中保持野性" },
  { key: "avatarName", icon: "🪷", question: "给你的分身起个名字", sub: "它会以这个名字替你探索世界", placeholder: "例如：镜中人、另一个我、影子..." },
];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progress = ((step) / STEPS.length) * 100;

  async function handleNext() {
    const val = input.trim();
    const newAnswers = val ? { ...answers, [currentStep.key]: val } : answers;
    setAnswers(newAnswers);

    if (isLast) {
      await submit(newAnswers);
    } else {
      setStep((s) => s + 1);
      setInput("");
    }
  }

  async function handleSkip() {
    if (isLast) {
      await submit(answers);
    } else {
      setStep((s) => s + 1);
      setInput("");
    }
  }

  async function submit(data: Record<string, string>) {
    setLoading(true);
    await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.replace("/avatar");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #e0f7fa 100%)" }}>
        <div className="text-center space-y-4">
          <div className="text-5xl wave inline-block">🪷</div>
          <p className="text-sky-700 font-semibold text-lg">正在唤醒你的分身...</p>
          <div className="flex gap-1.5 justify-center">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 40%, #f0f9ff 100%)" }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sky-600 text-sm font-medium">打造你的分身</span>
            <span className="text-sky-400 text-sm">{step + 1} / {STEPS.length}</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-sky-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #38bdf8, #0284c7)" }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="max-w-lg w-full">
          {/* Step card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl shadow-sky-100/50 border border-white/60">
            {/* Icon */}
            <div className="text-5xl mb-6 wave inline-block">{currentStep.icon}</div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-sky-900 mb-1" style={{ fontFamily: "var(--font-syne)" }}>
              {currentStep.question}
            </h2>
            <p className="text-sky-500 text-sm mb-6">{currentStep.sub}</p>

            {/* Input */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentStep.placeholder}
              rows={4}
              className="w-full bg-sky-50 border-2 border-sky-100 focus:border-sky-300 text-sky-900 placeholder:text-sky-300 p-4 rounded-2xl text-sm leading-relaxed resize-none focus:outline-none transition-colors"
              onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) handleNext(); }}
              autoFocus
            />

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleNext}
                disabled={!input.trim()}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: input.trim() ? "linear-gradient(135deg, #0ea5e9, #0284c7)" : "#e0f2fe", color: input.trim() ? "white" : "#7dd3fc" }}
              >
                {isLast ? "完成 🎉" : "继续 →"}
              </button>
              <button
                onClick={handleSkip}
                className="px-5 py-3.5 rounded-2xl text-sm text-sky-400 hover:text-sky-600 hover:bg-sky-50 transition-colors font-medium"
              >
                跳过
              </button>
            </div>

            {step === 0 && (
              <button
                onClick={() => submit({})}
                className="w-full mt-3 text-sky-400 text-xs hover:text-sky-600 transition-colors py-1"
              >
                暂时跳过全部，直接看分身内容
              </button>
            )}
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-2 mt-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? "24px" : "8px",
                  height: "8px",
                  background: i <= step ? "#0284c7" : "#bae6fd",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
