"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
    <main className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-10">
        <div className="space-y-3">
          <div className="text-6xl">🪷</div>
          <h1 className="text-4xl font-light text-stone-100 tracking-widest">
            我来看看
          </h1>
          <p className="text-stone-400 text-sm tracking-wider">
            你的分身，替你看世界
          </p>
        </div>

        <div className="space-y-4 text-stone-400 text-sm leading-relaxed">
          <p>
            每天，你的分身在互联网上替你游历六个维度——
            <br />
            工作、成长、娱乐、健康、关系、以及其他。
          </p>
          <p>
            它用你的眼睛看，用你的心感受，
            <br />
            把最值得你亲历的内容带回来。
          </p>
        </div>

        <div>
          <a
            href="/api/auth/login"
            className="inline-block px-8 py-3 bg-stone-100 text-stone-900 text-sm tracking-widest hover:bg-stone-200 transition-colors"
          >
            用 SecondMe 登录
          </a>
        </div>

        <p className="text-stone-600 text-xs">哲学 · 深沉 · 禅意</p>
      </div>
    </main>
  );
}
