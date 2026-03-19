"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const OCEAN_BG = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1920";

const FEATURES = [
  { icon: "🌊", label: "工作" },
  { icon: "🌱", label: "成长" },
  { icon: "🎮", label: "娱乐" },
  { icon: "💪", label: "健康" },
  { icon: "💫", label: "关系" },
  { icon: "✨", label: "其他" },
];

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) return;
        if (!data.user.setupDone) router.replace("/setup");
        else router.replace("/avatar");
      });
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col">
      {/* Ocean background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${OCEAN_BG})` }}
      />
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900/40 via-sky-800/50 to-blue-950/80" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl wave inline-block">🪷</span>
          <span className="text-white font-bold text-lg tracking-wide" style={{ fontFamily: "var(--font-syne)" }}>
            我来看看
          </span>
        </div>
        <a
          href="/api/auth/login"
          className="glass text-white text-sm px-5 py-2 rounded-full hover:bg-white/20 transition-all duration-200 font-medium"
        >
          登录 →
        </a>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="text-center max-w-2xl">
          {/* Badge */}
          <div className="fade-up-1 inline-flex items-center gap-2 glass text-sky-200 text-xs px-4 py-2 rounded-full mb-8 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            AI 分身 · 每日为你探索世界
          </div>

          {/* Main heading */}
          <h1 className="fade-up-2 text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-6" style={{ fontFamily: "var(--font-syne)" }}>
            你的分身<br />
            <span className="gradient-text">替你看世界</span>
          </h1>

          {/* Subtext */}
          <p className="fade-up-3 text-sky-100/80 text-base sm:text-lg leading-relaxed mb-10 max-w-md mx-auto">
            每天，你的分身在互联网上替你游历六个维度，
            用你的眼睛看，用你的心感受，
            把最值得亲历的内容带回来。
          </p>

          {/* CTA */}
          <div className="fade-up-4 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/api/auth/login"
              className="group relative inline-flex items-center justify-center gap-2 bg-white text-sky-700 font-bold px-8 py-4 rounded-2xl text-base hover:bg-sky-50 transition-all duration-200 shadow-lg shadow-sky-900/30 hover:shadow-xl hover:shadow-sky-900/40 hover:-translate-y-0.5"
            >
              <span>用 SecondMe 登录</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>

        {/* Dimension tags */}
        <div className="fade-up-4 mt-14 flex flex-wrap justify-center gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="glass hover-lift text-white text-sm px-4 py-2 rounded-xl flex items-center gap-2 cursor-default"
            >
              <span>{f.icon}</span>
              <span className="font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="relative z-10 text-center pb-6">
        <p className="text-sky-300/60 text-xs tracking-widest">探索 · 发现 · 成长</p>
      </div>
    </main>
  );
}
