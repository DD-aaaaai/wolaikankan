"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  {
    key: "personality",
    question: "你是个什么样的人？说说你的性格和喜欢的东西。",
    placeholder: "例如：思考型，喜欢哲学和深度阅读，讨厌浮夸...",
  },
  {
    key: "occupation",
    question: "你的职业是什么？行业和专业方向？",
    placeholder: "例如：产品经理，互联网行业，关注AI和用户体验...",
  },
  {
    key: "goal",
    question: "你有什么想实现的目标吗？",
    placeholder: "例如：希望在三年内做出一款有影响力的产品...",
  },
  {
    key: "story",
    question: "说说你的故事。什么经历塑造了现在的你？",
    placeholder: "例如：从小在农村长大，靠自学进入互联网行业...",
  },
  {
    key: "slogan",
    question: "你的Slogan是什么？用一句话定义你自己。",
    placeholder: "例如：在混沌中寻找秩序，在秩序中保持野性",
  },
  {
    key: "avatarName",
    question: "最后，给你的分身起个名字。",
    placeholder: "例如：镜中人、另一个我、影子...",
  },
];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  async function handleNext() {
    if (input.trim()) {
      setAnswers((prev) => ({ ...prev, [currentStep.key]: input.trim() }));
    }

    if (isLast) {
      await submit({ ...answers, [currentStep.key]: input.trim() });
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

  async function handleSkipAll() {
    setSkipped(true);
    await submit({});
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
      <main className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-stone-400 text-sm tracking-widest animate-pulse">
          正在唤醒你的分身...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6">
      <div className="max-w-lg w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-stone-500 text-xs tracking-widest">
            分身设置 {step + 1} / {STEPS.length}
          </p>
          <div className="flex gap-1 justify-center">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-0.5 w-8 transition-colors ${
                  i <= step ? "bg-stone-300" : "bg-stone-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="space-y-6">
          <p className="text-stone-100 text-lg leading-relaxed">
            {currentStep.question}
          </p>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentStep.placeholder}
            rows={4}
            className="w-full bg-stone-900 border border-stone-700 text-stone-100 placeholder:text-stone-600 p-4 text-sm leading-relaxed resize-none focus:outline-none focus:border-stone-500 transition-colors"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) handleNext();
            }}
          />

          <div className="flex gap-3">
            <button
              onClick={handleNext}
              disabled={!input.trim()}
              className="flex-1 py-3 bg-stone-100 text-stone-900 text-sm tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-200 transition-colors"
            >
              {isLast ? "完成设置" : "继续"}
            </button>
            <button
              onClick={handleSkip}
              className="px-6 py-3 border border-stone-700 text-stone-500 text-sm hover:border-stone-500 hover:text-stone-400 transition-colors"
            >
              跳过
            </button>
          </div>

          {step === 0 && (
            <button
              onClick={handleSkipAll}
              className="w-full text-stone-600 text-xs hover:text-stone-500 transition-colors"
            >
              暂时跳过全部设置，直接看分身内容
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
